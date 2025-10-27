const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for @tanstack/react-query module resolution
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, "cjs", "mjs"],
  unstable_enablePackageExports: true,
};

module.exports = withNativeWind(config, { input: "./global.css" });
