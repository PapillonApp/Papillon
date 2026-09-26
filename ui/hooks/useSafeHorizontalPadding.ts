import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Horizontal content padding that keeps content inside the left/right safe
// area while letting the scroll view itself span the whole screen.
export const useSafeHorizontalPadding = (base = 16) => {
  const insets = useSafeAreaInsets();
  return {
    paddingLeft: insets.left + base,
    // A large right inset (landscape notch) already gives enough breathing room.
    paddingRight: insets.right + (insets.right > 10 ? 0 : base),
  };
};
