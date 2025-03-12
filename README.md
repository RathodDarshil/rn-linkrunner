# rn-linkrunner

React Native Package for [linkrunner.io](https://www.linkrunner.io)

## Table of Contents

- [Installation](#installation)
  - [Step 1: Prerequisites](#step-1-prerequisites)
  - [Step 2: Installing rn-linkrunner](#step-2-installing-rn-linkrunner)
- [Expo](#expo)
- [Usage](#usage)
  - [Initialisation](#initialisation)
  - [Signup](#signup)
  - [Set User Data](#set-user-data)
  - [Trigger Deeplink](#trigger-deeplink-for-deferred-deep-linking)
  - [Capture Payment](#capture-payment)
  - [Remove Payment](#remove-payment)
- [Support](#facing-issues-during-integration)
- [License](#license)

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

Call this function only once after the user has completed the onboarding process in your app. This should be triggered at the final step of your onboarding flow to register the user with Linkrunner.

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

### Set User Data

Call this function everytime the app is opened and the user is logged in.

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

### Trigger Deeplink (For Deferred Deep Linking)

This function triggers the original deeplink that led to the app installation. Call it only after your main navigation is initialized and all deeplink-accessible screens are ready to receive navigation events.

Note: For this to work properly make sure you have added verification objects on the [Linkrunner Dashboard](https://www.linkrunner.io/settings?p_id=38&sort_by=activity-1&s=store-verification).

```jsx
import linkrunner from 'rn-linkrunner';

const onTriggerDeeplink = async () => {
  await linkrunner.triggerDeeplink();
};
```

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

### Function Placement Guide

Below is a simple guide on where to place each function in your application:

| Function                     | Where to Place                                                          | When to Call                                             |
| ---------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `linkrunner.init`            | In your `App.tsx` within a `useEffect` hook with empty dependency array | Once when the app starts                                 |
| `linkrunner.signup`          | In your onboarding flow                                                 | Once after user completes the onboarding process         |
| `linkrunner.setUserData`     | In your authentication logic                                            | Every time the app is opened and the user is logged in   |
| `linkrunner.triggerDeeplink` | After navigation initialization                                         | Once after your navigation is ready to handle deep links |
| `linkrunner.capturePayment`  | In your payment processing flow                                         | When a user makes a payment                              |
| `linkrunner.removePayment`   | In your payment cancellation/refund flow                                | When a payment needs to be removed                       |

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
