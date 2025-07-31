import React from "react";
import { View, StyleSheet } from "react-native";
import { NativeText } from "./NativeComponents";
import PapillonSpinner from "./PapillonSpinner";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

const PapillonLoading: React.FC<{
  title: string;
  subtitle?: string;
  color?: string;
}> = ({ title, subtitle, color }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <PapillonSpinner size={subtitle ? 36 : 30} strokeWidth={4} color={color ?? theme.colors.primary} />
      <NativeText style={[
        subtitle ? styles.title : styles.singleText,
      ]}>{title}</NativeText>
      {subtitle &&
        <NativeText style={[
          styles.subtitle
        ]}>{subtitle}</NativeText>
      }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 4,
  },
  title: {
    fontSize: 18,
    lineHeight: 20,
    fontFamily: "semibold",
    marginTop: 6,
  },
  singleText: {
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "medium",
    opacity: 0.7,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: "medium",
    opacity: 0.7,
  },
});

export default PapillonLoading;