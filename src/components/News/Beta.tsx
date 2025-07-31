import React from "react";
import { Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";


const BetaIndicator: React.FC<{ colors?: string[] }> = (props) => {
  return (
    <LinearGradient
      colors={props.colors || ["#00AADC", "#A6FFC4"]}
      start={[0, 0]}
      end={[0, 2]}
      style={{ borderRadius: 8, paddingHorizontal: 6, paddingVertical: 4 }}
    >
      <Text style={{ fontFamily: "semibold", color: "white", fontSize: 14, letterSpacing: 1.6 }}>BETA</Text>
    </LinearGradient>
  );
};

export default BetaIndicator;
