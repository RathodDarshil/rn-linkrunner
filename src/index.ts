import { Linking } from 'react-native';
import DeviceInfo, {
  getManufacturer,
  getSystemVersion,
} from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';

const package_version = '0.4.2';
const app_version = DeviceInfo.getVersion();
const EncryptedStorageTokenName = 'linkrunner-token';

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

const init = (token: string) => {
  // In error message add "Click here to get your project token"
  if (!token)
    return console.error('Linkrunner needs your project token to initialize!');

  fetch(baseUrl + '/api/client/init', {
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
    }),
  })
    .then((res) => res.json())
    .then(async (result) => {
      if (!result) throw new Error('No response obtained!');

      if (result?.status !== 200 && result?.status !== 201) {
        throw new Error(result?.msg);
      }

      await EncryptedStorage.setItem(EncryptedStorageTokenName, token);
      console.log('Linkrunner initialised successfully 🔥');
    })
    .catch((err) => {
      console.error('Error initializing linkrunner: ', err.message);
    });
};

type UserData = {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
};

const trigger = async ({
  data,
  user_data,
}: {
  user_data: UserData;
  data: any;
}) => {
  const token = await EncryptedStorage.getItem(EncryptedStorageTokenName);

  fetch(baseUrl + '/api/client/trigger', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      user_data,
      data: {
        ...data,
        device_data,
      },
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (!result) throw new Error('No response obtained!');

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Trigger failed');
        console.error('Linkrunner: ', result?.msg);
      }

      if (!!result?.data?.deeplink) {
        Linking.openURL(result?.data?.deeplink);
      }

      console.log('Linkrunner: Trigger called 🔥');
    })
    .catch((err) => {
      console.error('Linkrunner: Trigger failed');
      console.error('Linkrunner: ', err?.msg);
    });
};

const linkrunner = {
  init,
  trigger,
};

export default linkrunner;
