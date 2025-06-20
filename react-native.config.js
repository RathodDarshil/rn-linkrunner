module.exports = {
  dependencies: {
    'rn-linkrunner': {
      platforms: {
        android: {
          sourceDir: 'android',
          packageImportPath: 'io.linkrunner.LinkrunnerPackage',
        },
        // iOS configuration will be added when iOS module is created
      },
    },
  },
};