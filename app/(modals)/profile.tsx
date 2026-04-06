import { Papicons } from "@getpapillon/papicons";
import { MenuAction, NativeActionEvent } from "@react-native-menu/menu";
import { useTheme } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker"
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { fetchEDProfilePicture } from "@/services/ecoledirecte/profile";
import { refreshEDAccount } from "@/services/ecoledirecte/refresh";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Avatar from "@/ui/components/Avatar";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { getInitials } from "@/utils/chats/initials";
import { warn } from "@/utils/logger/logger";
import {
  createProfilePictureDataUri,
  getAccountProfilePictureUri,
} from "@/utils/profilePicture";
import ActionMenu from "@/ui/components/ActionMenu";
import {
  ANONYMOUS_PROFILE_BLUR_RADIUS,
  getDisplayInitials,
  getDisplayPersonName,
  useAnonymousMode,
} from "@/utils/privacy/anonymize";

type ProfileMenuAction = MenuAction & {
  papicon?: React.ComponentProps<typeof Papicons>["name"];
};

export default function CustomProfileScreen() {
  const { t } = useTranslation();
  const store = useAccountStore.getState();
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);
  const anonymousMode = useAnonymousMode();

  const [firstName, setFirstName] = useState<string>(account?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(account?.lastName ?? "");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(getAccountProfilePictureUri(account?.customisation?.profilePicture) ?? null);
  const [isImportingProfilePicture, setIsImportingProfilePicture] = useState(false);

  useEffect(() => {
    if (!account) {
      setFirstName("");
      setLastName("");
      setProfilePictureUrl(null);
      return;
    }

    setFirstName(account.firstName);
    setLastName(account.lastName);
    setProfilePictureUrl(getAccountProfilePictureUri(account.customisation?.profilePicture) ?? null);
  }, [account]);

  const insets = useSafeAreaInsets()

  const updateProfilePictureFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const profilePicture = createProfilePictureDataUri(asset.base64 ?? "", asset.mimeType);
      store.setAccountProfilePicture(lastUsedAccount, profilePicture);
      setProfilePictureUrl(getAccountProfilePictureUri(profilePicture) ?? null);
    }
  }

  const updateProfilePictureFromService = async () => {
    if (!account || isImportingProfilePicture) {
      return;
    }

    const edService = account.services.find((service) => service.serviceId === Services.ECOLEDIRECTE);
    if (!edService) {
      Alert.alert(
        "Photo de profil",
        "Cette option est disponible uniquement pour les comptes EcoleDirecte."
      );
      return;
    }

    setIsImportingProfilePicture(true);

    try {
      const { account: session } = await refreshEDAccount(edService.id, edService.auth);
      const profilePicture = await fetchEDProfilePicture(session);
      if (!profilePicture) {
        Alert.alert(
          "Photo de profil",
          "Aucune photo n'est disponible sur EcoleDirecte pour ce compte."
        );
        return;
      }

      store.setAccountProfilePicture(lastUsedAccount, profilePicture);
      setProfilePictureUrl(getAccountProfilePictureUri(profilePicture) ?? null);
    } catch (error) {
      warn(`Failed to import ED profile picture: ${String(error)}`);
      Alert.alert(
        "Photo de profil",
        "Impossible de recuperer la photo de profil depuis EcoleDirecte."
      );
    } finally {
      setIsImportingProfilePicture(false);
    }
  }

  const { colors } = useTheme();
  const displayName = getDisplayPersonName(firstName, lastName, anonymousMode);
  const [displayFirstName, ...displayLastNameParts] = displayName.split(" ");
  const displayLastName = displayLastNameParts.join(" ");
  const profilePictureActions: ProfileMenuAction[] = [
    {
      id: 'photo_library',
      title: t("Button_Change_ProfilePicture_FromLibrary"),
      papicon: 'Gallery',
      image: Platform.select({
        ios: 'photo',
        android: 'ic_menu_gallery',
      }),
      imageColor: colors.text
    },
    {
      id: 'from_service',
      title: t("Button_Change_ProfilePicture_FromService"),
      papicon: 'archive',
      image: Platform.select({
        ios: 'square.and.arrow.down',
        android: 'ic_menu_save',
      }),
      imageColor: colors.text
    },
    {
      id: 'remove_photo',
      title: t("Button_Change_ProfilePicture_Remove"),
      attributes: { destructive: true },
      papicon: 'Trash',
      image: Platform.select({
        ios: 'trash',
        android: 'ic_menu_delete',
      }),
      imageColor: "#FF0000"
    }
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View style={{ paddingHorizontal: 50, alignItems: "center", gap: 15, paddingTop: 20 }}>
          <Avatar
            size={117}
            initials={getDisplayInitials(getInitials(`${firstName} ${lastName}`), anonymousMode)}
            imageUrl={profilePictureUrl || undefined}
            blurRadius={anonymousMode ? ANONYMOUS_PROFILE_BLUR_RADIUS : 0}
          />

          <ActionMenu
            actions={profilePictureActions}
            onPressAction={(e: NativeActionEvent) => {
              if (isImportingProfilePicture) {
                return;
              }

              switch (e.nativeEvent.event) {
                case 'photo_library':
                  updateProfilePictureFromLibrary();
                  break;
                case 'from_service':
                  updateProfilePictureFromService();
                  break;
                case 'remove_photo':
                  store.setAccountProfilePicture(lastUsedAccount, "");
                  setProfilePictureUrl(null);
                  break;
              }
            }}
          >
            <Button
              inline
              size="small"
              loading={isImportingProfilePicture}
              disabled={isImportingProfilePicture}
              icon={<Papicons name="Camera" />}
              title={t("Button_Change_ProfilePicture")}
            />
          </ActionMenu>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 30, gap: 15 }}>
          <View style={{ gap: 10 }}>
            <Typography color="secondary">Prénom</Typography>
            <OnboardingInput
              placeholder={"Prénom"}
              text={anonymousMode ? displayFirstName : firstName}
              setText={setFirstName}
              icon={"Font"}
              inputProps={{ editable: !anonymousMode }}
            />
            <Typography color="secondary">Nom</Typography>
            <OnboardingInput
              placeholder={"Nom"}
              text={anonymousMode ? displayLastName : lastName}
              setText={setLastName}
              icon={"Bold"}
              inputProps={{ editable: !anonymousMode }}
            />
          </View>
        </View>
        <NativeHeaderSide side="Left" key={`${firstName}-${lastName}`}>
          <NativeHeaderPressable
            onPressIn={() => {
              useAccountStore.getState().setAccountName(lastUsedAccount, firstName, lastName);
              router.back();
            }}
          >
            <Icon papicon size={26}>
              <Papicons name="ArrowLeft" />
            </Icon>
          </NativeHeaderPressable>

        </NativeHeaderSide>
      </ScrollView>
    </View>
  );
}