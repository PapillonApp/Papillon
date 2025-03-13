import defaultPersonalization from "@/services/local/default-personalization";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, Identity, LocalAccount } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import type { Screen } from "@/router/helpers/types";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { useAlert } from "@/providers/AlertProvider";
import { BadgeX, Undo2 } from "lucide-react-native";

const providers = ["scodoc", "moodle", "ical"];

const capitalizeFirst = (str: string) => {
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const buildIdentity = (data: any): Partial<Identity> => {
  return {
    firstName: capitalizeFirst(data["relevé"].etudiant.prenom || ""),
    lastName: (data["relevé"].etudiant.nom || "").toUpperCase(),
    civility: data["relevé"].etudiant.civilite || undefined,
    boursier: data["relevé"].etudiant.boursier || false,
    ine: data["relevé"].etudiant.code_ine || undefined,
    birthDate: data["relevé"].etudiant.date_naissance
      ? new Date(data["relevé"].etudiant.date_naissance.split("/").reverse().join("-"))
      : undefined,
    birthPlace: data["relevé"].etudiant.lieu_naissance || undefined,
    phone: [
      data["relevé"].etudiant.telephonemobile ? (data["relevé"].etudiant.telephonemobile).replaceAll(".", " ") : undefined,
    ],
    email: [
      data["relevé"].etudiant.email || undefined,
      data["relevé"].etudiant.emailperso || undefined,
    ],
    address: {
      street: data["relevé"].etudiant.domicile || undefined,
      city: data["relevé"].etudiant.villedomicile || undefined,
      zipCode: data["relevé"].etudiant.codepostaldomicile || undefined,
    },
  };
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

  const { showAlert } = useAlert();

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

      // @ts-ignore
      mutateProperty("providers", providers);
      mutateProperty("identity", buildIdentity(data));

      retreiveGrades(data);
    }
  };

  const [semestresToRetrieve, setSemestresToRetrieve] = React.useState<any[]>([]);
  const [currentSemestre, setCurrentSemestre] = React.useState(0);

  const retreiveGrades = async (data: any) => {
    setStep("Récupération des notes");

    try {
      const scodocData = data;
      const semestres = (scodocData["semestres"] as any);

      setSemestresToRetrieve(semestres);
      await retreiveNextSemestre(currentSemestre, semestres);
    }
    catch (e) {
      console.error(e);
      showAlert({
        title: "Erreur",
        message: "Impossible de récupérer les notes de l'IUT de Lannion. Vérifie ta connexion Internet et réessaie.",
        icon: <BadgeX />,
        actions: [
          {
            title: "OK",
            icon: <Undo2 />,
            onPress: () => navigation.goBack(),
            primary: true,
          }
        ]
      });
    }
  };

  const retreiveNextSemestre = async (cs: number, semestres: any[] = semestresToRetrieve) => {
    const sem = semestres[cs];
    setStep("Récupération du semestre " + sem.semestre_id);
    wbref.current?.injectJavaScript(`
      window.location.href = "https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=" + ${sem.formsemestre_id};
    `);
  };

  const processSemestre = async (data: any) => {
    // ajouter le semestre ici
    const newServiceData = account?.serviceData || {} as any;

    if (!newServiceData["semestres"]) {
      newServiceData["semestres"] = {};
    }

    const semesterName = "Semestre " + semestresToRetrieve[currentSemestre].semestre_id;

    newServiceData["semestres"][semesterName] = data;
    mutateProperty("serviceData", newServiceData);

    // passer au prochain semestre
    const newCurrentSemestre = currentSemestre + 1;
    setCurrentSemestre(newCurrentSemestre);

    if (newCurrentSemestre < semestresToRetrieve.length) {
      await retreiveNextSemestre(newCurrentSemestre, semestresToRetrieve);
    }
    else {
      if(firstLogin) {
        queueMicrotask(() => {
          // Reset the navigation stack to the "Home" screen.
          // Prevents the user from going back to the login screen.
          navigation.goBack();
          navigation.reset({
            index: 0,
            routes: [{ name: "AccountCreated" }],
          });
        });
      }
      else {
        navigation.goBack();
      }
    }
  };

  const actionFirstLogin = async (data: any) => {
    const local_account: LocalAccount = {
      authentication: undefined,
      instance: undefined,

      identityProvider: {
        identifier: "iut-lannion",
        name: "IUT de Lannion",
        rawData: data,
      },

      providers: providers,

      identity: buildIdentity(data),

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

      personalization: await defaultPersonalization({
        tabs: [
          { name: "Home", enabled: true },
          { name: "Week", enabled: true },
          { name: "Grades", enabled: true },
          { name: "Attendance", enabled: true },
          { name: "Menu", enabled: true }
        ]
      }),
      serviceData: {}
    };

    // https://planning.univ-rennes1.fr/jsp/custom/modules/plannings/pn8d0kn8.shu

    createStoredAccount(local_account);
    switchTo(local_account);

    retreiveGrades(data);
  };

  const wbref = React.useRef<WebView>(null);

  const [canExtractJSON, setCanExtractJSON] = React.useState(false);
  const [redirectCount, setRedirectCount] = React.useState(0);

  const injectPassword = () => {
    if(redirectCount >= 2) {
      showAlert({
        title: "Erreur",
        message: "Impossible de se connecter au portail du l'IUT de Lannion. Vérifie tes identifiants et réessaye.",
        icon: <BadgeX />,
        actions: [
          {
            title: "OK",
            icon: <Undo2 />,
            onPress: () => navigation.goBack(),
            primary: true,
          }
        ]
      });
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

          if(url.startsWith("https://sso-cas.univ-rennes.fr//login?")) {
            injectPassword();
          }

          if(url.startsWith("https://notes9.iutlan.univ-rennes1.fr/") && canExtractJSON) {
            redirectToData();
            setCanExtractJSON(false);
          }

          if(url.startsWith("https://notes9.iutlan.univ-rennes1.fr/services/data.php?q=relev%C3%A9Etudiant&semestre=")) {
            wbref.current?.injectJavaScript(`
              window.ReactNativeWebView.postMessage("semestre:"+document.body.innerText);
            `);
          }
          else if(url.startsWith("https://notes9.iutlan.univ-rennes1.fr/services/data.php")) {
            wbref.current?.injectJavaScript(`
              window.ReactNativeWebView.postMessage("firstLogin:"+document.body.innerText);
            `);
          }
        }}

        onError={(data) => {
          console.error(data);
          showAlert({
            title: "Erreur",
            message: "Impossible de se connecter au portail de l'IUT de Lannion. Vérifie ta connexion Internet et réessaie.",
            icon: <BadgeX />,
            actions: [
              {
                title: "OK",
                icon: <Undo2 />,
                onPress: () => navigation.goBack(),
                primary: true,
              }
            ]
          });
        }}

        onMessage={(event) => {
          try {
            if(event.nativeEvent.data.startsWith("firstLogin:")) {
              const data = event.nativeEvent.data.replace("firstLogin:", "");
              const parsedData = JSON.parse(data);
              useData(parsedData);
            }
            else if(event.nativeEvent.data.startsWith("semestre:")) {
              const data = event.nativeEvent.data.replace("semestre:", "");
              const parsedData = JSON.parse(data);
              processSemestre(parsedData);
            }
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
