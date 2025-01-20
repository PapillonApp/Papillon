import React, { useEffect, useState } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from "react-native-reanimated";

interface AnimatedEmojiProps {
  initialScale?: number;
  size?: number; // Taille de la police
}

const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({ initialScale = 1, size = 20 }) => {
  const scale = useSharedValue(initialScale);
  const opacity = useSharedValue(1);
  const emojis = ["😍", "🙄", "😭", "🥳", "😱", "😳", "🤓", "🤡", "🤯", "😨", "🤔", "🫠"];
  const [currentEmoji, setCurrentEmoji] = useState(emojis[0]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const changeEmoji = () => {
    scale.value = withSequence(
      withSpring(initialScale * 0.5, {
        damping: 10,
        stiffness: 100,
      }),
      withSpring(initialScale, {
        damping: 12,
        stiffness: 200,
      })
    );

    opacity.value = withSequence(
      withTiming(0, {
        duration: 100,
        easing: Easing.inOut(Easing.ease),
      }),
      withTiming(1, {
        duration: 200,
        easing: Easing.inOut(Easing.ease),
      })
    );

    setTimeout(() => {
      const nextIndex = (emojis.indexOf(currentEmoji) + 1) % emojis.length;
      setCurrentEmoji(emojis[nextIndex]);
    }, 100);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      changeEmoji();
    }, 2000);

    return () => clearInterval(interval);
  }, [currentEmoji]);

  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.Text
        style={[
          {
            color: "#FFFFFF",
            fontSize: size,
            fontFamily: "semibold",
            textAlign: "center",
            textAlignVertical: "center",
            marginTop: -2,
          },
          animatedStyle,
        ]}
      >
        {currentEmoji}
      </Animated.Text>
    </View>
  );
};

export default AnimatedEmoji;
