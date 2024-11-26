import { NativeText } from "@/components/Global/NativeComponents";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import defaultPersonalization from "@/services/local/default-personalization";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, LocalAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { Alert, Button, View } from "react-native";
import { WebView } from "react-native-webview";
import type { Screen } from "@/router/helpers/types";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";

const capitalizeFirst = (str: string) => {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const BackgroundIUTLannion: Screen<"BackgroundIUTLannion"> = ({ route, navigation }) => {
  const params = route.params;
  let username = params?.username || null;
  let password = params?.password || null;

  const account = useCurrentAccount(store => store.account);

  const url = "https://notes9.iutlan.univ-rennes1.fr/";
  const firstLogin = params?.firstLogin || false;
  const theme = useTheme();

  const [step, setStep] = React.useState("Chargement du portail");

  if(!firstLogin) {
    if(account?.service == AccountService.Local && account.credentials) {
      username = account.credentials.username;
      password = account.credentials.password;
    }
    else {
      navigation.goBack();
    }
  }

  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const useData = async (data: any) => {
    if(firstLogin) {
      await actionFirstLogin(data);
    }
    else {
      mutateProperty("identityProvider", {
        identifier: "iut-lannion",
        name: "IUT de Lannion",
        rawData: data,
      });

      navigation.goBack();
    }
  };

  const actionFirstLogin = async (data: any) => {
    console.log("First login");
    console.log(data);

    const local_account: LocalAccount = {
      authentication: undefined,
      instance: undefined,

      identityProvider: {
        identifier: "iut-lannion",
        name: "IUT de Lannion",
        rawData: data,
      },

      credentials: {
        username: username || "",
        password: password || ""
      },

      localID: uuid(),
      service: AccountService.Local,

      isExternal: false,
      linkedExternalLocalIDs: [],

      name: data["relevé"].etudiant.nom + " " + capitalizeFirst(data["relevé"].etudiant.prenom),
      studentName: {
        first: capitalizeFirst(data["relevé"].etudiant.prenom),
        last: data["relevé"].etudiant.nom
      },
      className: data["relevé"].etudiant.dept_acronym,
      schoolName: "IUT de Lannion - Université de Rennes",

      personalization: await defaultPersonalization()
    };

    createStoredAccount(local_account);
    switchTo(local_account);

    queueMicrotask(() => {
      // Reset the navigation stack to the "Home" screen.
      // Prevents the user from going back to the login screen.
      navigation.goBack();
      navigation.reset({
        index: 0,
        routes: [{ name: "AccountCreated" }],
      });
    });
  };

  const wbref = React.useRef<WebView>(null);

  const [canExtractJSON, setCanExtractJSON] = React.useState(false);
  const [redirectCount, setRedirectCount] = React.useState(0);

  const injectPassword = () => {
    if(redirectCount >= 2) {
      Alert.alert(
        "Erreur",
        "Impossible de se connecter au portail de l'IUT de Lannion. Vérifiez vos identifiants et réessayez.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      navigation.goBack();
      return;
    }

    setStep("Connexion à Sésame");

    const newRedirCount = redirectCount + 1;
    setRedirectCount(newRedirCount);

    wbref.current?.injectJavaScript(`
            // fill input id=username
            document.getElementById("username").value = "${username}";
            // fill input id=password
            document.getElementById("password").value = "${password}";
            // press button name=submitBtn
            document.getElementsByName("submitBtn")[0].click();
          `);
    setCanExtractJSON(true);
  };

  const redirectToData = () => {
    setStep("Récupération des données");
    wbref.current?.injectJavaScript(`
              window.location.href = "https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=dataPremièreConnexion";
            `);
  };

  return (
    <>
      <View
        style={{
          backgroundColor: theme.colors.background,
          padding: 10,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 9999,
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <PapillonSpinner size={56} strokeWidth={5} color={theme.colors.primary} />
        <View style={{ height: 10 }} />
        <NativeText variant="title" key={step}
          animated
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp)}
        >
          {step}
        </NativeText>
        <NativeText variant="subtitle">
          Cela peut prendre quelques secondes...
        </NativeText>
        <View style={{ height: 50 }} />
      </View>

      <WebView
        source={{ uri: url }}
        incognito={true}
        ref={wbref}

        onLoad={(data) => {
          const url = data.nativeEvent.url;
          console.log(url);

          if(url.startsWith("https://sso-cas.univ-rennes1.fr//login?")) {
            injectPassword();
          }

          if(url.startsWith("https://notes9.iutlan.univ-rennes1.fr/") && canExtractJSON) {
            redirectToData();
            setCanExtractJSON(false);
          }

          if(url.startsWith("https://notes9.iutlan.univ-rennes1.fr/services/data.php")) {
            wbref.current?.injectJavaScript(`
                window.ReactNativeWebView.postMessage(document.body.innerText);
              `);
          }
        }}

        onMessage={(event) => {
          try {
            const parsedData = JSON.parse(event.nativeEvent.data);
            useData(parsedData);
          }
          catch (e) {
            console.error(e);
          }
        }}
      />
    </>
  );
};

export default BackgroundIUTLannion;
