import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { useTheme } from "@react-navigation/native";
import { BadgeInfo, BadgeX, Calendar, CalendarOff, ClipboardCopy, Info, QrCode, Undo2, X } from "lucide-react-native";
import React, { useEffect } from "react";
import { Modal, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

import * as Clipboard from "expo-clipboard";

import { CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { fetchIcalData } from "@/services/local/ical";
import {Screen} from "@/router/helpers/types";
import { useAlert } from "@/providers/AlertProvider";

const ical = require("cal-parser");

const LessonsImportIcal: Screen<"LessonsImportIcal"> = ({ route, navigation }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const defaultIcal = route.params?.ical || "";
  const defaultTitle = route.params?.title || "";
  const autoAdd = route.params?.autoAdd || false;

  const account = useCurrentAccount(store => store.account!);
  const timetables = useTimetableStore(store => store.timetables);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const [url, setUrl] = React.useState(defaultIcal);
  const [title, setTitle] = React.useState(defaultTitle);

  const [cameraVisible, setCameraVisible] = React.useState(false);

  const scanIcalQRCode = async () => {
    setCameraVisible(true);
  };

  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (!account.instance) return;
    if (defaultIcal && autoAdd) {
      if(account.personalization.icalURLs?.filter(u => u.url === defaultIcal).length === 0) {
        saveIcal().then(() => {
          if (autoAdd) {
            navigation.goBack();
            navigation.navigate("Lessons");
          }
        });
      }
      else {
        navigation.goBack();
      }
    }
  }, [defaultIcal]);

  const { showAlert } = useAlert();

  const saveIcal = async () => {
    setLoading(true);
    const oldUrls = account.personalization.icalURLs || [];

    await fetch(url)
      .then(response => response.text())
      .then(text => {
        const parsed = ical.parseString(text);
        let newParsed = parsed;
        newParsed.events = [];

        const defaultTitle = "Mon calendrier" + (oldUrls.length > 0 ? ` ${oldUrls.length + 1}` : "");

        mutateProperty("personalization", {
          ...account.personalization,
          icalURLs: [...oldUrls, {
            name: title.trim().length > 0 ? title : defaultTitle,
            url,
          }]
        });

        fetchIcalData(account);
      })
      .catch(() => {
        showAlert({
          title: "Erreur",
          message: "Impossible de récupérer les données du calendrier. Vérifie l'URL et réessaye.",
          icon: <BadgeX />,
        });
      })
      .finally(() => {
        setLoading(false);
      });

    return;
  };

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingTop: 0,
      }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Modal
        visible={cameraVisible}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setCameraVisible(false)}
      >
        <TouchableOpacity
          onPress={() => setCameraVisible(false)}
          style={{
            padding: 8,
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 999,
            borderRadius: 100,
            backgroundColor: "#ffffff39",
            opacity: 1,
          }}
        >
          <X size={20} strokeWidth={2.5} color={"#fff"} />
        </TouchableOpacity>

        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 10,
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
        }}>
          <View style={{
            width: 260,
            maxWidth: "90%",
            aspectRatio: 1,
            borderWidth: 3,
            borderColor: "#fff",
            borderRadius: 8,
          }}/>
        </View>

        <CameraView
          style={{
            flex: 1,
          }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={({ data }) => {
            setUrl(data);
            setCameraVisible(false);
          }}
        />
      </Modal>

      <NativeList>
        <NativeItem
          icon={<Info />}
        >
          <NativeText variant="subtitle">
            Les liens iCal permettent d'importer des calendriers en temps réel depuis un agenda compatible.
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Utiliser un lien iCal" />

      <NativeList>
        <NativeItem
          trailing={
            <TouchableOpacity
              style={{
                marginRight: 8,
              }}
              onPress={() => scanIcalQRCode()}
            >
              <QrCode
                size={24}
                color={theme.colors.primary}
              />
            </TouchableOpacity>
          }
        >
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="Adresse URL du calendrier"
            placeholderTextColor={theme.colors.text + 50}
            style={{
              flex: 1,
              paddingHorizontal: 6,
              paddingVertical: 0,
              fontFamily: "medium",
              fontSize: 16,
              color: theme.colors.text,
            }}
          />
        </NativeItem>
      </NativeList>

      <ButtonCta
        value="Importer"
        icon={loading ?
          <View>
            <PapillonSpinner
              strokeWidth={3}
              size={22}
              color={theme.colors.text}
            />
          </View>: undefined
        }
        primary={!loading}
        style={{
          marginTop: 16,
        }}
        onPress={() => {saveIcal();}}
      />

      {account.personalization.icalURLs && account.personalization.icalURLs.length > 0 &&(<>
        <NativeListHeader label="URLs ajoutées" />

        <NativeList>
          {account.personalization.icalURLs.map((url, index) => (
            <NativeItem
              key={index}
              icon={<Calendar />}
              onPress={() => {
                showAlert({
                  title: url.name,
                  message: url.url,
                  icon: <BadgeInfo />,
                  actions: [
                    {
                      title: "Annuler",
                      icon: <Undo2 />,
                    },
                    {
                      title: "Copier l'URL",
                      icon: <ClipboardCopy />,
                      onPress: () => {
                        Clipboard.setString(url.url);
                        showAlert({
                          title: "Copié",
                          message: "L'URL a été copiée dans le presse-papiers.",
                          icon: <ClipboardCopy />,
                        });
                      },
                      primary: true,
                      backgroundColor: theme.colors.primary,
                    },
                    {
                      title: "Supprimer le calendrier",
                      icon: <CalendarOff />,
                      onPress: () => {
                        useTimetableStore.getState().removeClassesFromSource("ical://"+url.url);
                        const urls = account.personalization.icalURLs || [];
                        urls.splice(index, 1);
                        mutateProperty("personalization", {
                          ...account.personalization,
                          icalURLs: urls,
                        });
                      },
                      danger: true,
                      delayDisable: 3,
                    }
                  ]
                });
              }}
            >
              <NativeText variant="title">{url.name}</NativeText>
              <NativeText variant="subtitle">{url.url}</NativeText>
            </NativeItem>
          ))}
        </NativeList>
      </>)}

    </ScrollView>
  );
};

export default LessonsImportIcal;
