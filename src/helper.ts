import DeviceInfo, {
  getManufacturer,
  getSystemVersion,
} from 'react-native-device-info';
import { fetch as netinfoFetch } from '@react-native-community/netinfo';
import {
  PlayInstallReferrer,
  type PlayInstallReferrerInfo,
} from 'react-native-play-install-referrer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import ReactNativeIdfaAaid from '@sparkfabrik/react-native-idfa-aaid';

const device_data = async (): Promise<Record<string, any>> => {
  const getInstallReferrerInfo = (): Promise<PlayInstallReferrerInfo | {}> => {
    return new Promise((resolve) => {
      if (Platform.OS === 'ios') {
        resolve({});
        return;
      }

      // Add a timeout to ensure the promise resolves even if the callback never fires
      const timeoutId = setTimeout(() => {
        resolve({});
      }, 2000);

      try {
        PlayInstallReferrer.getInstallReferrerInfo(
          (installReferrerInfo, error) => {
            // Clear the timeout since callback fired
            clearTimeout(timeoutId);

            if (!error && !!installReferrerInfo) {
              resolve(installReferrerInfo);
            } else {
              resolve({});
            }
          }
        );
      } catch (e) {
        // Clear the timeout since we caught an exception
        clearTimeout(timeoutId);
        resolve({});
      }
    });
  };

  const getAdvertisingIdentifier = async () => {
    const identifier = await ReactNativeIdfaAaid.getAdvertisingInfo();
    if (!identifier.isAdTrackingLimited && identifier.id) {
      return identifier.id;
    } else {
      return null;
    }
  };

  const [installReferrerInfo, connectivity, manufacturer, systemVersion] =
    await Promise.all([
      getInstallReferrerInfo(),
      netinfoFetch(),
      getManufacturer(),
      getSystemVersion(),
    ]);

  return {
    android_id: await DeviceInfo.getAndroidId(),
    api_level: await DeviceInfo.getApiLevel(),
    application_name: DeviceInfo.getApplicationName(),
    base_os: await DeviceInfo.getBaseOs(),
    build_id: await DeviceInfo.getBuildId(),
    brand: DeviceInfo.getBrand(),
    build_number: DeviceInfo.getBuildNumber(),
    bundle_id: DeviceInfo.getBundleId(),
    carrier: [await DeviceInfo.getCarrier()],
    device: await DeviceInfo.getDevice(),
    device_id: await DeviceInfo.getDeviceId(),
    device_display: await DeviceInfo.getDisplay(),
    device_type: await DeviceInfo.getDeviceType(),
    device_name: await DeviceInfo.getDeviceName(),
    device_token: await DeviceInfo.getDeviceToken(),
    device_ip: await DeviceInfo.getIpAddress(),
    install_ref: await DeviceInfo.getInstallReferrer(),
    manufacturer,
    system_version: systemVersion,
    version: DeviceInfo.getVersion(),
    connectivity: connectivity.type,
    user_agent: await DeviceInfo.getUserAgent(),
    gaid: Platform.OS === 'android' ? await getAdvertisingIdentifier() : null,
    idfa: Platform.OS === 'ios' ? await getAdvertisingIdentifier() : null,
    idfv: Platform.OS === 'ios' ? await DeviceInfo.getUniqueId() : null,
    ...installReferrerInfo,
  };
};

const STORAGE_KEY = 'linkrunner_install_instance_id';
const ID_LENGTH = 20;

async function getLinkRunnerInstallInstanceId(): Promise<string> {
  try {
    // Try to get the existing ID
    let installInstanceId = await AsyncStorage.getItem(STORAGE_KEY);

    // If the ID doesn't exist, generate a new one and store it
    if (installInstanceId === null) {
      installInstanceId = generateRandomString(ID_LENGTH);
      await AsyncStorage.setItem(STORAGE_KEY, installInstanceId);
    }

    return installInstanceId;
  } catch (error) {
    console.error('Error accessing AsyncStorage:', error);
    return 'ERROR_GENERAING_INSTALL_INSTANCE_ID';
  }
}

function generateRandomString(length: number): string {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array(length)
    .fill(null)
    .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
    .join('');
}

const DEEPLINK_URL_STORAGE_KEY = 'linkrunner_deeplink_url';

async function setDeeplinkURL(deeplink_url: string) {
  try {
    await AsyncStorage.setItem(DEEPLINK_URL_STORAGE_KEY, deeplink_url);
  } catch (error) {
    console.error('Error setting deeplink URL:', error);
  }
}

async function getDeeplinkURL(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(DEEPLINK_URL_STORAGE_KEY);
  } catch (error) {
    console.error('Error getting deeplink URL:', error);
    return null;
  }
}

export { device_data, getLinkRunnerInstallInstanceId, setDeeplinkURL, getDeeplinkURL };
