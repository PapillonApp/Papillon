import { useWindowDimensions } from "react-native";

const useResizable = () => {
  const dimensions = useWindowDimensions();
  const isLarge = dimensions.width >= 768;

  return {
    isLarge
  };
};

export default useResizable;