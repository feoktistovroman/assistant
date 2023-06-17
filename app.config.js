import "dotenv/config";

export default {
  expo: {
    name: "assistant",
    slug: "assistant",
    version: "1.0.0",
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
      bugsnag: {
        apiKey: "23b7eeed07e558e32156e9cc0a411d58"
      },
      API_URL: process.env.API_URL,
      OPENAI_API_URL: process.env.OPENAI_API_URL,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY
    },
    hooks: {
      postPublish: [
        {
          file: "@bugsnag/expo/hooks/post-publish.js",
          config: {}
        }
      ]
    },
    plugins: [
      "@bugsnag/plugin-expo-eas-sourcemaps"
    ],
    updates: {
      url: "https://u.expo.dev/3d764b16-cf00-4b9a-a78f-bccb0b3ef12f"
    },
    runtimeVersion: {
      policy: "sdkVersion"
    }
  }
}
