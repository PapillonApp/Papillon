import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { Screen } from "@/router/helpers/types";
import { useCurrentAccount } from "@/stores/account";
import { useTheme } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { BadgeX, Camera, ChevronDown, ChevronUp, ClipboardCopy, TextCursorInput, Undo2, User2, UserCircle2, WholeWord } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Switch, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/providers/AlertProvider";
import * as Clipboard from "expo-clipboard";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getDefaultProfilePicture } from "@/utils/GetRessources/GetDefaultProfilePicture";

const SettingsProfile: Screen<"SettingsProfile"> = ({ navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const [oldFirstName, setOldFirstName] = useState(account.studentName?.first ?? "");
  const [oldLastName, setOldLastName] = useState(account.studentName?.last ?? "");

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState(account.studentName?.first ?? "");
  const [lastName, setLastName] = useState(account.studentName?.last ?? "");

  const { showAlert } = useAlert();

  // on name change, update the account name
  useEffect(() => {
    let newLastName = lastName;
    let newFirstName = firstName;

    if (newFirstName.trim() === "") {
      newFirstName = oldFirstName;
    }

    if (newLastName.trim() === "") {
      newLastName = oldLastName;
    }

    mutateProperty("studentName", {
      first: newFirstName.trim(),
      last: newLastName.trim(),
    });
  }, [firstName, lastName]);

  const [profilePic, setProfilePic] = useState(account.personalization.profilePictureB64);
  const [loadingPic, setLoadingPic] = useState(false);

  const resetProfilePic = async () => {
    setLoadingPic(true);

    // Call up the function to obtain the profile picture
    const img = await getDefaultProfilePicture(account);

    // If the image is undefined, an alert is displayed with an error message
    if (!img) {
      showAlert({
        title: "Erreur",
        message: "Impossible de récupérer de la photo de profil",
        icon: <BadgeX />,
        actions: [
          {
            title: "OK",
            primary: true,
            icon: <Undo2 />,
          },
        ],
      });
    } else {
      // If image available, update profile picture
      setProfilePic(img);
      mutateProperty("personalization", {
        ...account.personalization,
        profilePictureB64: img,
      });
    }

    setLoadingPic(false);
  };

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
      setProfilePic(img);
      mutateProperty("personalization", {
        ...account.personalization,
        profilePictureB64: img,
      }, true);
    }

    setLoadingPic(false);
  };

  const [hideNameOnHomeScreen, setHideNameOnHomeScreen] = useState(account.personalization.hideNameOnHomeScreen);
  const [hideProfilePicOnHomeScreen, setHideProfilePicOnHomeScreen] = useState(account.personalization.hideProfilePicOnHomeScreen);

  useEffect(() => {
    mutateProperty("personalization", {
      ...account.personalization,
      hideNameOnHomeScreen: hideNameOnHomeScreen,
      hideProfilePicOnHomeScreen: hideProfilePicOnHomeScreen,
    });
  }, [hideNameOnHomeScreen, hideProfilePicOnHomeScreen]);

  const identityData = account.identity ? [
    account.identity.civility && {
      label: "Civilité",
      value: account.identity.civility === "M" ? "Monsieur" : "Madame",
    },
    account.identity.birthDate && {
      label: "Date de naissance",
      value: new Date(account.identity.birthDate).toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    },
    account.identity.birthPlace && {
      label: "Lieu de naissance",
      value: account.identity.birthPlace,
    },
    account.identity.ine && {
      label: "INE",
      value: account.identity.ine,
    },
    account.identity.boursier && {
      label: "Boursier",
      value: "Oui",
    },
    account.identity.email && {
      label: "Email",
      value: account.identity.email[0],
    },
    account.identity.phone && {
      label: "Téléphone",
      value: account.identity.phone[0],
    },
    account.identity.address && {
      label: "Adresse",
      value: `${account.identity.address.street}, ${account.identity.address.zipCode} ${account.identity.address.city}`,
    },
  ].filter(Boolean) as { label: string, value: string }[
  ] : [];

  const [showIdentity, setShowIdentity] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 44}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 16 + insets.bottom,
        }}
      >

        <NativeListHeader
          label="Photo de profil"
        />

        <NativeList>
          <NativeItem
            chevron={true}
            onPress={() => updateProfilePic()}
            leading={profilePic &&
              <Image
                source={{ uri: profilePic }}
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: 16,
                  // @ts-expect-error : borderCurve is not in the Image style
                  borderCurve: "continuous",
                }}
              />
            }
            icon={!profilePic && <Camera />}
            trailing={
              <ActivityIndicator animating={loadingPic} />
            }
          >
            <NativeText variant="title">
              {profilePic ? "Changer la photo de profil" : "Ajouter une photo de profil"}
            </NativeText>
            {!profilePic ? (
              <NativeText variant="subtitle">
                Personnalise ton compte en ajoutant une photo de profil.
              </NativeText>
            ) : (
              <NativeText variant="subtitle">
                Ta photo de profil reste sur ton appareil.
              </NativeText>
            )}
          </NativeItem>

          {profilePic && (
            <NativeItem
              chevron={false}
              onPress={resetProfilePic}
              icon={<Camera />}
            >
              <NativeText variant="title">
                Réinitialiser la photo de profil
              </NativeText>
              <NativeText variant="subtitle">
                Supprime la photo actuelle et rétablit l'image par défaut.
              </NativeText>
            </NativeItem>
          )}
        </NativeList>

        <NativeListHeader
          label="Prénom et nom"
        />

        <NativeList>

          <NativeItem
            onPress={() => firstNameRef.current?.focus()}
            chevron={false}
            icon={<User2 />}
          >
            <NativeText variant="subtitle">
              Prénom
            </NativeText>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Théo"
              placeholderTextColor={theme.colors.text + "80"}
              value={firstName}
              onChangeText={setFirstName}
              ref={firstNameRef}
            />
          </NativeItem>

          <NativeItem
            onPress={() => lastNameRef.current?.focus()}
            chevron={false}
            icon={<TextCursorInput />}
          >
            <NativeText variant="subtitle">
              Nom de famille
            </NativeText>
            <TextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Dubois"
              placeholderTextColor={theme.colors.text + "80"}
              value={lastName}
              onChangeText={setLastName}
              ref={lastNameRef}
            />
          </NativeItem>

        </NativeList>

        <NativeListHeader
          label="Afficher sur l'accueil"
        />

        <NativeList>
          <NativeItem
            chevron={false}
            icon={<WholeWord />}
            trailing={
              <Switch
                value={!hideNameOnHomeScreen}
                onValueChange={() => setHideNameOnHomeScreen(!hideNameOnHomeScreen)}
                trackColor={{false: theme.colors.border, true: theme.colors.primary}}
                thumbColor={theme.colors.background}
              />
            }
          >
            <NativeText style={{
              fontSize: 16,
              fontFamily: "semibold",
              color: theme.colors.text,
            }}>
              Nom de famille
            </NativeText>
          </NativeItem>

          <NativeItem
            chevron={false}
            icon={<UserCircle2 />}
            trailing={
              <Switch
                value={!hideProfilePicOnHomeScreen}
                onValueChange={() => setHideProfilePicOnHomeScreen(!hideProfilePicOnHomeScreen)}
                trackColor={{false: theme.colors.border, true: theme.colors.primary}}
                thumbColor={theme.colors.background}
              />
            }
          >
            <NativeText style={{
              fontSize: 16,
              fontFamily: "semibold",
              color: theme.colors.text,
            }}>
              Photo de profil
            </NativeText>
          </NativeItem>
        </NativeList>

        {Object.keys(account.identity ?? {})?.length > 0 && (
          <NativeListHeader
            label="Informations d'identité"
            trailing={
              <TouchableOpacity
                onPress={() => setShowIdentity(!showIdentity)}
              >
                {showIdentity ?
                  <ChevronUp
                    size={24}
                    color={theme.colors.primary}
                  /> :
                  <ChevronDown
                    size={24}
                    color={theme.colors.primary}
                  />
                }
              </TouchableOpacity>
            }
          />
        )}

        {showIdentity && (
          <NativeList>
            {identityData.map((item, index) => (
              <NativeItem
                key={"identityData_"+index}
                onPress={async () => {
                  await Clipboard.setStringAsync(item.value);
                  showAlert({
                    title: "Copié",
                    message: "L'information a été copiée dans le presse-papier.",
                    icon: <ClipboardCopy />,
                  });
                }}
                chevron={false}
              >
                <NativeText variant="subtitle">
                  {item.label}
                </NativeText>
                <NativeText variant="body">
                  {item.value}
                </NativeText>
              </NativeItem>
            ))}
          </NativeList>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsProfile;
