import { useWindowDimensions } from "react-native";

const useResizable = () => {
  const dimensions = useWindowDimensions();
  const isLarge = dimensions.width >= 600;
  // Orientation-independent: a tablet's short edge clears this and a phone's
  // never does, so this stays put when the device is turned.
  const isTablet = Math.min(dimensions.width, dimensions.height) >= 600;

  return {
    isLarge,
    isTablet
  };
};

export default useResizable;