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
import messaging from '@react-native-firebase/messaging';
import type { PushTokenInfo } from './types';

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

const getAdvertisingIdentifier = async (): Promise<string | null> => {
  try {
    const identifier = await ReactNativeIdfaAaid.getAdvertisingInfo();
    if (!identifier.isAdTrackingLimited && identifier.id) {
      return identifier.id;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting advertising identifier:', error);
    return null;
  }
};

const device_data = async (): Promise<Record<string, any>> => {
  try {
    const [installReferrerInfo, connectivity, manufacturer, systemVersion] =
      await Promise.all([
        getInstallReferrerInfo(),
        netinfoFetch(),
        getManufacturer(),
        getSystemVersion(),
      ]);

    // Helper function to safely get device info with fallback
    const safeGet = async <T>(
      getter: () => Promise<T> | T,
      fallback: T = null as unknown as T
    ): Promise<T> => {
      try {
        return await getter();
      } catch (error) {
        console.warn(`DeviceInfo error: ${error}`);
        return fallback;
      }
    };

    return {
      android_id: await safeGet(DeviceInfo.getAndroidId),
      api_level: await safeGet(DeviceInfo.getApiLevel),
      application_name: await safeGet(DeviceInfo.getApplicationName),
      base_os: await safeGet(DeviceInfo.getBaseOs),
      build_id: await safeGet(DeviceInfo.getBuildId),
      brand: await safeGet(DeviceInfo.getBrand),
      build_number: await safeGet(DeviceInfo.getBuildNumber),
      bundle_id: await safeGet(DeviceInfo.getBundleId),
      carrier: [await safeGet(DeviceInfo.getCarrier)],
      device: await safeGet(DeviceInfo.getDevice),
      device_id: await safeGet(DeviceInfo.getDeviceId),
      device_display: await safeGet(DeviceInfo.getDisplay),
      device_type: await safeGet(DeviceInfo.getDeviceType),
      device_name: await safeGet(DeviceInfo.getDeviceName),
      device_token: await safeGet(DeviceInfo.getDeviceToken),
      device_ip: await safeGet(DeviceInfo.getIpAddress),
      install_ref: await safeGet(DeviceInfo.getInstallReferrer),
      manufacturer,
      system_version: systemVersion,
      version: await safeGet(DeviceInfo.getVersion),
      connectivity: connectivity.type,
      user_agent: await safeGet(DeviceInfo.getUserAgent),
      gaid: Platform.OS === 'android' ? await getAdvertisingIdentifier() : null,
      idfa: Platform.OS === 'ios' ? await getAdvertisingIdentifier() : null,
      idfv:
        Platform.OS === 'ios' ? await safeGet(DeviceInfo.getUniqueId) : null,
      ...installReferrerInfo,
    };
  } catch (error) {
    console.error('Error collecting device data:', error);
    return { error: 'Failed to collect device data' };
  }
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

export async function getPushToken(): Promise<PushTokenInfo | null> {
  try {
    const status = await messaging().requestPermission();

    const enabled =
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) return null;

    await messaging().registerDeviceForRemoteMessages();
    const apns_token = await messaging().getAPNSToken();
    const fcm_token = await messaging().getToken();
    if(apns_token==null) {
      return {
        fcm_token: fcm_token,
        platform: 'android',
      };
    }
    return {
      apns_token: apns_token,
      fcm_token: fcm_token,
      platform: Platform.OS==='ios' ? 'ios' : 'android',
    };
  } catch (e) {
    console.warn('Push‑token fetch failed', e);
    return null;
  }
}


export {
  device_data,
  getLinkRunnerInstallInstanceId,
  setDeeplinkURL,
  getDeeplinkURL,
};
