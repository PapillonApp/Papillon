import React from "react";
import { View } from "react-native";
import { NativeText } from "../Global/NativeComponents";
import { UsersRound } from "lucide-react-native";

const InitialIndicator = ({ initial, color, textColor = "#FFF", size = 42 }: { initial: string, color: string, textColor?: string, size?: number }) => {
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      marginLeft: -1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: color,
    }}>
      {initial === "group" ? (
        <UsersRound size={size / 2} color={textColor}/>
      ):(
        <NativeText variant="title" style={{
          color: textColor,
          fontSize: size / 2.25,
          lineHeight: size,

        }}>
          {initial
            .substr(0, 2)
            .toUpperCase()
          }
        </NativeText>
      )}
    </View>
  );
};

export default InitialIndicator;
