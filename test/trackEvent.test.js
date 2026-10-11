const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const ts = require('typescript');

// Load src/*.ts in Node by transpiling to CommonJS and swapping react-native for a stub.
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
  trackEvent: async (...args) => {
    calls.push(args);
    return { status: 'success' };
  },
  init: async () => ({ status: 'success' }),
};

const originalLoad = Module._load;
Module._load = function (request, ...rest) {
  if (request === 'react-native') {
    return {
      NativeModules: { LinkrunnerSDK: nativeModule },
      Platform: { OS: 'android', select: (o) => o.default },
    };
  }
  return originalLoad.call(this, request, ...rest);
};

global.__DEV__ = false;
const linkrunner = require('../src/index.ts').default;

test.before(async () => {
  await linkrunner.init('token');
});

test.beforeEach(() => {
  calls.length = 0;
});

test('trackEvent without payment calls native as before, with a null payment', async () => {
  await linkrunner.trackEvent('signup_done', { plan: 'pro' }, 42);
  assert.deepEqual(calls, [['signup_done', { plan: 'pro' }, '42', null]]);
});

test('trackEvent with only an event name defaults the rest', async () => {
  await linkrunner.trackEvent('opened');
  assert.deepEqual(calls, [['opened', {}, null, null]]);
});

test('trackEvent passes payment fields through and normalizes currency', async () => {
  await linkrunner.trackEvent('purchase', { sku: 'a' }, 'ord_1', {
    amount: 499.5,
    paymentId: 'ord_1',
    currency: ' inr ',
    status: 'PAYMENT_COMPLETED',
  });
  assert.deepEqual(calls, [
    [
      'purchase',
      { sku: 'a' },
      'ord_1',
      {
        amount: 499.5,
        paymentId: 'ord_1',
        currency: 'INR',
        status: 'PAYMENT_COMPLETED',
      },
    ],
  ]);
});

test('payment status is optional and left out when not set', async () => {
  await linkrunner.trackEvent('purchase', undefined, undefined, {
    amount: 0,
    paymentId: 'ord_2',
    currency: 'USD',
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][3], { amount: 0, paymentId: 'ord_2', currency: 'USD' });
  assert.equal('status' in calls[0][3], false);
});

test('invalid payments are rejected before reaching native', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const bad = [
      { amount: -1, paymentId: 'p', currency: 'USD' },
      { amount: NaN, paymentId: 'p', currency: 'USD' },
      { amount: Infinity, paymentId: 'p', currency: 'USD' },
      { amount: '10', paymentId: 'p', currency: 'USD' },
      { amount: 1, paymentId: '', currency: 'USD' },
      { amount: 1, paymentId: '   ', currency: 'USD' },
      { amount: 1, paymentId: 'p', currency: '' },
      { amount: 1, paymentId: 'p', currency: 'US' },
      { amount: 1, paymentId: 'p', currency: 'USDT' },
      { amount: 1, paymentId: 'p', currency: 'U5D' },
      { amount: 1, paymentId: 'p', currency: 'USD', status: 'REFUNDED' },
    ];
    for (const payment of bad) {
      await assert.rejects(
        linkrunner.trackEvent('purchase', {}, undefined, payment),
        /Linkrunner: payment\./,
        JSON.stringify(payment)
      );
    }
  } finally {
    console.error = originalError;
  }
  assert.equal(calls.length, 0);
});

test('capturePayment and removePayment are gone', () => {
  assert.equal(linkrunner.capturePayment, undefined);
  assert.equal(linkrunner.removePayment, undefined);
});
