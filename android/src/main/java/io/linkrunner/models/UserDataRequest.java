package io.linkrunner.models;

import androidx.annotation.Nullable;

/**
 * User data model for API requests - Java implementation for the React Native module
 */
public class UserDataRequest {
    private final String id;
    private final String name;
    private final String phone;
    private final String email;
    private final String mixpanelDistinctId;
    private final String amplitudeDeviceId;
    private final String posthogDistinctId;
    private final String userCreatedAt;
    private final Boolean isFirstTimeUser;

    public UserDataRequest(String id, @Nullable String name, @Nullable String phone, 
                           @Nullable String email, @Nullable String mixpanelDistinctId,
                           @Nullable String amplitudeDeviceId, @Nullable String posthogDistinctId,
                           @Nullable String userCreatedAt, @Nullable Boolean isFirstTimeUser) {
        this.id = id;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.mixpanelDistinctId = mixpanelDistinctId;
        this.amplitudeDeviceId = amplitudeDeviceId;
        this.posthogDistinctId = posthogDistinctId;
        this.userCreatedAt = userCreatedAt;
        this.isFirstTimeUser = isFirstTimeUser;
    }

    /**
     * Convert this Java object to the Kotlin SDK's UserDataRequest
     */
    public io.linkrunner.sdk.models.request.UserDataRequest toKotlinModel() {
        return new io.linkrunner.sdk.models.request.UserDataRequest(
                id, name, phone, email, mixpanelDistinctId,
                amplitudeDeviceId, posthogDistinctId, 
                userCreatedAt, isFirstTimeUser
        );
    }
}
