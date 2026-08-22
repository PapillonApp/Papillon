import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "expo-router/react-navigation";

import Reanimated, { useAnimatedStyle, withSpring, ZoomIn, ZoomOut } from "react-native-reanimated";

const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={() => onChange(!checked)}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: theme.colors.border,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked &&
          <Reanimated.View
            style={{
              width: 28,
              height: 28,
              borderRadius: 24,
              backgroundColor: theme.colors.primary,
              alignItems: "center",
              justifyContent: "center",
            }}
            entering={ZoomIn.springify().duration(200)}
            exiting={ZoomOut.springify().duration(200)}
          >
            {checked &&
              <Papicons color="white" name='check' size={20} />
            }
          </Reanimated.View>
        }
      </View>
    </Pressable>
  );
}

export default Checkbox;