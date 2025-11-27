import { NativeModules, Platform } from 'react-native';
import type { AttributionData, IntegrationData, UserData } from './types';
import packageJson from '../package.json';

const LINKING_ERROR =
  `The package 'rn-linkrunner' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LinkrunnerSDKModule = NativeModules.LinkrunnerSDK;

if (!LinkrunnerSDKModule) {
  throw new Error(LINKING_ERROR);
}

const packageVersion = packageJson.version;

class Linkrunner {
  private token: string | null;

  constructor() {
    this.token = null;
  }

  getPackageVersion() {
    return packageVersion;
  }

  async init(token: string, secretKey?: string, keyId?: string, disableIdfa?: boolean, debug: boolean=false) {
    if (!token) {
      console.error('Linkrunner needs your project token to initialize!');
      return;
    }

    this.token = token;

    try {

      let result;
      if (Platform.OS === 'android') {
        result = await LinkrunnerSDKModule.init(token, {secretKey, keyId, debug, packageVersion});
      } else {
        // iOS init maintains backwards compatibility
        result = await LinkrunnerSDKModule.initializeSDK({token: token, secretKey, keyId, disableIdfa, debug});
      }
      
      if (__DEV__) {
        console.log("Init successful");
        console.log('Linkrunner initialised successfully');
        console.log('init response > ', result);
      }

      return;
    } catch (error) {
      console.error('Error initializing linkrunner via native module', error);
      throw error;
    }
  }

  async signup({
    data,
    user_data,
  }: {
    data?: { [key: string]: any };
    user_data: UserData;
  }) {
    if (!this.token) {
      console.error('Linkrunner: Signup failed, token not initialized');
      return;
    }

    // Validate user_data has required id field
    if (!user_data || !user_data.id) {
      console.error('Linkrunner: User data with id is required');
      return;
    }

    try {
      // Pass null as data if it's undefined to avoid potential issues
      const result = await LinkrunnerSDKModule.signup(user_data, data || {});
      
      if (__DEV__) {
        console.log('Linkrunner signup successful');
        console.log('signup response > ', result);
      }

      return;
    } catch (error) {
      console.error('Error during signup via native module', error);
      throw error;
    }
  }

  async setUserData(user_data: UserData) {
    if (!this.token) {
      console.error('Linkrunner: Set user data failed, token not initialized');
      return;
    }

    try {
      const result = await LinkrunnerSDKModule.setUserData(user_data);
      
      if (__DEV__) {
        console.log('Linkrunner user data set successfully');
        console.log('set user data response > ', result);
      }

      return result;
    } catch (error) {
      console.error('Error setting user data via native module', error);
      throw error;
    }
  }

  async capturePayment({
    amount,
    userId,
    paymentId,
    type,
    status,
  }: {
    paymentId?: string;
    userId: string;
    amount: number;
    type?:
      | 'FIRST_PAYMENT'
      | 'WALLET_TOPUP'
      | 'FUNDS_WITHDRAWAL'
      | 'SUBSCRIPTION_CREATED'
      | 'SUBSCRIPTION_RENEWED'
      | 'DEFAULT'
      | 'ONE_TIME'
      | 'RECURRING';
    status?:
      | 'PAYMENT_INITIATED'
      | 'PAYMENT_COMPLETED'
      | 'PAYMENT_FAILED'
      | 'PAYMENT_CANCELLED';
  }) {
    if (!this.token) {
      console.error('Linkrunner: Payment capture failed, token not initialized');
      return;
    }

    try {
      const paymentData = {
        paymentId: paymentId || '',
        userId,
        amount,
        type: type || 'DEFAULT',
        status: status || 'PAYMENT_COMPLETED',
      };

      const result = await LinkrunnerSDKModule.capturePayment(paymentData);
      
      if (__DEV__) {
        console.log('Linkrunner payment captured successfully');
        console.log('capture payment response > ', result);
      }

    } catch (error) {
      console.error('Error capturing payment via native module', error);
      throw error;
    }
  }

  async removePayment({
    userId,
    paymentId,
  }: {
    paymentId?: string;
    userId: string;
  }) {
    if (!this.token) {
      console.error('Linkrunner: Payment removal failed, token not initialized');
      return;
    }

    try {
      const paymentData = {
        paymentId: paymentId || '',
        userId,
      };

      const result = await LinkrunnerSDKModule.removePayment(paymentData);
      
      if (__DEV__) {
        console.log('Linkrunner payment removed successfully');
        console.log('remove payment response > ', result);
      }
    } catch (error) {
      console.error('Error removing payment via native module', error);
      throw error;
    }
  }

  async trackEvent(eventName: string, eventData?: Record<string, any>, eventId?: string | number ) {
    let finalEventId: string | null = null;
    
    if (eventId != null) {
      if (typeof eventId === 'string' || typeof eventId === 'number') {
        finalEventId = String(eventId);
      } else {
        console.warn('Linkrunner: eventId must be a string or number. Received:', typeof eventId, '. Ignoring eventId.');
        finalEventId = null;
      }
    }
    
    if (!this.token) {
      console.error('Linkrunner: Track event failed, token not initialized');
      return;
    }

    if (!eventName) {
      return console.error('Linkrunner: Event name is required');
    }

    try {
      const result = await LinkrunnerSDKModule.trackEvent(eventName, eventData || {}, finalEventId);
      
      if (__DEV__) {
        console.log('Linkrunner event tracked successfully:', eventName);
        console.log('track event response > ', result);
      }

      return result?.data;
    } catch (error) {
      console.error('Error tracking event via native module', error);
      throw error;
    }
  }


  async setAdditionalData(integrationData: IntegrationData): Promise<void | any> {
    if (!this.token) {
      console.error('Linkrunner: Setting integration data failed, token not initialized');
      return;
    }

    if (!integrationData || Object.keys(integrationData).length === 0) {
      console.error('Linkrunner: Integration data is required');
      return;
    }

    try {
      // Call the native module implementation
      const result = await LinkrunnerSDKModule.setAdditionalData(integrationData);
      
      if (__DEV__) {
        console.log('Linkrunner: Integration data set successfully', integrationData);
        console.log('set additional data response > ', result);
      }

      return result?.data;
    } catch (error) {
      console.error('Linkrunner: Setting integration data failed');
      console.error('Linkrunner: ', error);
      throw error;
    }
  }
  
  async getAttributionData(): Promise<AttributionData | void> {
    if (!this.token) {
      console.error('Linkrunner: Getting attribution data failed, token not initialized');
      return;
    }

    try {
      const result = await LinkrunnerSDKModule.getAttributionData();
      
      if (__DEV__) {
        console.log('Linkrunner: Attribution data retrieved successfully');
        console.log('get attribution data response > ', result);
      }

      return result as AttributionData;
    } catch (error) {
      console.error('Linkrunner: Getting attribution data failed');
      console.error('Linkrunner: ', error);
      throw error;
    }
  }

  enablePIIHashing(enabled: boolean = true): void {
    try {
      LinkrunnerSDKModule.enablePIIHashing(enabled);
      
      if (__DEV__) {
        console.log(`Linkrunner: PII hashing ${enabled ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error(`Linkrunner: Failed to ${enabled ? 'enable' : 'disable'} PII hashing`);
      console.error('Linkrunner: ', error);
    }
  }

  /**
   * Disable or enable Google Advertising ID (AAID/GAID) collection
   * 
   * When disabled, the SDK will not collect or send the Google Advertising ID (GAID).
   * This is useful for apps targeting children or families to comply with Google Play's Family Policy.
   * 
   * IMPORTANT: To fully comply and avoid Google Play flags, you must also remove the AD_ID permission
   * from your app's AndroidManifest.xml. See documentation for details.
   * 
   * @param disabled - Set to true to disable AAID collection, false to enable (default: true)
   * 
   * @example
   * // Disable AAID collection (recommended for child-directed apps)
   * linkrunner.setDisableAaidCollection(true);
   * 
   * // Enable AAID collection (default behavior)
   * linkrunner.setDisableAaidCollection(false);
   */
  setDisableAaidCollection(disabled: boolean = true): void {
    if (Platform.OS !== 'android') {
      if (__DEV__) {
        console.warn('Linkrunner: setDisableAaidCollection is only available on Android');
      }
      return;
    }

    try {
      LinkrunnerSDKModule.setDisableAaidCollection(disabled);
      
      if (__DEV__) {
        console.log(`Linkrunner: AAID collection ${disabled ? 'disabled' : 'enabled'}`);
      }
    } catch (error) {
      console.error(`Linkrunner: Failed to ${disabled ? 'disable' : 'enable'} AAID collection`);
      console.error('Linkrunner: ', error);
    }
  }

  /**
   * Check if Google Advertising ID (AAID/GAID) collection is currently disabled
   * 
   * Returns true if AAID collection is disabled, false if it's enabled.
   * 
   * @returns Promise<boolean> - true if AAID collection is disabled, false if enabled
   * 
   * @example
   * // Check current AAID collection status
   * const isDisabled = await linkrunner.isAaidCollectionDisabled();
   * console.log(`AAID collection is ${isDisabled ? 'disabled' : 'enabled'}`);
   */
  async isAaidCollectionDisabled(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      if (__DEV__) {
        console.warn('Linkrunner: isAaidCollectionDisabled is only available on Android');
      }
      return false;
    }

    try {
      const isDisabled = await LinkrunnerSDKModule.isAaidCollectionDisabled();
      
      if (__DEV__) {
        console.log(`Linkrunner: AAID collection disabled status: ${isDisabled}`);
      }
      
      return isDisabled;
    } catch (error) {
      console.error('Linkrunner: Failed to get AAID collection status');
      console.error('Linkrunner: ', error);
      throw error;
    }
  }

}

const linkrunner = new Linkrunner();

export default linkrunner;
