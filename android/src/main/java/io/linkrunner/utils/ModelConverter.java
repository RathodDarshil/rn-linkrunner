package io.linkrunner.utils;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableArray;

import io.linkrunner.models.CapturePaymentRequest;
import io.linkrunner.models.PaymentStatus;
import io.linkrunner.models.PaymentType;
import io.linkrunner.models.RemovePaymentRequest;
import io.linkrunner.models.UserDataRequest;

import io.linkrunner.sdk.models.response.ClientCampaignData;
import io.linkrunner.sdk.models.response.GeneralResponse;
import io.linkrunner.sdk.models.response.IPLocationData;

/**
 * Utility class to convert React Native ReadableMap objects to Java model objects
 */
public class ModelConverter {    
    
    /**
     * Convert GeneralResponse to WritableMap
     */
    public static WritableMap fromGeneralResponse(GeneralResponse response) {
        if (response == null) {
            return null;
        }
        
        WritableMap map = Arguments.createMap();
        
        // Add IP location data if available
        if (response.getIpLocationData() != null) {
            map.putMap("ip_location_data", fromIPLocationData(response.getIpLocationData()));
        }
        
        // Add deeplink if available
        if (response.getDeeplink() != null) {
            map.putString("deeplink", response.getDeeplink());
        }
        
        // Add root domain if available
        if (response.getRootDomain() != null) {
            map.putBoolean("root_domain", response.getRootDomain());
        }
        
        return map;
    }
    
    /**
     * Convert ClientCampaignData to WritableMap
     */
    public static WritableMap fromClientCampaignData(ClientCampaignData data) {
        if (data == null) {
            return null;
        }
        
        WritableMap map = Arguments.createMap();
        
        // Add required fields
        map.putString("id", data.getId());
        map.putString("name", data.getName());
        map.putString("type", data.getType());
        
        // Add optional fields if available
        if (data.getAdNetwork() != null) {
            map.putString("ad_network", data.getAdNetwork());
        }
        
        if (data.getGroupName() != null) {
            map.putString("group_name", data.getGroupName());
        }
        
        if (data.getAssetGroupName() != null) {
            map.putString("asset_group_name", data.getAssetGroupName());
        }
        
        if (data.getAssetName() != null) {
            map.putString("asset_name", data.getAssetName());
        }
        
        return map;
    }
    
    /**
     * Convert IPLocationData to WritableMap
     */
    public static WritableMap fromIPLocationData(IPLocationData data) {
        if (data == null) {
            return null;
        }
        
        WritableMap map = Arguments.createMap();
        
        // Add all fields if available
        if (data.getIp() != null) {
            map.putString("ip", data.getIp());
        }
        
        if (data.getCity() != null) {
            map.putString("city", data.getCity());
        }
        
        if (data.getCountryLong() != null) {
            map.putString("countryLong", data.getCountryLong());
        }
        
        if (data.getCountryShort() != null) {
            map.putString("countryShort", data.getCountryShort());
        }
        
        if (data.getLatitude() != null) {
            map.putDouble("latitude", data.getLatitude());
        }
        
        if (data.getLongitude() != null) {
            map.putDouble("longitude", data.getLongitude());
        }
        
        if (data.getRegion() != null) {
            map.putString("region", data.getRegion());
        }
        
        if (data.getTimeZone() != null) {
            map.putString("timeZone", data.getTimeZone());
        }
        
        if (data.getZipCode() != null) {
            map.putString("zipCode", data.getZipCode());
        }
        
        return map;
    }

    /**
     * Convert a ReadableMap to UserDataRequest
     */
    public static UserDataRequest toUserDataRequest(ReadableMap map) {
        if (map == null) {
            throw new IllegalArgumentException("User data map cannot be null");
        }
        
        if (!map.hasKey("id")) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        String id = map.getString("id");
        String name = map.hasKey("name") ? map.getString("name") : null;
        String phone = map.hasKey("phone") ? map.getString("phone") : null;
        String email = map.hasKey("email") ? map.getString("email") : null;
        String mixpanelDistinctId = map.hasKey("mixpanelDistinctId") ? map.getString("mixpanelDistinctId") : null;
        String amplitudeDeviceId = map.hasKey("amplitudeDeviceId") ? map.getString("amplitudeDeviceId") : null;
        String posthogDistinctId = map.hasKey("posthogDistinctId") ? map.getString("posthogDistinctId") : null;
        String userCreatedAt = map.hasKey("userCreatedAt") ? map.getString("userCreatedAt") : null;
        Boolean isFirstTimeUser = map.hasKey("isFirstTimeUser") ? map.getBoolean("isFirstTimeUser") : null;

        return new UserDataRequest(
            id, name, phone, email, mixpanelDistinctId,
            amplitudeDeviceId, posthogDistinctId, 
            userCreatedAt, isFirstTimeUser
        );
    }

    /**
     * Convert a ReadableMap to CapturePaymentRequest
     */
    public static CapturePaymentRequest toCapturePaymentRequest(ReadableMap map) {
        if (map == null) {
            throw new IllegalArgumentException("Payment data map cannot be null");
        }
        
        if (!map.hasKey("userId")) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        if (!map.hasKey("amount")) {
            throw new IllegalArgumentException("Amount is required");
        }
        
        String userId = map.getString("userId");
        double amount = map.getDouble("amount");
        String paymentId = map.hasKey("paymentId") ? map.getString("paymentId") : null;
        
        PaymentType type = PaymentType.DEFAULT;
        if (map.hasKey("type") && map.getString("type") != null) {
            type = PaymentType.fromString(map.getString("type"));
        }
        
        PaymentStatus status = PaymentStatus.PAYMENT_COMPLETED;
        if (map.hasKey("status") && map.getString("status") != null) {
            status = PaymentStatus.fromString(map.getString("status"));
        }
        
        return new CapturePaymentRequest(userId, amount, paymentId, type, status);
    }

    /**
     * Convert a ReadableMap to RemovePaymentRequest
     */
    public static RemovePaymentRequest toRemovePaymentRequest(ReadableMap map) {
        if (map == null) {
            throw new IllegalArgumentException("Payment data map cannot be null");
        }
        
        // Either paymentId or userId must be provided
        String paymentId = map.hasKey("paymentId") ? map.getString("paymentId") : null;
        String userId = map.hasKey("userId") ? map.getString("userId") : null;
        
        if (paymentId == null && userId == null) {
            throw new IllegalArgumentException("Either paymentId or userId must be provided");
        }
        
        return new RemovePaymentRequest(paymentId, userId);
    }
}
