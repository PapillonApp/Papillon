import Reanimated, { FadeInUp, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { Text } from "react-native";
import { NativeText } from "./NativeComponents";
import AnimatedEmoji from "../Grades/AnimatedEmoji";
var MissingItem = function (_a) {
    var style = _a.style, leading = _a.leading, trailing = _a.trailing, emoji = _a.emoji, animatedEmoji = _a.animatedEmoji, title = _a.title, description = _a.description, entering = _a.entering, exiting = _a.exiting;
    return (<Reanimated.View layout={LinearTransition.springify().mass(1).damping(20).stiffness(300)} style={[{
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 20,
            }, style]} entering={entering ? entering : FadeInUp} exiting={exiting ? exiting : FadeOutDown}>
      {leading && leading}

      {!animatedEmoji ? emoji && (<Text style={{ fontSize: 32 }}>
          {emoji}
        </Text>) : (<AnimatedEmoji initialScale={1.2} size={40}/>)}

      <NativeText variant="title" style={{ textAlign: "center", marginTop: 3 }}>
        {title}
      </NativeText>

      <NativeText variant="subtitle" style={{ textAlign: "center" }}>
        {description}
      </NativeText>

      {trailing && trailing}
    </Reanimated.View>);
};
export default MissingItem;
