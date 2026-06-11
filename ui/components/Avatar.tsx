import { Image, View, ViewProps, ViewStyle } from "react-native";
import { useTheme } from "expo-router/react-navigation";
import adjust from "@/utils/adjustColor";
import Typography from "@/ui/components/Typography";
import { useEffect, useState } from "react";
import SkeletonView from "@/ui/components/SkeletonView";

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
  style,
  ...rest
}: AvatarProps) => {
  const { colors, dark } = useTheme();
  const [hasFailed, setHasFailed] = useState(false);

  const borderRadius = shape === "circle" ? size / 2 : size * 0.2;
  const showImage = !!imageUrl && !hasFailed;
  const showInitials = hasFailed || (!showImage && !skeleton);
  const showSkeleton = !hasFailed && (skeleton || showImage);
  const initialsColor = color ?? (colors.primary as string);

  useEffect(() => {
    setHasFailed(false);
  }, [imageUrl]);

  const generateBodyStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      width: size,
      height: size,
      borderRadius: borderRadius,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden",
    };

    if (showInitials)
      baseStyle.backgroundColor = adjust(initialsColor, dark ? -0.6 : 0.85);

    baseStyle.borderColor = colors.border;

    return baseStyle;
  }

  return (
    <View {...rest} style={[generateBodyStyle(), style]}>
      {showSkeleton && (
        <SkeletonView
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: size,
            height: size,
            borderRadius: borderRadius,
          }}
        />
      )}

      {showImage && (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: borderRadius }}
          resizeMode="cover"
          onError={() => setHasFailed(true)}
        />
      )}
      {showInitials && (
        <Typography
          color={initialsColor}
          weight={"bold"}
          style={{ textTransform: "uppercase", fontSize: size * 0.4, lineHeight: size * 0.95 }}
        >
          {initials || "?"}
        </Typography>
      )}
    </View>
  );
};

export default Avatar;
