import React, { useEffect, useState } from "react";
import { View, Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { animPapillon, PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Reanimated, { LinearTransition, type AnimatedStyle } from "react-native-reanimated";
import { NativeText } from "./NativeComponents";

import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";

type PickerData = string[] | { label: string, icon?: JSX.Element, onPress: () => unknown }[];

interface PapillonPickerProps {
  children: React.ReactNode
  data: PickerData
  selected?: string
  contentContainerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
  delay?: number,
  direction?: "left" | "right",
  animated?: boolean,
  onSelectionChange?: (item: string) => unknown
}

const PapillonPicker: React.FC<PapillonPickerProps> = ({
  children,
  data,
  selected,
  contentContainerStyle,
  delay,
  direction = "left",
  animated,
  onSelectionChange,
}) => {
  const theme = useTheme();
  const [contentHeight, setContentHeight] = useState(0);
  const [opened, setOpened] = useState(false);

  const handleSelectionChange = (item: string) => {
    if (onSelectionChange) {
      setTimeout(() => {
        onSelectionChange(item);
      }, delay ?? 0);
    }
  };

  return (
    <Reanimated.View layout={animated && animPapillon(LinearTransition)} style={[styles.container, contentContainerStyle]}>
      <TouchableOpacity
        onPress={() => setOpened(!opened)}
      >
        <Reanimated.View
          layout={animated && animPapillon(LinearTransition)}
          style={styles.children}
          onLayout={(event)=> {
            const height = event.nativeEvent.layout.height;
            setContentHeight(height);
          }}
        >
          {children}
        </Reanimated.View>
      </TouchableOpacity>

      {opened && (
        <Reanimated.View
          layout={animated && animPapillon(LinearTransition)}
          style={[
            styles.picker,
            direction === "left" ? {
              left: 0,
            } : {
              right: 0,
            },
            {
              backgroundColor: Platform.OS === "ios" ? theme.colors.card + 50 : theme.colors.card,
              borderColor: theme.colors.text + "55",
              top: contentHeight + 10,
            }
          ]}
          entering={PapillonContextEnter}
          exiting={PapillonContextExit}
        >
          <BlurView
            intensity={70}
            style={{
              flex: 1,
              borderRadius: 12,
              borderCurve: "continuous",
              overflow: "hidden",
            }}
            tint={theme.dark ? "dark" : "light"}
          >
            {data.map((item, index) => {
              // check if item is a string or a component
              const isNotString = typeof item !== "string";

              const label = isNotString ? item.label : item;
              const icon: null | React.ReactNode = isNotString ? (item.icon ? item.icon: null) : null;

              const onPressItem = isNotString ? item.onPress : null;

              const newIcon = icon ? React.cloneElement(icon, {
                size: 20,
                strokeWidth: 2.5,
                color: theme.colors.text,
              }) : null;

              return (
                <View key={index}>
                  <TouchableOpacity
                    key={index}
                    onPress={onPressItem ? () => {
                      setOpened(false);
                      onPressItem();
                    } : () => {
                      setOpened(false);
                      handleSelectionChange(item as string);
                    }}
                    style={[
                      styles.item
                    ]}
                  >
                    {newIcon && (
                      <View
                        style={{
                          marginRight: 10,
                        }}
                      >
                        {newIcon}
                      </View>
                    )}

                    <NativeText
                    >{label}</NativeText>

                    <View style={{ flex: 1 }} />

                    {item === selected && (
                      <Check
                        size={20}
                        strokeWidth={2.5}
                        color={theme.colors.primary}
                        style={{ marginRight: 10}}
                      />
                    )}
                  </TouchableOpacity>

                  {index === data.length - 1 ? null : (
                    <View
                      style={{
                        height: 1,
                        borderBottomColor: theme.colors.text + "25",
                        borderBottomWidth: 0.5,
                        marginLeft: 14,
                      }}
                    />
                  )}
                </View>
              );
            })}
          </BlurView>
        </Reanimated.View>
      )}
    </Reanimated.View>
  );
};

const styles = StyleSheet.create({
  container: {

  },
  children: {

  },
  picker: {
    position: "absolute",
    top: 0,
    borderWidth: 0.5,
    zIndex: 10000000000,

    minWidth: 200,

    borderRadius: 12,
    borderCurve: "continuous",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  item: {
    paddingVertical: 12,
    paddingRight: 22,
    marginLeft: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
});

export default PapillonPicker;
