const path = require('path');

module.exports = {
  dependencies: {
    'rn-linkrunner': {
      platforms: {
        android: {
          sourceDir: 'android',
          packageImportPath: 'io.linkrunner.LinkrunnerPackage',
          packageInstance: 'new LinkrunnerPackage()',
        },
        ios: {
          podspecPath: path.join(__dirname, 'LinkrunnerSDK.podspec'),
        },
      },
    },
  },
};