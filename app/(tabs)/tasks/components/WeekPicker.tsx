import { Host, HStack, Picker, Popover, Rectangle, Text as SwiftUIText } from "@expo/ui/swift-ui";
import { frame, opacity, padding, pickerStyle, tag } from "@expo/ui/swift-ui/modifiers";
import { useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

import Typography from "@/ui/new/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import i18n from "@/utils/i18n";

import { getMonthOfWeek, getWeeksOfMonth, type WeekCell } from "../utils/weekGrid";

// How far either side of this year the year wheel reaches. Homework does not
// exist outside a school year or two in either direction.
const YEAR_SPAN = 3;

// Column widths, wide enough for the longest month name in the languages the
// app ships and for a two-digit day range.
const WEEK_COLUMN = 96;
const MONTH_COLUMN = 132;
const YEAR_COLUMN = 84;
const COLUMNS_WIDTH = WEEK_COLUMN + MONTH_COLUMN + YEAR_COLUMN;

const IOS_WHEEL_HEIGHT = 180;
const IOS_CONTENT_PADDING = 8;

const ANDROID_ROW_HEIGHT = 40;
const ANDROID_VISIBLE_ROWS = 5;
const ANDROID_WHEEL_HEIGHT = ANDROID_ROW_HEIGHT * ANDROID_VISIBLE_ROWS;
const ANDROID_CARD_PADDING = 12;
const ANDROID_CARD_MARGIN = 24;
// Long enough for the card's exit animation to finish before the modal, which
// hosts it, is torn down underneath it.
const ANDROID_EXIT_MS = 320;

export interface WeekPickerAnchor {
  /** Distance from the top of the screen container. */
  top?: number;
  /** Distance from its leading edge. */
  left?: number;
  /**
   * Width of the invisible anchor strip. The popover's arrow centers on it, so
   * this should roughly match the width of the control that opens the picker.
   */
  width?: number;
}

interface WeekPickerProps {
  visible: boolean;
  /** Week index, in the same space as the tasks pager. */
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  onClose: () => void;
  /**
   * Pins the popover's anchor at a fixed spot in the screen. The toolbar button
   * that opens the picker is native and cannot host a SwiftUI anchor itself.
   */
  anchor?: WeekPickerAnchor;
}

interface Option {
  value: number;
  label: string;
}

const weekOptionLabel = (cell: WeekCell) => `${cell.start.getDate()} – ${cell.end.getDate()}`;

const monthOptions = (): Option[] =>
  Array.from({ length: 12 }, (_, month) => ({
    value: month,
    // Any year does, the month name is all that is read off it.
    label: new Date(2000, month, 1).toLocaleDateString(i18n.language, { month: "long" }),
  }));

/**
 * The three wheels, derived from the selected week alone: the week is the only
 * state, and the month and year it sits in follow from it. Turning the month or
 * year wheel therefore has to name a week — the first one of the month it
 * lands on, per the wheel it was turned to.
 */
const useWheels = (selectedWeek: number, onSelectWeek: (week: number) => void) => {
  const { year, month } = getMonthOfWeek(selectedWeek);

  const weeks = useMemo(() => getWeeksOfMonth(year, month), [year, month]);

  const weekOptions = useMemo(
    () => weeks.map(cell => ({ value: cell.index, label: weekOptionLabel(cell) })),
    [weeks]
  );

  const months = useMemo(() => monthOptions(), [i18n.language]);

  const years = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const from = Math.min(thisYear - YEAR_SPAN, year);
    const to = Math.max(thisYear + YEAR_SPAN, year);
    return Array.from({ length: to - from + 1 }, (_, offset) => ({
      value: from + offset,
      label: String(from + offset),
    }));
  }, [year]);

  const openMonth = useCallback((nextYear: number, nextMonth: number) => {
    onSelectWeek(getWeeksOfMonth(nextYear, nextMonth)[0].index);
  }, [onSelectWeek]);

  return {
    year,
    month,
    weekOptions,
    months,
    years,
    onWeekChange: onSelectWeek,
    onMonthChange: useCallback((next: number) => openMonth(year, next), [openMonth, year]),
    onYearChange: useCallback((next: number) => openMonth(next, month), [openMonth, month]),
  };
};

