import { useRouter } from "expo-router";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const OnboardingBackButton = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <AnimatedPressable
      onPress={() => router.back()}
      style={{
        position: 'absolute',
        left: 16,
        top: insets.top + 4,
        zIndex: 200,
        backgroundColor: '#ffffff42',
        padding: 10,
        borderRadius: 100,
      }}
    >
      <Papicons name={"ArrowLeft"} size={26} fill={"#fff"}/>
    </AnimatedPressable>
  )
}

export default OnboardingBackButton;