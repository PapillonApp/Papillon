module.exports = {
  expo: {
    name: "Papillon",
    slug: "papillon",
    version: "8.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "papillon",
    platforms: ["ios", "android"],
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#003A21",
    },
    ios: {
      bundleIdentifier: "xyz.getpapillon.ios",
      supportsTablet: true
    },
    android: {
      package: "xyz.getpapillon.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      splash: {
        image: "./assets/images/splash.png",
        resizeMode: "cover",
        backgroundColor: "#003A21",
      },
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "expo-localization",
      "react-native-bottom-tabs",
      [
        "expo-location",
        {
          locationWhenInUsePermission:
            "Papillon utilise ton emplacement pour trouver les établissements autour de toi.",
          cameraPermission:
            "Papillon utilise ta caméra pour scanner des QR-codes pour te connecter, pour capturer des documents, ou pour des fonctionnalités amusantes telles que les réactions.",
        },
      ],
      [
        "react-native-edge-to-edge",
        {
          android: {
            parentTheme: "Material3",
            enforceNavigationBarContrast: false,
          },
        },
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static",
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
  },
};
