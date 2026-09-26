import { Host } from "@expo/ui/swift-ui";
import { useFocusEffect, useTheme } from "expo-router/react-navigation";
import React, { useCallback, useMemo, useState } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { type SFSymbol } from "sf-symbols-typescript";

import { TIP_MAX_SHOWS, TipVisitsRequired, type TipId } from "@/constants/Tips";
import { PapillonTipView } from "@/modules/papillon-tips";
import { useTipsStore } from "@/stores/tips";

// Screens arrive with a push animation and their headers settle a beat later.
// Popping a callout into that reads as a glitch, so the anchor waits.
const APPEAR_DELAY_MS = 900;

interface TipProps {
  tipId: TipId;
  title: string;
  message?: string;
  systemImage?: SFSymbol;
  /**
   * Which edge of the *anchor* the callout hangs off. `bottom`, the default,
   * puts the callout below the anchor with its arrow pointing up; `top` puts it
   * above with the arrow pointing down. iOS flips it when there is no room.
   */
  arrowEdge?: "top" | "bottom" | "leading" | "trailing";
  /**
   * Width of the invisible anchor. SwiftUI centers the arrow on it, so it
   * should roughly match the control being pointed at.
   */
  width?: number;
  /** How long to wait, once the screen is eligible, before the tip appears. */
  delay?: number;
  /**
   * Where the anchor sits. Give it the insets that place it against the thing
   * being pointed at; the anchor centers itself within them.
   */
  style?: StyleProp<ViewStyle>;
}

/**
 * A TipKit callout pointing at something on screen.
 *
 * Two gates stand between mounting this and a callout appearing. The first is
 * ours: the screen has to have been opened often enough (see
 * `TipVisitsRequired`), so a new user is not met with a wall of hints. The
 * second is TipKit's, which owns the presentation and files a dismissal when
 * its close button is used.
 *
 * TipKit's own bookkeeping is not enough on its own, though. Tapping outside a
 * callout dismisses the popover without invalidating the tip, so it comes
 * straight back the next time the screen behind it redraws — which, on a pager
 * like the tasks weeks, is every swipe. So the decision to show is taken once,
 * when the screen is entered, and never revisited while it is on screen: no
 * store subscription, nothing that could bring the callout back mid-visit. Each
 * tip gets `TIP_MAX_SHOWS` visits and is then done for good.
 *
 * Renders nothing off iOS 17.
 */
const Tip: React.FC<TipProps> = ({
  tipId,
  title,
  message,
  systemImage,
  arrowEdge = "bottom",
  width = 160,
  delay = APPEAR_DELAY_MS,
  style,
}) => {
  const { colors } = useTheme();

  // The one thing worth watching live: retirement means the user just did what
  // the tip was teaching, and the callout should go away under them.
  const retired = useTipsStore(state => state.retired.includes(tipId));

  // Null until this visit has been judged and the settling delay has passed.
  // Deliberately not derived from the store: reading it reactively would let a
  // write elsewhere re-run the decision, which is exactly the flicker this
  // component exists to avoid.
  const [showing, setShowing] = useState(false);

  // Counted per screen entry rather than per mount: tab screens stay mounted in
  // the background, so a mount effect would count once and never again.
  useFocusEffect(
    useCallback(() => {
      const store = useTipsStore.getState();
      store.recordVisit(tipId);

      const { visits, shows, forceAll, retired: alreadyRetired } = useTipsStore.getState();
      const eligible = forceAll || (
        !alreadyRetired.includes(tipId) &&
        (visits[tipId] ?? 0) >= (TipVisitsRequired[tipId] ?? 1) &&
        (shows[tipId] ?? 0) < TIP_MAX_SHOWS
      );

      // Spent up front, not when the callout fades in: a visit the user cut
      // short still used up one of the tip's chances to be noticed.
      if (eligible && !forceAll) {
        store.recordShow(tipId);
      }

      const timeout = eligible ? setTimeout(() => setShowing(true), delay) : undefined;
      return () => {
        clearTimeout(timeout);
        setShowing(false);
      };
    }, [tipId, delay])
  );

  const hostStyle = useMemo(() => ({ width, height: 1 }), [width]);

  if (Platform.OS !== "ios" || !showing || retired) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={[styles.anchor, style]}>
      <Host style={hostStyle} matchContents={false}>
        <PapillonTipView
          tipId={tipId}
          title={title}
          message={message}
          systemImage={systemImage}
          presentation="popover"
          arrowEdge={arrowEdge}
          anchorWidth={width}
          anchorHeight={1}
          tintColor={String(colors.primary)}
        />
      </Host>
    </View>
  );
};

export default React.memo(Tip);

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
    height: 1,
    alignItems: "center",
  },
});
