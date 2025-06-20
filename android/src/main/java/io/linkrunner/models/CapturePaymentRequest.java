package io.linkrunner.models;

import androidx.annotation.Nullable;

/**
 * Payment capture request model - Java implementation for the React Native module
 */
public class CapturePaymentRequest {
    private final String paymentId;
    private final String userId;
    private final double amount;
    private final PaymentType type;
    private final PaymentStatus status;

    public CapturePaymentRequest(String userId, double amount, @Nullable String paymentId, 
                                 PaymentType type, PaymentStatus status) {
        this.userId = userId;
        this.amount = amount;
        this.paymentId = paymentId;
        this.type = type;
        this.status = status;
    }

    /**
     * Convert this Java object to the Kotlin SDK's CapturePaymentRequest
     */
    public io.linkrunner.sdk.models.request.CapturePaymentRequest toKotlinModel() {
        return new io.linkrunner.sdk.models.request.CapturePaymentRequest(
                paymentId,
                userId,
                amount,
                type.toKotlinEnum(),
                status.toKotlinEnum()
        );
    }
}
