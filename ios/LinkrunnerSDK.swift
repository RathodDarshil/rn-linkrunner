import Foundation
import LinkrunnerKit;
import React

@objc(LinkrunnerSDK)
class LinkrunnerSDK: NSObject {
    
    private var linkrunnerSDK: LinkrunnerKit.LinkrunnerSDK!
    
    override init() {
        linkrunnerSDK = LinkrunnerKit.LinkrunnerSDK.shared
    }
    
    
    // MARK: - Native SDK Method Wrappers
    
    @objc func initializeSDK(_ dict: NSDictionary) -> Void {
        guard let token = dict["token"] as? String else {
            print("Linkrunner: token is required")
            return
        }

        let secretKey = dict["secretKey"] as? String
        let keyId = dict["keyId"] as? String
        let disableIdfa = dict["disableIdfa"] as? Bool ?? false
        let debug = dict["debug"] as? Bool ?? false
    
        
        Task {
            do {
                try await linkrunnerSDK.initialize(token: token, secretKey: secretKey, keyId: keyId, disableIdfa: disableIdfa, debug: debug)
                print("Linkrunner: SDK initialized successfully")
            } catch {
                print("Linkrunner: Failed to initialize SDK: \(error)")
            }
        }
    }

    @objc func signup(_ userData: NSDictionary, data: NSDictionary? = nil) -> Void {
        guard let id = userData["id"] as? String else {
            print("Linkrunner: User ID is required")
            return
        }
        
        let userDataObj = UserData(
            id: id,
            name: userData["name"] as? String,
            phone: userData["phone"] as? String,
            email: userData["email"] as? String,
            isFirstTimeUser: userData["is_first_time_user"] as? Bool,
            userCreatedAt: userData["user_created_at"] as? String,
            mixPanelDistinctId: userData["mixpanel_distinct_id"] as? String,
            amplitudeDeviceId: userData["amplitude_device_id"] as? String,
            posthogDistinctId: userData["posthog_distinct_id"] as? String,
            brazeDeviceId: userData["braze_device_id"] as? String,
            gaAppInstanceId: userData["ga_app_instance_id"] as? String,
            gaSessionId: userData["ga_session_id"] as? String,
            netcoreDeviceGuid: userData["netcore_device_guid"] as? String
        )
        
        Task {
            do {
                if #available(iOS 15.0, *) {
                    try await linkrunnerSDK.signup(
                        userData: userDataObj,
                        additionalData: data as? [String: Any]
                    )
                    return
                } else {
                    print("UNSUPPORTED_VERSION: iOS 15.0 or later is required")
                }
            } catch {
                print("SIGNUP_ERROR", "Failed to complete signup: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc func setUserData(_ userData: NSDictionary) -> Void {
        guard let id = userData["id"] as? String else {
            print("Linkrunner: User ID is required")
            return
        }
        
        let userDataObj = UserData(
            id: id,
            name: userData["name"] as? String,
            phone: userData["phone"] as? String,
            email: userData["email"] as? String,
            isFirstTimeUser: userData["is_first_time_user"] as? Bool,
            userCreatedAt: userData["user_created_at"] as? String,
            mixPanelDistinctId: userData["mixpanel_distinct_id"] as? String,
            amplitudeDeviceId: userData["amplitude_device_id"] as? String,
            posthogDistinctId: userData["posthog_distinct_id"] as? String,
            brazeDeviceId: userData["braze_device_id"] as? String,
            gaAppInstanceId: userData["ga_app_instance_id"] as? String,
            gaSessionId: userData["ga_session_id"] as? String,
            netcoreDeviceGuid: userData["netcore_device_guid"] as? String
        )
        
        Task {
            do {
                try await linkrunnerSDK.setUserData(userDataObj)
                print("Linkrunner: User data set successfully")
            } catch {
                print("Linkrunner: Failed to set user data: \(error)")
            }
        }
    }
    
    @objc func trackEvent(_ eventName: NSString, eventData: NSDictionary?, eventId: NSString?, payment: NSDictionary?) -> Void {
        let eventPayment: EventPayment?
        do {
            eventPayment = try payment.map(makeEventPayment)
        } catch {
            print("Linkrunner: Failed to track event, invalid payment: \(error)")
            return
        }

        Task {
            let finalEventData = eventData as? [String: Any]
            let eventIdString = eventId as String?
            await linkrunnerSDK.trackEvent(
                eventName: eventName as String,
                eventData: finalEventData,
                eventId: eventIdString,
                payment: eventPayment
            )
            print("Linkrunner: Event tracked successfully")
        }
    }

    private func makeEventPayment(_ payment: NSDictionary) throws -> EventPayment {
        guard let amount = (payment["amount"] as? NSNumber)?.doubleValue else {
            throw EventPaymentError.invalidAmount
        }
        guard let paymentId = payment["paymentId"] as? String else {
            throw EventPaymentError.invalidPaymentId
        }
        guard let currency = payment["currency"] as? String else {
            throw EventPaymentError.invalidCurrency
        }
        guard let userId = payment["userId"] as? String else {
            throw BridgePaymentError.missingUserId
        }
        let status = (payment["status"] as? String).flatMap { PaymentStatus(rawValue: $0) } ?? .completed
        return try EventPayment(amount: amount, paymentId: paymentId, currency: currency, userId: userId, status: status)
    }

    @objc func enablePIIHashing(_ enabled: Bool) -> Void {
        Task {
            await linkrunnerSDK.enablePIIHashing(enabled)
            print("Linkrunner: PII hashing \(enabled ? "enabled" : "disabled")")
        }
    }
    
    @objc func requestTrackingAuthorization() -> Void {
        linkrunnerSDK.requestTrackingAuthorization { status in
            print("Linkrunner: Tracking authorization status: \(status.rawValue)")
        }
    }

    /// Maps a JS consent value to `ConsentStatus`.
    ///
    /// Anything absent or unrecognised becomes `.unknown`, which the native SDK omits
    /// from the payload rather than sending as a denial. JS booleans cannot express
    /// "not known", so the bridge takes strings: "granted", "denied" or "unknown".
    private func consentStatus(from value: Any?) -> ConsentStatus {
        guard let raw = value as? String else { return .unknown }
        return ConsentStatus(rawValue: raw.lowercased()) ?? .unknown
    }

    @objc func setConsent(_ consentData: NSDictionary) -> Void {
        let consent = LinkrunnerConsent(
            isEEA: consentStatus(from: consentData["isEEA"]),
            hasConsentForDataUsage: consentStatus(from: consentData["hasConsentForDataUsage"]),
            hasConsentForAdsPersonalization: consentStatus(from: consentData["hasConsentForAdsPersonalization"])
        )
        linkrunnerSDK.setConsent(consent)
        print("Linkrunner: Consent set — isEEA: \(consent.isEEA.rawValue), "
              + "adUserData: \(consent.hasConsentForDataUsage.rawValue), "
              + "adPersonalization: \(consent.hasConsentForAdsPersonalization.rawValue)")
    }

    @objc func enableTCFConsentCollection(_ enabled: Bool) -> Void {
        linkrunnerSDK.enableTCFConsentCollection(enabled)
        print("Linkrunner: TCF consent collection \(enabled ? "enabled" : "disabled")")
    }
    
    @objc func getAttributionData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            let attributionData = await linkrunnerSDK.getAttributionData()

            var response: [String: Any] = [:]

            if let deeplink = attributionData.deeplink {
                response["deeplink"] = deeplink
            }

            response["gaid"] = attributionData.gaid ?? NSNull()
            response["idfa"] = attributionData.idfa ?? NSNull()

            if let campaignData = attributionData.campaignData {
                let dateFormatter = ISO8601DateFormatter()
                dateFormatter.formatOptions = [.withInternetDateTime]

                var campaignDataMap: [String: Any] = [
                    "id": campaignData.id,
                    "name": campaignData.name,
                    "type": campaignData.type.rawValue
                ]

                if let adNetwork = campaignData.adNetwork {
                    // camelCase (correct, matches TypeScript type and Android)
                    campaignDataMap["adNetwork"] = adNetwork.rawValue
                    // snake_case (deprecated, for backward compatibility)
                    campaignDataMap["ad_network"] = adNetwork.rawValue
                }
                if let groupName = campaignData.groupName {
                    campaignDataMap["groupName"] = groupName
                    campaignDataMap["group_name"] = groupName
                }
                if let assetGroupName = campaignData.assetGroupName {
                    campaignDataMap["assetGroupName"] = assetGroupName
                    campaignDataMap["asset_group_name"] = assetGroupName
                }
                if let adNetworkCampaignId = campaignData.adNetworkCampaignId {
                    campaignDataMap["adNetworkCampaignId"] = adNetworkCampaignId
                    campaignDataMap["ad_network_campaign_id"] = adNetworkCampaignId
                }
                if let adSetId = campaignData.adSetId {
                    campaignDataMap["adSetId"] = adSetId
                    campaignDataMap["ad_set_id"] = adSetId
                }
                if let adSetName = campaignData.adSetName {
                    campaignDataMap["adSetName"] = adSetName
                    campaignDataMap["ad_set_name"] = adSetName
                }
                if let adCreativeId = campaignData.adCreativeId {
                    campaignDataMap["adCreativeId"] = adCreativeId
                    campaignDataMap["ad_creative_id"] = adCreativeId
                }
                if let adCreativeName = campaignData.adCreativeName {
                    campaignDataMap["adCreativeName"] = adCreativeName
                    campaignDataMap["ad_creative_name"] = adCreativeName
                }
                if let assetName = campaignData.assetName {
                    campaignDataMap["assetName"] = assetName
                    campaignDataMap["asset_name"] = assetName
                }
                let installedAtDate = campaignData.installedAt ?? Date()
                let installedAtString = dateFormatter.string(from: installedAtDate)
                campaignDataMap["installedAt"] = installedAtString
                campaignDataMap["installed_at"] = installedAtString
                if let storeClickAt = campaignData.storeClickAt {
                    let dateString = dateFormatter.string(from: storeClickAt)
                    campaignDataMap["storeClickAt"] = dateString
                    campaignDataMap["store_click_at"] = dateString
                }

                // camelCase (correct, matches TypeScript type and Android)
                response["campaignData"] = campaignDataMap
                // snake_case (deprecated, for backward compatibility)
                response["campaign_data"] = campaignDataMap
            }

            resolve(response)
        }
    }
    
