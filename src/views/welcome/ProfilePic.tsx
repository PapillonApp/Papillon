import React from "react";
import { Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Screen } from "@/router/helpers/types";
import Reanimated, { FadeOut, LinearTransition, ZoomIn } from "react-native-reanimated";

import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";


import { useCurrentAccount } from "@/stores/account";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Camera, Trash } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";


const ProfilePic: Screen<"ProfilePic"> = ({ navigation }) => {
  const account = useCurrentAccount((state) => state.account!);
  const { mutateProperty } = useCurrentAccount();
  const theme = useTheme();
  const { playHaptics, playSound } = useSoundHapticsWrapper();
  const LEson5 = require("@/../assets/sound/5.wav");
  const LEson6 = require("@/../assets/sound/6.wav");

  const hasProfilePic = account && account?.personalization && account?.personalization.profilePictureB64 !== undefined && account?.personalization.profilePictureB64.trim() !== "";

  const [loadingPic, setLoadingPic] = React.useState(false);

  const updateProfilePic = async () => {
    setLoadingPic(true);

    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const img = "data:image/jpeg;base64," + result.assets[0].base64;
      mutateProperty("personalization", {
        ...account.personalization,
        profilePictureB64: img,
      }, true);
    }

    setLoadingPic(false);
  };

  let name = (!account || !account.studentName?.first) ? null
    : account.studentName?.first;

  // Truncate name if over 10 characters.
  if (name && name.length > 10) {
    name = name.substring(0, 10) + "...";
  }

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{height: 48}}/>

      <PapillonShineBubble
        message={name ? `Très bon choix, ${name} ! Maintenant, une petite photo ?` : "Ajouter une photo de profil ?"}
        numberOfLines={name ? 2 : 1}
        width={260}
        style={{
          zIndex: 10,
        }}
        noFlex
      />

      <Reanimated.View style={{flex: 1, justifyContent: "center", alignItems: "center"}}>
        <Reanimated.View layout={animPapillon(LinearTransition)}>
          <Pressable
            onPress={() => {updateProfilePic();}}
            style={(state) => [
              styles.profilePicContainer,
              {
                borderColor: theme.colors.text + "33",
                borderWidth: 1,
                marginTop: -100,
              },
              state.pressed && {
                opacity: 0.5,
              },
            ]}
          >
            {loadingPic ? (
              <PapillonSpinner
                size={100}
                strokeWidth={5}
                color={theme.colors.primary}
                style={{ opacity: 0.5 }}
              />
            ) : hasProfilePic ? (
              <Reanimated.Image
                source={{ uri: account.personalization.profilePictureB64 }}
                style={{ width: "100%", height: "100%", borderRadius: 200, overflow: "hidden" }}
                entering={animPapillon(ZoomIn)}
                exiting={FadeOut.duration(100)}
              />
            ) : (
              <Reanimated.View
                entering={animPapillon(ZoomIn)}
                exiting={FadeOut.duration(100)}
              >
                <Camera
                  size={100}
                  strokeWidth={1}
                  color={theme.colors.text}
                  style={{ opacity: 0.5 }}
                />
              </Reanimated.View>
            )}
          </Pressable>
        </Reanimated.View>

        {hasProfilePic && (
          <Reanimated.View layout={animPapillon(LinearTransition)}>
            <TouchableOpacity
              onPress={() => {
                mutateProperty("personalization", {
                  ...account.personalization,
                  profilePictureB64: undefined,
                }, true);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 24,
              }}
            >
              <Trash
                size={20}
                strokeWidth={2}
                color={theme.colors.primary}
              />

              <NativeText
                style={{
                  color: theme.colors.primary,
                  fontSize: 15,
                  fontFamily: "semibold",
                }}
              >
                Supprimer la photo
              </NativeText>
            </TouchableOpacity>
          </Reanimated.View>
        )}
      </Reanimated.View>

      <View
        style={styles.buttons}
      >
        <ButtonCta
          value="Magnifique !"
          disabled={!hasProfilePic}
          primary
          onPress={() => {
            navigation.navigate("AccountStack", {onboard: true});
            playSound(LEson6);
          }}
        />
        <ButtonCta
          value="Ignorer cette étape"
          onPress={() => {
            navigation.navigate("AccountStack", { onboard: true });
            playSound(LEson6);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  profilePicContainer: {
    width: 180,
    height: 180,
    borderRadius: 200,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  terms_text: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "medium",
    paddingHorizontal: 20,
  },
});

export default ProfilePic;
