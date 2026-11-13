const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2019,
      esModuleInterop: true,
    },
    fileName: filename,
  });
  module._compile(outputText, filename);
};

const calls = [];
const nativeModule = {
  init: async (...args) => {
    calls.push(['init', ...args]);
    return { status: 'success' };
  },
  initializeSDK: async (...args) => {
    calls.push(['initializeSDK', ...args]);
  },
};
const platform = { OS: 'android', select: (o) => o.default };

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'react-native') {
    return { NativeModules: { LinkrunnerSDK: nativeModule }, Platform: platform };
  }
  return originalLoad.call(this, request, ...rest);
};

global.__DEV__ = false;
const linkrunner = require('../src/index.ts').default;

test.beforeEach(() => {
  calls.length = 0;
});

for (const os of ['android', 'ios']) {
  const options = () => (os === 'android' ? calls[0][2] : calls[0][1]);

  test(`${os}: privacyMode left out reaches native as null, not false`, async () => {
    platform.OS = os;
    await linkrunner.init('token');
    assert.equal(calls.length, 1);
    assert.ok('privacyMode' in options());
    assert.equal(options().privacyMode, null);
  });

  test(`${os}: privacyMode true and false are passed through`, async () => {
    platform.OS = os;
    await linkrunner.init('token', undefined, undefined, undefined, false, true);
    assert.equal(options().privacyMode, true);
    calls.length = 0;
    await linkrunner.init('token', undefined, undefined, undefined, false, false);
    assert.equal(options().privacyMode, false);
  });
}
