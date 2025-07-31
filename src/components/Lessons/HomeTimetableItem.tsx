import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HomeTimetableItemProps {
  item: any
}

export const HomeTimetableItem = ({ item }: HomeTimetableItemProps) => {
  return (
    <View style={styles.container}>
      <Text>HomeTimetableItem</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "blue",
  },
});
