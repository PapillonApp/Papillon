import React, { useRef, useCallback, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import InfinitePager from "react-native-infinite-pager";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const InfiniteDatePager = ({ renderDate, initialDate = new Date(), onDateChange }) => {
  const pagerRef = useRef(null);
  const baseDate = useRef(new Date()).current;
  baseDate.setHours(0, 0, 0, 0);
  const lastChangeTime = useRef(0);

  const getDateFromIndex = useCallback((index) => {
    return new Date(baseDate.getTime() + index * MILLISECONDS_PER_DAY);
  }, []);

  const getIndexFromDate = useCallback((date) => {
    return Math.round((date.getTime() - baseDate.getTime()) / MILLISECONDS_PER_DAY);
  }, []);

  const renderPage = useCallback(({ index }) => {
    const date = getDateFromIndex(index);
    return (
      <View style={styles.pageContainer}>
        {renderDate ? renderDate(date) : (
          <Text style={styles.dateText}>
            {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </Text>
        )}
      </View>
    );
  }, [getDateFromIndex, renderDate]);

  const handlePageChange = useCallback((index) => {
    const now = Date.now();
    if (now - lastChangeTime.current > 200) { // 200ms throttle
      lastChangeTime.current = now;
      const newDate = getDateFromIndex(index);
      onDateChange?.(newDate);
    }
  }, [getDateFromIndex, onDateChange]);

  useEffect(() => {
    const index = getIndexFromDate(initialDate);
    pagerRef.current?.setPage(index, false);
  }, [initialDate]);

  return (
    <View style={styles.container}>
      <InfinitePager
        ref={pagerRef}
        renderPage={renderPage}
        onPageChange={handlePageChange}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dateText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default InfiniteDatePager;