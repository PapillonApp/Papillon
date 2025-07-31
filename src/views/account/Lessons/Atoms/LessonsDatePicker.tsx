import React, { useState, useRef, useEffect, useCallback } from "react";
import {View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, ListRenderItem} from "react-native";
import { format, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import * as Haptics from "expo-haptics";

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS, SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {Theme} from "@react-navigation/native/src/types";
import {NativeScrollEvent, ScrollViewProps} from "react-native/Libraries/Components/ScrollView/ScrollView";
import {NativeSyntheticEvent} from "react-native/Libraries/Types/CoreEventTypes";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 104;
const ITEM_MARGIN = 10;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;
const DATE_RANGE = 30;
const SCROLL_THRESHOLD = 7;
const SCROLL_VELOCITY = 100;

const generateDateRange = (centerDate: Date) => {
  return Array.from({ length: DATE_RANGE }, (_, i) => addDays(centerDate, i - Math.floor(DATE_RANGE / 2)));
};

interface DateItemProps {
  date: Date
  index: number
  isSelected: boolean
  isToday: boolean
  onPress: (date: Date) => unknown
  scrollX: SharedValue<number>
  colors: Theme["colors"]
}

const DateItem = React.memo(({ date, index, scrollX, isSelected, isToday, onPress, colors }: DateItemProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * ITEM_TOTAL_WIDTH,
      index * ITEM_TOTAL_WIDTH,
      (index + 1) * ITEM_TOTAL_WIDTH,
    ];
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [1, 1.2, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.dateItem,
          {
            backgroundColor: colors.text + "10",
          },
          isToday && {
            backgroundColor: colors.primary + "20",
          },
          isSelected && {
            backgroundColor: colors.primary,
          },
        ]}
        onPress={() => onPress(date)}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.dayText,
            {
              color: colors.text + "88",
            },
            isToday && {
              color: colors.primary,
            },
            isSelected && styles.selectedDateText,
          ]}
        >
          {format(date, "EEE d MMM", { locale: fr })}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

interface HorizontalDatePickerProps {
  onDateSelect: (date: Date) => unknown
  onCurrentDatePress: () => unknown
  initialDate: Date
}

const HorizontalDatePicker = ({ onDateSelect, onCurrentDatePress, initialDate = new Date() }: HorizontalDatePickerProps) => {
  const [dates, setDates] = useState(() => generateDateRange(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [centerIndex, setCenterIndex] = useState(Math.floor(DATE_RANGE / 2));
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const flatListRef = useRef<FlatList | null>(null);
  const scrollX = useSharedValue(0);
  const lastItemIndex = useSharedValue(0);
  const { playHaptics } = useSoundHapticsWrapper();

  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const dateIndex = dates.findIndex(date => isSameDay(date, initialDate));
    if (dateIndex !== -1) {
      const diffFromCenter = dateIndex - centerIndex;
      if (Math.abs(diffFromCenter) <= SCROLL_THRESHOLD) {
        setIsProgrammaticScroll(true);
        flatListRef.current?.scrollToIndex({
          index: dateIndex,
          animated: true,
          // velocity: SCROLL_VELOCITY
        });
        setSelectedDate(initialDate);
      } else {
        setDates(generateDateRange(initialDate));
        setSelectedDate(initialDate);
        setCenterIndex(Math.floor(DATE_RANGE / 2));
      }
    } else {
      setDates(generateDateRange(initialDate));
      setSelectedDate(initialDate);
      setCenterIndex(Math.floor(DATE_RANGE / 2));
    }
  }, [initialDate]);

  useEffect(() => {
    if (dates.length > 0) {
      setIsProgrammaticScroll(true);
      flatListRef.current?.scrollToIndex({
        index: centerIndex,
        animated: false,
        // velocity: SCROLL_VELOCITY
      });
    }
  }, [dates, centerIndex]);

  const handleDatePress = useCallback((date: Date) => {
    setSelectedDate(date);
    onDateSelect(date);
    if (isSameDay(date, selectedDate) && isSameDay(selectedDate, initialDate)) {
      onCurrentDatePress();
    }
  }, [onDateSelect, onCurrentDatePress, initialDate, selectedDate]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_TOTAL_WIDTH,
    offset: ITEM_TOTAL_WIDTH * index,
    index,
  }), []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const currentItemIndex = Math.round(event.contentOffset.x / ITEM_TOTAL_WIDTH);
      if (currentItemIndex !== lastItemIndex.value) {
        lastItemIndex.value = currentItemIndex;
        runOnJS(setIsProgrammaticScroll)(false);
        if (!isProgrammaticScroll) {
          runOnJS(playHaptics)("impact", {
            impact: Haptics.ImpactFeedbackStyle.Light,
          });
        }
      }
    },
  });

  const handleMomentumScrollEnd: ScrollViewProps["onMomentumScrollEnd"] = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_TOTAL_WIDTH);
    const newSelectedDate = dates[index];
    if (newSelectedDate && !isSameDay(newSelectedDate, selectedDate)) {
      setSelectedDate(newSelectedDate);
      onDateSelect(newSelectedDate);
    }
    setIsProgrammaticScroll(false);
  }, [dates, selectedDate, onDateSelect]);

  const renderDateItem: ListRenderItem<Date> = useCallback(({ item, index }) => (
    <DateItem
      date={item}
      index={index}
      scrollX={scrollX}
      isSelected={isSameDay(item, selectedDate)}
      isToday={isSameDay(item, new Date())}
      onPress={handleDatePress}
      colors={colors}
    />
  ), [selectedDate, handleDatePress, scrollX, colors]);

  return (
    <View style={[styles.container, {
      marginTop: insets.top,
    }]}>
      <Animated.FlatList
        ref={flatListRef}
        data={dates}
        renderItem={renderDateItem}
        keyExtractor={(item) => item.toISOString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_TOTAL_WIDTH}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.listContent}
        initialScrollIndex={centerIndex}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  listContent: {
    paddingHorizontal: (SCREEN_WIDTH - ITEM_TOTAL_WIDTH) / 2,
    paddingVertical: 4,
    alignItems: "center"
  },
  dateItem: {
    width: ITEM_WIDTH,
    height: 29,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: ITEM_MARGIN,
    borderRadius: 11,
    borderCurve: "continuous",
    backgroundColor: "#f0f0f0",
  },
  selectedDateItem: {
    backgroundColor: "#007AFF",
  },
  todayDateItem: {
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  dayText: {
    fontSize: 13,
    fontFamily: "semibold",
    letterSpacing: 0.2,
  },
  selectedDateText: {
    color: "white",
    opacity: 1
  },
});

export default HorizontalDatePicker;
