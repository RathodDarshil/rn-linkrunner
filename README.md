# rn-linkrunner

React Native Package for [linkrunner.io](https://www.linkrunner.io)

## Installation

### Step 1: Prerequisites

rn-linkrunner also uses `react-native-device-info` and `react-native-encrypted-storage`, you can install these packages from the below mentioned commands

```sh
npm install react-native-device-info react-native-encrypted-storage

or

yarn add react-native-device-info react-native-encrypted-storage
```

then run `cd ios && pod install` to install pods for the above mentioned packages

### Step 2: Installing rn-linkrunner

```sh
npm install rn-linkrunner

or

yarn add rn-linkrunner
```

## Usage

### Initialisation

You'll need your [project token](https://www.linkrunner.io/dashboard?m=documentation) to initialisation the package

Place it in the `App.tsx` component, make sure the dependency array is empty for the `useEffect`

```js
import linkrunner from 'rn-linkrunner';

// Inside your react component
useEffect(() => {
  linkrunner.init('PROJECT_TOKEN');
}, []);
```

### Trigger

Call this function once your onboarding is completed and the navigation stack can be accessed by a deeplink

```JSX
import linkrunner from 'rn-linkrunner';

const onTrigger = () => {
    linkrunner.trigger({
        user_data: {
            id: 1,
            name: "Darshil Rathod", // optional
            phone: "9583849238", // optional
            email: "darshil@linkrunner.io", //optional
        },
        data: {}, // Any other data you might need
    });
};
```

Both the attributes in the `trigger` method are optional although recommened to have.

<!-- ## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow. -->

## License

MIT
