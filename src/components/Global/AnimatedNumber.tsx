import { Platform, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, {
  AnimatedStyle,
  FadeInDown,
  FadeOutUp,
  LinearTransition
} from "react-native-reanimated";
import { useRef, useEffect } from "react";

interface AnimatedNumberProps {
  value: string | any;
  style?: StyleProp<TextStyle>
  contentContainerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  contentContainerStyle
}) => {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, []);

  const shouldAnimate = !isFirstRender.current && Platform.OS !== "android";

  return (
    <Reanimated.View
      style={[{
        flexDirection: "row",
        alignItems: "flex-end",
        overflow: "hidden",
        paddingHorizontal: 3,
        marginHorizontal: -5,
        paddingVertical: 2,
        marginVertical: -2,
      }, contentContainerStyle]}
      layout={shouldAnimate ? animPapillon(LinearTransition) : undefined}
    >
      {value.toString().split("").map((n: string, i: number) => (
        <Reanimated.View
          key={`${n}_${i}`}
          entering={shouldAnimate ? animPapillon(FadeInDown).delay(i * 20 + 20).mass(1).damping(30).stiffness(700) : undefined}
          exiting={shouldAnimate ? animPapillon(FadeOutUp).delay(i * 30) : undefined}
          layout={shouldAnimate ? animPapillon(LinearTransition) : undefined}
        >
          <NativeText style={style}>
            {n}
          </NativeText>
        </Reanimated.View>
      ))}
    </Reanimated.View>
  );
};

export default AnimatedNumber;
