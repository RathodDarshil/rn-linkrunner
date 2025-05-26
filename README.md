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
  - [Track Event](#track-event)
  - [Process Google Analytics](#process-google-analytics)
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
import analytics from '@react-native-firebase/analytics';
import { Platform } from 'react-native';

// Inside your react component
useEffect(() => {
  init();
}, []);

const init = async () => {
  const initData = await linkrunner.init('PROJECT_TOKEN');

  // Call processGoogleAnalytics right after init
  if (Platform.OS === 'android') {
    await linkrunner.processGoogleAnalytics(analytics);
  }
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
  attribution_source: "ORGANIC" | "META" | "GOOGLE";
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

Note: For this to work properly make sure you have added verification objects on the [Linkrunner Dashboard](https://www.linkrunner.io/settings?sort_by=activity-1&s=store-verification).

```jsx
import linkrunner from 'rn-linkrunner';

const onTriggerDeeplink = async () => {
  await linkrunner.triggerDeeplink();
};
```

### Track Event

Use this method to track custom events

```js
const trackEvent = async () => {
  await linkrunner.trackEvent(
    'event_name', // Name of the event
    { key: 'value' } // Optional: Additional JSON data for the event
  );
};
```

### Process Google Analytics

Use this method to track GCLID from install referrer in Google Analytics. This is especially useful for tracking the effectiveness of Google Ads campaigns. For best results, call this method immediately after initializing linkrunner.

```js
import analytics from '@react-native-firebase/analytics';
import linkrunner from 'rn-linkrunner';

// Recommended implementation
const init = async () => {
  const initData = await linkrunner.init('PROJECT_TOKEN');

  // Call processGoogleAnalytics right after init
  linkrunner.processGoogleAnalytics(analytics);
};
```

#### Prerequisites for `linkrunner.processGoogleAnalytics`

You must have `@react-native-firebase/analytics` installed in your project and have properly configured Firebase in your app according to the [Firebase for React Native documentation](https://rnfirebase.io/analytics/usage).

### Capture Payment

Use this method to capture payment information:

```js
const capturePayment = async () => {
  await linkrunner.capturePayment({
    amount: 100, // Payment amount
    userId: 'user123', // User identifier
    paymentId: 'payment456', // Optional: Unique payment identifier
    type: 'FIRST_PAYMENT', // Optional: Payment type
    status: 'PAYMENT_COMPLETED', // Optional: Payment status
  });
};
```

#### Parameters for `linkrunner.capturePayment`

- `amount`: number (required) - The payment amount
- `userId`: string (required) - Identifier for the user making the payment
- `paymentId`: string (optional) - Unique identifier for the payment
- `type`: string (optional) - Type of payment. Available options:
  - `FIRST_PAYMENT` - First payment made by the user
  - `WALLET_TOPUP` - Adding funds to a wallet
  - `FUNDS_WITHDRAWAL` - Withdrawing funds
  - `SUBSCRIPTION_CREATED` - New subscription created
  - `SUBSCRIPTION_RENEWED` - Subscription renewal
  - `ONE_TIME` - One-time payment
  - `RECURRING` - Recurring payment
  - `DEFAULT` - Default type (used if not specified)
- `status`: string (optional) - Status of the payment. Available options:
  - `PAYMENT_INITIATED` - Payment has been initiated
  - `PAYMENT_COMPLETED` - Payment completed successfully (default if not specified)
  - `PAYMENT_FAILED` - Payment attempt failed
  - `PAYMENT_CANCELLED` - Payment was cancelled

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

### Set CleverTap ID

Use this method to associate a CleverTap ID with the current installation:

```js
import linkrunner from 'rn-linkrunner';

const setCleverTapIdentifier = async () => {
  await linkrunner.setClevertapId('your_clevertap_user_id');
};
```

#### Parameters for `linkrunner.setClevertapId`

- `clevertapId`: string (required) - The CleverTap ID to associate with this installation

### Function Placement Guide

Below is a simple guide on where to place each function in your application:

| Function                                                                    | Where to Place                                                          | When to Call                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| [`linkrunner.init`](#initialisation)                                        | In your `App.tsx` within a `useEffect` hook with empty dependency array | Once when the app starts                                 |
| [`linkrunner.processGoogleAnalytics`](#process-google-analytics)            | Just below the `linkrunner.init` function call in your `App.tsx`        | Once after initializing linkrunner                       |
| [`linkrunner.signup`](#signup)                                              | In your onboarding flow                                                 | Once after user completes the onboarding process         |
| [`linkrunner.setUserData`](#set-user-data)                                  | In your authentication logic                                            | Every time the app is opened and the user is logged in   |
| [`linkrunner.setClevertapId`](#set-clevertap-id)                           | After initializing CleverTap SDK                                        | When you want to associate a CleverTap ID with the user  |
| [`linkrunner.triggerDeeplink`](#trigger-deeplink-for-deferred-deep-linking) | After navigation initialization                                         | Once after your navigation is ready to handle deep links |
| [`linkrunner.trackEvent`](#track-event)                                     | Throughout your app where events need to be tracked                     | When specific user actions or events occur               |
| [`linkrunner.capturePayment`](#capture-payment)                             | In your payment processing flow                                         | When a user makes a payment                              |
| [`linkrunner.removePayment`](#remove-payment)                               | In your payment cancellation/refund flow                                | When a payment needs to be removed                       |

### Facing issues during integration?

Mail us on darshil@linkrunner.io

## License

MIT
