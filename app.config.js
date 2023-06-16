import "dotenv/config";

export default {
  expo: {
    name: "assistant",
    slug: "assistant",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.feoktistov.roman.assistant",
      buildNumber: '1'
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      eas: {
        projectId: "3d764b16-cf00-4b9a-a78f-bccb0b3ef12f"
      },
      API_URL: process.env.API_URL,
      OPENAI_API_URL: process.env.OPENAI_API_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
    },
    updates: {
      url: "https://u.expo.dev/3d764b16-cf00-4b9a-a78f-bccb0b3ef12f"
    },
    runtimeVersion: {
      policy: "nativeVersion"
    }
  }
}
