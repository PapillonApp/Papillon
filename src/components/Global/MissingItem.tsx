import Reanimated, { AnimatedStyle, EntryExitTransition, FadeInUp, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { type StyleProp, Text, type ViewStyle } from "react-native";
import { NativeText } from "./NativeComponents";
import AnimatedEmoji from "../Grades/AnimatedEmoji";

interface MissingItemProps {
  style?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
  emoji?: string;
  animatedEmoji?: boolean;
  title: string;
  description: string;
  entering?: EntryExitTransition;
  exiting?: EntryExitTransition;
}

const MissingItem: React.FC<MissingItemProps> = ({
  style,
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
        gap: 4,
        paddingHorizontal: 40,
      }, style]}
      entering={entering ? entering : FadeInUp}
      exiting={exiting ? exiting : FadeOutDown}
    >
      {!animatedEmoji ? (
        <Text style={{ fontSize: 32 }}>
          {emoji}
        </Text>
      ) : (
        <AnimatedEmoji initialScale={1.2} size={40} />
      )}

      <NativeText variant="title" style={{ textAlign: "center", marginTop: 3 }}>
        {title}
      </NativeText>

      <NativeText variant="subtitle" style={{textAlign: "center"}}>
        {description}
      </NativeText>
    </Reanimated.View>
  );
};

export default MissingItem;
