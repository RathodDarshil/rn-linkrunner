# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.1] - 2026-04-02

### Changed

- Upgraded native iOS SDK (LinkrunnerKit) to 3.9.0

## [2.9.0] - 2026-03-21

### Added

- **Netcore Integration**: Added `netcore_device_guid` field to user data for Netcore device tracking integration

### Changed

- Upgraded native Android SDK to 3.7.0
- Upgraded native iOS SDK to 3.9.0

## [2.8.0] - 2026-03-12

### Added

- **Uninstall Tracking (iOS)**: Implemented `setPushToken` on the iOS native bridge to forward push tokens to the Linkrunner backend via LinkrunnerKit, enabling uninstall tracking for iOS

### Fixed

- Fixed iOS `setPushToken` being a no-op stub that never called the native SDK
- Added missing `setPushToken` export in the Objective-C bridge (`LinkrunnerSDK.m`)

## [2.7.1] - 2026-03-05

### Fixed

- Fixed iOS attribution data response to use camelCase keys for consistency with JavaScript naming conventions

## [2.7.0] - 2026-03-05

### Added

- Added optional event data parameter to payment capture functionality, allowing additional event information to be included with transactions.

## [2.6.3] - 2026-01-29

### Added

- **Google Analytics Session ID**: Added support for `ga_session_id` field in user data collection

## [2.6.2] - 2026-01-02

- Added support for Meta view through attribution

## [2.6.1] - 2025-12-30

- Removed trailing commas to fix syntax errors when building with older versions of Swift

## [2.6.0] - 2025-12-16

- Upgraded the Native iOS version to support apple search ads attribution

## [2.5.2] - 2025-12-11

- Removed jcenter() from Gradle repositories configuration as it is no longer supported in recent Gradle and Android Gradle Plugin versions.

## [2.5.0] - 2025-11-10

### Added

- **Third-Party Integration Fields**: Added Braze device ID and Google Analytics app instance ID fields to user data collection

## [2.4.3] - 2025-10-01

### Added

- **Android Backup Configuration**: Added backup exclusion config files for LinkRunner SharedPreferences on Android versions 6-11 and 12+
