import { useTheme } from "@react-navigation/native";
import { RotateCcw } from "lucide-react-native";
import React, { useState } from "react";
import { Image, ViewProps } from "react-native";
import {
  StyleProps,
} from "react-native-reanimated";

import AnimatedPressable from "@/ui/components/AnimatedPressable";
import SkeletonView from "@/ui/components/SkeletonView";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";

export interface AvatarProps extends ViewProps {
  size?: number;
  initials?: string;
  imageUrl?: string;
  shape?: "circle" | "square";
  color?: string;
  skeleton?: boolean;
}

const Avatar = ({
  size = 40,
  initials,
  imageUrl,
  shape = "circle",
  color,
  skeleton = false,
  ...rest
}: AvatarProps) => {
  const { colors, dark } = useTheme();
  const [hasFailed, setHasFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const generateBodyStyle = (): StyleProps => {
    const baseStyle: StyleProps = {
      width: size,
      height: size,
      borderRadius: shape === "circle" ? size / 2 : size * 0.2,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    };

    if (hasFailed) { baseStyle.backgroundColor = adjust("#DD0030", dark ? -0.6 : 0.9); }
    else if (!imageUrl && !skeleton) { baseStyle.backgroundColor = adjust(color ?? colors.primary, dark ? -0.6 : 0.85); }

    if (hasFailed) { baseStyle.borderColor = adjust(color ?? colors.primary, dark ? -0.6 : 0.9); }
    else if (imageUrl || skeleton) { baseStyle.borderColor = colors.border; }
    else { baseStyle.borderColor = colors.border }

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
          color={color ?? colors.primary}
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