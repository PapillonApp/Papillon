/* eslint-disable react/react-in-jsx-scope */
import { CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router";
import { AuthenticateError, createSessionHandle, loginQrCode, SecurityError } from "pawnote";
import { useEffect, useState } from "react";
import { TextInput } from "react-native";

import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Typography from "@/ui/components/Typography";
import uuid from "@/utils/uuid/uuid";
export default function PronoteLoginWithQR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [pinCode, setPinCode] = useState<string>();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission?.granted, requestPermission]);

  console.log(permission?.granted)
  return (
    <>
      <TextInput placeholder="PIN" value={pinCode} onChangeText={setPinCode} style={{ paddingTop: 150 }} />
      {permission?.granted && (
        <>
          <Typography>Camera</Typography>
          <CameraView
            facing="back"
            barcodeScannerSettings={
              {
                barcodeTypes: ["qr"]
              }
            }
            onBarcodeScanned={async ({ data }) => {
              const device = uuid();
              const decodedJSON = JSON.parse(data);
              const formattedData = {
                jeton: decodedJSON.jeton,
                login: decodedJSON.login,
                url: decodedJSON.url,
              };

              const session = createSessionHandle();
              const authentification = await loginQrCode(session, {
                qr: formattedData,
                pin: pinCode ?? "",
                deviceUUID: device
              }).catch((error) => {
                if (error instanceof SecurityError && !error.handle.shouldCustomPassword && !error.handle.shouldCustomDoubleAuth) {
                  router.push({
                    pathname: "/(onboarding)/pronote/2fa",
                    params: {
                      error: JSON.stringify(error),
                      session: JSON.stringify(session),
                      deviceId: device
                    }
                  })
                } else {
                  throw error;
                }
              });

              if (!authentification) { throw AuthenticateError; }
              const schoolName = session.user.resources[0].establishmentName
              const className = session.user.resources[0].className;
              useAccountStore.getState().addAccount({
                id: device,
                firstName: session.user.name.split(" ")[0],
                lastName: session.user.name.split(" ")[1],
                schoolName,
                className,
                services: [{
                  id: device,
                  auth: {
                    accessToken: authentification.token,
                    refreshToken: authentification.token,
                    additionals: {
                      instanceURL: authentification.url,
                      kind: authentification.kind,
                      username: authentification.username,
                      deviceUUID: device
                    }
                  },
                  serviceId: Services.PRONOTE,
                  createdAt: (new Date()).toISOString(),
                  updatedAt: (new Date()).toISOString()
                }],
                createdAt: (new Date()).toISOString(),
                updatedAt: (new Date()).toISOString()
              });

              return router.push({
                pathname: "../end/color",
                params: {
                  accountId: device
                }
              });
            }}
          />
        </>
      )}
    </>
  )
}