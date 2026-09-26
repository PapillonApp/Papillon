import DateTimePicker from "@expo/ui/community/datetime-picker";
import { Button, DatePicker, Divider, Host, Popover, ProgressView, Rectangle, VStack } from "@expo/ui/swift-ui";
import {
  buttonStyle,
  contentShape,
  datePickerStyle,
  fixedSize,
  frame,
  onGeometryChange,
  opacity,
  padding,
  shapes,
} from "@expo/ui/swift-ui/modifiers";
import { t } from "i18next";
import React from "react";
import { InteractionManager, Platform, StyleSheet, View } from "react-native";

// UICalendarView, which backs the graphical style, refuses to lay out below
// 320pt. Pinning the width there keeps the popover from resizing on every tap.
const PICKER_WIDTH = 320;

const PICKER_PADDING = { horizontal: 8, vertical: 4 } as const;

const TODAY_PADDING = { horizontal: 8, vertical: 14 } as const;

// The popover's contents always lay out to the same size, so measuring them
// once is enough for every popover afterwards, including on a later mount of
// this screen. Kept at module scope for exactly that reason. Null until they
// have been built once, and no estimate stands in: a placeholder at the wrong
// height would present the popover at the wrong height.
let measuredPickerSize: { width: number; height: number } | null = null;

// Long enough for the dismiss animation to finish, so tearing the picker back
// down is not visible as a flash of the placeholder on the way out.
const CONTENT_TEARDOWN_MS = 350;

export interface CalendarAnchor {
  /** Distance from the top of the screen container. */
  top?: number;
  /** Distance from its leading edge. */
  left?: number;
  /**
   * Width of the invisible anchor strip. The popover's arrow centers on it, so
   * this should roughly match the width of the control that opens the calendar.
   */
  width?: number;
}

export interface CalendarProps {
  /** The selected day. Fully controlled: the picker never holds its own copy. */
  date?: Date;
  onDateChange?: (date: Date) => void;
  /** Tint applied to the picker's selection and accents. */
  color?: string;
  /** Controlled visibility. Leave undefined to drive it through the ref. */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  /**
   * Pins the anchor at a fixed spot in the screen instead of wherever the
   * component sits in the tree. Use it to hang the popover off a native header
   * item, which cannot host a SwiftUI anchor itself.
   */
  anchor?: CalendarAnchor;
  /**
   * Where the arrow sits on the popover, which is what decides the side the
   * popover opens towards: `top` puts the arrow above the sheet, so it drops
   * *below* the anchor.
   */
  arrowEdge?: "top" | "bottom" | "leading" | "trailing" | "none";
}

