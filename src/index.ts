import DeviceInfo from 'react-native-device-info';

let projet_token: string;

const package_version = '0.2.0';
const app_version = DeviceInfo.getVersion();

const init = (token: string) => {
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

const trigger = ({
  data,
  user_id,
}: {
  user_id: string | number;
  data: any;
}) => {
  fetch('http://localhost:4000/api/client/trigger', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: projet_token,
      user_id,
      data,
    }),
  })
    .then((res) => res.json())
    .then((result) => {
      if (!result) throw new Error('No response obtained!');

      if (result?.status !== 200 && result?.status !== 201) {
        throw new Error(result?.msg);
      }

      console.log('Linkrunner: Trigger called 🔥');
    })
    .catch((err) => {
      console.error('Error initializing linkrunner: ', err.message);
    });
};

const linkrunner = {
  init,
  trigger,
};

export default linkrunner;