    @objc func setAdditionalData(_ integrationDataDict: NSDictionary, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        if integrationDataDict.count == 0 {
            reject("ADDITIONAL_DATA_ERROR", "Integration data is required", NSError(domain: "LinkrunnerSDK", code: 1, userInfo: nil))
            return
        }
        
        let clevertapId = integrationDataDict["clevertapId"] as? String
        
        let integrationData = IntegrationData(clevertapId: clevertapId)
        
        Task {
            do {
                if #available(iOS 15.0, *) {
                    try await linkrunnerSDK.setAdditionalData(integrationData)
                    
                    let response: [String: Any] = [
                        "status": "success",
                        "message": "Additional data set successfully"
                    ]
                    resolve(response)
                } else {
                    reject("UNSUPPORTED_VERSION", "iOS 15.0 or later is required", NSError(domain: "LinkrunnerSDK", code: 2, userInfo: nil))
                }
            } catch {
                reject("ADDITIONAL_DATA_ERROR", "Failed to set additional data: \(error.localizedDescription)", error)
            }
        }
    }
    
    @objc func setPushToken(_ pushToken: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        let tokenString = (pushToken as String).trimmingCharacters(in: .whitespacesAndNewlines)
        
        if tokenString.isEmpty {
            reject("SET_PUSH_TOKEN_ERROR", "Push token cannot be empty", NSError(domain: "LinkrunnerSDK", code: 1, userInfo: nil))
            return
        }
        
        Task {
            do {
                if #available(iOS 15.0, *) {
                    try await linkrunnerSDK.setPushToken(tokenString)
                    let response: [String: Any] = [
                        "status": "success",
                        "message": "Push token set successfully"
                    ]
                    resolve(response)
                } else {
                    reject("UNSUPPORTED_VERSION", "iOS 15.0 or later is required", NSError(domain: "LinkrunnerSDK", code: 2, userInfo: nil))
                }
            } catch {
                reject("SET_PUSH_TOKEN_ERROR", "Failed to set push token: \(error.localizedDescription)", error)
            }
        }
    }

    @objc func setCustomerUserId(_ userId: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        let userIdString = (userId as String).trimmingCharacters(in: .whitespacesAndNewlines)

        if userIdString.isEmpty {
            reject("SET_CUSTOMER_USER_ID_ERROR", "Customer user ID cannot be empty", NSError(domain: "LinkrunnerSDK", code: 1, userInfo: nil))
            return
        }

        Task {
            do {
                if #available(iOS 15.0, *) {
                    try await linkrunnerSDK.setCustomerUserId(userIdString)
                    let response: [String: Any] = [
                        "status": "success",
                        "message": "Customer user ID set successfully"
                    ]
                    resolve(response)
                } else {
                    reject("UNSUPPORTED_VERSION", "iOS 15.0 or later is required", NSError(domain: "LinkrunnerSDK", code: 2, userInfo: nil))
                }
            } catch {
                reject("SET_CUSTOMER_USER_ID_ERROR", "Failed to set customer user ID: \(error.localizedDescription)", error)
            }
        }
    }

    @objc func handleDeeplink(_ deeplinkUrl: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        let urlString = (deeplinkUrl as String).trimmingCharacters(in: .whitespacesAndNewlines)

        if urlString.isEmpty {
            // Silently succeed for empty URLs (matches SDK behavior)
            let response: [String: Any] = [
                "isLinkrunner": false
            ]
            resolve(response)
            return
        }

        Task {
            if #available(iOS 15.0, *) {
                let deeplinkResponse = await linkrunnerSDK.handleDeeplink(url: urlString)

                var response: [String: Any] = [
                    "isLinkrunner": deeplinkResponse.isLinkrunner
                ]

                if let deeplink = deeplinkResponse.deeplink {
                    response["deeplink"] = deeplink
                }

                if let processing = deeplinkResponse.processing {
                    response["processing"] = processing
                }

                resolve(response)
            } else {
                reject("UNSUPPORTED_VERSION", "iOS 15.0 or later is required", NSError(domain: "LinkrunnerSDK", code: 2, userInfo: nil))
            }
        }
    }

}

// Type definition needed for RCTPromiseResolveBlock
typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String, String?, Error?) -> Void

// JS always sends userId; a missing one means the payload did not come from the wrapper.
private enum BridgePaymentError: Error {
    case missingUserId
}
