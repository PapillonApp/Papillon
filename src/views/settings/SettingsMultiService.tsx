import React, {useRef, useState} from "react";
import { Image, ScrollView, Switch, TextInput, View} from "react-native";
import {useTheme} from "@react-navigation/native";
import type {Screen} from "@/router/helpers/types";
import MultiServiceContainerCard from "@/components/Settings/MultiServiceContainerCard";
import {NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import {BadgeInfo, Check, ImageIcon, PlugZap, Plus, ShieldAlert, Type, Undo2} from "lucide-react-native";
import {useAccounts, useCurrentAccount} from "@/stores/account";
import {useMultiService} from "@/stores/multiService";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import * as ImagePicker from "expo-image-picker";
import {animPapillon} from "@/utils/ui/animations";
import {ZoomIn, ZoomOut} from "react-native-reanimated";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import {MultiServiceSpace} from "@/stores/multiService/types";
import {AccountService, PapillonMultiServiceSpace} from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import {defaultProfilePicture} from "@/utils/ui/default-profile-picture";
import {defaultTabs} from "@/consts/DefaultTabs";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const SettingsMultiService: Screen<"SettingsMultiService"> = ({ navigation }) => {
  const theme = useTheme();
  const toggleMultiService = useMultiService(store => store.toggleEnabledState);
  const multiServiceEnabled = useMultiService(store => store.enabled);
  const multiServiceSpaces = useMultiService(store => store.spaces);
  const createMultiServiceSpace = useMultiService(store => store.create);
  const deleteMultiServiceSpace = useMultiService(store => store.remove);
  const accounts = useAccounts();
  const currentAccount = useCurrentAccount();

  const [spaceCreationSheetOpened, setSpaceCreationSheetOpened] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const spaceNameRef = useRef<TextInput>(null);

  const [loadingImage, setLoadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<null | string>(null);

  const { showAlert } = useAlert();

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
      setSelectedImage(img);
    }

    setLoadingImage(false);
  };

  const createSpace = () => {
    if (spaceName == "") {
      showAlert({
        title: "Aucun titre défini",
        message: "Tu dois définir un titre à l'environnement multi service pour pouvoir le créer.",
        icon: <BadgeInfo />,
      });
      return;
    }

    const localID = uuid();

    const defaultSpaceTabs = [
      "Home",
      "Lessons",
      "Homeworks",
      "Grades",
      "News",
      "Attendance"
    ] as typeof defaultTabs[number]["tab"][];

    const linkedAccount: PapillonMultiServiceSpace = {
      isExternal: false,
      linkedExternalLocalIDs: [],
      associatedAccountsLocalIDs: [],
      authentication: null,
      identity: {},
      identityProvider: {
        name: spaceName,
        identifier: undefined,
        rawData: undefined
      },
      instance: null,
      localID: localID,
      name: spaceName,
      personalization: {
        profilePictureB64: selectedImage || undefined,
        tabs: defaultTabs
          .filter(current => defaultSpaceTabs.includes(current.tab))
          .map((tab, index) => ({
            name: tab.tab,
            enabled: index <= 4
          }))
      },
      service: AccountService.PapillonMultiService,
      studentName: {
        first: currentAccount.account?.studentName.first || "",
        last: currentAccount.account?.studentName.last || ""
      },

      serviceData: {},
      providers: []
    };

    const space: MultiServiceSpace = {
      accountLocalID: localID,
      featuresServices: {
        grades: undefined,
        timetable: undefined,
        news: undefined,
        homeworks: undefined,
        attendance: undefined
      },
      name: spaceName,
      image: selectedImage || undefined
    };
    createMultiServiceSpace(space, linkedAccount);
    accounts.create(linkedAccount);
    setSpaceCreationSheetOpened(false);
    setSelectedImage(null);
    setSpaceName("");
  };

  const deleteAllSpaces = () => {
    for (const space of multiServiceSpaces) {
      accounts.remove(space.accountLocalID);
      deleteMultiServiceSpace(space.accountLocalID);
    }
  };
  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 15,
        paddingBottom: 25
      }}
    >
      <MultiServiceContainerCard theme={theme} />

      <NativeListHeader label="Options" />
      <NativeList>
        <NativeItem
          trailing={
            <Switch
              value={multiServiceEnabled ?? false}
              onValueChange={() => {
                if (multiServiceEnabled) {
                  showAlert({
                    title: "Attention",
                    message: "La désactivation du multi-service entrainera la suppression de tes environnement multi-services créés.",
                    icon: <ShieldAlert />,
                    actions: [
                      {
                        title: "Annuler",
                        icon: <Undo2 />,
                        primary: false,
                      },
                      {
                        title: "Confirmer",
                        icon: <Check />,
                        onPress: () => {
                          deleteAllSpaces();
                          toggleMultiService();
                        },
                        danger: true,
                        delayDisable: 5,
                      }
                    ]
                  });
                } else {
                  toggleMultiService();
                }
              }}
            />
          }
          leading={
            <NativeIcon
              icon={<PlugZap />}
              color="#1f76ce"
            />
          }
        >
          <NativeText variant="title">
            Multiservice
          </NativeText>
          <NativeText variant="subtitle">
            Activer le multiservice te permet de créer ton premier espace virtuel.
          </NativeText>
        </NativeItem>
      </NativeList>

      {multiServiceEnabled && (
        <>
          <NativeListHeader label="Mes Espaces"/>
          <NativeList>
            {multiServiceSpaces.map((space, index) => (
              <NativeItem
                key={index}
                onPress={() => navigation.navigate("SettingsMultiServiceSpace", { space })}
                leading={
                  <Image
                    source={space.image ?
                      { uri: space.image } :
                      defaultProfilePicture(AccountService.PapillonMultiService, "") }
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 3,
                      // @ts-expect-error : borderCurve is not in the Image style
                      borderCurve: "continuous",
                    }}
                  />
                }
              >
                <NativeText variant="title">
                  {space.name}
                </NativeText>
              </NativeItem>
            ))}
            <NativeItem
              onPress={() => setSpaceCreationSheetOpened(true)}
              icon={<Plus/>}
            >
              <NativeText>
                Nouvel espace
              </NativeText>
              <NativeText variant="subtitle">
                Créer un nouvel environnement multi service
              </NativeText>
            </NativeItem>
          </NativeList>
          <NativeText
            style={{
              paddingTop: 25,
              padding: 10,
              fontFamily: "medium",
              fontSize: 12.5,
              lineHeight: 12,
              color: theme.colors.text + "60"
            }}
            variant="subtitle"
          >
            Cette fonctionnalité est instable et peut engendrer des dysfonctionnements sur les comptes associés.
            Si tu rencontres un problème, déconnecte et reconnecte tes comptes pour retrouver leur fonctionnement normal.
          </NativeText>
          <BottomSheet
            setOpened={(opened) => setSpaceCreationSheetOpened(opened)}
            opened={spaceCreationSheetOpened}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <NativeListHeader label="Créer un espace"/>
            <NativeList>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  gap: 14,
                }}
              >
                <View style={{ flex: 1 }}>
                  <NativeItem
                    onPress={() => spaceNameRef.current?.focus()}
                    chevron={false}
                    icon={<Type/>}
                  >
                    <NativeText>
                      Titre de l'espace
                    </NativeText>
                    <ResponsiveTextInput
                      style={{
                        fontSize: 16,
                        fontFamily: "semibold",
                        color: theme.colors.text,
                      }}
                      placeholder="Mon espace multi service"
                      placeholderTextColor={theme.colors.text + "80"}
                      value={spaceName}
                      onChangeText={setSpaceName}
                      ref={spaceNameRef}
                    />
                  </NativeItem>
                  <NativeItem
                    onPress={() => selectPicture()}
                    icon={loadingImage ? <PapillonSpinner
                      size={18}
                      color="white"
                      strokeWidth={2.8}
                      entering={animPapillon(ZoomIn)}
                      exiting={animPapillon(ZoomOut)}
                    />: <ImageIcon/>}
                    trailing={selectedImage && <Image
                      source={{ uri: selectedImage }}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 90,
                        // @ts-expect-error : borderCurve is not in the Image style
                        borderCurve: "continuous",
                      }}
                    />}
                  >
                    <NativeText>
                      Image
                    </NativeText>
                    <NativeText
                      style={{
                        fontSize: 16,
                        fontFamily: "semibold",
                        color: theme.colors.text + "80",
                      }}
                    >
                      Définir une image
                    </NativeText>
                  </NativeItem>
                </View>
              </View>
            </NativeList>
            <View
              style={{
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingTop: 25,
                paddingBottom: 0,
                paddingHorizontal: 0,
                gap: 10,
              }}
            >
              <ButtonCta
                primary={true}
                onPress={() => createSpace()}
                value="Créer l'espace"
              />
              <ButtonCta
                primary={false}
                value="Annuler"
                onPress={() => setSpaceCreationSheetOpened(false)}
              />
            </View>
          </BottomSheet>
        </>
      )}
    </ScrollView>
  );
};



export default SettingsMultiService;
