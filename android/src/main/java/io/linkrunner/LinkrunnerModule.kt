package io.linkrunner

import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import io.linkrunner.sdk.BuildConfig
import io.linkrunner.sdk.LinkRunner
import io.linkrunner.sdk.models.request.UserDataRequest
import io.linkrunner.sdk.models.IntegrationData
import io.linkrunner.utils.MapUtils
import io.linkrunner.utils.ModelConverter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LinkrunnerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val TAG = "LinkrunnerModule"
    private val linkrunnerSDK = LinkRunner.getInstance()
    private val moduleScope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    override fun getName(): String {
        return "LinkrunnerSDK"
    }

    @ReactMethod
    fun init(token: String, options: ReadableMap?, promise: Promise) {
        try {
            // Extract optional parameters
            val secretKey = options?.getString("secretKey")
            val keyId = options?.getString("keyId")
            val debug = options?.getBoolean("debug") ?: false

            val packageVersion = options?.getString("packageVersion") ?: "2.4.1" // React Native package version

            if (token.isEmpty()) {
                promise.reject("INIT_ERROR", "Token is required")
                return
            }

            moduleScope.launch {
                try {
                    // Configure SDK with client platform and version prior to init
                    try {
                        val platform = "REACT_NATIVE"
                        val packageVersion = packageVersion // React Native package version
                        LinkRunner.configureSDK(platform, packageVersion)
                    } catch (e: Exception) {
                        Log.w(TAG, "configureSDK failed: ${e.message}")
                    }
                    
                    val result = linkrunnerSDK.init(
                        context = reactContext,
                        token = token,
                        secretKey = secretKey,
                        keyId = keyId,
                        debug = debug
                    )
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "Linkrunner SDK initialized successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "INIT_ERROR", 
                                "Failed to initialize Linkrunner: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("INIT_ERROR", "Exception calling init: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize Linkrunner: ${e.message}", e)
        }
    }

    @ReactMethod
    fun signup(userData: ReadableMap, data: ReadableMap?, promise: Promise) {
        try {
            // Convert ReadableMap to native Map for userData
            val userDataMap = MapUtils.readableMapToMap(userData)

            // Convert ReadableMap to native Map for additionalData
            val additionalData = if (data != null && !data.toHashMap().isEmpty()) {
                MapUtils.readableMapToMap(data)
            } else {
                null
            }

            moduleScope.launch {
                try {
                    val result = linkrunnerSDK.signup(
                        userData = ModelConverter.toUserDataRequest(userDataMap),
                        additionalData = additionalData
                    )
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "User signed up successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "SIGNUP_ERROR", 
                                "Failed to signup user: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("SIGNUP_ERROR", "Exception during signup: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("SIGNUP_ERROR", "Failed to signup user: ${e.message}", e)
        }
    }

    @ReactMethod
    fun setUserData(userData: ReadableMap, promise: Promise) {
        try {
            // Convert ReadableMap to native Map for userData
            val userDataMap = MapUtils.readableMapToMap(userData)

            moduleScope.launch {
                try {
                    val result = linkrunnerSDK.setUserData(ModelConverter.toUserDataRequest(userDataMap))
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "User data set successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "SET_USER_DATA_ERROR", 
                                "Failed to set user data: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("SET_USER_DATA_ERROR", "Exception setting user data: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("SET_USER_DATA_ERROR", "Failed to set user data: ${e.message}", e)
        }
    }

    @ReactMethod
    fun trackEvent(eventName: String, eventData: ReadableMap?, promise: Promise) {
        if (eventName.isEmpty()) {
            promise.reject("TRACK_EVENT_ERROR", "Event name is required")
            return
        }

        try {
            val eventDataMap = if (eventData != null) {
                MapUtils.readableMapToMap(eventData)
            } else {
                emptyMap()
            }

            moduleScope.launch {
                try {
                    val result = linkrunnerSDK.trackEvent(eventName, eventDataMap)
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "Event tracked successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "TRACK_EVENT_ERROR", 
                                "Failed to track event: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("TRACK_EVENT_ERROR", "Exception tracking event: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("TRACK_EVENT_ERROR", "Failed to track event: ${e.message}", e)
        }
    }

    @ReactMethod
    fun capturePayment(paymentData: ReadableMap, promise: Promise) {
        if (paymentData == null) {
            promise.reject("PAYMENT_ERROR", "Payment data is required")
            return
        }

        try {
            val paymentDataMap = MapUtils.readableMapToMap(paymentData)
            
            moduleScope.launch {
                try {
                    val result = linkrunnerSDK.capturePayment(ModelConverter.toCapturePaymentRequest(paymentDataMap))
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "Payment captured successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "PAYMENT_ERROR", 
                                "Failed to capture payment: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("PAYMENT_ERROR", "Exception capturing payment: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("PAYMENT_ERROR", "Failed to capture payment: ${e.message}", e)
        }
    }

    @ReactMethod
    fun removePayment(paymentData: ReadableMap, promise: Promise) {
        if (paymentData == null) {
            promise.reject("REMOVE_PAYMENT_ERROR", "Payment data is required")
            return
        }

        try {
            val paymentDataMap = MapUtils.readableMapToMap(paymentData)
            
            moduleScope.launch {
                try {
                    val result = linkrunnerSDK.removePayment(ModelConverter.toRemovePaymentRequest(paymentDataMap))
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "Payment removed successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "REMOVE_PAYMENT_ERROR", 
                                "Failed to remove payment: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("REMOVE_PAYMENT_ERROR", "Exception removing payment: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("REMOVE_PAYMENT_ERROR", "Failed to remove payment: ${e.message}", e)
        }
    }

    @ReactMethod
    fun getAttributionData(promise: Promise) {
        moduleScope.launch {
            try {
                val result = linkrunnerSDK.getAttributionData()
                
                withContext(Dispatchers.Main) {
                    if (result.isSuccess) {
                        val attributionData = result.getOrNull()
                        
                        // Convert the attribution data to a WritableMap
                        val response = Arguments.createMap()
                        
                        if (attributionData != null) {
                            // Add the deeplink if it exists
                            attributionData.deeplink?.let { deeplink ->
                                response.putString("deeplink", deeplink)
                            }
                            
                            // Convert campaign data to a WritableMap if it exists
                            attributionData.campaignData?.let { campaignData ->
                                val campaignDataMap = Arguments.createMap()
                                campaignDataMap.putString("id", campaignData.id)
                                campaignDataMap.putString("name", campaignData.name)
                                
                                campaignData.adNetwork?.let { adNetwork ->
                                    campaignDataMap.putString("adNetwork", adNetwork)
                                }
                                
                                campaignDataMap.putString("type", campaignData.type)
                                campaignDataMap.putString("installedAt", campaignData.installedAt)
                                
                                campaignData.storeClickAt?.let { storeClickAt ->
                                    campaignDataMap.putString("storeClickAt", storeClickAt)
                                }
                                
                                campaignDataMap.putString("groupName", campaignData.groupName)
                                campaignDataMap.putString("assetName", campaignData.assetName)
                                campaignDataMap.putString("assetGroupName", campaignData.assetGroupName)
                                
                                response.putMap("campaignData", campaignDataMap)
                            }
                        }
                        
                        response.putString("status", "success")
                        response.putString("message", "Attribution data retrieved successfully")
                        
                        promise.resolve(response)
                    } else {
                        promise.reject(
                            "ATTRIBUTION_DATA_ERROR", 
                            "Failed to get attribution data: ${result.exceptionOrNull()?.message}",
                            result.exceptionOrNull()
                        )
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    promise.reject("ATTRIBUTION_DATA_ERROR", "Exception getting attribution data: ${e.message}", e)
                }
            }
        }
    }

    @ReactMethod
    fun setAdditionalData(integrationDataMap: ReadableMap?, promise: Promise) {
        if (integrationDataMap == null || integrationDataMap.toHashMap().isEmpty()) {
            promise.reject("ADDITIONAL_DATA_ERROR", "Integration data is required")
            return
        }
        
        try {
            val additionalData = MapUtils.readableMapToMap(integrationDataMap)
            
            moduleScope.launch {
                try {
                    // Convert Map to IntegrationData
                    val integrationData = ModelConverter.toIntegrationData(additionalData)
                    val result = linkrunnerSDK.setAdditionalData(integrationData)
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "Additional data set successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "ADDITIONAL_DATA_ERROR", 
                                "Failed to set additional data: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("ADDITIONAL_DATA_ERROR", "Exception setting additional data: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("ADDITIONAL_DATA_ERROR", "Failed to set additional data: ${e.message}", e)
        }
    }

    @ReactMethod
    fun enablePIIHashing(enabled: Boolean) {
        try {
            // Call the SDK's enablePIIHashing method
            linkrunnerSDK.enablePIIHashing(enabled)
            
            if (BuildConfig.DEBUG) {
                Log.d(TAG, "Linkrunner: PII hashing ${if (enabled) "enabled" else "disabled"}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to ${if (enabled) "enable" else "disable"} PII hashing", e)
        }
    }

    @ReactMethod
    fun setPushToken(pushToken: String, promise: Promise) {
        if (pushToken.isBlank()) {
            promise.reject("SET_PUSH_TOKEN_ERROR", "Push token cannot be empty")
            return
        }

        try {
            moduleScope.launch {
                try {
                    val result = linkrunnerSDK.setPushToken(pushToken)
                    
                    withContext(Dispatchers.Main) {
                        if (result.isSuccess) {
                            val response = Arguments.createMap()
                            response.putString("status", "success")
                            response.putString("message", "Push token set successfully")
                            promise.resolve(response)
                        } else {
                            promise.reject(
                                "SET_PUSH_TOKEN_ERROR", 
                                "Failed to set push token: ${result.exceptionOrNull()?.message}",
                                result.exceptionOrNull()
                            )
                        }
                    }
                } catch (e: Exception) {
                    withContext(Dispatchers.Main) {
                        promise.reject("SET_PUSH_TOKEN_ERROR", "Exception setting push token: ${e.message}", e)
                    }
                }
            }
        } catch (e: Exception) {
            promise.reject("SET_PUSH_TOKEN_ERROR", "Failed to set push token: ${e.message}", e)
        }
    }
}
