package io.linkrunner.models;

import androidx.annotation.Nullable;

/**
 * Payment removal request model - Java implementation for the React Native module
 */
public class RemovePaymentRequest {
    private final String paymentId;
    private final String userId;

    public RemovePaymentRequest(@Nullable String paymentId, @Nullable String userId) {
        this.paymentId = paymentId;
        this.userId = userId;
        
        // Either paymentId or userId must be provided
        if (paymentId == null && userId == null) {
            throw new IllegalArgumentException("Either paymentId or userId must be provided");
        }
    }

    /**
     * Convert this Java object to the Kotlin SDK's RemovePaymentRequest
     */
    public io.linkrunner.sdk.models.request.RemovePaymentRequest toKotlinModel() {
        return new io.linkrunner.sdk.models.request.RemovePaymentRequest(
                paymentId,
                userId
        );
    }
}
