import React from "react";
import { View, type StyleProp, type ViewProps, type ViewStyle } from "react-native";

// Shim web/desktop pour `react-native-linear-gradient`.
//
// Le paquet n'a pas de vraie version web : sa branche "sinon" (index.js)
// retombe sur index.windows.js, qui appelle requireNativeComponent au niveau
// module → crash immédiat au bundling web. On reproduit ici uniquement les
// props réellement utilisées dans l'app (colors, start, end, locations,
// style, children — vérifié dans les 7 écrans qui l'utilisent), avec un
// vrai dégradé CSS (`backgroundImage: linear-gradient(...)`) au lieu d'une
// vue native. `React.forwardRef` pour rester compatible avec
// `Reanimated.createAnimatedComponent(LinearGradient)` (utilisé dans
// ui/components/SkeletonView.tsx).

type Point = { x: number; y: number };

type LinearGradientProps = ViewProps & {
  colors: string[];
  start?: Point;
  end?: Point;
  locations?: number[] | null;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

// Convertit les points start/end (repère écran, y vers le bas, comme sur
// mobile) en angle CSS (0deg = vers le haut, sens horaire). Validé contre
// les valeurs par défaut de la lib d'origine et les usages de l'app.
function angleFromPoints(start: Point, end: Point): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

const LinearGradient = React.forwardRef<View, LinearGradientProps>((props, ref) => {
  const {
    colors,
    start = { x: 0.5, y: 0 },
    end = { x: 0.5, y: 1 },
    locations,
    style,
    children,
    ...rest
  } = props;

  const angle = angleFromPoints(start, end);
  const stops = (colors || [])
    .map((color, i) => {
      const hasLocation = locations && locations[i] !== undefined;
      return hasLocation ? `${color} ${(locations as number[])[i] * 100}%` : color;
    })
    .join(", ");

  return (
    <View
      ref={ref}
      {...rest}
      style={[
        style,
        { backgroundImage: `linear-gradient(${angle}deg, ${stops})` } as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
});

LinearGradient.displayName = "LinearGradient";

export default LinearGradient;
