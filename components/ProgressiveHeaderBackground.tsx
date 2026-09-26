import { ProgressiveBlurView } from '@sbaiahmed1/react-native-blur';
import React from 'react';
import { StyleSheet } from 'react-native';

// Stands in for the navigation bar's own scroll-edge material on screens whose
// title is a custom component. Such a title is hosted as a raw
// `UINavigationItem.titleView`, and UIKit only fades its material in behind
// content it manages itself, so the bar would otherwise stay transparent at
// every scroll position. react-navigation renders this at the top of the
// screen, underneath the native bar, clipped to the header height.
// `startOffset` is the share of the height kept at full blur before the fade
// starts. At 0 the fade spans the whole view and, since the mask eases the blur
// *radius* cubically, everything below the top quarter comes out practically
// sharp — the status bar looks blurred and the bar itself does not. The plateau
// covers the status bar and the bar, leaving the fade to the bottom edge.
export const ProgressiveHeaderBackground = () => (
  <ProgressiveBlurView
    blurType="systemUltraThinMaterial"
    blurAmount={10}
    direction="blurredTopClearBottom"
    startOffset={0.7}
    reducedTransparencyFallbackColor="#00000000"
    style={StyleSheet.absoluteFill}
  />
);

export default ProgressiveHeaderBackground;
