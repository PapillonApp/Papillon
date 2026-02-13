import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { View } from "react-native";

import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Divider from "@/ui/new/Divider";
import Ripple from "@/ui/new/RippleEffect";
import Typography from "@/ui/new/Typography";
import { PapillonZoomIn, PapillonZoomOut } from "@/ui/utils/Transition";
import adjust from "@/utils/adjustColor";



export default function OnboardingSelector({ item, selected, setSelected }) {
  const theme = useTheme();
  const { colors } = theme;

  if (item.type == 'separator') {
    return <Stack padding={[32, 10]}><Divider height={1.5} /></Stack>
  }

  const color = adjust(item.color, theme.dark ? -0.5 : 0.3);
  const dark = adjust(item.color, theme.dark ? 0.4 : -0.4);

  return (
    <Ripple
      style={
        {
          height: 74,
          padding: 20,
          borderRadius: 20,
          borderCurve: "continuous",
          borderColor: selected == item.key ? dark : theme.dark ? colors.text + "22" : colors.text + "36",
          borderWidth: selected == item.key ? 2 : 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden"
        }
      }
      onTap={() => { selected == item.key ? setSelected(null) : setSelected(item.key) }}
    >
      {selected == item.key && (
        <LinearGradient
          colors={theme.dark ? [color, color + "44"] : [color + "44", color]}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}

      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
        {selected == item.key && (
          <Dynamic animated entering={PapillonZoomIn} exiting={PapillonZoomOut}>
            <Icon fill={dark}>
              <Papicons name="check" />
            </Icon>
          </Dynamic>
        )}
        <Dynamic animated>
          <Typography numberOfLines={1} variant="title" color={selected == item.key ? dark : "textSecondary"}>{item.label}</Typography>
        </Dynamic>
      </View>

      <View style={{ flex: 1, alignItems: "flex-end", marginBottom: -10 }}>
        <item.icon color={selected == item.key ? color : "transparent"} dark={selected == item.key ? dark : theme.dark ? colors.text + "22" : colors.text + "36"} />
      </View>
    </Ripple>
  )
};