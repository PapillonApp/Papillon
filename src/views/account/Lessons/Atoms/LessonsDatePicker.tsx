import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from "react-native";
import { format, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useTheme } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ITEM_WIDTH = 104;
const ITEM_MARGIN = 10;
const ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;
const DATE_RANGE = 30;
const SCROLL_THRESHOLD = 7;
const SCROLL_VELOCITY = 100;

const generateDateRange = (centerDate) => {
  return Array.from({ length: DATE_RANGE }, (_, i) => addDays(centerDate, i - Math.floor(DATE_RANGE / 2)));
};

const DateItem = React.memo(({ date, index, scrollX, isSelected, isToday, onPress, colors }) => {
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

const HorizontalDatePicker = ({ onDateSelect, onCurrentDatePress, initialDate = new Date() }) => {
  const [dates, setDates] = useState(() => generateDateRange(initialDate));
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [centerIndex, setCenterIndex] = useState(Math.floor(DATE_RANGE / 2));
  const [isProgrammaticScroll, setIsProgrammaticScroll] = useState(false);
  const flatListRef = useRef(null);
  const scrollX = useSharedValue(0);
  const lastItemIndex = useSharedValue(0);

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
          velocity: SCROLL_VELOCITY
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
        velocity: SCROLL_VELOCITY
      });
    }
  }, [dates, centerIndex]);

  const handleDatePress = useCallback((date) => {
    setSelectedDate(date);
    onDateSelect(date);
    if (isSameDay(date, selectedDate) && isSameDay(selectedDate, initialDate)) {
      onCurrentDatePress();
    }
  }, [onDateSelect, onCurrentDatePress, initialDate, selectedDate]);

  const getItemLayout = useCallback((_, index) => ({
    length: ITEM_TOTAL_WIDTH,
    offset: ITEM_TOTAL_WIDTH * index,
    index,
  }), []);

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      const currentItemIndex = Math.round(event.contentOffset.x / ITEM_TOTAL_WIDTH);
      if (currentItemIndex !== lastItemIndex.value) {
        lastItemIndex.value = currentItemIndex;
        runOnJS(setIsProgrammaticScroll)(false);
        if (!isProgrammaticScroll) {
          runOnJS(triggerHaptic)();
        }
      }
    },
  });

  const handleMomentumScrollEnd = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / ITEM_TOTAL_WIDTH);
    const newSelectedDate = dates[index];
    if (newSelectedDate && !isSameDay(newSelectedDate, selectedDate)) {
      setSelectedDate(newSelectedDate);
      onDateSelect(newSelectedDate);
    }
    setIsProgrammaticScroll(false);
  }, [dates, selectedDate, onDateSelect]);

  const renderDateItem = useCallback(({ item, index }) => (
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