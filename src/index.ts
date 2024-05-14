import { Linking } from 'react-native';
import DeviceInfo, {
  getManufacturer,
  getSystemVersion,
} from 'react-native-device-info';

const package_version = '0.5.0';
const app_version: string = DeviceInfo.getVersion();

const device_data = {
  android_id: DeviceInfo.getAndroidId(),
  api_level: DeviceInfo.getApiLevel(),
  application_name: DeviceInfo.getApplicationName(),
  base_os: DeviceInfo.getBaseOs(),
  build_id: DeviceInfo.getBuildId(),
  brand: DeviceInfo.getBrand(),
  build_number: DeviceInfo.getBuildNumber(),
  bundle_id: DeviceInfo.getBundleId(),
  carrier: DeviceInfo.getCarrier(),
  device: DeviceInfo.getDevice(),
  device_id: DeviceInfo.getDeviceId(),
  device_type: DeviceInfo.getDeviceType(),
  device_name: DeviceInfo.getDeviceName(),
  device_token: DeviceInfo.getDeviceToken(),
  device_ip: DeviceInfo.getIpAddress(),
  install_ref: DeviceInfo.getInstallReferrer(),
  manufacturer: getManufacturer(),
  system_version: getSystemVersion(),
  version: DeviceInfo.getVersion(),
};

const baseUrl = 'https://api.linkrunner.io';

interface UserData {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface TriggerConfig {
  trigger_deeplink?: boolean;
}

export type Response = {
  ip_location_data: IPLocationData;
  deeplink: string;
  root_domain: boolean;
};

export interface IPLocationData {
  ip: string;
  city: string;
  countryLong: string;
  countryShort: string;
  latitude: number;
  longitude: number;
  region: string;
  timeZone: string;
  zipCode: string;
}

class Linkrunner {
  private token: string | null;

  constructor() {
    this.token = null;
  }

  async init(token: string): Promise<void | Response> {
    if (!token) {
      console.error('Linkrunner needs your project token to initialize!');
      return;
    }

    this.token = token;
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
          device_data,
          platform: 'REACT_NATIVE',
        }),
      });

      const result = await fetch_result.json();

      //   if (!result) throw new Error('No response obtained!');

      if (result?.status !== 200 && result?.status !== 201) {
        throw new Error(result?.msg);
      }

      if (__DEV__) {
        console.log('Linkrunner initialised successfully 🔥');
      }

      return result?.data;
    } catch (error) {
      console.error('Error initializing linkrunner');
    }
  }

  async trigger({
    data,
    user_data,
    config,
  }: {
    config?: TriggerConfig;
    data: any;
    user_data: UserData;
  }): Promise<void | Response> {
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
            device_data,
          },
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
            .then((res) => res.json())
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
}

const linkrunner = new Linkrunner();

export default linkrunner;