type Wheels = ReturnType<typeof useWheels> & { selectedWeek: number };

function IOSWheels({
  selectedWeek,
  year,
  month,
  weekOptions,
  months,
  years,
  onWeekChange,
  onMonthChange,
  onYearChange,
}: Wheels) {
  const column = useCallback(
    (width: number) => [pickerStyle("wheel"), frame({ width, height: IOS_WHEEL_HEIGHT })],
    []
  );

  return (
    <HStack spacing={0} modifiers={[padding({ all: IOS_CONTENT_PADDING })]}>
      <Picker
        label={t("Tasks_Week")}
        selection={selectedWeek}
        onSelectionChange={onWeekChange}
        modifiers={column(WEEK_COLUMN)}
      >
        {weekOptions.map(option => (
          <SwiftUIText key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </SwiftUIText>
        ))}
      </Picker>

      <Picker
        label=""
        selection={month}
        onSelectionChange={onMonthChange}
        modifiers={column(MONTH_COLUMN)}
      >
        {months.map(option => (
          <SwiftUIText key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </SwiftUIText>
        ))}
      </Picker>

      <Picker
        label=""
        selection={year}
        onSelectionChange={onYearChange}
        modifiers={column(YEAR_COLUMN)}
      >
        {years.map(option => (
          <SwiftUIText key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </SwiftUIText>
        ))}
      </Picker>
    </HStack>
  );
}

/**
 * One wheel, for Android, where there is no native one to borrow. A snapping
 * scroll view with the middle row framed: the value is committed once the
 * scroll has come to rest, never per frame.
 */
