#import "React/RCTBridgeModule.h"

// first parameter is the name of the native module
// second parameter is the name of the native class that implements the module
@interface RCT_EXTERN_REMAP_MODULE(LinkrunnerSDK, LinkrunnerSDK, NSObject)

RCT_EXTERN_METHOD(initializeSDK:(NSDictionary *)dict)

RCT_EXTERN_METHOD(signup:(NSDictionary *)userData
                  data:(NSDictionary *)data)

RCT_EXTERN_METHOD(setUserData:(NSDictionary *)userData)

RCT_EXTERN_METHOD(trackEvent:(NSString *)eventName eventData:(NSDictionary *)eventData)

RCT_EXTERN_METHOD(capturePayment:(NSDictionary *)paymentData)

RCT_EXTERN_METHOD(removePayment:(NSDictionary *)paymentData)

RCT_EXTERN_METHOD(enablePIIHashing:(BOOL)enabled)

RCT_EXTERN_METHOD(requestTrackingAuthorization)

RCT_EXTERN_METHOD(getAttributionData:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setAdditionalData:(NSDictionary *)integrationDataDict
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end