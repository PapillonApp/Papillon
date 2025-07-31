import React from "react";
import { View, Text, StyleSheet } from "react-native";
export var HomeTimetableItem = function (_a) {
    var item = _a.item;
    return (<View style={styles.container}>
      <Text>HomeTimetableItem</Text>
    </View>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "blue",
    },
});
