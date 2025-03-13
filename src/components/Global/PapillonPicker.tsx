import React, { useState } from "react";
import { View, Platform, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { animPapillon, PapillonContextEnter, PapillonContextExit } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";
import { Pressable } from "react-native-gesture-handler";
import Reanimated, { LinearTransition, type AnimatedStyle } from "react-native-reanimated";
import { NativeText } from "./NativeComponents";

import { ContextMenuButton } from "react-native-ios-context-menu";

import { BlurView } from "expo-blur";
import { Check } from "lucide-react-native";
import { isExpoGo } from "@/utils/native/expoGoAlert";

export type PickerDataItem = string | {
  label: string,
  subtitle?: string,
  icon?: JSX.Element,
  sfSymbol?: string,
  onPress?: () => {} | void,
  checked?: boolean,
  destructive?: boolean,
} | null;

type PickerData = PickerDataItem[];

interface PapillonPickerProps {
  children: React.ReactNode
  data: PickerData
  selected?: PickerDataItem
  contentContainerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
  delay?: number,
  direction?: "left" | "right",
  animated?: boolean,
  onSelectionChange?: any
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

  const handleSelectionChange = (item: PickerDataItem) => {
    if (onSelectionChange) {
      setTimeout(() => {
        onSelectionChange(item);
      }, delay ?? 0);
    }
  };

  if (Platform.OS === "ios" && !isExpoGo()) {
    return (
      <ContextMenuButton
        style={[styles.container, contentContainerStyle]}
        onPressMenuItem={(event) => {
          const actionKey = event.nativeEvent.actionKey;
          const index = parseInt(actionKey.split("-")[1]);

          const item: PickerDataItem = data[index];
          if (item !== null) {
            // @ts-ignore
            if (!item.onPress) {
              handleSelectionChange(item);
            } else {
              // @ts-ignore
              item.onPress();
            }
          }
        }}
        menuConfig={{
          menuTitle: "",
          // @ts-ignore
          menuItems: data.filter((item) => item !== null).map((item, index) => {
            return {
              actionKey: "action-"+index.toString(),
              actionTitle: typeof item === "string" ? item : item.label,
              // @ts-ignore
              actionSubtitle: item.subtitle,
              // @ts-ignore
              menuState: (item.checked || item === selected) ? "on" : "off",
              // @ts-ignore
              menuAttributes: [item.destructive ? "destructive" : "normal"],
              icon: {
                type: typeof item !== "string" ? "IMAGE_SYSTEM" : "IMAGE_SYSTEM",
                imageValue: {
                  systemName: typeof item !== "string" ? (item.sfSymbol ? item.sfSymbol : "") : "",
                },
              }
            };
          }),
        }}
      >
        <Pressable
          onPress={() => {}}
          style={{ opacity: opened ? 0.3 : 1 }}
        >
          {children}
        </Pressable>
      </ContextMenuButton>
    );
  }

  return (
    <Reanimated.View layout={animated && animPapillon(LinearTransition)} style={[styles.container, contentContainerStyle]}>
      <Pressable onPress={() => setOpened(!opened)}>
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
      </Pressable>

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
            {data.filter((item) => item !== null).map((item, index) => {
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
                  <Pressable
                    key={index}
                    onPress={onPressItem ? () => {
                      setOpened(false);
                      onPressItem();
                    } : () => {
                      setOpened(false);
                      handleSelectionChange(item);
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

                    <NativeText>{label}</NativeText>

                    <View style={{ flex: 1 }} />

                    {item === selected || (isNotString && item.checked) && (
                      <Check
                        size={20}
                        strokeWidth={2.5}
                        color={theme.colors.primary}
                        style={{ marginRight: 10}}
                      />
                    )}
                  </Pressable>

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
  container: {},
  children: {},
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
