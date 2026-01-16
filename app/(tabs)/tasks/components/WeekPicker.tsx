import { useTheme } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import React, { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import Reanimated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDateRangeOfWeek, getWeekNumberFromDate } from '@/database/useHomework';
import { runsIOS26 } from '@/ui/utils/IsLiquidGlass';
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition';

interface WeekPickerProps {
  selectedWeek: number;
  onSelectWeek: (week: number) => void;
  onClose: () => void;
}

const WeekPicker: React.FC<WeekPickerProps> = ({ selectedWeek, onSelectWeek, onClose }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const WeekPickerRef = useRef<FlatList>(null);

  const layoutPicker = useCallback(() => {
    if (WeekPickerRef.current) {
      const offset = selectedWeek * 60;
      WeekPickerRef.current.scrollToOffset({
        offset,
        animated: false,
      });
    }
  }, [selectedWeek]);

  const [weekLimit, setWeekLimit] = useState(60);

  const loadMoreWeeks = useCallback(() => {
    setWeekLimit((prev) => prev + 26);
  }, []);

  const handleWeekScroll = useCallback((event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const itemWidth = 60;
    const index = Math.round(contentOffsetX / itemWidth);
    if (index < 0 || index >= weekLimit) { return; }
    requestAnimationFrame(() => {
      onSelectWeek(index);
    });
  }, [onSelectWeek]);

  return (
    <Reanimated.View
      style={{
        position: "absolute",
        top: insets.top + 50,
        left: 16,
        alignSelf: "flex-start",
        borderRadius: 16,
        zIndex: 1000000,
        transformOrigin: "center top",
      }}
      entering={PapillonAppearIn}
      exiting={PapillonAppearOut}
    >
      <BlurView
        style={{
          height: 60,
          width: 300,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
        }}
      >
        <View
          style={{
            position: "absolute",
            alignSelf: "center",
            top: 5,
            height: 50,
            width: 50,
            borderRadius: 16,
            borderCurve: "continuous",
            borderWidth: 2,
            borderColor: "#C54CB3",
          }}
        />

        <FlatList
          onLayout={() => {
            layoutPicker();
          }}
          data={Array.from({ length: weekLimit }, (_, i) => i)}
          onEndReached={loadMoreWeeks}
          onEndReachedThreshold={2}
          windowSize={5}
          initialScrollIndex={selectedWeek}
          getItemLayout={(data, index) => (
            { length: 60, offset: 60 * index, index }
          )}
          keyExtractor={(item) => "picker:" + item.toString()}
          horizontal
          removeClippedSubviews={true}
          showsHorizontalScrollIndicator={false}
          style={{
            flexGrow: 0,
            height: 100,
            width: 300,
          }}
          contentContainerStyle={{
            alignItems: "center",
            gap: 0,
            paddingLeft: 300 / 2 - 30,
            paddingRight: 300 / 2 - 30,
          }}
          snapToInterval={60}
          decelerationRate="fast"
          ref={WeekPickerRef}
          initialNumToRender={10}
          onScroll={handleWeekScroll}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onSelectWeek(item);
                onClose();
              }}
              style={[
                {
                  width: 40,
                  height: 40,
                  margin: 10,
                  borderRadius: 12,
                  borderCurve: "continuous",
                  backgroundColor: runsIOS26 ? colors.text + "10" : colors.background,
                  borderColor: colors.text + "22",
                  borderWidth: 1,
                  alignItems: "center",
                  justifyContent: "center",
                },
                item === selectedWeek && {
                  backgroundColor: "#C54CB3",
                  boxShadow: "0px 1px 6px rgba(0, 0, 0, 0.15)",
                }
              ]}
            >
              <Text
                style={{
                  color: item === selectedWeek ? "#FFF" : colors.text,
                  fontSize: 16,
                  fontFamily: item === selectedWeek ? "bold" : "medium",
                }}
              >
                {getWeekNumberFromDate(getDateRangeOfWeek(item, new Date().getFullYear()).start)}
              </Text>
            </Pressable>
          )}
        />
      </BlurView>
    </Reanimated.View>
  );
};

export default WeekPicker;
