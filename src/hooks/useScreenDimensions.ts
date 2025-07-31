import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

export default function useScreenDimensions () {
  const [screenDimensions, setScreenDimensions] = useState<{
    width: number;
    height: number;
  }>(() => Dimensions.get("screen"));

  useEffect(() => {
    const handleDimensionsChange = ({
      screen,
    }: {
      screen: { width: number; height: number };
    }) => {
      setScreenDimensions(screen);
    };

    const subscription = Dimensions.addEventListener(
      "change",
      handleDimensionsChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  return {
    width: screenDimensions.width,
    height: screenDimensions.height,
    isTablet: screenDimensions.width > screenDimensions.height,
  };
}
