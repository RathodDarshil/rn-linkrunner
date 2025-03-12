# rn-linkrunner

React Native Package for [linkrunner.io](https://www.linkrunner.io)

## Installation

### Step 1: Prerequisites

rn-linkrunner also uses `react-native-device-info`, `@react-native-community/netinfo`, `@react-native-async-storage/async-storage`, `react-native-play-install-referrer` and `@sparkfabrik/react-native-idfa-aaid`. You can install these packages with the following command:

```sh
npm install react-native-device-info @react-native-community/netinfo @react-native-async-storage/async-storage react-native-play-install-referrer @sparkfabrik/react-native-idfa-aaid
```

or

```sh
yarn add react-native-device-info @react-native-community/netinfo @react-native-async-storage/async-storage react-native-play-install-referrer @sparkfabrik/react-native-idfa-aaid
```

**IOS Configuration**:

- Run `cd ios && pod install` to install pods for the package.
- Add the below code in `info.plist`:
  ```sh
    <key>NSUserTrackingUsageDescription</key>
    <string>This identifier will be used to deliver personalized ads and improve your app experience.</string>
  ```

### Step 2: Installing rn-linkrunner

```sh
npm install rn-linkrunner
```

or

```sh
yarn add rn-linkrunner
```

## Expo

If you are using Expo, you will need to use development builds since this package relies on native libraries. Follow the [Expo Development Builds Documentation](https://docs.expo.dev/develop/development-builds/introduction/) to get started.

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
  campaign_data: {
    id: string;
    name: string;
    type: "ORGANIC" | "INORGANIC";
    ad_network: "META" | "GOOGLE" | null;
    group_name: string | null;
    asset_group_name: string | null;
    asset_name: string | null;
  };
}
```

### Signup

Call this function once your onboarding is completed:

```jsx
import linkrunner from 'rn-linkrunner';

const onSignup = async () => {
  const signup = await linkrunner.signup({
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

#### Response type for `linkrunner.signup`

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

### Trigger Deeplink

Call this function to trigger the deeplink:

```jsx
import linkrunner from 'rn-linkrunner';

const onTriggerDeeplink = async () => {
  await linkrunner.triggerDeeplink();
};
```

### Set User Data

Call this function to update user data:

```jsx
import linkrunner from 'rn-linkrunner';

const setUserData = async () => {
  await linkrunner.setUserData({
    user_data: {
      id: '1',
      name: 'John Doe', // optional
      phone: '9583849238', // optional
      email: 'support@linkrunner.io', //optional
    },
  });
};
```

Note: Make sure this function is called every time the user opens the app after being logged in.

### Capture Payment

Use this method to capture payment information:

const capturePayment = async () => {
  await linkrunner.capturePayment({
    amount: 100, // Payment amount
    userId: 'user123', // User identifier
    paymentId: 'payment456', // Optional: Unique payment identifier
  });
};
```

#### Parameters for `linkrunner.capturePayment`

- `amount`: number (required) - The payment amount
- `userId`: string (required) - Identifier for the user making the payment
- `paymentId`: string (optional) - Unique identifier for the payment

### Remove Payment

Use this method to remove a captured payment:

```js
const removePayment = async () => {
  await linkrunner.removePayment({
    userId: 'user123', // User identifier
    paymentId: 'payment456', // Optional: Unique payment identifier
  });
};
```

#### Parameters for `linkrunner.removePayment`

- `userId`: string (required) - Identifier for the user whose payment is being removed
- `paymentId`: string (optional) - Unique identifier for the payment to be removed

Note: Either `paymentId` or `userId` must be provided when calling `removePayment`. If `userId` is provided, all payments for that user will be removed.

### Facing issues during integration?

Mail us on darshil@linkrunner.io

## License

MIT
