import DeviceInfo from 'react-native-device-info';
import EncryptedStorage from 'react-native-encrypted-storage';

const package_version = '0.2.2';
const app_version = DeviceInfo.getVersion();
const EncryptedStorageTokenName = 'linkrunner-token';

const init = (token: string) => {
  // In error message add "Click here to get your project token"
  if (!token)
    return console.error('Linkrunner needs your project token to initialize!');

  fetch('http://localhost:4000/api/client/init', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      package_version,
      app_version,
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

const trigger = async ({
  data,
  user_id,
}: {
  user_id: string | number;
  data: any;
}) => {
  const token = await EncryptedStorage.getItem(EncryptedStorageTokenName);

  fetch('http://localhost:4000/api/client/trigger', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      user_id,
      data,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (!result) throw new Error('No response obtained!');

      if (result?.status !== 200 && result?.status !== 201) {
        console.error('Linkrunner: Trigger failed');
        console.error('Linkrunner: ', result?.msg);
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
