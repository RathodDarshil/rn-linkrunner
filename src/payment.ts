import type { EventPayment, PaymentStatus } from './types';

const PAYMENT_STATUSES: readonly PaymentStatus[] = [
  'PAYMENT_INITIATED',
  'PAYMENT_COMPLETED',
  'PAYMENT_FAILED',
  'PAYMENT_CANCELLED',
];

const CURRENCY_PATTERN = /^[A-Za-z]{3}$/;

/**
 * Validates a payment with the same rules as the native SDKs and returns the
 * normalized payload for the bridge (currency trimmed and uppercased, status
 * defaulted to PAYMENT_COMPLETED).
 */
export function normalizeEventPayment(payment: EventPayment): EventPayment {
  if (payment == null || typeof payment !== 'object') {
    throw new Error('Linkrunner: payment must be an object');
  }

  const { amount, paymentId, currency, userId, status } = payment;

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    throw new Error('Linkrunner: payment.amount must be a finite number >= 0');
  }

  if (typeof paymentId !== 'string' || paymentId.trim().length === 0) {
    throw new Error('Linkrunner: payment.paymentId is required');
  }

  const code = typeof currency === 'string' ? currency.trim() : '';
  if (!CURRENCY_PATTERN.test(code)) {
    throw new Error(
      'Linkrunner: payment.currency must be a 3 letter ISO 4217 code'
    );
  }

  if (typeof userId !== 'string') {
    throw new Error(
      "Linkrunner: payment.userId is required (pass '' to use the saved user)"
    );
  }

  if (status != null && !PAYMENT_STATUSES.includes(status)) {
    throw new Error(
      `Linkrunner: payment.status must be one of ${PAYMENT_STATUSES.join(', ')}`
    );
  }

  return {
    amount,
    paymentId,
    currency: code.toUpperCase(),
    userId,
    status: status ?? 'PAYMENT_COMPLETED',
  };
}
