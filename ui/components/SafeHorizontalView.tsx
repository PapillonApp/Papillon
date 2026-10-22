import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// A large right inset (landscape notch) already gives enough breathing room,
// so the right side takes the max of inset and base instead of their sum.
export const SAFE_HORIZONTAL_EDGES = { left: 'additive', right: 'maximum' } as const;

type SafeHorizontalViewProps = Omit<React.ComponentProps<typeof SafeAreaView>, 'edges' | 'mode'> & {
  // Padding kept on each side on top of the safe area.
  base?: number;
  style?: StyleProp<ViewStyle>;
};

// Keeps content inside the left/right safe area. The insets are applied natively,
// so they follow window resizes right away instead of waiting for a JS re-render
// like useSafeAreaInsets() does.
const SafeHorizontalView = ({ base = 16, style, ...props }: SafeHorizontalViewProps) => (
  <SafeAreaView
    {...props}
    edges={SAFE_HORIZONTAL_EDGES}
    style={[style, { paddingLeft: base, paddingRight: base }]}
  />
);

export default SafeHorizontalView;
