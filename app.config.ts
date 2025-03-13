import { ExpoConfig } from "expo/config";
import PackageJSON from "./package.json";

export default (): ExpoConfig => ({
  name: "Papillon",
  slug: PackageJSON.name,
  scheme: "papillon",
  version: PackageJSON.version,
  orientation: "default",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  primaryColor: "#32AB8E",
  splash: {
    image: "./assets/launch/splash.png",
    resizeMode: "cover",
    backgroundColor: "#32AB8E",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    appStoreUrl:
      "https://apps.apple.com/us/app/papillon-lappli-scolaire/id6477761165",
    bundleIdentifier: "xyz.getpapillon.ios",
    associatedDomains: ["applinks:getpapillon.xyz"],
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["papillon", "izly"],
        },
      ],
    },
    splash: {
      backgroundColor: "#32AB8E",
      image: "./assets/launch/splash.png",
      resizeMode: "cover",
      dark: {
        backgroundColor: "#001C0F",
        image: "./assets/launch/splash-dark.png",
        resizeMode: "cover",
      },
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    versionCode: parseInt(PackageJSON.version.replaceAll(".", "") + "0"),
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=xyz.getpapillon.app",
    adaptiveIcon: {
      foregroundImage: "./assets/launch/adaptive-icon-foreground.png",
      backgroundImage: "./assets/launch/adaptive-icon-background.png",
      monochromeImage: "./assets/launch/adaptive-icon-monochrome.png",
      backgroundColor: "#32AB8E",
    },
    intentFilters: [
      {
        action: "VIEW",
        data: [{ scheme: "papillon" }, { scheme: "izly" }],
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
    splash: {
      backgroundColor: "#32AB8E",
      image: "./assets/launch/splash.png",
      resizeMode: "cover",
      dark: {
        backgroundColor: "#001C0F",
        image: "./assets/launch/splash-dark.png",
        resizeMode: "cover",
      },
    },
    package: "xyz.getpapillon.app",
    permissions: [
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_FINE_LOCATION",
    ],
  },
  plugins: [
    [
      "expo-build-properties",
      {
        "ios": {
          "deploymentTarget": "15.6"
        }
      }
    ],
    [
      "expo-dev-client",
      {
        "launchMode": "most-recent"
      }
    ],
    "./plugins/notifee-mod.js",
    [
      "expo-font",
      {
        fonts: [
          "assets/fonts/FixelText-Bold.ttf",
          "assets/fonts/FixelText-Light.ttf",
          "assets/fonts/FixelText-Medium.ttf",
          "assets/fonts/FixelText-Regular.ttf",
          "assets/fonts/FixelText-SemiBold.ttf",
        ],
      },
    ],
    "expo-barcode-scanner",
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
      "expo-camera",
      {
        cameraPermission:
          "Papillon utilise ta caméra pour scanner des QR-codes pour te connecter, pour capturer des documents, ou pour des fonctionnalités amusantes telles que les réactions.",
        microphonePermission:
          "Papillon utilise ton micro pour enregistrer des travaux audio ou des cours.",
        recordAudioAndroid: true,
      },
    ],
    [
      "expo-sensors",
      {
        motionPermission:
          "Papillon utilise les capteurs de mouvement de ton appareil pour de nombreuses fonctionnalités interactives.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Papillon utilise tes photos et vidéos pour personnaliser ton profil, ta gestion des cours et bien plus.",
      },
    ],
    [
      "react-native-share",
      {
        ios: ["fb", "instagram", "twitter", "tiktoksharesdk"],
        android: [
          "com.facebook.katana",
          "com.instagram.android",
          "com.twitter.android",
          "com.zhiliaoapp.musically",
        ],
      },
    ],
  ],
});
