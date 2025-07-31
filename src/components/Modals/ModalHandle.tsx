import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

const ModalHandle = () => {
  const theme = useTheme();

  return (
    <View
      style={styles.container}
      pointerEvents="none"
    >
      <View
        style={[
          styles.handle,
          {
            backgroundColor: theme.dark ? "#fff" : "#000",
          }
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000000,
  },

  handle: {
    width: 50,
    height: 5,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: 10,
    opacity: 0.2,
  },
});

export default ModalHandle;