import { Linking } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { device_data, getLinkRunnerInstallInstanceId } from './helper';
import type { TriggerConfig, UserData } from './types';

const package_version = '0.6.1';
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

  async trigger({
    data,
    user_data,
    config,
  }: {
    config?: TriggerConfig;
    data?: { [key: string]: any };
    user_data: UserData;
  }): Promise<void | LRTriggerResponse> {
    if (!this.token) {
      console.error('Linkrunner: Trigger failed, token not initialized');
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
        console.error('Linkrunner: Trigger failed');
        console.error('Linkrunner: ', result?.msg);
        return;
      }

      if (
        result?.data?.deeplink &&
        config?.trigger_deeplink !== false &&
        result?.data?.trigger
      ) {
        if (__DEV__) {
          console.log('Triggering deeplink > ', result?.data?.deeplink);
        }

        Linking.openURL(result?.data?.deeplink).then(() => {
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
                  result?.data?.deeplink
                );
              }
            })
            .catch(() => {});
        });
      }

      if (__DEV__) {
        console.log('Linkrunner: Trigger called 🔥');
      }

      return result.data;
    } catch (err: any) {
      console.error('Linkrunner: Trigger failed');
      console.error('Linkrunner: ', err.message);
    }
  }

  async capturePayment({
    amount,
    userId,
    paymentId,
  }: {
    paymentId?: string;
    userId: string;
    amount: number;
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
}

const linkrunner = new Linkrunner();

export type LRInitResponse = Response;

export type LRTriggerResponse = Response;

export default linkrunner;
