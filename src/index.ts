import { Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import {
  device_data,
  getDeeplinkURL,
  getLinkRunnerInstallInstanceId,
  setDeeplinkURL,
} from './helper';
import type { CampaignData, LRIPLocationData, UserData } from './types';
import packageJson from '../package.json';
import { Platform } from 'react-native';
import { PlayInstallReferrer } from 'react-native-play-install-referrer';

const package_version = packageJson.version;
const app_version: string = DeviceInfo.getVersion();

const baseUrl = 'https://api.linkrunner.io';

const initApiCall = async (
  token: string,
  source: 'GENERAL' | 'ADS',
  link?: string
) => {
  try {
    const fetch_result = await fetch(baseUrl + '/api/client/init', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        package_version,
        app_version,
        device_data: await device_data(),
        platform: 'REACT_NATIVE',
        source,
        link,
        install_instance_id: await getLinkRunnerInstallInstanceId(),
      }),
    });

    const result = await fetch_result.json();

    if (result?.status !== 200 && result?.status !== 201) {
      throw new Error(result?.msg);
    }

    if (__DEV__) {
      console.log('Linkrunner initialised successfully 🔥');

      console.log('init response > ', result);
    }

    if (!!result?.data?.deeplink) setDeeplinkURL(result?.data?.deeplink);

    return result?.data;
  } catch (error) {
    console.error('Error initializing linkrunner', error);
  }
};

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

    return await initApiCall(token, 'GENERAL');
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
      const response = await fetch(baseUrl + '/api/client/trigger', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
          user_data,
          platform: 'REACT_NATIVE',
          data: {
            ...data,
            device_data: await device_data(),
          },
          install_instance_id: await getLinkRunnerInstallInstanceId(),
        }),
      });
      const result = await response.json();

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Signup failed');
        console.error('Linkrunner: ', result?.msg);
        return;
      }

      if (__DEV__) {
        console.log('Linkrunner: Signup called 🔥');
      }

      return result.data;
    } catch (err: any) {
      console.error('Linkrunner: Signup failed');
      console.error('Linkrunner: ', err.message);
    }
  }

  async triggerDeeplink() {
    const deeplink_url = await getDeeplinkURL();

    if (!deeplink_url) {
      console.error('Linkrunner: Deeplink URL not found');
      return;
    }

    Linking.openURL(deeplink_url).then(() => {
      fetch(baseUrl + '/api/client/deeplink-triggered', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
        }),
      })
        .then(() => {
          if (__DEV__) {
            console.log(
              'Linkrunner: Deeplink triggered successfully',
              deeplink_url
            );
          }
        })
        .catch(() => {
          if (__DEV__) {
            console.error(
              'Linkrunner: Deeplink triggering failed',
              deeplink_url
            );
          }
        });
    });
  }

  async setUserData(user_data: UserData) {
    if (!this.token) {
      console.error('Linkrunner: Set user data failed, token not initialized');
      return;
    }

    try {
      const response = await fetch(baseUrl + '/api/client/set-user-data', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
          user_data,
          device_data: await device_data(),
          install_instance_id: await getLinkRunnerInstallInstanceId(),
        }),
      });

      const result = await response.json();

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Set user data failed');
        console.error('Linkrunner: ', result?.msg);
        return;
      }

      return result.data;
    } catch (err: any) {
      console.error('Linkrunner: Set user data failed');
      console.error('Linkrunner: ', err?.message);
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
      console.error(
        'Linkrunner: Capture payment failed, token not initialized'
      );
      return;
    }

    try {
      const response = await fetch(baseUrl + '/api/client/capture-payment', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
          user_id: userId,
          platform: 'REACT_NATIVE',
          data: {
            device_data: await device_data(),
          },
          amount,
          payment_id: paymentId,
          type,
          status,
          install_instance_id: await getLinkRunnerInstallInstanceId(),
        }),
      });

      const result = await response.json();

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Capture payment failed');
        console.error('Linkrunner: ', result?.msg);
        return;
      }

      if (__DEV__) {
        console.log('Linkrunner: Payment captured successfully 💸', {
          amount,
          paymentId,
          userId,
          type,
          status,
        });
      }
    } catch (error) {
      console.error('Linkrunner: Payment capturing failed!');
      return;
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
      console.error('Linkrunner: Remove payment failed, token not initialized');
      return;
    }

    if (!paymentId && !userId) {
      return console.error(
        'Linkrunner: Either paymentId or userId must be provided!'
      );
    }

    try {
      const response = await fetch(
        baseUrl + '/api/client/remove-captured-payment',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: this.token,
            user_id: userId,
            platform: 'REACT_NATIVE',
            data: {
              device_data: await device_data(),
            },
            payment_id: paymentId,
            install_instance_id: await getLinkRunnerInstallInstanceId(),
          }),
        }
      );

      const result = await response.json();

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Capture payment failed');
        console.error('Linkrunner: ', result?.msg);
        return;
      }

      if (__DEV__) {
        console.log('Linkrunner: Payment entry removed successfully!', {
          paymentId,
          userId,
        });
      }
    } catch (error) {
      console.error('Linkrunner: Payment capturing failed!');
      return;
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
      const response = await fetch(baseUrl + '/api/client/capture-event', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: this.token,
          event_name: eventName,
          event_data: eventData,
          device_data: await device_data(),
          install_instance_id: await getLinkRunnerInstallInstanceId(),
        }),
      });

      const result = await response.json();

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Track event failed');
        console.error('Linkrunner: ', result?.msg);
        return;
      }

      if (__DEV__) {
        console.log('Linkrunner: Tracking event', eventName, eventData);
      }

      return result?.data;
    } catch (error) {
      console.error('Linkrunner: Track event failed');
      console.error('Linkrunner: ', error);
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

export type LRTriggerResponse = Response;

export default linkrunner;
