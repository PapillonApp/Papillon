import React, { useRef, useCallback, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import InfinitePager from "react-native-infinite-pager";
var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
var InfiniteDatePager = function (_a) {
    var renderDate = _a.renderDate, _b = _a.initialDate, initialDate = _b === void 0 ? new Date() : _b, onDateChange = _a.onDateChange;
    var pagerRef = useRef(null);
    var baseDate = useRef(new Date()).current;
    baseDate.setHours(0, 0, 0, 0);
    var lastChangeTime = useRef(0);
    var getDateFromIndex = useCallback(function (index) {
        return new Date(baseDate.getTime() + index * MILLISECONDS_PER_DAY);
    }, []);
    var getIndexFromDate = useCallback(function (date) {
        return Math.round((date.getTime() - baseDate.getTime()) / MILLISECONDS_PER_DAY);
    }, []);
    var renderPage = useCallback(function (_a) {
        var index = _a.index;
        var date = getDateFromIndex(index);
        return (<View style={styles.pageContainer}>
        {renderDate ? renderDate(date) : (<Text style={styles.dateText}>
            {date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </Text>)}
      </View>);
    }, [getDateFromIndex, renderDate]);
    var handlePageChange = useCallback(function (index) {
        var now = Date.now();
        if (now - lastChangeTime.current > 200) { // 200ms throttle
            lastChangeTime.current = now;
            var newDate = getDateFromIndex(index);
            onDateChange === null || onDateChange === void 0 ? void 0 : onDateChange(newDate);
        }
    }, [getDateFromIndex, onDateChange]);
    useEffect(function () {
        var _a;
        var index = getIndexFromDate(initialDate);
        (_a = pagerRef.current) === null || _a === void 0 ? void 0 : _a.setPage(index, { animated: false });
    }, [initialDate]);
    return (<View style={styles.container}>
      <InfinitePager ref={pagerRef} renderPage={renderPage} onPageChange={handlePageChange}/>
    </View>);
};
var styles = StyleSheet.create({
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
