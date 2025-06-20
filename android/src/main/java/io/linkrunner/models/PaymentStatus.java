package io.linkrunner.models;

/**
 * Java enum representing different payment statuses to map to the Kotlin SDK's PaymentStatus
 */
public enum PaymentStatus {
    PAYMENT_INITIATED("PAYMENT_INITIATED"),
    PAYMENT_COMPLETED("PAYMENT_COMPLETED"),
    PAYMENT_FAILED("PAYMENT_FAILED"),
    PAYMENT_CANCELLED("PAYMENT_CANCELLED");

    private final String value;

    PaymentStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    /**
     * Convert this Java enum to the Kotlin SDK's PaymentStatus
     */
    public io.linkrunner.sdk.models.PaymentStatus toKotlinEnum() {
        switch (this) {
            case PAYMENT_INITIATED:
                return io.linkrunner.sdk.models.PaymentStatus.PAYMENT_INITIATED;
            case PAYMENT_COMPLETED:
                return io.linkrunner.sdk.models.PaymentStatus.PAYMENT_COMPLETED;
            case PAYMENT_FAILED:
                return io.linkrunner.sdk.models.PaymentStatus.PAYMENT_FAILED;
            case PAYMENT_CANCELLED:
                return io.linkrunner.sdk.models.PaymentStatus.PAYMENT_CANCELLED;
            default:
                return io.linkrunner.sdk.models.PaymentStatus.PAYMENT_COMPLETED;
        }
    }

    /**
     * Get PaymentStatus from string value
     */
    public static PaymentStatus fromString(String text) {
        for (PaymentStatus status : PaymentStatus.values()) {
            if (status.value.equalsIgnoreCase(text)) {
                return status;
            }
        }
        return PAYMENT_COMPLETED; // Default value
    }
}
