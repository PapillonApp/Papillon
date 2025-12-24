import { useAnimatedKeyboard } from 'react-native-reanimated';

export const useKeyboardHeight = () => {
  const keyboard = useAnimatedKeyboard();
  return keyboard.height;
};
