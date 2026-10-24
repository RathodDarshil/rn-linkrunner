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
const sdk = require('../src/index.ts');
const linkrunner = sdk.default;
const { PaymentStatus } = sdk;

test.before(async () => {
  await linkrunner.init('token');
});

test.beforeEach(() => {
  calls.length = 0;
});

test('custom event calls native exactly as before', async () => {
  await linkrunner.trackEvent('signup_done', { plan: 'pro' }, 42);
  assert.deepEqual(calls, [['signup_done', { plan: 'pro' }, '42']]);
});

test('trackEvent with only an event name defaults the rest', async () => {
  await linkrunner.trackEvent('opened');
  assert.deepEqual(calls, [['opened', {}, null]]);
});

test('custom event with amount and currency in eventData is passed unchanged', async () => {
  await linkrunner.trackEvent('cart_value', { amount: 250, currency: 'INR', status: 'open', userId: 'u_7' });
  assert.deepEqual(calls, [['cart_value', { amount: 250, currency: 'INR', status: 'open', userId: 'u_7' }, null]]);
});

test('payment fields in eventData reach native unchanged, with numbers kept as numbers', async () => {
  await linkrunner.trackEvent('FIRST_PAYMENT', {
    amount: 1200,
    paymentId: 'bk_10231',
    currency: 'INR',
    userId: 'playo_u_8842',
    status: PaymentStatus.PAYMENT_CANCELLED,
    venue_id: 'v_221',
  });
  assert.equal(calls.length, 1);
  const [name, data, eventId] = calls[0];
  assert.equal(name, 'FIRST_PAYMENT');
  assert.equal(eventId, null);
  assert.equal(typeof data.amount, 'number');
  assert.deepEqual(data, {
    amount: 1200,
    paymentId: 'bk_10231',
    currency: 'INR',
    userId: 'playo_u_8842',
    status: 'PAYMENT_CANCELLED',
    venue_id: 'v_221',
  });
});

test('native payment errors are rethrown', async () => {
  const original = nativeModule.trackEvent;
  nativeModule.trackEvent = async () => {
    throw new Error('Failed to track event: amount, paymentId and currency must be sent together');
  };
  try {
    await assert.rejects(
      linkrunner.trackEvent('FIRST_PAYMENT', { amount: 1, paymentId: 'p' }),
      /must be sent together/
    );
  } finally {
    nativeModule.trackEvent = original;
  }
});

test('trackEvent is the only payment API', () => {
  for (const name of ['trackPayment', 'capturePayment', 'removePayment']) {
    assert.equal(typeof linkrunner[name], 'undefined', name);
  }
});

test('PaymentStatus exposes the four statuses as strings', () => {
  assert.deepEqual(Object.values(PaymentStatus), [
    'PAYMENT_INITIATED',
    'PAYMENT_COMPLETED',
    'PAYMENT_FAILED',
    'PAYMENT_CANCELLED',
  ]);
});
