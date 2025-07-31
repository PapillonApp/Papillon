import {
  NativeItem,
  NativeList,
  NativeListHeader,
  NativeText
} from "@/components/Global/NativeComponents";
import type {Screen} from "@/router/helpers/types";
import {
  View,
  ScrollView,
  Image,
  Switch,
  Platform,
  Modal,
} from "react-native";
import React from "react";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {
  BadgeX,
  Calendar,
  Camera, Carrot, Clock,
  Code, Cog,
  Folder,
  Globe, Images, LockKeyhole,
  MapPin,
  Newspaper,
  PieChart,
  Terminal,
  TriangleAlert,
  User,
  UserCog,
} from "lucide-react-native";
import {get_addons_list} from "@/addons/addons";
import {PressableScale} from "react-native-pressable-scale";
import * as Linking from "expo-linking";
import * as FileSystem from "expo-file-system";
import {AddonManifest} from "@/addons/types";
import { useAlert } from "@/providers/AlertProvider";

const SettingsAddons: Screen<"SettingsAddons"> = () => {
  let [ opened, setOpened ] = React.useState(false);
  let [ storageAddons , setStorageAddons ] = React.useState<Array<AddonManifest>>([]);
  let [ selectedAddons, setSelectedAddons] = React.useState<AddonManifest>({
    author: "",
    development: false,
    domains: [],
    license: "",
    minAppVersion: "",
    permissions: [],
    placement: [],
    screenshot: [],
    version: "",
    name: "",
    description: "",
    icon: "",
    error: ""
  });

  React.useEffect(() => {
    get_addons_list().then(r => {
      setStorageAddons(r);
    });
  }, []);

  const insets = useSafeAreaInsets();
  const { showAlert } = useAlert();

  return (
    <View>
      <Modal
        animationType="slide"
        visible={opened}
        onRequestClose={() => setOpened(false)}
        presentationStyle="pageSheet"
      >
        <View style={{
          backgroundColor: "#FFFFFFF4",
          height: 23,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 100,
        }}>
          <View style={{
            backgroundColor: "#00000015",
            height: 5,
            width: 50,
            borderRadius: 5,
          }}></View>
        </View>
        <ScrollView style={{
          flex: 1,
        }}>
          <View style={{display: "flex", gap: 20, paddingTop: 23}}>
            <View style={{backgroundColor: "#BE0B0010", padding: 10, margin: 16, borderRadius: 10, display: "flex", flexDirection: "row", alignItems: "center", gap: 10}}>
              <TriangleAlert size={32} color={"#BE0B00"}/>
              <View style={{flex: 1}}>
                <NativeText variant={"title"} style={{flex: 1}}>Cette extension n'est pas signé</NativeText>
                <NativeText variant={"subtitle"} style={{flex: 1}}>Les extensions non signées ne sont pas vérifiées par nos équipes. Tu es responsable de l'installation de celle-ci.</NativeText>
              </View>
            </View>
            <View style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 16,
              gap: 5,
              paddingHorizontal: 16
            }}>
              <Image
                source={selectedAddons.icon == "" ? require("../../../assets/images/addon_default_logo.png"): {uri: selectedAddons.icon}}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "#00000015",
                  marginBottom: 16,
                }}
              />
              <NativeText variant="title" style={{fontSize: 22}}>
                {selectedAddons.name}
              </NativeText>
              <NativeText variant="subtitle" style={{width: "100%", textAlign: "center"}}>
                {"v" + selectedAddons.version + " - " + (selectedAddons.license == "" ? "Licence non précisé": selectedAddons.license)}
              </NativeText>
              <PressableScale
                onPress={() => {
                  Linking.openURL("https://github.com/" + selectedAddons.author);
                }}
                style={{
                  padding: 8,
                  paddingHorizontal: 15,
                  backgroundColor: "#00000015",
                  borderRadius: 100,
                  marginTop: 10,
                }}
              >
                <NativeText variant="subtitle" style={{width: "100%", textAlign: "center"}}>
                  {"par @" + selectedAddons.author}
                </NativeText>
              </PressableScale>
            </View>
            <View>
              <NativeText variant="title" style={{fontSize: 18, paddingHorizontal: 16}}>
                Capture d’écran
              </NativeText>
              <ScrollView horizontal={true} style={{marginTop: 10}} snapToInterval={130} showsHorizontalScrollIndicator={false}>
                <View style={{display: "flex", gap: 10, flexDirection: "row", paddingHorizontal: 16}}>
                  {selectedAddons.screenshot.map((screenshot, index) => (
                    <Image
                      key={index}
                      source={{uri: screenshot}}
                      style={{
                        width: 120,
                        height: 250,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#00000015",
                      }}
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
            <View style={{paddingHorizontal: 16}}>
              <NativeText variant="title" style={{fontSize: 18, marginBottom: 10}}>
                Description
              </NativeText>
              <NativeText variant="subtitle">
                {selectedAddons.description}
              </NativeText>
            </View>
            <View style={{paddingHorizontal: 16}}>
              <NativeText variant="title" style={{fontSize: 18, marginBottom: 10}}>
                Autorisations
              </NativeText>
              <NativeList style={{marginTop: 0}}>
                {selectedAddons.permissions.map((permission, index) => (
                  <NativeItem
                    key={"perm_" + index}
                    leading={
                      permission.name == "PERM_APP_CAMERA" ? <Camera color={"#000"} size={24}/>:
                        permission.name == "PERM_APP_PHOTOS" ? <Images color={"#000"} size={24}/>:
                          permission.name == "PERM_APP_LOCATION" ? <MapPin color={"#000"} size={24}/>:
                            permission.name == "PERM_EDIT_PREFERENCES" ? <Cog color={"#000"} size={24}/>:
                              permission.name == "PERM_EDIT_STUDENT_INFO" ? <UserCog color={"#000"} size={24}/>:
                                permission.name == "PERM_SCHOOLDATA_CALENDAR" ? <Calendar color={"#000"} size={24}/>:
                                  permission.name == "PERM_SCHOOLDATA_AUTH" ? <LockKeyhole color={"#BE0B00"} size={24}/>:
                                    permission.name == "PERM_SCHOOLDATA_GRADES" ? <PieChart color={"#000"} size={24}/>:
                                      permission.name == "PERM_SCHOOLDATA_NEWS" ? <Newspaper color={"#000"} size={24}/>:
                                        permission.name == "PERM_SCHOOLDATA_TIMETABLE" ? <Clock color={"#000"} size={24}/>:
                                          permission.name == "PERM_STUDENT_INFO" ? <User color={"#000"} size={24}/>:
                                            permission.name == "PERM_APP_LOGS" ? <Terminal color={"#000"} size={24}/>:
                                              permission.name == "PERM_SCHOOLDATA_SELF" ? <Carrot color={"#000"} size={24}/>:
                                                <Code color={"#000"} size={24}/>
                    }
                  >
                    <NativeText variant="title" style={permission.name == "PERM_SCHOOLDATA_AUTH" && {color: "#BE0B00"}}>
                      {
                        permission.name == "PERM_APP_CAMERA" ? "Accès à la caméra":
                          permission.name == "PERM_APP_PHOTOS" ? "Accès aux photos":
                            permission.name == "PERM_APP_LOCATION" ? "Accès à la localisation":
                              permission.name == "PERM_EDIT_PREFERENCES" ? "Modifier les préférences de l'application":
                                permission.name == "PERM_EDIT_STUDENT_INFO" ? "Modifier les informations de l'élève":
                                  permission.name == "PERM_SCHOOLDATA_CALENDAR" ? "Accèder au calendrier de l'élève":
                                    permission.name == "PERM_SCHOOLDATA_AUTH" ? "Accéder aux données d'authentification de ton compte principal (DANGEREUX)":
                                      permission.name == "PERM_SCHOOLDATA_GRADES" ? "Accéder aux notes de l'élève":
                                        permission.name == "PERM_SCHOOLDATA_NEWS" ? "Accéder aux actualités de l'établissement":
                                          permission.name == "PERM_SCHOOLDATA_TIMETABLE" ? "Accéder à l'emploi du temps de l'élève":
                                            permission.name == "PERM_STUDENT_INFO" ? "Accéder au informations de l'élève":
                                              permission.name == "PERM_APP_LOGS" ? "Accéder aux logs de l'application":
                                                permission.name == "PERM_SCHOOLDATA_SELF" ? "Accéder aux informations de repas de l'élève":
                                                  "Permission introuvable : " + permission.name
                      }
                    </NativeText>
                    <NativeText variant="subtitle">
                      {(permission.name == "PERM_SCHOOLDATA_AUTH" ? "Cette autorisation transmet à l'extension les jetons de connexion vers tes services. Avec ceci, l'extension peut exécuter n'importe quelle action. Sois prudent.\n\n":"") + permission.reason}
                    </NativeText>
                  </NativeItem>
                ))}
                {selectedAddons.domains.map((domain, index) => (
                  <NativeItem
                    key={"domain_" + index}
                    leading={
                      <Globe size={24} color={"#000"}/>
                    }
                  >
                    <NativeText variant="title">
                      {"Faire des requetes à \n" + domain.domain}
                    </NativeText>
                    <NativeText variant="subtitle">
                      {domain.reason}
                    </NativeText>
                  </NativeItem>
                ))}
              </NativeList>
            </View>
          </View>
        </ScrollView>
        <View style={{padding: 16, marginBottom: insets.bottom, backgroundColor: "#FFFFFFFA"}}>
          <ButtonCta
            value="Désinstaller"
          />
        </View>
      </Modal>
      <ScrollView style={{
        paddingTop: 0,
        padding: 16,
      }}>
        <NativeList>
          <View
            style={{
              height: 120,
              backgroundColor: "#66C1FF",
            }}
          />
          <NativeItem>
            <NativeText variant="title">
              Extensions
            </NativeText>
            <NativeText variant="subtitle">
              Ajoute des fonctions externes à Papillon.
            </NativeText>
          </NativeItem>
        </NativeList>
        <NativeListHeader label={"Installée"}/>
        <NativeList>
          {storageAddons.map((addon, index) => (
            <NativeItem
              key={index}
              onPress={addon.error ? () => {} : () => {
                setSelectedAddons(addon);
                setOpened(true);
              }}
              leading={
                <Image
                  source={addon.icon == "" ? require("../../../assets/images/addon_default_logo.png"): {uri: addon.icon}}
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: "#00000015",
                    opacity: addon.error ? 0.5 : 1,
                  }}
                />
              }
              trailing={addon.error && (
                <PressableScale
                  onPress={() => {
                    showAlert({
                      title: `Impossible de charger le plugin "${addon.name}"`,
                      message: addon.error ?? "Erreur inconnue",
                      icon: <BadgeX />,
                    });
                  }}
                >
                  <TriangleAlert
                    size={24}
                    color={"#BE0B00"}
                    style={{marginRight: 5}}
                  />
                </PressableScale>
              )}
            >
              <NativeText variant="title" numberOfLines={1} style={{opacity: addon.error ? 0.5 : 1}}>
                {addon.name}
              </NativeText>
              <NativeText variant="subtitle" numberOfLines={1}>
                {addon.description ? (addon.description.replaceAll(" ", "") !== "" ? addon.description: "Aucune description") : "Aucune description"}
              </NativeText>
            </NativeItem>
          ))}
          {
            Platform.OS == "ios" && (
              <NativeItem
                leading={
                  <Folder size={24} color={"#000"}/>
                }
                onPress={() => {
                  Linking.openURL(FileSystem.documentDirectory?.replace("file", "shareddocuments") + "addons");
                }}
              >
                <NativeText variant="title">
                  Ouvrir le dossier des extensions
                </NativeText>
              </NativeItem>
            )
          }
        </NativeList>
        <NativeListHeader label={"Soutenu par l’équipe Papillon"}/>
        <NativeList>
          <NativeItem leading={
            <Image
              source={require("../../../assets/images/addon_default_logo.png")}
              style={{
                width: 46,
                height: 46,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#00000015",
              }}
            />
          }>
            <NativeText variant="title" numberOfLines={1}>
              Demo plugin
            </NativeText>
            <NativeText variant="subtitle" numberOfLines={1}>
              Use this plugin to learn how Papillon extension works.
            </NativeText>
          </NativeItem>
        </NativeList>
        <NativeListHeader label={"Avancé"}/>
        <NativeList>
          <NativeItem
            trailing={
              <Switch></Switch>
            }
          >
            <NativeText variant="title">
              Autoriser les sources peu fiables
            </NativeText>
            <NativeText variant="subtitle">
              Attention, cela peut être dangereux pour ton appareil.
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </View>
  );
};

export default SettingsAddons;