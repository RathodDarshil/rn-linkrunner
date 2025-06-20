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
import io.linkrunner.sdk.models.response.InitResponse;
import io.linkrunner.sdk.models.response.TriggerResponse;
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

            try {
                linkrunnerSDK.initFromJava(
                        reactContext,
                        token,
                        link,
                        source,
                        secretKey,
                        keyId,
                        initResponse -> {
                            try {
                                WritableMap response = io.linkrunner.utils.ModelConverter.fromInitResponse(initResponse);
                                if (response == null) {
                                    response = Arguments.createMap();
                                }

                                response.putString("status", "success");
                                response.putString("message", "Linkrunner SDK initialized successfully");
                                promise.resolve(response);

                                return Unit.INSTANCE;
                            } catch (Exception e) {
                              promise.reject("CALLBACK_ERROR", "Error in success callback: " + e.getMessage(), e);
                              return Unit.INSTANCE;
                            }
                        },
                        exception -> {
                          promise.reject("INIT_ERROR", "Failed to initialize Linkrunner: " +
                              exception.getMessage(), exception);

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
            if (data != null) {
                additionalData = MapUtils.readableMapToMap(data);
            }

            // Call native SDK signup method with proper callback handling
            linkrunnerSDK.signupFromJava(
                userDataRequest.toKotlinModel(),
                additionalData,
                triggerResponse -> {
                    Log.i(TAG, "signup: Success callback received");
                    try {
                        // Convert the Kotlin TriggerResponse to a JavaScript-friendly WritableMap
                        WritableMap response = io.linkrunner.utils.ModelConverter.fromTriggerResponse(triggerResponse);

                        // Add status and message for better client-side handling
                        if (response == null) {
                            response = Arguments.createMap();
                        }
                        response.putString("status", "success");
                        response.putString("message", "User signed up successfully");

                        // Resolve the promise with the properly converted response
                        promise.resolve(response);
                        Log.i(TAG, "signup: Promise resolved successfully");
                        return Unit.INSTANCE;
                    } catch (Exception e) {
                        Log.e(TAG, "signup: Exception in success callback: " + e.getMessage(), e);
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
    public void triggerDeeplink(Promise promise) {
        try {
            // Call native SDK triggerDeeplink method with proper callback
            linkrunnerSDK.triggerDeeplinkFromJava(
              () -> {
                    // Convert the Kotlin TriggerResponse to a JavaScript-friendly WritableMap

                    WritableMap response = Arguments.createMap();
                    response.putString("status", "success");
                    response.putString("message", "Deeplink triggered successfully");

                    // Resolve the promise with the properly converted response
                    promise.resolve(response);
                    return Unit.INSTANCE;
                },
                exception -> {
                    promise.reject("TRIGGER_DEEPLINK_ERROR", "Failed to trigger deeplink: " + exception.getMessage(), exception);
                    return Unit.INSTANCE;
                }
            );
        } catch (Exception e) {
            promise.reject("TRIGGER_DEEPLINK_ERROR", "Failed to trigger deeplink: " + e.getMessage(), e);
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
    public void processGoogleAnalytics(Promise promise) {
        try {
            // Note: This method might not be available in the SDK
            // Provide a meaningful response or error based on availability
            WritableMap response = Arguments.createMap();
            response.putString("status", "not_implemented");
            response.putString("message", "This functionality is not currently available in the SDK");

            promise.resolve(response);
        } catch (Exception e) {
            promise.reject("PROCESS_GA_ERROR", "Failed to process Google Analytics: " + e.getMessage(), e);
        }
    }

    @ReactMethod
    public void getDeviceData(Promise promise) {
        try {
            // Note: This method might not be directly available in the SDK
            // Create a response with basic device information from the context
            WritableMap deviceData = Arguments.createMap();

            // Add device information available from context
            deviceData.putString("platform", "android");
            deviceData.putString("osVersion", android.os.Build.VERSION.RELEASE);
            deviceData.putString("deviceModel", android.os.Build.MODEL);
            deviceData.putString("manufacturer", android.os.Build.MANUFACTURER);

            promise.resolve(deviceData);
        } catch (Exception e) {
            promise.reject("GET_DEVICE_DATA_ERROR", "Failed to get device data: " + e.getMessage(), e);
        }
    }
}
