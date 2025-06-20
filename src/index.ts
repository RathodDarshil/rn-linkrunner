import { NativeModules, Platform } from 'react-native';
// import DeviceInfo from 'react-native-device-info';
import {
  setDeeplinkURL,
} from './helper';
import type { CampaignData, LRIPLocationData, UserData } from './types';
// import packageJson from '../package.json';
import { PlayInstallReferrer } from 'react-native-play-install-referrer';

const LINKING_ERROR =
  `The package 'rn-linkrunner' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const LinkrunnerSDKModule = NativeModules.LinkrunnerSDK;

if (!LinkrunnerSDKModule) {
  throw new Error(LINKING_ERROR);
}

// const package_version = packageJson.version;
// const app_version: string = '2.2.0';

class Linkrunner {
  private token: string | null;

  constructor() {
    this.token = null;
  }

  async init(token: string): Promise<void | LRInitResponse> {
    if (!token) {
      console.error('Linkrunner needs your project token to initialize!');
      return;
    }

    this.token = token;

    try {
      const result = await LinkrunnerSDKModule.init(token, { link: "", source: "GENERAL" });
      
      if (__DEV__) {
        console.log("Init successful");
        console.log('Linkrunner initialised successfully ');
        console.log('init response > ', result);
      }

      // Handle deeplink from native response
      if (result?.deeplink) {
        setDeeplinkURL(result.deeplink);
      }

      return result;
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
  }): Promise<void | LRTriggerResponse> {
    if (!this.token) {
      console.error('Linkrunner: Signup failed, token not initialized');
      return;
    }

    try {
      const result = await LinkrunnerSDKModule.signup(user_data, data || {});
      
      if (__DEV__) {
        console.log('Linkrunner signup successful');
        console.log('signup response > ', result);
      }

      return result;
    } catch (error) {
      console.error('Error during signup via native module', error);
      throw error;
    }
  }

  async triggerDeeplink(): Promise<void | LRTriggerResponse> {
    if (!this.token) {
      console.error('Linkrunner: Trigger Deeplink failed, token not initialized');
      return;
    }

    try {
      const result = await LinkrunnerSDKModule.triggerDeeplink();
      
      if (__DEV__) {
        console.log('Linkrunner deeplink triggered successfully');
        console.log('trigger deeplink response > ', result);
      }

      return result;
    } catch (error) {
      console.error('Error triggering deeplink via native module', error);
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

  async trackEvent(eventName: string, eventData?: Record<string, any>) {
    if (!this.token) {
      console.error('Linkrunner: Track event failed, token not initialized');
      return;
    }

    if (!eventName) {
      return console.error('Linkrunner: Event name is required');
    }

    try {
      const result = await LinkrunnerSDKModule.trackEvent(eventName, eventData || {});
      
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

  /**
   * Processes Google Analytics with GCLID from install referrer
   * @param analytics - Instance of Firebase Analytics
   */
  async processGoogleAnalytics(analytics: any): Promise<void> {
    if (Platform.OS !== 'android') {
      return;
    }

    try {
      const gclid = await this.extractGCLID();

      if (!gclid) {
        return;
      }

      // Log event with GCLID
      await analytics().logEvent('install_with_gclid', {
        gclid: gclid,
      });

      // Set user property with GCLID
      await analytics().setUserProperty('gclid', gclid);
    } catch (error) {
      console.error('Linkrunner: Error processing Google Analytics:', error);
    }
  }

  /**
   * Extracts GCLID from install referrer
   * @returns Promise with GCLID string or null if not found
   */
  private extractGCLID(): Promise<string | null> {
    return new Promise((resolve) => {
      // Set a timeout to ensure the promise resolves even if there's an issue
      const timeoutId = setTimeout(() => {
        resolve(null);
      }, 5000);

      try {
        PlayInstallReferrer.getInstallReferrerInfo(
          (installReferrerInfo, error) => {
            // Clear the timeout since callback fired
            clearTimeout(timeoutId);

            if (error) {
              resolve(null);
              return;
            }

            if (!installReferrerInfo || !installReferrerInfo.installReferrer) {
              resolve(null);
              return;
            }

            // Parse the referrer URL to extract GCLID
            try {
              const referrer = installReferrerInfo.installReferrer;
              const urlParams = new URLSearchParams(referrer);
              let gclid = urlParams.get('gclid');

              if (!gclid) {
                const match = referrer.match(/gclid=([^&]*)/);
                gclid = !!match?.[1] ? match[1] : null;
              }

              resolve(gclid);
            } catch (parseError) {
              console.error(
                'Linkrunner: Error parsing referrer URL:',
                parseError
              );
              resolve(null);
            }
          }
        );
      } catch (e) {
        // Clear the timeout since we caught an exception
        clearTimeout(timeoutId);
        console.error('Linkrunner: Exception in extractGCLID:', e);
        resolve(null);
      }
    });
  }
}

const linkrunner = new Linkrunner();

export type LRInitResponse = {
  ip_location_data: LRIPLocationData;
  deeplink: string;
  root_domain: boolean;
  campaign_data: CampaignData;
};

export type LRTriggerResponse = {
  status: string;
  message: string;
  [key: string]: any;
};

export default linkrunner;
