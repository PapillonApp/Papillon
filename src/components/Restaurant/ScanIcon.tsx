import React from "react";
import { View } from "react-native";
import Svg, {
  G,
  Path,
  Rect,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
} from "react-native-svg";

interface ScanIconProps {
  color: string
}

const ScanIcon = ({ color }: ScanIconProps) => {
  return (
    <View>
      <Svg width="73" height="73" viewBox="0 0 73 73" fill="none">
        <G clipPath="url(#clip0_4147_1418)">
          <Path
            d="M71.25 36.5C71.25 55.6919 55.6919 71.25 36.5 71.25C17.3081 71.25 1.75 55.6919 1.75 36.5C1.75 17.3081 17.3081 1.75 36.5 1.75C55.6919 1.75 71.25 17.3081 71.25 36.5Z"
            stroke="white"
            strokeWidth="3.5"
          />
          <Path
            d="M57 28C57 23.5817 53.4183 20 49 20H25C20.5817 20 17 23.5817 17 28V67.3601C22.6411 70.9321 29.3291 73 36.5 73C44.0995 73 51.1565 70.6775 57 66.7037V28Z"
            fill="white"
          />
          <Rect
            x="20.5"
            y="25.8912"
            width="33"
            height="32"
            rx="2"
            fill="url(#paint0_linear_4147_1418)"
          />
        </G>
        <Defs>
          <LinearGradient
            id="paint0_linear_4147_1418"
            x1="37"
            y1="25.8912"
            x2="37"
            y2="57.8912"
            gradientUnits="userSpaceOnUse"
          >
            <Stop stopColor={color} />
            <Stop offset="1" stopColor="white" stopOpacity="0" />
          </LinearGradient>
          <ClipPath id="clip0_4147_1418">
            <Rect width="73" height="73" rx="36.5" fill="white" />
          </ClipPath>
        </Defs>
      </Svg>
    </View>
  );
};

export default ScanIcon;
