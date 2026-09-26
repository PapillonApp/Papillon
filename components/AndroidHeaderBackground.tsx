import { useTheme } from "expo-router/react-navigation";
import { Platform } from "react-native";

// Renders the Android header background via `headerStyle.backgroundColor`
// instead of a custom `headerBackground` native subview. react-native-screens'
// ScreenStackHeaderConfig has to add/remove custom headerBackground subviews on
// every header update, which is prone to a native "child already has a parent"
// crash on Android; a plain headerStyle color avoids that code path entirely.
export const useAndroidHeaderProps = () => {
  const theme = useTheme();
  return Platform.OS === "android"
    ? {
      headerBackVisible: false,
      headerStyle: { backgroundColor: theme.colors.background },
    }
    : {};
};
