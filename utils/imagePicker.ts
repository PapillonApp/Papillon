import * as ExpoImagePicker from 'expo-image-picker';
import { isWindows } from './platform';
import { warn } from './logger/logger';

const launchImageLibraryAsync = async (
  options: ExpoImagePicker.ImagePickerOptions
): Promise<ExpoImagePicker.ImagePickerResult> => {
  if (isWindows) {
    warn('ImagePicker is not available on Windows.');
    return {
      canceled: true,
      assets: null,
    };
  }
  return ExpoImagePicker.launchImageLibraryAsync(options);
};

// Re-export all other members from expo-image-picker
export * from 'expo-image-picker';

// Override the specific function with our abstraction
export { launchImageLibraryAsync };