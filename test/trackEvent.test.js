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
    userId: 'user_1',
    status: 'PAYMENT_FAILED',
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
        userId: 'user_1',
        status: 'PAYMENT_FAILED',
      },
    ],
  ]);
});

test('payment status defaults to PAYMENT_COMPLETED and a blank userId is passed through', async () => {
  await linkrunner.trackEvent('purchase', undefined, undefined, {
    amount: 0,
    paymentId: 'ord_2',
    currency: 'USD',
    userId: '',
  });
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0][3], {
    amount: 0,
    paymentId: 'ord_2',
    currency: 'USD',
    userId: '',
    status: 'PAYMENT_COMPLETED',
  });
});

test('invalid payments are rejected before reaching native', async () => {
  const originalError = console.error;
  console.error = () => {};
  try {
    const bad = [
      { amount: -1, paymentId: 'p', currency: 'USD', userId: 'u' },
      { amount: NaN, paymentId: 'p', currency: 'USD', userId: 'u' },
      { amount: Infinity, paymentId: 'p', currency: 'USD', userId: 'u' },
      { amount: '10', paymentId: 'p', currency: 'USD', userId: 'u' },
      { amount: 1, paymentId: '', currency: 'USD', userId: 'u' },
      { amount: 1, paymentId: '   ', currency: 'USD', userId: 'u' },
      { amount: 1, paymentId: 'p', currency: '', userId: 'u' },
      { amount: 1, paymentId: 'p', currency: 'US', userId: 'u' },
      { amount: 1, paymentId: 'p', currency: 'USDT', userId: 'u' },
      { amount: 1, paymentId: 'p', currency: 'U5D', userId: 'u' },
      { amount: 1, paymentId: 'p', currency: 'USD', userId: 'u', status: 'REFUNDED' },
      { amount: 1, paymentId: 'p', currency: 'USD' },
      { amount: 1, paymentId: 'p', currency: 'USD', userId: null },
      { amount: 1, paymentId: 'p', currency: 'USD', userId: 42 },
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

test('trackPayment sends the payment through native trackEvent', async () => {
  await linkrunner.trackPayment({
    eventName: 'first_payment',
    paymentId: 'ord_3',
    userId: 'user_9',
    amount: 499,
    currency: 'inr',
    status: 'PAYMENT_INITIATED',
    eventData: { plan: 'pro' },
  });
  assert.deepEqual(calls, [
    [
      'first_payment',
      { plan: 'pro' },
      null,
      {
        amount: 499,
        paymentId: 'ord_3',
        currency: 'INR',
        userId: 'user_9',
        status: 'PAYMENT_INITIATED',
      },
    ],
  ]);
});

test('trackPayment defaults status to PAYMENT_COMPLETED and eventData to empty', async () => {
  await linkrunner.trackPayment({
    eventName: 'purchase',
    paymentId: 'ord_4',
    userId: '',
    amount: 0,
    currency: 'USD',
  });
  assert.deepEqual(calls, [
    [
      'purchase',
      {},
      null,
      {
        amount: 0,
        paymentId: 'ord_4',
        currency: 'USD',
        userId: '',
        status: 'PAYMENT_COMPLETED',
      },
    ],
  ]);
});

test('trackPayment rejects invalid input before reaching native', async () => {
  const originalError = console.error;
  console.error = () => {};
  const valid = {
    eventName: 'purchase',
    paymentId: 'p',
    userId: 'u',
    amount: 1,
    currency: 'USD',
  };
  try {
    const cases = [
      [{ ...valid, eventName: '' }, /eventName is required/],
      [{ ...valid, eventName: undefined }, /eventName is required/],
      [{ ...valid, userId: undefined }, /payment\.userId is required/],
      [{ ...valid, userId: null }, /payment\.userId is required/],
      [{ ...valid, paymentId: ' ' }, /payment\.paymentId is required/],
      [{ ...valid, amount: -5 }, /payment\.amount/],
      [{ ...valid, currency: 'RUPEE' }, /payment\.currency/],
      [{ ...valid, currency: undefined }, /payment\.currency/],
      [{ ...valid, status: 'REFUNDED' }, /payment\.status/],
    ];
    for (const [params, pattern] of cases) {
      await assert.rejects(linkrunner.trackPayment(params), pattern, JSON.stringify(params));
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

test('PaymentStatus enum exposes the four statuses and works with trackPayment', async () => {
  assert.deepEqual(Object.values(PaymentStatus), [
    'PAYMENT_INITIATED',
    'PAYMENT_COMPLETED',
    'PAYMENT_FAILED',
    'PAYMENT_CANCELLED',
  ]);
  calls.length = 0;
  await linkrunner.trackPayment({
    eventName: 'purchase',
    paymentId: 'order_enum',
    userId: 'user_1',
    amount: 10,
    currency: 'INR',
    status: PaymentStatus.PAYMENT_FAILED,
  });
  assert.equal(calls.at(-1)[3].status, 'PAYMENT_FAILED');
});
