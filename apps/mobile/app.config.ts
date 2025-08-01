import "dotenv/config";

export default {
  expo: {
    name: "mobile-native",
    slug: "mobile-native",
    extra: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
    version: "1.0.0",
    orientation: "portrait",
    // Local icon removed
    scheme: "mobilenative",
    userInterfaceStyle: "automatic",
    // The new architecture causes issues with certain native modules like
    // react-native-maps, so disable it for now
    newArchEnabled: false,
    splash: {
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      // Local favicon removed
    },
    // Enable react-native-maps config plugin
    plugins: ["expo-router"],
    experiments: {
      typedRoutes: true,
    },
  },
};
