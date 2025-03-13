import React, {useRef, useState} from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  TextInput,
  View
} from "react-native";
import {useTheme} from "@react-navigation/native";
import type {Screen} from "@/router/helpers/types";
import {NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {BadgeHelp, Camera, ChevronDown, CircleAlert, TextCursorInput, Trash2, Type, Undo2, User2} from "lucide-react-native";
import {useAccounts} from "@/stores/account";
import {AccountService, PrimaryAccount} from "@/stores/account/types";
import * as ImagePicker from "expo-image-picker";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useMultiService} from "@/stores/multiService";
import {MultiServiceFeature} from "@/stores/multiService/types";
import LottieView from "lottie-react-native";
import {anim2Papillon} from "@/utils/ui/animations";
import Reanimated, {FadeOut, ZoomIn} from "react-native-reanimated";
import PapillonBottomSheet from "@/components/Modals/PapillonBottomSheet";
import * as Haptics from "expo-haptics";
import AccountItem from "@/components/Global/AccountItem";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const SettingsMultiServiceSpace: Screen<"SettingsMultiServiceSpace"> = ({ navigation, route }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const space = route.params.space;
  const accounts = useAccounts();
  const availableAccounts = accounts.accounts.filter(account => !account.isExternal && !(account.service == AccountService.PapillonMultiService));
  const deleteMultiServiceSpace = useMultiService(store => store.remove);
  const updateMultiServiceSpace = useMultiService(store => store.update);
  const setMultiServiceSpaceAccountFeature = useMultiService(store => store.setFeatureAccount);
  const { playHaptics } = useSoundHapticsWrapper();

  const linkedAccount = accounts.accounts.find(account => account.localID === space.accountLocalID) as PrimaryAccount | undefined;

  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const spaceNameRef = useRef<TextInput>(null);

  const [firstName, setFirstName] = useState(linkedAccount?.studentName?.first ?? "");
  const [lastName, setLastName] = useState(linkedAccount?.studentName?.last ?? "");
  const [spaceName, setSpaceName] = useState(space.name);

  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<null | string>(null);
  const selectPicture = async () => {
    setLoadingImage(true);

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      const img = "data:image/jpeg;base64," + result.assets[0].base64;
      updateMultiServiceSpace(space.accountLocalID, "image", img);
      // @ts-expect-error
      accounts.update(space.accountLocalID, "personalization", {
        profilePictureB64: img
      });
      setSelectedImage(img);
    }

    setLoadingImage(false);
  };

  const [accountSelectorOpened, setAccountSelectorOpened] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<PrimaryAccount | null>(null);
  const [featureSelection, setFeatureSelection] = useState<MultiServiceFeature>(MultiServiceFeature.Grades);
  const [featureSelectionName, setFeatureSelectionName] = useState<string>("");

  const { showAlert } = useAlert();

  const deleteSpace = () => {
    showAlert({
      title: "Es-tu sûr ?",
      message: "Cette action entrainera la suppression de ton espace multi-service.",
      icon: <BadgeHelp />,
      actions: [
        {
          title: "Annuler",
          icon: <Undo2 />,
          primary: false,
        },
        {
          title: "Confirmer",
          icon: <Trash2 />,
          onPress: () => {
            accounts.remove(space.accountLocalID);
            deleteMultiServiceSpace(space.accountLocalID);
            navigation.goBack();
          },
          danger: true,
          delayDisable: 5,
        }
      ]
    });
  };

  const openAccountSelector = (feature: MultiServiceFeature, name: string) => {
    setSelectedAccount(availableAccounts.find(account => account.localID === space.featuresServices[feature]) || null);
    setFeatureSelection(feature);
    setFeatureSelectionName(name);
    setAccountSelectorOpened(true);
  };

  const setAccountFeature = (account: PrimaryAccount | undefined, feature: MultiServiceFeature) => {
    const currentSelectedAccountID = space.featuresServices[feature];
    setMultiServiceSpaceAccountFeature(space.accountLocalID, feature, account);
    let linkedAccountsIds = [...(linkedAccount?.associatedAccountsLocalIDs || [])];
    if (account) {
      // Putting the space's associated accounts ids in linkedExternalLocalIDs permits the reload of their instance / authentication fields (like externals accounts)
      linkedAccountsIds.push(account.localID);
      linkedAccountsIds = linkedAccountsIds.filter((value, index) => linkedAccountsIds.indexOf(value) === index); // Remove duplicates
    } else {
      // If feature's service has been removed and service is not assigned to other feature, we remove it from "associatedAccountsLocalIDs"
      const accountNoMoreUsed = !Object.keys(space.featuresServices).some(key =>
        (space.featuresServices[key as MultiServiceFeature] == currentSelectedAccountID && !((key as MultiServiceFeature) === feature))
      );
      if (accountNoMoreUsed) {
        linkedAccountsIds = linkedAccountsIds.filter(localID => localID != currentSelectedAccountID);
      }
    }
    // @ts-expect-error
    accounts.update(space.accountLocalID, "associatedAccountsLocalIDs", linkedAccountsIds);
    setAccountSelectorOpened(false);
    setSelectedAccount(null);
  };

  const lottieRef = React.useRef<LottieView>(null);

  const features = [
    {
      name: "Notes",
      feature: MultiServiceFeature.Grades,
      icon: require("@/../assets/lottie/tab_chart.json")
    },
    {
      name: "Compétences",
      feature: MultiServiceFeature.Evaluations,
      icon: require("@/../assets/lottie/tab_evaluations.json")
    },
    {
      name: "Emploi du temps",
      feature: MultiServiceFeature.Timetable,
      icon: require("@/../assets/lottie/tab_calendar.json")
    },
    {
      name: "Devoirs",
      feature: MultiServiceFeature.Homeworks,
      icon: require("@/../assets/lottie/tab_book_2.json")
    },
    {
      name: "Vie scolaire",
      feature: MultiServiceFeature.Attendance,
      icon: require("@/../assets/lottie/tab_check.json")
    },
    {
      name: "Actualités",
      feature: MultiServiceFeature.News,
      icon: require("@/../assets/lottie/tab_news.json")
    },
    {
      name: "Discussions",
      feature: MultiServiceFeature.Chats,
      icon: require("@/../assets/lottie/tab_chat.json")
    }
  ];

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 44}>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 16 + insets.bottom,
        }}
      >

        <NativeListHeader
          label="Image"
        />

        <NativeList>
          <NativeItem
            key={0}
            chevron={true}
            onPress={() => selectPicture()}
            leading={(selectedImage || space.image) &&
              <Image
                source={{ uri: selectedImage || space.image }}
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: 90,
                  // @ts-expect-error : borderCurve is not in the Image style
                  borderCurve: "continuous",
                }}
              />
            }
            icon={!(selectedImage || space.image) && <Camera />}
            trailing={
              <ActivityIndicator animating={loadingImage} />
            }
          >
            <NativeText variant="title">
              {selectedImage ? "Changer la photo" : "Ajouter une photo"}
            </NativeText>
            {!selectedImage ? (
              <NativeText variant="subtitle">
                Personnalise ton espace en ajoutant une photo.
              </NativeText>
            ) : (
              <NativeText variant="subtitle">
                La photo de l'espace reste sur votre appareil.
              </NativeText>
            )}
          </NativeItem>
        </NativeList>

        <NativeListHeader
          label="Titre de l'espace"
        />

        <NativeList>

          <NativeItem
            key={0}
            onPress={() => spaceNameRef.current?.focus()}
            chevron={false}
            icon={<Type />}
          >
            <NativeText variant="subtitle">
              Titre
            </NativeText>
            <ResponsiveTextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Mon super espace"
              placeholderTextColor={theme.colors.text + "80"}
              value={spaceName}
              onChangeText={(text: string) => {
                updateMultiServiceSpace(space.accountLocalID, "name", text);
                // @ts-expect-error
                accounts.update(space.accountLocalID, "identityProvider", {
                  name: text
                });
                setSpaceName(text);
              }}
              ref={spaceNameRef}
            />
          </NativeItem>


        </NativeList>

        <NativeListHeader
          label="Profil de l'espace"
        />

        <NativeList>

          <NativeItem
            key={0}
            onPress={() => firstNameRef.current?.focus()}
            chevron={false}
            icon={<User2 />}
          >
            <NativeText variant="subtitle">
              Prénom
            </NativeText>
            <ResponsiveTextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Théo"
              placeholderTextColor={theme.colors.text + "80"}
              value={firstName}
              onChangeText={(text: string) => {
                // @ts-expect-error
                accounts.update(space.accountLocalID, "studentName", {
                  first: text,
                  last: lastName
                });
                setFirstName(text);
              }}
              ref={firstNameRef}
            />
          </NativeItem>

          <NativeItem
            key={1}
            onPress={() => lastNameRef.current?.focus()}
            chevron={false}
            icon={<TextCursorInput />}
          >
            <NativeText variant="subtitle">
              Nom de famille
            </NativeText>
            <ResponsiveTextInput
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
              }}
              placeholder="Dubois"
              placeholderTextColor={theme.colors.text + "80"}
              value={lastName}
              onChangeText={(text: string) => {
                // @ts-expect-error
                accounts.update(space.accountLocalID, "studentName", {
                  first: firstName,
                  last: text
                });
                setLastName(text);
              }}
              ref={lastNameRef}
            />
          </NativeItem>
        </NativeList>
        <NativeText
          style={{
            paddingLeft: 7,
            paddingTop: 15
          }}
          variant="subtitle"
        >
          Accède à plus d'options en sélectionnant l'espace virtuel, et en personnalisant ton profil dans les paramètres.
        </NativeText>

        <NativeListHeader label="Configuration" />
        <NativeList>
          {features.map((feature, index) => (
            <>
              <NativeItem
                key={index * 2}
                icon={
                  <Reanimated.View
                    entering={anim2Papillon(ZoomIn)}
                    exiting={anim2Papillon(FadeOut)}
                    style={[
                      {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.colors.primary + "22",
                        borderRadius: 8,
                        borderCurve: "continuous",
                      },
                    ]}
                  >
                    <LottieView
                      ref={lottieRef}
                      source={feature.icon}
                      colorFilters={[{
                        keypath: "*",
                        color: theme.colors.primary,
                      }]}
                      style={[
                        {
                          width: 30,
                          height: 30,
                        }
                      ]}
                    />
                  </Reanimated.View>}
                onPress={() => openAccountSelector(feature.feature, feature.name)}
                trailing={<ChevronDown color={theme.colors.primary}/>}
                chevron={false}
              >
                <NativeText variant="title">{feature.name}</NativeText>
              </NativeItem>
              {accounts.accounts.find(account =>
                account.localID === space.featuresServices[feature.feature]) ?
                (
                  <AccountItem
                    account={accounts.accounts.find(
                      account => account.localID === space.featuresServices[feature.feature]) as PrimaryAccount}
                    endCheckMark={false}
                    additionalStyles={{
                      paddingStart: 10,
                      borderBottomWidth: 1,
                      backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                      borderColor: theme.colors.text + "20"
                    }}
                  />
                ) :
                (
                  <NativeItem
                    key={index * 2 + 1}
                    icon={<CircleAlert />}
                    separator={true}
                  >
                    <NativeText>Pas de service sélectionné</NativeText>
                  </NativeItem>
                )}
            </>
          ))}
        </NativeList>

        <PapillonBottomSheet opened={accountSelectorOpened} setOpened={opened => setAccountSelectorOpened(opened)}>
          <View
            style={{
              paddingHorizontal: 10
            }}
          >
            <NativeListHeader label={`Sélectionner un service pour "${featureSelectionName}"`}/>
            <NativeList>
              {availableAccounts.map((account, index) => (
                <Pressable
                  key={index}
                  onPress={() => {
                    playHaptics("impact", {
                      impact: Haptics.ImpactFeedbackStyle.Soft,
                    });
                    setAccountFeature(account, featureSelection);
                  }}
                >
                  <AccountItem
                    account={account}
                    additionalStyles={{
                      backgroundColor: selectedAccount?.localID === account.localID ? (theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11"): theme.colors.background,
                      borderBottomWidth: index !== availableAccounts.length - 1 ? 1 : 0,
                      borderColor: theme.colors.text + "20",
                    }}
                    endCheckMark={selectedAccount?.localID === account.localID}
                  />
                </Pressable>
              ))}
              {/*setAccountFeature*/}
            </NativeList>
            <ButtonCta
              style={{
                marginTop: 25
              }}
              primary={false}
              value="Réinitialiser"
              onPress={() => setAccountFeature(undefined, featureSelection)}
            />
          </View>
        </PapillonBottomSheet>

        <NativeListHeader label="Actions" />
        <NativeList>
          <NativeItem
            onPress={() => deleteSpace()}
            leading={
              <Trash2 color="#CF0029" />
            }
          >
            <NativeText variant="title">
              Supprimer
            </NativeText>
            <NativeText variant="subtitle">
              Supprimer l'environnement
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};



export default SettingsMultiServiceSpace;
