import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { format, addDays, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import * as Haptics from "expo-haptics";
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, Extrapolate, runOnJS, } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var SCREEN_WIDTH = Dimensions.get("window").width;
var ITEM_WIDTH = 104;
var ITEM_MARGIN = 10;
var ITEM_TOTAL_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;
var DATE_RANGE = 30;
var SCROLL_THRESHOLD = 7;
var SCROLL_VELOCITY = 100;
var generateDateRange = function (centerDate) {
    return Array.from({ length: DATE_RANGE }, function (_, i) { return addDays(centerDate, i - Math.floor(DATE_RANGE / 2)); });
};
var DateItem = React.memo(function (_a) {
    var date = _a.date, index = _a.index, scrollX = _a.scrollX, isSelected = _a.isSelected, isToday = _a.isToday, onPress = _a.onPress, colors = _a.colors;
    var animatedStyle = useAnimatedStyle(function () {
        var inputRange = [
            (index - 1) * ITEM_TOTAL_WIDTH,
            index * ITEM_TOTAL_WIDTH,
            (index + 1) * ITEM_TOTAL_WIDTH,
        ];
        var scale = interpolate(scrollX.value, inputRange, [1, 1.2, 1], Extrapolate.CLAMP);
        return {
            transform: [{ scale: scale }],
        };
    });
    return (<Animated.View style={animatedStyle}>
      <TouchableOpacity style={[
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
        ]} onPress={function () { return onPress(date); }}>
        <Text numberOfLines={1} style={[
            styles.dayText,
            {
                color: colors.text + "88",
            },
            isToday && {
                color: colors.primary,
            },
            isSelected && styles.selectedDateText,
        ]}>
          {format(date, "EEE d MMM", { locale: fr })}
        </Text>
      </TouchableOpacity>
    </Animated.View>);
});
var HorizontalDatePicker = function (_a) {
    var onDateSelect = _a.onDateSelect, onCurrentDatePress = _a.onCurrentDatePress, _b = _a.initialDate, initialDate = _b === void 0 ? new Date() : _b;
    var _c = useState(function () { return generateDateRange(initialDate); }), dates = _c[0], setDates = _c[1];
    var _d = useState(initialDate), selectedDate = _d[0], setSelectedDate = _d[1];
    var _e = useState(Math.floor(DATE_RANGE / 2)), centerIndex = _e[0], setCenterIndex = _e[1];
    var _f = useState(false), isProgrammaticScroll = _f[0], setIsProgrammaticScroll = _f[1];
    var flatListRef = useRef(null);
    var scrollX = useSharedValue(0);
    var lastItemIndex = useSharedValue(0);
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var colors = useTheme().colors;
    var insets = useSafeAreaInsets();
    useEffect(function () {
        var _a;
        var dateIndex = dates.findIndex(function (date) { return isSameDay(date, initialDate); });
        if (dateIndex !== -1) {
            var diffFromCenter = dateIndex - centerIndex;
            if (Math.abs(diffFromCenter) <= SCROLL_THRESHOLD) {
                setIsProgrammaticScroll(true);
                (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({
                    index: dateIndex,
                    animated: true,
                    // velocity: SCROLL_VELOCITY
                });
                setSelectedDate(initialDate);
            }
            else {
                setDates(generateDateRange(initialDate));
                setSelectedDate(initialDate);
                setCenterIndex(Math.floor(DATE_RANGE / 2));
            }
        }
        else {
            setDates(generateDateRange(initialDate));
            setSelectedDate(initialDate);
            setCenterIndex(Math.floor(DATE_RANGE / 2));
        }
    }, [initialDate]);
    useEffect(function () {
        var _a;
        if (dates.length > 0) {
            setIsProgrammaticScroll(true);
            (_a = flatListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex({
                index: centerIndex,
                animated: false,
                // velocity: SCROLL_VELOCITY
            });
        }
    }, [dates, centerIndex]);
    var handleDatePress = useCallback(function (date) {
        setSelectedDate(date);
        onDateSelect(date);
        if (isSameDay(date, selectedDate) && isSameDay(selectedDate, initialDate)) {
            onCurrentDatePress();
        }
    }, [onDateSelect, onCurrentDatePress, initialDate, selectedDate]);
    var getItemLayout = useCallback(function (_, index) { return ({
        length: ITEM_TOTAL_WIDTH,
        offset: ITEM_TOTAL_WIDTH * index,
        index: index,
    }); }, []);
    var scrollHandler = useAnimatedScrollHandler({
        onScroll: function (event) {
            scrollX.value = event.contentOffset.x;
            var currentItemIndex = Math.round(event.contentOffset.x / ITEM_TOTAL_WIDTH);
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
    var handleMomentumScrollEnd = useCallback(function (event) {
        var index = Math.round(event.nativeEvent.contentOffset.x / ITEM_TOTAL_WIDTH);
        var newSelectedDate = dates[index];
        if (newSelectedDate && !isSameDay(newSelectedDate, selectedDate)) {
            setSelectedDate(newSelectedDate);
            onDateSelect(newSelectedDate);
        }
        setIsProgrammaticScroll(false);
    }, [dates, selectedDate, onDateSelect]);
    var renderDateItem = useCallback(function (_a) {
        var item = _a.item, index = _a.index;
        return (<DateItem date={item} index={index} scrollX={scrollX} isSelected={isSameDay(item, selectedDate)} isToday={isSameDay(item, new Date())} onPress={handleDatePress} colors={colors}/>);
    }, [selectedDate, handleDatePress, scrollX, colors]);
    return (<View style={[styles.container, {
                marginTop: insets.top,
            }]}>
      <Animated.FlatList ref={flatListRef} data={dates} renderItem={renderDateItem} keyExtractor={function (item) { return item.toISOString(); }} horizontal showsHorizontalScrollIndicator={false} snapToInterval={ITEM_TOTAL_WIDTH} decelerationRate="fast" getItemLayout={getItemLayout} onScroll={scrollHandler} onMomentumScrollEnd={handleMomentumScrollEnd} scrollEventThrottle={16} contentContainerStyle={styles.listContent} initialScrollIndex={centerIndex}/>
    </View>);
};
var styles = StyleSheet.create({
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
