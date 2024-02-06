import DeviceInfo from 'react-native-device-info';
// @ts-ignore
import * as packageJson from '../../package.json';

let projet_token: string;

const init = (token: string) => {
  if (!token)
    return console.error('Linkrunner needs your project token to initialize!');

  const package_version = packageJson?.version;
  const app_version = DeviceInfo.getVersion();

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
    .then((result) => {
      if (!result) throw new Error('No response obtained!');

      if (result?.status !== 200 && result?.status !== 201) {
        throw new Error(result?.msg);
      }

      projet_token = token;
      console.log('Linkrunner initialised successfully 🔥');
    })
    .catch((err) => {
      console.error('Error initializing linkrunner: ', err.message);
    });
};

const trigger = () => {
  console.log('====================================');
  console.log('Token', projet_token);
  console.log('====================================');
};

const linkrunner = {
  init,
  trigger,
};

export default linkrunner;

linkrunner.init('FEhvnvlyBgJBTtrATPBpkkRMqtLcKWOs');
