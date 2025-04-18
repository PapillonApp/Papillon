import Reanimated, { AnimatedStyle, EntryExitTransition, FadeInUp, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { type StyleProp, Text, type ViewStyle } from "react-native";
import { NativeText } from "./NativeComponents";
import AnimatedEmoji from "../Grades/AnimatedEmoji";

interface MissingItemProps {
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  emoji?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  animatedEmoji?: boolean;
  title: string;
  description: string;
  entering?: EntryExitTransition;
  exiting?: EntryExitTransition;
}

const MissingItem: React.FC<MissingItemProps> = ({
  style,
  leading,
  trailing,
  emoji,
  animatedEmoji,
  title,
  description,
  entering,
  exiting,
}) => {
  return (
    <Reanimated.View
      layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)}
      style={[{
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 20,
      }, style]}
      entering={entering ?? FadeInUp}
      exiting={exiting ?? FadeOutDown}
    >
      {leading && leading}

      {!animatedEmoji ? emoji && (
        <Text style={{ fontSize: 32 }}>
          {emoji}
        </Text>
      ) : (
        <AnimatedEmoji initialScale={1.2} size={40} />
      )}

      <NativeText variant="title" style={{ textAlign: "center", marginTop: 3 }}>
        {title}
      </NativeText>

      <NativeText variant="subtitle" style={{ textAlign: "center" }}>
        {description}
      </NativeText>

      {trailing && trailing}
    </Reanimated.View>
  );
};

export default MissingItem;
