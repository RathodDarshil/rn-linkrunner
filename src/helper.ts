import DeviceInfo, {
  getManufacturer,
  getSystemVersion,
} from 'react-native-device-info';
import { fetch as netinfoFetch } from '@react-native-community/netinfo';
import {
  PlayInstallReferrer,
  type PlayInstallReferrerInfo,
} from 'react-native-play-install-referrer';

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

export { device_data };
