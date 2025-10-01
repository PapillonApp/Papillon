import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as ExpoCamera from 'expo-camera';
import { isWindows } from './platform';

const MockCameraView = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.container}>
    <Text style={styles.text}>Camera not available on Desktop</Text>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
  },
});

const useMockCameraPermissions = (): [ExpoCamera.PermissionResponse | null, () => Promise<ExpoCamera.PermissionResponse>] => {
  const permissionResponse: ExpoCamera.PermissionResponse = {
    granted: false,
    expires: 'never',
    canAskAgain: false,
    status: ExpoCamera.PermissionStatus.DENIED,
  };

  const requestPermission = async (): Promise<ExpoCamera.PermissionResponse> => {
    return Promise.resolve(permissionResponse);
  };

  return [permissionResponse, requestPermission];
};

export const CameraView = isWindows ? MockCameraView : ExpoCamera.CameraView;
export const useCameraPermissions = isWindows ? useMockCameraPermissions : ExpoCamera.useCameraPermissions;