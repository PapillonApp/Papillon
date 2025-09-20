import { useRouter } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OnboardingBackButton = (props: {
  icon?: string;
  position?: 'left' | 'right';
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <AnimatedPressable
      onPress={() => router.back()}
      style={[
        {
        position: 'absolute',
        top: insets.top + 4,
        zIndex: 200,
        backgroundColor: '#ffffff42',
        padding: 10,
        borderRadius: 100,
        },
        props.position === 'right' ? { right: 16 } : { left: 16 }
      ]}
    >
      <Papicons name={props.icon ?? "ArrowLeft"} size={26} fill={"#fff"}/>
    </AnimatedPressable>
  )
}

export default OnboardingBackButton;