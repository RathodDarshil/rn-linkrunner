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

const device_data = async (): Promise<Record<string, any>> => {
  const getInstallReferrerInfo = (): Promise<PlayInstallReferrerInfo | {}> => {
    return new Promise((resolve) => {
      PlayInstallReferrer.getInstallReferrerInfo(
        (installReferrerInfo, error) => {
          if (!error && !!installReferrerInfo) {
            resolve(installReferrerInfo);
          } else {
            resolve({});
          }
        }
      );
    });
  };

  const [installReferrerInfo, connectivity, manufacturer, systemVersion] =
    await Promise.all([
      getInstallReferrerInfo(),
      netinfoFetch(),
      getManufacturer(),
      getSystemVersion(),
    ]);

  return {
    android_id: DeviceInfo.getAndroidId(),
    api_level: DeviceInfo.getApiLevel(),
    application_name: DeviceInfo.getApplicationName(),
    base_os: DeviceInfo.getBaseOs(),
    build_id: DeviceInfo.getBuildId(),
    brand: DeviceInfo.getBrand(),
    build_number: DeviceInfo.getBuildNumber(),
    bundle_id: DeviceInfo.getBundleId(),
    carrier: [DeviceInfo.getCarrier()],
    device: DeviceInfo.getDevice(),
    device_id: DeviceInfo.getDeviceId(),
    device_display: DeviceInfo.getDisplay(),
    device_type: DeviceInfo.getDeviceType(),
    device_name: DeviceInfo.getDeviceName(),
    device_token: DeviceInfo.getDeviceToken(),
    device_ip: DeviceInfo.getIpAddress(),
    install_ref: await DeviceInfo.getInstallReferrer(),
    manufacturer,
    system_version: systemVersion,
    version: DeviceInfo.getVersion(),
    connectivity: connectivity.type,
    user_agent: DeviceInfo.getUserAgent(),
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
    throw error;
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

export { device_data, getLinkRunnerInstallInstanceId };
