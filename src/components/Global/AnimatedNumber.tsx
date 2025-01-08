import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";

import Reanimated, {
  AnimatedStyle,
  FadeInDown,
  FadeOutUp,
  LinearTransition
} from "react-native-reanimated";

interface AnimatedNumberProps {
  /**
   * Nombre en tant que string pour permettre
   * d'animer chaque chiffre et d'avoir un
   * flottant fixé, par exemple.
   */
  value: string | any;

  /**
   * Style du texte du nombre.
   */
  style?: StyleProp<TextStyle>

  /**
   * Style du conteneur du texte qui contient chaque chiffre.
   */
  contentContainerStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>
}

/**
 * Composant qui permet d'animer un nombre
 * lors de son apparition et modification.
 */
const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  style,
  contentContainerStyle
}) => {
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
      layout={animPapillon(LinearTransition)}
    >
      {value.toString().split("").map((n: string, i: number) => (
        <Reanimated.View
          key={i + "_" + n}
          entering={animPapillon(FadeInDown).delay(i * 20 + 20).mass(1).damping(30).stiffness(700)}
          exiting={animPapillon(FadeOutUp).delay(i * 30)}
          layout={animPapillon(LinearTransition)}
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