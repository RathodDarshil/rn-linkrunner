package io.linkrunner.models;

/**
 * Java enum representing different types of payments to map to the Kotlin SDK's PaymentType
 */
public enum PaymentType {
    FIRST_PAYMENT("FIRST_PAYMENT"),
    WALLET_TOPUP("WALLET_TOPUP"),
    FUNDS_WITHDRAWAL("FUNDS_WITHDRAWAL"),
    SUBSCRIPTION_CREATED("SUBSCRIPTION_CREATED"),
    SUBSCRIPTION_RENEWED("SUBSCRIPTION_RENEWED"),
    ONE_TIME("ONE_TIME"),
    RECURRING("RECURRING"),
    DEFAULT("DEFAULT");

    private final String value;

    PaymentType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    /**
     * Convert this Java enum to the Kotlin SDK's PaymentType
     */
    public io.linkrunner.sdk.models.PaymentType toKotlinEnum() {
        switch (this) {
            case FIRST_PAYMENT:
                return io.linkrunner.sdk.models.PaymentType.FIRST_PAYMENT;
            case WALLET_TOPUP:
                return io.linkrunner.sdk.models.PaymentType.WALLET_TOPUP;
            case FUNDS_WITHDRAWAL:
                return io.linkrunner.sdk.models.PaymentType.FUNDS_WITHDRAWAL;
            case SUBSCRIPTION_CREATED:
                return io.linkrunner.sdk.models.PaymentType.SUBSCRIPTION_CREATED;
            case SUBSCRIPTION_RENEWED:
                return io.linkrunner.sdk.models.PaymentType.SUBSCRIPTION_RENEWED;
            case ONE_TIME:
                return io.linkrunner.sdk.models.PaymentType.ONE_TIME;
            case RECURRING:
                return io.linkrunner.sdk.models.PaymentType.RECURRING;
            default:
                return io.linkrunner.sdk.models.PaymentType.DEFAULT;
        }
    }

    /**
     * Get PaymentType from string value
     */
    public static PaymentType fromString(String text) {
        for (PaymentType type : PaymentType.values()) {
            if (type.value.equalsIgnoreCase(text)) {
                return type;
            }
        }
        return DEFAULT; // Default value
    }
}
