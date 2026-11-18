import { Papicons } from "@getpapillon/papicons";
import { LiquidGlassView } from "@sbaiahmed1/react-native-blur";
import { useTheme } from "expo-router/react-navigation";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";

import Typography from "../new/Typography";
import ActionMenu, { type NativeActionEvent } from "./ActionMenu";

type PickerProps = {
  options: string[]
  selectedIndex: number
  onValueChange: (index: number) => void
  disabled?: boolean
}

const Picker: React.FC<PickerProps> = ({ options, selectedIndex, onValueChange, disabled }) => {
  const theme = useTheme();

  return (
    <View pointerEvents={disabled ? "none" : "auto"} style={{ marginHorizontal: -12 }}>
      <PickerContainer>
        <ActionMenu
          selectionMode="single"
          actions={options.map((option, index) => ({
            id: option,
            title: option,
            onPress: () => onValueChange(index),
            state: index === selectedIndex ? "on" : "off",
          }))}
          onPressAction={(e: NativeActionEvent) => {
            const index = options.findIndex(option => option === e.nativeEvent.event);
            if (index !== -1) {
              onValueChange(index);
            }
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Typography variant="body1" weight="semibold" color={"primary"}>
              {options[selectedIndex]}
            </Typography>
            <Papicons name="ChevronDown" size={16} color={theme.colors.primary} />
          </View>
        </ActionMenu>
      </PickerContainer>
    </View>
  )
}

const PickerContainer: React.FC<{ children: React.ReactNode }> = (props) => {
  if(Platform.OS === "android") {
    return (
      <TouchableOpacity
        style={{
          marginHorizontal: 12,
        }}
      >
        {props.children}
      </TouchableOpacity>
    )
  }

  return (
    <LiquidGlassView
      glassType="regular"
      isInteractive={true}
      glassOpacity={0}
      style={{
        borderRadius: 80,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 6,
      }}
    >
      {props.children}
    </LiquidGlassView>
  )
}

export default Picker