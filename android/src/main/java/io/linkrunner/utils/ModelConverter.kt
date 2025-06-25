package io.linkrunner.utils

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import io.linkrunner.sdk.models.PaymentStatus
import io.linkrunner.sdk.models.PaymentType
import io.linkrunner.sdk.models.request.CapturePaymentRequest
import io.linkrunner.sdk.models.request.RemovePaymentRequest
import io.linkrunner.sdk.models.request.UserDataRequest
import io.linkrunner.sdk.models.IntegrationData
import io.linkrunner.sdk.models.response.AttributionData
import io.linkrunner.sdk.models.response.ClientCampaignData
import io.linkrunner.sdk.models.response.GeneralResponse
import io.linkrunner.sdk.models.response.IPLocationData

/**
 * Utility class to convert React Native ReadableMap objects to Kotlin model objects and vice versa
 */
object ModelConverter {
    
    /**
     * Convert GeneralResponse to WritableMap
     */
    fun fromGeneralResponse(response: GeneralResponse?): WritableMap? {
        if (response == null) {
            return null
        }
        
        val map = Arguments.createMap()
        
        // Add IP location data if available
        response.ipLocationData?.let { ipData ->
            map.putMap("ip_location_data", fromIPLocationData(ipData))
        }
        
        // Add deeplink if available
        response.deeplink?.let { deeplink ->
            map.putString("deeplink", deeplink)
        }
        
        // Add root domain if available
        response.rootDomain?.let { rootDomain ->
            map.putBoolean("root_domain", rootDomain)
        }
        
        return map
    }
    
    /**
     * Convert ClientCampaignData to WritableMap
     */
    fun fromClientCampaignData(data: ClientCampaignData?): WritableMap? {
        if (data == null) {
            return null
        }
        
        val map = Arguments.createMap()
        
        // Add required fields
        map.putString("id", data.id)
        map.putString("name", data.name)
        map.putString("type", data.type)
        
        // Add optional fields if available
        data.adNetwork?.let { adNetwork ->
            map.putString("adNetwork", adNetwork)
        }
        
        data.groupName?.let { groupName ->
            map.putString("groupName", groupName)
        }
        
        data.assetGroupName?.let { assetGroupName ->
            map.putString("assetGroupName", assetGroupName)
        }
        
        data.assetName?.let { assetName ->
            map.putString("assetName", assetName)
        }
        
        return map
    }
    
    /**
     * Convert IPLocationData to WritableMap
     */
    fun fromIPLocationData(data: IPLocationData?): WritableMap? {
        if (data == null) {
            return null
        }
        
        val map = Arguments.createMap()
        
        // Add all fields if available
        data.ip?.let { ip ->
            map.putString("ip", ip)
        }
        
        data.city?.let { city ->
            map.putString("city", city)
        }
        
        data.countryLong?.let { countryLong ->
            map.putString("countryLong", countryLong)
        }
        
        data.countryShort?.let { countryShort ->
            map.putString("countryShort", countryShort)
        }
        
        data.latitude?.let { latitude ->
            map.putDouble("latitude", latitude)
        }
        
        data.longitude?.let { longitude ->
            map.putDouble("longitude", longitude)
        }
        
        data.region?.let { region ->
            map.putString("region", region)
        }
        
        data.timeZone?.let { timeZone ->
            map.putString("timeZone", timeZone)
        }
        
        data.zipCode?.let { zipCode ->
            map.putString("zipCode", zipCode)
        }
        
        return map
    }

    /**
     * Convert AttributionData to WritableMap
     */
    fun fromAttributionData(data: AttributionData?): WritableMap {
        val map = Arguments.createMap()
        
        if (data != null) {
            // Add the deeplink if it exists
            data.deeplink?.let { deeplink ->
                map.putString("deeplink", deeplink)
            }
            
            // Convert campaign data to a WritableMap if it exists
            data.campaignData?.let { campaignData ->
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
                
                map.putMap("campaignData", campaignDataMap)
            }
        }
        
        return map
    }

    /**
     * Convert a ReadableMap to UserDataRequest
     */
    fun toUserDataRequest(map: Map<String, Any>): UserDataRequest {
        return UserDataRequest(
            id = map["id"] as? String ?: "",
            name = map["name"] as? String,
            phone = map["phone"] as? String,
            email = map["email"] as? String,
            mixpanelDistinctId = map["mixpanel_distinct_id"] as? String,
            amplitudeDeviceId = map["amplitude_device_id"] as? String,
            posthogDistinctId = map["posthog_distinct_id"] as? String,
            userCreatedAt = map["user_created_at"] as? String,
            isFirstTimeUser = map["is_first_time_user"] as? Boolean
        )
    }

    /**
     * Convert a Map to IntegrationData
     */
    fun toIntegrationData(map: Map<String, Any>): IntegrationData {
        return IntegrationData(
            clevertapId = map["clevertapId"] as? String
        )
    }

    /**
     * Convert a ReadableMap to CapturePaymentRequest
     */
    fun toCapturePaymentRequest(map: Map<String, Any>): CapturePaymentRequest {
        val typeString = map["type"] as? String ?: "DEFAULT"
        val statusString = map["status"] as? String ?: "PAYMENT_COMPLETED"
        
        return CapturePaymentRequest(
            paymentId = map["paymentId"] as? String ?: "",
            userId = map["userId"] as? String ?: "",
            amount = (map["amount"] as? Number)?.toDouble() ?: 0.0,
            type = PaymentType.valueOf(typeString),
            status = PaymentStatus.valueOf(statusString)
        )
    }

    /**
     * Convert a ReadableMap to RemovePaymentRequest
     */
    fun toRemovePaymentRequest(map: Map<String, Any>): RemovePaymentRequest {
        return RemovePaymentRequest(
            paymentId = map["paymentId"] as? String ?: "",
            userId = map["userId"] as? String ?: ""
        )
    }
}
