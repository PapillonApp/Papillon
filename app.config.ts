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
      image: "./assets/images/splash-screen.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "xyz.getpapillon.ios",
      supportsTablet: true,
    },
    android: {
      package: "xyz.getpapillon.app",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "react-native-bottom-tabs",
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
