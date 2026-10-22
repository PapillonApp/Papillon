import { useRouter } from "expo-router";
import { Papicons } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import React from "react";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const OnboardingBackButton = (props: {
  icon?: string;
  position?: 'left' | 'right';
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isRight = props.position === 'right';

  return (
    <SafeAreaView
      mode="margin"
      edges={isRight ? { right: 'maximum' } : { left: 'additive' }}
      style={[
        {
          position: 'absolute',
          top: insets.top + 4,
          zIndex: 200,
        },
        isRight ? { right: 0, marginRight: 16 } : { left: 0, marginLeft: 16 }
      ]}
    >
      <AnimatedPressable
        onPress={() => router.back()}
        style={{
          backgroundColor: '#ffffff42',
          padding: 10,
          borderRadius: 100,
        }}
      >
        <Papicons name={props.icon ?? "ArrowLeft"} size={26} fill={"#fff"}/>
      </AnimatedPressable>
    </SafeAreaView>
  )
}

export default OnboardingBackButton;