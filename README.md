# rn-linkrunner

React Native Package for [linkrunner.io](https://www.linkrunner.io)

## Installation

### Step 1: Prerequisites

rn-linkrunner also uses `react-native-device-info`. You can install this package with the following command:

```sh
npm install react-native-device-info

or

yarn add react-native-device-info
```

Then run `cd ios && pod install` to install pods for the package.

### Step 2: Installing rn-linkrunner

```sh
npm install rn-linkrunner

or

yarn add rn-linkrunner
```

## Usage

### Initialisation

You'll need your [project token](https://www.linkrunner.io/dashboard?m=documentation) to initialise the package. Place this initialization step in your `App.tsx` component, making sure the dependency array is empty for the `useEffect`:

```js
import linkrunner from 'rn-linkrunner';

// Inside your react component
useEffect(() => {
  init();
}, []);

const init = async () => {
  const initData = await linkrunner.init('PROJECT_TOKEN');
};
```

#### Response type for `linkrunner.init`

```
{
  ip_location_data: {
    ip: string;
    city: string;
    countryLong: string;
    countryShort: string;
    latitude: number;
    longitude: number;
    region: string;
    timeZone: string;
    zipCode: string;
  };
  deeplink: string;
  root_domain: boolean;
}
```

### Trigger

Call this function once your onboarding is completed and the navigation stack can be accessed by a deeplink:

```jsx
import linkrunner from 'rn-linkrunner';

const onTrigger = async () => {
  const trigger = await linkrunner.trigger({
    user_data: {
      id: '1',
      name: 'John Doe', // optional
      phone: '9583849238', // optional
      email: 'support@linkrunner.io', //optional
    },
    data: {}, // Any other data you might need
  });
};
```

#### Response type for `linkrunner.trigger`

```
{
  ip_location_data: {
    ip: string;
    city: string;
    countryLong: string;
    countryShort: string;
    latitude: number;
    longitude: number;
    region: string;
    timeZone: string;
    zipCode: string;
  };
  deeplink: string;
  root_domain: boolean;
  trigger: boolean // Deeplink won't be triggered if false
}
```

Note: Value of `trigger` will be only true for the first time the function is triggered by the user in order to prevent unnecessary redirects

### Facing issues during integration?

Mail us on support@linkrunner.io

## License

MIT