export interface CalendarRef {
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

const Calendar = React.forwardRef<CalendarRef, CalendarProps>(({
  date,
  onDateChange,
  color,
  visible: visibleProp,
  onVisibleChange,
  anchor,
  arrowEdge = "top",
}, ref) => {
  const isControlled = visibleProp !== undefined;
  const [uncontrolledVisible, setUncontrolledVisible] = React.useState(false);
  const visible = isControlled ? visibleProp : uncontrolledVisible;

  // Read by the imperative handle so it can flip the current value without
  // being rebuilt on every visibility change.
  const visibleRef = React.useRef(visible);
  visibleRef.current = visible;

  const setVisible = React.useCallback((next: boolean) => {
    if (!isControlled) {
      setUncontrolledVisible(next);
    }
    onVisibleChange?.(next);
  }, [isControlled, onVisibleChange]);

  React.useImperativeHandle(ref, () => ({
    toggle: () => setVisible(!visibleRef.current),
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }), [setVisible]);

  const handleDateChange = React.useCallback((picked: Date) => {
    onDateChange?.(picked);
  }, [onDateChange]);

  // Jumping to today is a "take me there" action rather than browsing, so it
  // also puts the popover away: what the caller wants to look at is behind it.
  const handleToday = React.useCallback(() => {
    onDateChange?.(new Date());
    setVisible(false);
  }, [onDateChange, setVisible]);

  // SwiftUI only builds the popover's body at presentation, and building
  // UICalendarView is slow enough to be felt as a delay between the tap and the
  // popover appearing. So the popover opens on a placeholder, which costs
  // nothing to build, and the real picker is mounted a frame later — the
  // construction then happens with the popover already on screen.
  const [pickerMounted, setPickerMounted] = React.useState(false);
  React.useEffect(() => {
    if (visible) {
      // After the commit that presents the popover, not before it.
      const frameId = requestAnimationFrame(() => setPickerMounted(true));
      return () => cancelAnimationFrame(frameId);
    }
    const timeout = setTimeout(() => setPickerMounted(false), CONTENT_TEARDOWN_MS);
    return () => clearTimeout(timeout);
  }, [visible]);

  const anchorWidth = anchor?.width ?? 160;

  const hostStyle = React.useMemo(() => ({
    width: anchorWidth,
    height: 1,
    alignSelf: (anchor ? "flex-start" : "center") as "flex-start" | "center",
  }), [anchorWidth, anchor]);

  const triggerModifiers = React.useMemo(
    () => [frame({ width: anchorWidth, height: 1 }), opacity(0)],
    [anchorWidth]
  );

  // The content reports its own frame, read after padding, so it is the size the
  // popover actually takes.
  const [pickerSize, setPickerSize] = React.useState(measuredPickerSize);
  const handlePickerGeometry = React.useCallback((measured: { width: number; height: number }) => {
    if (measured.height <= 0 || measured.width <= 0) {
      return;
    }
    measuredPickerSize = { width: measured.width, height: measured.height };
    setPickerSize(previous => (
      previous
      && Math.abs(previous.height - measured.height) < 1
      && Math.abs(previous.width - measured.width) < 1
        ? previous
        : { width: measured.width, height: measured.height }
    ));
  }, []);

  const pickerModifiers = React.useMemo(() => [
    datePickerStyle("graphical"),
    frame({ width: PICKER_WIDTH }),
    padding(PICKER_PADDING),
  ], []);

  // Measured on the whole content rather than on the picker alone, so the
  // placeholder stands in for the button's row too and the popover does not
  // resize as the real content takes over.
  //
  // A graphical date picker is vertically flexible and grows to whatever height
  // it is offered — the width is already pinned for the same reason. Measured
  // inside the roomy prewarm host it would otherwise report that host's height,
  // and the popover would open on a placeholder far taller than the picker,
  // until a real presentation measured it properly and corrected the record.
  // Taking the ideal height instead makes the first measurement the right one.
  const contentModifiers = React.useMemo(
    () => [fixedSize({ vertical: true }), onGeometryChange(handlePickerGeometry)],
    [handlePickerGeometry]
  );

  // Padded before it is framed, and given a hit shape, so the whole row is the
  // button rather than just the few points the word itself covers.
  const todayModifiers = React.useMemo(() => [
    buttonStyle("borderless"),
    padding(TODAY_PADDING),
    frame({ width: PICKER_WIDTH }),
    contentShape(shapes.rectangle()),
  ], []);

  const placeholderModifiers = React.useMemo(
    () => (pickerSize ? [frame({ width: pickerSize.width, height: pickerSize.height })] : []),
    [pickerSize]
  );

  // Falls back to mounting the content straight away if the tap beats the
  // prewarm, since a placeholder with no measurement would present at the wrong
  // height.
  const showPicker = pickerMounted || pickerSize === null;

  // Both the size and the cost of building UICalendarView have to be settled
  // before the first tap, or that tap pays for one or the other. So the picker
  // is built once offscreen, after the screen has settled, purely to be
  // measured. It unmounts itself as soon as it has reported, and what it leaves
  // behind — the measurement, and warm calendar machinery in the process — is
  // what makes the first real open both instant and correctly sized.
  const [prewarmReady, setPrewarmReady] = React.useState(false);
  React.useEffect(() => {
    if (Platform.OS !== "ios" || measuredPickerSize !== null) {
      return;
    }
    const handle = InteractionManager.runAfterInteractions(() => setPrewarmReady(true));
    return () => handle.cancel();
  }, []);

  // Held apart from the popover's presentation state so that opening and
  // closing touches only `isPresented`. Otherwise every toggle re-sends the
  // picker's props too, right when the main thread is busy building
  // UICalendarView.
  const pickerContent = React.useMemo(() => (
    <VStack spacing={0} modifiers={contentModifiers}>
      <DatePicker
        selection={date}
        displayedComponents={["date"]}
        onDateChange={handleDateChange}
        modifiers={pickerModifiers}
      />
      <Divider />
      <Button label={t("Today")} onPress={handleToday} modifiers={todayModifiers} />
    </VStack>
  ), [date, handleDateChange, handleToday, pickerModifiers, contentModifiers, todayModifiers]);

  const prewarm = pickerSize === null && prewarmReady ? (
    <View pointerEvents="none" style={styles.prewarm}>
      <Host style={styles.prewarmHost} matchContents={false}>
        {pickerContent}
      </Host>
    </View>
  ) : null;

  const pinnedStyle = React.useMemo(
    () => [styles.pinnedAnchor, { top: anchor?.top ?? 0, left: anchor?.left ?? 0 }],
    [anchor?.top, anchor?.left]
  );

  if (Platform.OS !== "ios") {
    // The Android picker presents its own dialog when it mounts and reports back
    // on both confirm and cancel, so mounting it *is* opening it.
    if (!visible) {
      return null;
    }
    return (
      <DateTimePicker
        value={date ?? new Date()}
        mode="date"
        presentation="dialog"
        // No accent colour: the Material dialog keeps its own theme rather than
        // being tinted to match the iOS picker.
        onValueChange={(_event, picked) => {
          setVisible(false);
          onDateChange?.(picked);
        }}
        onDismiss={() => setVisible(false)}
      />
    );
  }

  // An invisible strip the popover can attach to. SwiftUI needs a real view with
  // real geometry as the anchor, so it keeps its size and only loses its paint.
  const trigger = (
    <Host style={hostStyle} seedColor={color} matchContents={false}>
      <Popover
        isPresented={visible}
        onIsPresentedChange={setVisible}
        arrowEdge={arrowEdge}
      >
        <Popover.Trigger>
          <Rectangle modifiers={triggerModifiers} />
        </Popover.Trigger>
        <Popover.Content>
          {showPicker ? pickerContent : (
            <VStack alignment="center" modifiers={placeholderModifiers}>
              <ProgressView />
            </VStack>
          )}
        </Popover.Content>
      </Popover>
    </Host>
  );

  return (
    <>
      {anchor ? (
        <View pointerEvents="box-none" style={pinnedStyle}>
          {trigger}
        </View>
      ) : trigger}
      {prewarm}
    </>
  );
});

Calendar.displayName = "Calendar";

export default React.memo(Calendar);

const styles = StyleSheet.create({
  pinnedAnchor: {
    position: "absolute",
    height: 1,
  },
  // Parked off the left edge rather than hidden: a zero-sized or `display: none`
  // host would propose a degenerate size to SwiftUI and the picker would report
  // a height it never actually uses.
  prewarm: {
    position: "absolute",
    left: -10000,
    top: 0,
    opacity: 0,
  },
  prewarmHost: {
    width: PICKER_WIDTH + PICKER_PADDING.horizontal * 2,
    // Roomier than the content needs, so the proposed size never squeezes it
    // into reporting a height it would not actually use.
    height: 600,
  },
});
