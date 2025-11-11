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
    
    @objc func trackEvent(_ eventName: NSString, eventData: NSDictionary?, eventId: NSString?) -> Void {
        Task {
            do {
                let finalEventData = eventData as? [String: Any]
                let eventIdString = eventId as String?
                try await linkrunnerSDK.trackEvent(eventName: eventName as String, eventData: finalEventData, eventId: eventIdString)
                print("Linkrunner: Event tracked successfully")
            } catch {
                print("Linkrunner: Failed to track event: \(error)")
            }
        }
    }
    
    @objc func capturePayment(_ paymentData: NSDictionary) -> Void {
        guard let userId = paymentData["userId"] as? String,
              let amount = paymentData["amount"] as? Double else {
            print("Linkrunner: userId and amount are required for payment capture")
            return
        }
        
        let paymentId = paymentData["paymentId"] as? String
        let typeString = paymentData["type"] as? String ?? "DEFAULT"
        let statusString = paymentData["status"] as? String ?? "PAYMENT_COMPLETED"
        
        // Convert strings to enums
        let paymentType = PaymentType(rawValue: typeString) ?? .default
        let paymentStatus = PaymentStatus(rawValue: statusString) ?? .completed
        
        Task {
            do {
                try await linkrunnerSDK.capturePayment(
                    amount: amount,
                    userId: userId,
                    paymentId: paymentId,
                    type: paymentType,
                    status: paymentStatus
                )
                print("Linkrunner: Payment captured successfully")
            } catch {
                print("Linkrunner: Failed to capture payment: \(error)")
            }
        }
    }
    
    @objc func removePayment(_ paymentData: NSDictionary) -> Void {
        guard let userId = paymentData["userId"] as? String else {
            print("Linkrunner: userId is required for payment removal")
            return
        }
        
        let paymentId = paymentData["paymentId"] as? String
        
        Task {
            do {
                try await linkrunnerSDK.removePayment(userId: userId, paymentId: paymentId)
                print("Linkrunner: Payment removed successfully")
            } catch {
                print("Linkrunner: Failed to remove payment: \(error)")
            }
        }
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
    
    @objc func getAttributionData(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
        Task {
            do {
                let attributionData = try await linkrunnerSDK.getAttributionData()
                resolve(attributionData.toDictionary())
            } catch {
                reject("ATTRIBUTION_ERROR", "Failed to get attribution data: \(error.localizedDescription)", error)
            }
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

}

// Type definition needed for RCTPromiseResolveBlock
typealias RCTPromiseResolveBlock = (Any?) -> Void
typealias RCTPromiseRejectBlock = (String, String?, Error?) -> Void