function AndroidWheel({
  options,
  value,
  onChange,
  width,
}: {
  options: Option[];
  value: number;
  onChange: (value: number) => void;
  width: number;
}) {
  const { colors } = useTheme();
  const text = String(colors.text);
  const scroller = useRef<ScrollView>(null);

  const index = Math.max(0, options.findIndex(option => option.value === value));

  // Whatever moved the value — this wheel, another one, or the pager behind the
  // picker — the wheel is brought to it. Animated only once it has been laid
  // out, so opening the picker does not start with three wheels in motion.
  const laidOut = useRef(false);
  useEffect(() => {
    if (laidOut.current) {
      scroller.current?.scrollTo({ y: index * ANDROID_ROW_HEIGHT, animated: true });
    }
  }, [index]);

  const handleLayout = useCallback(() => {
    laidOut.current = true;
    scroller.current?.scrollTo({ y: index * ANDROID_ROW_HEIGHT, animated: false });
  }, [index]);

  const handleSettle = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const row = Math.round(event.nativeEvent.contentOffset.y / ANDROID_ROW_HEIGHT);
    const option = options[Math.min(options.length - 1, Math.max(0, row))];
    if (option && option.value !== value) {
      onChange(option.value);
    }
  }, [options, value, onChange]);

  return (
    <ScrollView
      ref={scroller}
      onLayout={handleLayout}
      style={{ width, height: ANDROID_WHEEL_HEIGHT }}
      contentContainerStyle={styles.wheelContent}
      snapToInterval={ANDROID_ROW_HEIGHT}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      onMomentumScrollEnd={handleSettle}
    >
      {options.map(option => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onChange(option.value)}
            style={styles.wheelRow}
          >
            <Typography
              variant="body1"
              weight={isSelected ? "semibold" : "medium"}
              color={isSelected ? text : `${text}66`}
              numberOfLines={1}
            >
              {option.label}
            </Typography>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function AndroidWheels({
  selectedWeek,
  year,
  month,
  weekOptions,
  months,
  years,
  onWeekChange,
  onMonthChange,
  onYearChange,
}: Wheels) {
  const { colors } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  // The columns keep their proportions and share out whatever the card is
  // given, so all three wheels fit a narrow phone as well as a wide one.
  const available = Math.min(
    COLUMNS_WIDTH,
    windowWidth - (ANDROID_CARD_MARGIN + ANDROID_CARD_PADDING) * 2
  );
  const scale = available / COLUMNS_WIDTH;

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      {/* The frame the selected row sits in, behind all three wheels. */}
      <View pointerEvents="none" style={styles.wheelSelection}>
        <View style={[styles.wheelSelectionBand, { backgroundColor: `${String(colors.text)}12` }]} />
      </View>

      <AndroidWheel
        options={weekOptions}
        value={selectedWeek}
        onChange={onWeekChange}
        width={WEEK_COLUMN * scale}
      />
      <AndroidWheel
        options={months}
        value={month}
        onChange={onMonthChange}
        width={MONTH_COLUMN * scale}
      />
      <AndroidWheel
        options={years}
        value={year}
        onChange={onYearChange}
        width={YEAR_COLUMN * scale}
      />
    </View>
  );
}

const WeekPicker: React.FC<WeekPickerProps> = ({
  visible,
  selectedWeek,
  onSelectWeek,
  onClose,
  anchor,
}) => {
  const wheels: Wheels = { ...useWheels(selectedWeek, onSelectWeek), selectedWeek };

  // The modal owns the window the card lives in, so it has to outlive the card:
  // torn down on the same commit, the exit animation would never be seen.
  const [windowMounted, setWindowMounted] = useState(visible);
  useEffect(() => {
    if (Platform.OS === "ios") {
      return;
    }
    if (visible) {
      setWindowMounted(true);
      return;
    }
    const timeout = setTimeout(() => setWindowMounted(false), ANDROID_EXIT_MS);
    return () => clearTimeout(timeout);
  }, [visible]);

  const anchorWidth = anchor?.width ?? 160;

  const hostStyle = useMemo(() => ({
    width: anchorWidth,
    height: 1,
    alignSelf: (anchor ? "flex-start" : "center") as "flex-start" | "center",
  }), [anchorWidth, anchor]);

  const triggerModifiers = useMemo(
    () => [frame({ width: anchorWidth, height: 1 }), opacity(0)],
    [anchorWidth]
  );

  const pinnedStyle = useMemo(
    () => [styles.pinnedAnchor, { top: anchor?.top ?? 0, left: anchor?.left ?? 0 }],
    [anchor?.top, anchor?.left]
  );

  if (Platform.OS !== "ios") {
    return (
      <Modal
        visible={windowMounted}
        transparent
        statusBarTranslucent
        animationType="none"
        onRequestClose={onClose}
      >
        {visible && (
          <Reanimated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(ANDROID_EXIT_MS)}
            style={styles.scrim}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t("CANCEL_BTN")}
              onPress={onClose}
              style={StyleSheet.absoluteFill}
            />
            <Reanimated.View entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <AndroidWheels {...wheels} />
            </Reanimated.View>
          </Reanimated.View>
        )}
      </Modal>
    );
  }

  // An invisible strip the popover attaches to. SwiftUI needs a real view with
  // real geometry as an anchor, so it keeps its size and only loses its paint.
  const trigger = (
    <Host style={hostStyle} matchContents={false}>
      <Popover
        isPresented={visible}
        onIsPresentedChange={presented => {
          if (!presented) {
            onClose();
          }
        }}
        arrowEdge="top"
      >
        <Popover.Trigger>
          <Rectangle modifiers={triggerModifiers} />
        </Popover.Trigger>
        <Popover.Content>
          <IOSWheels {...wheels} />
        </Popover.Content>
      </Popover>
    </Host>
  );

  return anchor ? (
    <View pointerEvents="box-none" style={pinnedStyle}>
      {trigger}
    </View>
  ) : trigger;
};

export default React.memo(WeekPicker);

const styles = StyleSheet.create({
  pinnedAnchor: {
    position: "absolute",
    height: 1,
  },
  scrim: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  card: {
    flexDirection: "row",
    borderRadius: 24,
    borderCurve: "continuous",
    padding: ANDROID_CARD_PADDING,
    elevation: 8,
  },
  wheelContent: {
    // Half a wheel above and below, so the first and last rows can reach the
    // middle of the frame.
    paddingVertical: (ANDROID_WHEEL_HEIGHT - ANDROID_ROW_HEIGHT) / 2,
  },
  wheelRow: {
    height: ANDROID_ROW_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelSelection: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: ANDROID_CARD_PADDING,
  },
  wheelSelectionBand: {
    height: ANDROID_ROW_HEIGHT,
    borderRadius: 12,
    borderCurve: "continuous",
  },
});
