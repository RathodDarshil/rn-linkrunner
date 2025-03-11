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

### Trigger

Call this function once your onboarding is completed and the navigation stack can be accessed by a deeplink:

Note: Make sure this function is called every time the user opens the app after being logged in.

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
    config: {
      trigger_deeplink: true, // Default is true
  });
};
```

The config parameter allows you to control the behavior of the trigger function:

- `trigger_deeplink`: boolean (optional) - When set to false, prevents automatic triggering of the deeplink even if one is returned

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
  trigger: boolean; // Deeplink won't be triggered if false
}
```

Value of `trigger` will be only true for the first time the function is triggered by the user in order to prevent unnecessary redirects

### Capture Payment

Use this method to capture payment information:

```js
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

### Track Event

Use this method to track custom events:

```js
const trackEvent = async () => {
  await linkrunner.trackEvent(
    'event_name', // Name of the event
    { key: 'value' } // Optional: Additional JSON data for the event
  );
};
```

### Facing issues during integration?

Mail us on darshil@linkrunner.io

## License

MIT
