import { useAccountStore } from "@/stores/account";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { Papicons } from "@getpapillon/papicons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MenuView, NativeActionEvent } from "@react-native-menu/menu";
import OnboardingInput from "@/components/onboarding/OnboardingInput";
import { getInitials } from "@/utils/chats/initials";
import Avatar from "@/ui/components/Avatar";
import { useTheme } from "@react-navigation/native";

export default function CustomProfileScreen() {
  const { t } = useTranslation();
  const store = useAccountStore.getState();
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, setFirstName] = useState<string>(account?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(account?.lastName ?? "");
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(account?.customisation?.profilePicture ? `data:image/png;base64,${account.customisation.profilePicture}` : null);

  useEffect(() => {
    if (account) {
      setFirstName(account.firstName);
      setLastName(account.lastName);
      setProfilePictureUrl(account.customisation?.profilePicture ? `data:image/png;base64,${account.customisation.profilePicture}` : null);
    }
  }, [account]);

  const insets = useSafeAreaInsets()

  const updateProfilePictureFromLibrary = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true
    });

    if (!result.canceled) {
      const b64 = result.assets[0].base64 ?? "";
      store.setAccountProfilePicture(lastUsedAccount, b64);
    }
  }

  const updateProfilePictureFromService = async () => {
    Alert.alert(
      t("Feature_Soon"),
      "Cette fonctionnalité n'est pas encore disponible, mais elle le sera dans une prochaine mise à jour.",
      [{ text: "OK" }]
    );
  }

  const { colors } = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={"position"}
      keyboardVerticalOffset={-insets.top * 3.2}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ height: "100%" }}
      >
        <View style={{ paddingHorizontal: 50, alignItems: "center", gap: 15, paddingTop: 20 }}>
          <Avatar
            size={117}
            initials={getInitials(`${firstName} ${lastName}`)}
            imageUrl={profilePictureUrl || undefined}
          />

          <MenuView
            actions={[
              {
                id: 'photo_library',
                title: t("Button_Change_ProfilePicture_FromLibrary"),
                image: Platform.select({
                  ios: 'photo',
                  android: 'ic_menu_gallery',
                }),
                imageColor: colors.text
              },
              {
                id: 'from_service',
                title: t("Button_Change_ProfilePicture_FromService"),
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
                image: Platform.select({
                  ios: 'trash',
                  android: 'ic_menu_delete',
                }),
                imageColor: "#FF0000"
              }
            ]}
            onPressAction={(e: NativeActionEvent) => {
              switch (e.nativeEvent.event) {
                case 'photo_library':
                  updateProfilePictureFromLibrary();
                  break;
                case 'from_service':
                  updateProfilePictureFromService();
                  break;
                case 'remove_photo':
                  store.setAccountProfilePicture(lastUsedAccount, "");
                  break;
              }
            }}
          >
            <Button
              inline
              variant="outline"
              size="small"
              icon={<Papicons name="Camera" />}
              title={t("Button_Change_ProfilePicture")}
            />
          </MenuView>
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 30, gap: 15 }}>
          <View style={{ gap: 10 }}>
            <Typography color="secondary">Prénom</Typography>
            <OnboardingInput
              placeholder={"Prénom"}
              text={firstName}
              setText={setFirstName}
              icon={"Font"}
              inputProps={{}}
            />
            <Typography color="secondary">Nom</Typography>
            <OnboardingInput
              placeholder={"Nom"}
              text={lastName}
              setText={setLastName}
              icon={"Bold"}
              inputProps={{}}
            />
          </View>
        </View>
        <NativeHeaderSide side="Left" key={`${firstName}-${lastName}`}>
          <NativeHeaderPressable
            onPress={() => {
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
    </ KeyboardAvoidingView >
  );
}
