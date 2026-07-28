#!/usr/bin/env python3
"""Block a PR when the SDK version in code is not recorded in config-sdk-version.json.

The rule: the version declared in this repo's package manifest must be the FIRST
entry of `sdk_versions` in config-sdk-version.json.

That single rule gives the behaviour we want on both sides:

  * A PR that does not touch the SDK version passes automatically, because the
    manifest version already sits at the top of the file. Ordinary bug fixes,
    docs and refactors are unaffected.
  * A PR that bumps the real SDK version fails until the author adds a matching
    entry, newest-first, to config-sdk-version.json.

Run with no arguments from the repo root. Exits 0 on success, 1 on failure.
Requires only the Python 3 standard library.
"""
import json
import os
import re
import sys

CONFIG = "config-sdk-version.json"

# type -> regex whose first group is the version. Anchored to the line that
# declares *this package's* version, so a dependency pin elsewhere in the file
# cannot be mistaken for it.
PATTERNS = {
    "package_json":        r'^\s*"version"\s*:\s*"([^"]+)"',
    "pubspec_yaml":        r"^version:\s*(\S+)\s*$",
    "podspec":             r"^\s*s\.version\s*=\s*['\"]([^'\"]+)['\"]",
    "gradle_version_name": r'^\s*versionName\s*["\']([^"\']+)["\']',
    "cordova_plugin_xml":  r'^\s*<plugin[^>]*?\sversion\s*=\s*"([^"]+)"',
}

RED, GREEN, YELLOW, BOLD, OFF = (
    ("\033[31m", "\033[32m", "\033[33m", "\033[1m", "\033[0m")
    if sys.stdout.isatty() or os.environ.get("GITHUB_ACTIONS") == "true"
    else ("", "", "", "", "")
)

errors, warnings = [], []


def fail(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


def read_version(path, kind):
    """Pull the declared version out of a manifest, or return None."""
    if kind not in PATTERNS:
        fail(f"Unknown version_source type {kind!r} in {CONFIG}.")
        return None
    if not os.path.exists(path):
        fail(f"Version manifest {path!r} (from {CONFIG}) does not exist.")
        return None
    # plugin.xml opens the version attribute on a tag that may wrap across lines
    text = open(path, encoding="utf-8", errors="replace").read()
    if kind == "cordova_plugin_xml":
        m = re.search(r"<plugin\b[^>]*?\sversion\s*=\s*\"([^\"]+)\"", text, re.S)
        return m.group(1).strip() if m else None
    for line in text.splitlines():
        m = re.match(PATTERNS[kind], line)
        if m:
            return m.group(1).strip()
    return None


def vkey(v):
    """Sortable tuple. Non-numeric suffixes (1.2.0-beta.1) sort below the release."""
    nums = [int(x) for x in re.findall(r"\d+", v)][:3]
    nums += [0] * (3 - len(nums))
    return (tuple(nums), 0 if re.search(r"[-+]", v) else 1)


def main():
    root = os.getcwd()
    if not os.path.exists(CONFIG):
        print(f"{RED}{CONFIG} not found in {root}.{OFF}")
        print(f"Every Linkrunner SDK repo must carry {CONFIG} at its root.")
        return 1

    try:
        with open(CONFIG, encoding="utf-8") as fh:
            cfg = json.load(fh)
    except json.JSONDecodeError as e:
        print(f"{RED}{CONFIG} is not valid JSON: {e}{OFF}")
        return 1

    entries = cfg.get("sdk_versions")
    if not isinstance(entries, list) or not entries:
        print(f"{RED}{CONFIG} has no non-empty 'sdk_versions' array.{OFF}")
        return 1

    src = cfg.get("version_source") or {}
    manifest, kind = src.get("file"), src.get("type")
    if not manifest or not kind:
        print(f"{RED}{CONFIG} is missing the 'version_source' block.{OFF}")
        print('Expected e.g. "version_source": {"file": "package.json", '
              '"type": "package_json"}')
        return 1

    code_version = read_version(manifest, kind)
    if code_version is None and not errors:
        fail(f"Could not find a version declaration in {manifest!r}.")

    # --- structural checks on the config -------------------------------------
    versions = [e.get("version") for e in entries]
    if any(not v for v in versions):
        fail(f"Every entry in {CONFIG} needs a non-empty 'version'.")

    dupes = sorted({v for v in versions if v and versions.count(v) > 1})
    if dupes:
        fail(f"{CONFIG} lists duplicate versions: {', '.join(dupes)}")

    ordered = sorted([v for v in versions if v], key=vkey, reverse=True)
    if [v for v in versions if v] != ordered:
        fail(f"{CONFIG} must be ordered newest-first. Expected to start with "
             f"{ordered[0]!r} but found {versions[0]!r}.")

    top = entries[0]
    if not top.get("pushed_date"):
        warn(f"Latest entry {top.get('version')!r} has no 'pushed_date'.")
    if not top.get("description"):
        warn(f"Latest entry {top.get('version')!r} has no 'description'.")

    # --- the core rule -------------------------------------------------------
    if code_version and not errors:
        listed = top.get("version")
        if code_version != listed:
            if code_version in versions:
                fail(
                    f"{manifest} declares {code_version!r}, which IS listed in "
                    f"{CONFIG} but not at the top (top is {listed!r}).\n"
                    f"    The newest release must be the first entry of "
                    f"'sdk_versions'."
                )
            else:
                fail(
                    f"{manifest} declares version {code_version!r}, but that "
                    f"version is missing from {CONFIG} (top entry is "
                    f"{listed!r}).\n"
                    f"    You bumped the SDK version without recording it. Add "
                    f"this as the FIRST entry of 'sdk_versions':\n\n"
                    f'      {{\n'
                    f'        "version": "{code_version}",\n'
                    f'        "pushed_date": "YYYY-MM-DD",\n'
                    f'        "description": "What changed in this release."\n'
                    f'      }}\n'
                )

    # --- mirrors that must not drift ----------------------------------------
    for mirror in cfg.get("version_mirrors") or []:
        mpath, mkind = mirror.get("file"), mirror.get("type")
        if not mpath or not os.path.exists(mpath):
            continue
        mver = read_version(mpath, mkind)
        if mver and code_version and mver != code_version:
            fail(f"{mpath} declares {mver!r} but {manifest} declares "
                 f"{code_version!r}. These must stay in sync.")

    # --- report --------------------------------------------------------------
    sdk = cfg.get("sdk", "SDK")
    for w in warnings:
        print(f"{YELLOW}warning:{OFF} {w}")
    if errors:
        print(f"\n{RED}{BOLD}SDK version check failed for {sdk}.{OFF}\n")
        for e in errors:
            print(f"  {RED}x{OFF} {e}")
        print(f"\n  Manifest : {manifest}")
        print(f"  Config   : {CONFIG} ({len(entries)} versions, latest "
              f"{entries[0].get('version')!r})")
        return 1

    print(f"{GREEN}SDK version check passed for {sdk}.{OFF} "
          f"{manifest} declares {code_version!r} and it is the latest entry in "
          f"{CONFIG} ({len(entries)} versions recorded).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
