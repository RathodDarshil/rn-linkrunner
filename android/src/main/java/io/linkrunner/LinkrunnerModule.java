package io.linkrunner;

import android.app.Activity;
import android.content.Context;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import io.linkrunner.models.CapturePaymentRequest;
import io.linkrunner.models.RemovePaymentRequest;
import io.linkrunner.models.UserDataRequest;
import io.linkrunner.sdk.LinkRunner;
import io.linkrunner.sdk.models.response.AttributionData;
import io.linkrunner.sdk.models.IntegrationData;
import io.linkrunner.utils.MapUtils;
import io.linkrunner.utils.ModelConverter;

import java.lang.reflect.Method;
import java.util.Map;
import kotlin.Result;
import kotlin.Unit;
import kotlin.jvm.functions.Function1;

import androidx.annotation.NonNull;

public class LinkrunnerModule extends ReactContextBaseJavaModule {
    private static final String TAG = "LinkrunnerModule";

    private static final String MODULE_NAME = "LinkrunnerSDK";
    private final ReactApplicationContext reactContext;
    private final LinkRunner linkrunnerSDK;

    public LinkrunnerModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        // Initialize the native SDK instance
        this.linkrunnerSDK = LinkRunner.getInstance();
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void init(String token, ReadableMap options, Promise promise) {

        try {
            String link = null;
            String source = null;
            String secretKey = null;
            String keyId = null;

            // Extract optional parameters if provided
            if (options != null) {
                if (options.hasKey("link")) {
                    link = options.getString("link");
                }

                if (options.hasKey("source")) {
                    source = options.getString("source");
                }

                if (options.hasKey("secretKey")) {
                    secretKey = options.getString("secretKey");
                }

                if (options.hasKey("keyId")) {
                    keyId = options.getString("keyId");
                }
            }

            if (token == null || token.isEmpty()) {
                promise.reject("INIT_ERROR", "Token is required");
                return;
            }

            try {
                Log.i(TAG, "init: Initializing LinkRunner SDK");
                
                linkrunnerSDK.initFromJava(
                        reactContext,
                        token,
                        link,
                        source,
                        secretKey,
                        keyId,
                        baseResponse -> {
                            try {
                                // Create a response map for React Native
                                WritableMap response = Arguments.createMap();
                                
                                // Add status and message
                                response.putString("status", "success");
                                response.putString("message", "Linkrunner SDK initialized successfully");
                                promise.resolve(response);
                                Log.i(TAG, "init: SDK initialized successfully");
                                
                                return Unit.INSTANCE;
                            } catch (Exception e) {
                                Log.e(TAG, "init: Error in success callback: " + e.getMessage(), e);
                                promise.reject("CALLBACK_ERROR", "Error in success callback: " + e.getMessage(), e);
                                return Unit.INSTANCE;
                            }
                        },
                        exception -> {
                            promise.reject("INIT_ERROR", "Failed to initialize Linkrunner: " + exception.getMessage(), exception);
                            return Unit.INSTANCE;
                        }
                );
                Log.i(TAG, "init: initFromJava call completed (async operation started)");
            } catch (Exception e) {
                Log.e(TAG, "init: Exception calling initFromJava: " + e.getMessage(), e);
                promise.reject("INIT_ERROR", "Exception calling initFromJava: " + e.getMessage(), e);
            }
        } catch (Exception e) {
            promise.reject("INIT_ERROR", "Failed to initialize Linkrunner: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void signup(ReadableMap userData, ReadableMap data, Promise promise) {
        try {
            // Convert ReadableMap to our model
            UserDataRequest userDataRequest = ModelConverter.toUserDataRequest(userData);

            // Convert ReadableMap to native Map for additionalData
            Map<String, Object> additionalData = null;
            if (data != null && !data.toHashMap().isEmpty()) {
                additionalData = MapUtils.readableMapToMap(data);
            }

            // Call native SDK signup method with proper callback handling
            linkrunnerSDK.signupFromJava(
                userDataRequest.toKotlinModel(),
                additionalData,
                baseResponse -> {
                    Log.i(TAG, "signup: Success callback received");
                    try {
                        // Create response map
                        WritableMap response = Arguments.createMap();
                        
                        response.putString("status", "success");
                        response.putString("message", "User signed up successfully");
                        
                        if (baseResponse != null) {
                            if (baseResponse.getMessage() != null) {
                                response.putString("message", baseResponse.getMessage());
                            }
                        }

                        promise.resolve(response);
                        return Unit.INSTANCE;
                    } catch (Exception e) {
                        promise.reject("CALLBACK_ERROR", "Error in signup success callback: " + e.getMessage(), e);
                        return Unit.INSTANCE;
                    }
                },
                exception -> {
                    Log.e(TAG, "signup: Error callback received: " + exception.getMessage(), exception);
                    promise.reject("SIGNUP_ERROR", "Failed to signup user: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("SIGNUP_ERROR", "Failed to signup user: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void setUserData(ReadableMap userData, Promise promise) {
        try {
            // Convert ReadableMap to our model
            UserDataRequest userDataRequest = ModelConverter.toUserDataRequest(userData);

            // Call native SDK setUserData method with proper callback
            linkrunnerSDK.setUserDataFromJava(
                userDataRequest.toKotlinModel(),
              () -> {

                    WritableMap response = Arguments.createMap();
                    response.putString("status", "success");
                    response.putString("message", "User data set successfully");

                    // Resolve the promise with the properly converted response
                    promise.resolve(response);
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("SET_USER_DATA_ERROR", "Failed to set user data: " + exception.getMessage(), exception);
                    return exception;
                }
            );
        } catch (Exception e) {
            promise.reject("SET_USER_DATA_ERROR", "Failed to set user data: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void trackEvent(String eventName, ReadableMap eventData, Promise promise) {
        try {
            Map<String, Object> eventDataMap = null;
            if (eventData != null) {
                eventDataMap = MapUtils.readableMapToMap(eventData);
            }

            // Call native SDK trackEvent method with proper callback
            linkrunnerSDK.trackEventFromJava(
                eventName,
                eventDataMap,
              () -> {
                    // Convert the Kotlin GeneralResponse to a JavaScript-friendly WritableMap
//                    WritableMap response = io.linkrunner.utils.ModelConverter.fromGeneralResponse();

                    // Add status and message for better client-side handling
                    WritableMap response = Arguments.createMap();
                    response.putString("status", "success");
                    response.putString("message", "Event tracked successfully");

                    // Resolve the promise with the properly converted response
                    promise.resolve(response);
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("TRACK_EVENT_ERROR", "Failed to track event: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("TRACK_EVENT_ERROR", "Failed to track event: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void capturePayment(ReadableMap paymentData, Promise promise) {
        try {
            // Convert ReadableMap to our model
            CapturePaymentRequest capturePaymentRequest = ModelConverter.toCapturePaymentRequest(paymentData);

            // Call native SDK capturePayment method with proper callback
            linkrunnerSDK.capturePaymentFromJava(
                capturePaymentRequest.toKotlinModel(),
              () -> {
                    // Convert the Kotlin GeneralResponse to a JavaScript-friendly WritableMap
                    WritableMap response = Arguments.createMap();


                    response.putString("status", "success");
                    response.putString("message", "Payment captured successfully");

                    // Resolve the promise with the properly converted response
                    promise.resolve(response);
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("CAPTURE_PAYMENT_ERROR", "Failed to capture payment: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("CAPTURE_PAYMENT_ERROR", "Failed to capture payment: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void removePayment(ReadableMap paymentData, Promise promise) {
        try {
            // Convert ReadableMap to our model
            RemovePaymentRequest removePaymentRequest = ModelConverter.toRemovePaymentRequest(paymentData);

            // Call native SDK removePayment method with proper callback
            linkrunnerSDK.removePaymentFromJava(
                removePaymentRequest.toKotlinModel(),
              () -> {
                    // Convert the Kotlin GeneralResponse to a JavaScript-friendly WritableMap
                    WritableMap response = Arguments.createMap();
                    response.putString("status", "success");
                    response.putString("message", "Payment removed successfully");
                    promise.resolve(response);
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("REMOVE_PAYMENT_ERROR", "Failed to remove payment: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("REMOVE_PAYMENT_ERROR", "Failed to remove payment: " + e.getMessage(), e);
        }
    }
    
    @ReactMethod
    public void getAttributionData(Promise promise) {
        try {
            // Call native SDK getAttributionDataFromJava method with proper callback
            linkrunnerSDK.getAttributionDataFromJava(
                attributionData -> {
                    try {
                        // Convert the attribution data to a WritableMap
                        WritableMap response = Arguments.createMap();
                        
                        if (attributionData != null) {
                            // Add the deeplink if it exists
                            if (attributionData.getDeeplink() != null) {
                                response.putString("deeplink", attributionData.getDeeplink());
                            }
                            
                            // Convert campaign data to a WritableMap
                            if (attributionData.getCampaignData() != null) {
                                WritableMap campaignDataMap = Arguments.createMap();
                                campaignDataMap.putString("id", attributionData.getCampaignData().getId());
                                campaignDataMap.putString("name", attributionData.getCampaignData().getName());
                                
                                if (attributionData.getCampaignData().getAdNetwork() != null) {
                                    campaignDataMap.putString("adNetwork", attributionData.getCampaignData().getAdNetwork());
                                }
                                
                                campaignDataMap.putString("type", attributionData.getCampaignData().getType());
                                campaignDataMap.putString("installedAt", attributionData.getCampaignData().getInstalledAt());
                                
                                if (attributionData.getCampaignData().getStoreClickAt() != null) {
                                    campaignDataMap.putString("storeClickAt", attributionData.getCampaignData().getStoreClickAt());
                                }
                                
                                campaignDataMap.putString("groupName", attributionData.getCampaignData().getGroupName());
                                campaignDataMap.putString("assetName", attributionData.getCampaignData().getAssetName());
                                campaignDataMap.putString("assetGroupName", attributionData.getCampaignData().getAssetGroupName());
                                
                                response.putMap("campaignData", campaignDataMap);
                                
                            }
                        }
                        
                        response.putString("status", "success");
                        response.putString("message", "Attribution data retrieved successfully");
                        
                        promise.resolve(response);
                    } catch (Exception e) {
                        promise.reject("ATTRIBUTION_DATA_ERROR", "Error processing attribution data: " + e.getMessage(), e);
                    }
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("ATTRIBUTION_DATA_ERROR", "Failed to get attribution data: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("ATTRIBUTION_DATA_ERROR", "Failed to get attribution data: " + e.getMessage(), e);
        }
    }
    
    @ReactMethod
    public void setAdditionalData(ReadableMap integrationDataMap, Promise promise) {
        try {
            if (integrationDataMap == null || integrationDataMap.toHashMap().isEmpty()) {
                promise.reject("ADDITIONAL_DATA_ERROR", "Integration data is required");
                return;
            }
            
            // Create IntegrationData instance
            IntegrationData integrationData = new IntegrationData();
            
            // Extract clevertapId if present
            if (integrationDataMap.hasKey("clevertapId")) {
                integrationData.setClevertapId(integrationDataMap.getString("clevertapId"));
            }
            
            // Add other integration data fields here as they are added to the SDK
            
            // Call native SDK setAdditionalDataFromJava method
            linkrunnerSDK.setAdditionalDataFromJava(
                integrationData,
                () -> {
                    WritableMap response = Arguments.createMap();
                    response.putString("status", "success");
                    response.putString("message", "Additional data set successfully");
                    promise.resolve(response);
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("ADDITIONAL_DATA_ERROR", "Failed to set additional data: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("ADDITIONAL_DATA_ERROR", "Failed to set additional data: " + e.getMessage(), e);
        }
    }
}
