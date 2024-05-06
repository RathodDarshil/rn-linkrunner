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
  linkrunner.init('PROJECT_TOKEN');
}, []);
```

### Trigger

Call this function once your onboarding is completed and the navigation stack can be accessed by a deep link:

```jsx
import linkrunner from 'rn-linkrunner';

const onTrigger = () => {
  linkrunner.trigger({
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

Both attributes in the `trigger` method are optional, although recommended.

### Facing issues during integration?

Mail us on support@linkrunner.io

## License

MIT
