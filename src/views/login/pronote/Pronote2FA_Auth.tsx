import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  ScrollView,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

import * as Device from "expo-device";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { Info } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import type { Screen } from "@/router/helpers/types";

import pronote from "pawnote";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, PronoteAccount } from "@/stores/account/types";
import extract_pronote_name from "@/utils/format/extract_pronote_name";
import defaultPersonalization from "@/services/pronote/default-personalization";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

export const Pronote2FA_Auth: Screen<"Pronote2FA_Auth"> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const pinInputRefs = useRef<TextInput[]>([]);
  const deviceNameInputRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  const createStoredAccount = useAccounts((store) => store.create);
  const switchTo = useCurrentAccount((store) => store.switchTo);

  const inputParams = route.params;
  const errorHandler = inputParams.error.handle;
  const session = inputParams.session;
  const accountID = inputParams.accountID;

  const needPin = errorHandler.shouldEnterPIN;

  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [deviceName, setDeviceName] = useState<string>(
    `Papillon sur ${Device.modelName}`,
  );

  if (deviceName.length > 30) {
    setDeviceName(deviceName.slice(0, 30)); // Prevent too long names
  }

  const handlePinChange = (text: string, index: number) => {
    if (text.length === 1) {
      let newPin = [...pin];
      newPin[index] = text;
      setPin(newPin);

      if (index < 3) {
        pinInputRefs.current[index + 1].focus();
      }
    }
  };

  const handlePinKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      let newPin = [...pin];
      // If input is empty, go back to precedent
      if (pin[index] === "" && index > 0) {
        pinInputRefs.current[index - 1].focus();
      }
      // Else we clear it
      newPin[index] = "";
      setPin(newPin);
    }
  };

  const handleSubmit = async () => {
    if (needPin) {
      if (pin.join("").length != 4) {
        let firstEmptyIndex = pin.findIndex((value) => value === "");
        pinInputRefs.current[firstEmptyIndex].focus();
        setLoading(false);
        return;
      } else {
        const isPinCorrect = await pronote.securityCheckPIN(
          session,
          pin.join(""),
        );
        if (!isPinCorrect) {
          pinInputRefs.current[4].focus();
          setLoading(false);
          return;
        }
      }
    }
    if (deviceName == "") {
      deviceNameInputRef.current?.focus();
      setLoading(false);
      return;
    }

    await pronote.securitySource(session, deviceName); // Pronote use it, but why ?

    await pronote.securitySave(session, errorHandler, {
      pin: pin.join("") || undefined,
      deviceName: deviceName,
    });

    const context = errorHandler.context;

    const refresh = await pronote.finishLoginManually(
      session,
      context.authentication,
      context.identity,
      context.initialUsername,
    );

    const user = session.user.resources[0];
    const name = user.name;

    const account: PronoteAccount = {
      instance: session,

      localID: accountID,
      service: AccountService.Pronote,

      isExternal: false,
      linkedExternalLocalIDs: [],

      name,
      className: user.className,
      schoolName: user.establishmentName,
      studentName: {
        first: extract_pronote_name(name).givenName,
        last: extract_pronote_name(name).familyName,
      },

      authentication: { ...refresh, deviceUUID: accountID },
      personalization: await defaultPersonalization(session),

      identity: {},
      serviceData: {},
      providers: []
    };

    pronote.startPresenceInterval(session);
    createStoredAccount(account);
    setLoading(false);
    switchTo(account);

    // We need to wait a tick to make sure the account is set before navigating.
    queueMicrotask(() => {
      // Reset the navigation stack to the "Home" screen.
      // Prevents the user from going back to the login screen.
      navigation.reset({
        index: 0,
        routes: [{ name: "AccountCreated" }],
      });
    });
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={insets.top + 64}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        overflow: "visible",
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          overflow: "visible",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            gap: 14,
            margin: 4,
          }}
        >
          <Image
            source={require("@/../assets/images/service_pronote.png")}
            style={{
              width: 42,
              height: 42,
              borderRadius: 80,
            }}
          />
          <View>
            <NativeText
              style={{
                fontSize: 16,
                fontFamily: "medium",
                opacity: 0.5,
              }}
            >
              Se connecter au service
            </NativeText>
            <NativeText
              style={{
                fontSize: 20,
                lineHeight: 24,
                fontFamily: "semibold",
              }}
            >
              Pronote
            </NativeText>
          </View>
        </View>

        <NativeList inline>
          <NativeItem icon={<Info />}>
            <NativeText variant="subtitle">
              Papillon n'est pas affilié à Pronote. La politique de
              confidentialité de Pronote s'applique.
            </NativeText>
          </NativeItem>
        </NativeList>
        {needPin && (
          <>
            <NativeListHeader label="Code Pin" />
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-evenly",
              }}
            >
              {pin.map((value, index) => (
                <NativeList
                  style={{
                    width: 48,
                    height: 64,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  key={index}
                >
                  <ResponsiveTextInput
                    placeholder="0"
                    placeholderTextColor={theme.colors.text + "55"}
                    style={{
                      fontSize: 32,
                      fontFamily: "medium",
                      color: theme.colors.text,
                      width: 32,
                      lineHeight: 32,
                      textAlign: "center",
                    }}
                    keyboardType="numeric"
                    autoComplete="off"
                    maxLength={1}
                    value={value}
                    onChangeText={(text) => handlePinChange(text, index)}
                    onKeyPress={(e) => handlePinKeyPress(e, index)}
                    autoFocus={index === 0}
                    ref={(ref) => {
                      if (ref) pinInputRefs.current[index] = ref;
                    }} // Sorcellerie pour TypeScript
                  />
                </NativeList>
              ))}
            </View>
          </>
        )}

        <NativeListHeader label="Nom de l'appareil" />
        <NativeList>
          <NativeItem>
            <ResponsiveTextInput
              placeholder="Nom de l'appareil"
              placeholderTextColor={theme.colors.text + "55"}
              value={deviceName}
              onChangeText={setDeviceName}
              maxLength={30} // Limit from pawnote sources
              style={{
                color: theme.colors.text,
              }}
              ref={deviceNameInputRef}
            />
          </NativeItem>
        </NativeList>

        <ButtonCta
          primary
          value="Se connecter"
          style={{
            marginTop: 24,
          }}
          onPress={() => {
            setLoading(true);
            handleSubmit();
          }}
          icon={loading ? <ActivityIndicator /> : void 0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Pronote2FA_Auth;
