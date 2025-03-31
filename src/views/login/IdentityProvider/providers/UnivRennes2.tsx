import React from "react";
import { View } from "react-native";

import { WebView } from "react-native-webview";

function extractStudentDataFromHTML (htmlString: string) {
  const data = {
    title: "",
    identity: {},
    formation: {},
    sesamAccount: {}
  };

  try {
    // Extract title
    const titleMatch = htmlString.match(/<title>(.*?)<\/title>/);
    if (titleMatch) {
      data.title = titleMatch[1].trim();
    }

    // Helper function to extract section data
    function extractSectionData (sectionName: string, dataObject: any) {
      const sectionRegex = new RegExp(`<h3 class="section-h3">${sectionName}[\\s\\S]*?<dl class="well">[\\s\\S]*?<\/dl>`);
      const sectionMatch = htmlString.match(sectionRegex);
      if (sectionMatch) {
        const divRegex = /<div class="information-dl-div">[\s\S]*?<dt[^>]*>(.*?)<\/dt>[\s\S]*?<dd[^>]*>(.*?)<\/dd>[\s\S]*?<\/div>/g;
        let divMatch;
        while ((divMatch = divRegex.exec(sectionMatch[0])) !== null) {
          const key = divMatch[1].replace(/<[^>]*>/g, "").trim();
          const value = divMatch[2].replace(/<[^>]*>/g, "").trim();
          dataObject[key] = value;
        }
      }
    }

    // Extract data for each section
    extractSectionData("Identité", data.identity);
    extractSectionData("Formation", data.formation);
    extractSectionData("Compte Sésame", data.sesamAccount);

  } catch (error) {
    console.error("Error parsing HTML:", error);
  }

  return data;
}

import type { Screen } from "@/router/helpers/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, LocalAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/local/default-personalization";
import uuid from "@/utils/uuid-v4";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

const UnivRennes2_Login: Screen<"UnivRennes2_Login"> = ({ navigation }) => {
  const mainURL = "https://cas.univ-rennes2.fr/login?service=https%3A%2F%2Fservices.univ-rennes2.fr%2Fsesame%2Findex.php%2Flogin%2Fmon-compte-sesame%2Fchanger-mon-mot-de-passe";
  const theme = useTheme();

  const webViewRef = React.useRef<WebView>(null);

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);

  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoadingText, setIsLoadingText] = React.useState("Connexion en cours...");

  const loginUnivData = async (data: any) => {
    if (data !== null) {
      const local_account: LocalAccount = {
        authentication: undefined,
        instance: undefined,

        identityProvider: {
          identifier: "univ-rennes2",
          name: "Université de Rennes 2",
          rawData: data
        },

        providers: ["ical", "moodle"],

        localID: uuid(),
        service: AccountService.Local,

        isExternal: false,
        linkedExternalLocalIDs: [],

        name: data?.identity["Nom"] + " " + data?.identity["Prénom(s)"],
        studentName: {
          first: data?.identity["Prénom(s)"],
          last: data?.identity["Nom"],
        },
        className: "UR2", // TODO ?
        schoolName: data?.formation["Formation"] + " - Université de Rennes 2",

        personalization: await defaultPersonalization(),

        identity: {},
        serviceData: {}
      };

      createStoredAccount(local_account);
      switchTo(local_account);

      queueMicrotask(() => {
        // Reset the navigation stack to the "Home" screen.
        // Prevents the user from going back to the login screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "AccountCreated" }],
        });
      });
    }
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      {isLoading && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.card,
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            gap: 6,
          }}
        >
          <PapillonSpinner
            size={48}
            strokeWidth={5}
            color="#29947a"
            style={{
              marginBottom: 16,
              marginHorizontal: 26,
            }}
          />

          <NativeText variant="title" style={{textAlign: "center"}}>
            Connexion au compte Sésame
          </NativeText>

          <NativeText variant="subtitle" style={{textAlign: "center"}}>
            {isLoadingText}
          </NativeText>
        </View>
      )}

      <WebView
        source={{ uri: mainURL }}
        style={{
          height: "100%",
          width: "100%",
        }}
        ref={webViewRef}
        startInLoadingState={true}
        incognito={true}
        onLoadStart={(e) => {
          if (e.nativeEvent.url === "https://services.univ-rennes2.fr/sesame/index.php/login/mon-compte-sesame/changer-mon-mot-de-passe") {
            setIsLoadingText("Récupération des données...");
            setIsLoading(true);
          }
        }}

        onLoadEnd={(e) => {

          if (e.nativeEvent.url === "https://services.univ-rennes2.fr/sesame/index.php/login/mon-compte-sesame/changer-mon-mot-de-passe") {
            webViewRef.current?.injectJavaScript(`
              window.location.href = "https://services.univ-rennes2.fr/sesame/index.php/mon-compte-sesame";
            `);
          }
          else if (e.nativeEvent.url === "https://services.univ-rennes2.fr/sesame/index.php/mon-compte-sesame") {
            // send all HTML content to the app
            webViewRef.current?.injectJavaScript(`
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "accountHTML",
                data: document.documentElement.outerHTML
              }));
            `);
          }
          else {
            setIsLoading(false);
          }
        }}

        onMessage={(e) => {
          const data = JSON.parse(e.nativeEvent.data);
          if (data.type === "accountHTML") {
            const accountData = extractStudentDataFromHTML(data.data);
            loginUnivData(accountData);
          }
        }}
      />
    </View>
  );
};

export default UnivRennes2_Login;
