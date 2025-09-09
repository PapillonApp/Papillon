import { Image, ViewProps } from "react-native";
import { useTheme } from "@react-navigation/native";
import adjust from "@/utils/adjustColor";
import Typography from "@/ui/components/Typography";
import { StyleProps } from "react-native-reanimated";
import { useState } from "react";
import SkeletonView from "@/ui/components/SkeletonView";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { RotateCcw } from "lucide-react-native";
import { Colors } from "@/utils/subjects/colors";

export interface AvatarProps extends ViewProps {
  size?: number;
  initials?: string;
  imageUrl?: string;
  shape?: "circle" | "square";
  color?: string;
  skeleton?: boolean;
  generateColor?: boolean;
}

const Avatar = ({
  size = 40,
  initials,
  imageUrl,
  shape = "circle",
  color,
  skeleton = false,
  generateColor = false,
  ...rest
}: AvatarProps) => {
  const { colors, dark } = useTheme();
  const [hasFailed, setHasFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const generateColorFromInitials = (): string => {
    if (!initials) return Colors[Math.floor(Math.random() * Colors.length)];
    const index = initials.charCodeAt(initials.length - 1) % Colors.length;
    return Colors[index];
  }

  const generatedColor = generateColor ? generateColorFromInitials() : colors.primary;

  const generateBodyStyle = (): StyleProps => {
    let baseStyle: StyleProps = {
      width: size,
      height: size,
      borderRadius: shape === "circle" ? size / 2 : size * 0.2,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    };

    if (hasFailed)
      baseStyle.backgroundColor = adjust("#DD0030", dark ? -0.6 : 0.9);
    else if (!imageUrl && !skeleton)
      baseStyle.backgroundColor = adjust(color ?? generatedColor, dark ? -0.6 : 0.85);

    if (hasFailed)
      baseStyle.borderColor = adjust(color ?? generatedColor, dark ? -0.6 : 0.9);
    else if (imageUrl || skeleton)
      baseStyle.borderColor = colors.border;
    else
      baseStyle.borderColor = colors.border

    return baseStyle;
  }

  return (
    <AnimatedPressable
      style={[generateBodyStyle(), rest.style]}
      pointerEvents={hasFailed ? "auto" : "none"}
      onPress={() => {
        setHasFailed(false);
        setReloadKey((k) => k + 1);
      }}
    >
      {(skeleton || (imageUrl && !hasFailed)) && (
        <SkeletonView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
          }}
        />
      )}

      {imageUrl && (
        <>
          <Image
            key={reloadKey}
            source={{ uri: imageUrl }}
            style={{ width: size, height: size }}
            resizeMode="cover"
            onError={() => setHasFailed(true)}
          />
        </>
      )}
      {(!imageUrl && !skeleton) && (
        <Typography
          color={color ?? generatedColor}
          weight={"bold"}
          style={{ textTransform: "uppercase", fontSize: size * 0.4, lineHeight: size * 0.95 }}
        >
          {initials || "?"}
        </Typography>
      )}
      {hasFailed && (
        <RotateCcw color={"#DD0030"} size={size * 0.4} style={{ position: "absolute" }} />
      )}
    </AnimatedPressable>
  );
};

export default Avatar;