import { DimensionValue, Platform, ViewProps } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";
import CrossPattern from "@/ui/components/Pattern/CrossPattern";
import { useTheme } from "@react-navigation/native";

enum AvailablePatterns {
  CROSS = "cross",
}

interface PatternProps extends ViewProps{
  pattern: AvailablePatterns;
  width?: DimensionValue
  height?: DimensionValue;
  color?: string;
  opacity?: number;
}

const Pattern = (props: PatternProps) => {
  const { colors } = useTheme();

  return (
    <MaskedView
      maskElement={
        <LinearGradient
          colors={["#000", "#0000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{
            flex: 1,
            width: "100%",
            height: "100%",
          }}
        />
      }
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0,
        width: props.width || "100%",
        height: props.height || "100%",
        opacity: (props.opacity || 0.25) * (Platform.OS === "android" ? 0.3 : 1),
      }}
    >
      {props.pattern === "cross" && (
        <CrossPattern color={props.color || colors.text}/>
      )}
    </MaskedView>
  );
}

export { AvailablePatterns, Pattern };