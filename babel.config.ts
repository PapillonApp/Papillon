module.exports = {
  presets: ["babel-preset-expo"],
  plugins: [
    "react-native-reanimated/plugin",
    ["@babel/plugin-proposal-decorators", { legacy: true }],
  ],
};
