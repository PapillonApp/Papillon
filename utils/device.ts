import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getStaticDeviceId = async (): Promise<string> => {
  if (Platform.OS === 'ios') {
    const id = await Application.getIosIdForVendorAsync();
    return id || "unknown-ios-device";
  } else if (Platform.OS === 'android') {
    return Application.getAndroidId() || "unknown-android-device";
  }
  return "unknown-device";
}
