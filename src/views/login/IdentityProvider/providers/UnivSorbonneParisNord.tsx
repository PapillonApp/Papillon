import React, { useState, useCallback, useMemo } from "react";
import { View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { AccountService, LocalAccount } from "@/stores/account/types";
import defaultPersonalization from "@/services/local/default-personalization";
import uuid from "@/utils/uuid-v4";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import LoginView from "@/components/Templates/LoginView";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";

const API_BASE_URL = "https://api.univ-spn.fr";
const USER_AGENT = "USPNAPP/1.0.1 CFNetwork/1568.200.41 Darwin/24.1.0";

const UnivSorbonneParisNord_login: Screen<"UnivSorbonneParisNord_login"> = ({ navigation }) => {
  const theme = useTheme();
  const createStoredAccount = useAccounts(store => store.create);
  const switchTo = useCurrentAccount(store => store.switchTo);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const fetchStudentInfo = useCallback(async (identifier: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/student/infos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      },
      body: JSON.stringify({ identifier, token }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch student info");
    }

    const data = await response.json();
    return data.identite;
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    setLoadingText("Connexion en cours...");

    try {
      const loginResponse = await fetch(`${API_BASE_URL}/student/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": USER_AGENT,
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!loginResponse.ok) {
        throw new Error("Login failed");
      }

      const [studentId, token] = await loginResponse.json();
      setLoadingText("Récupération des informations...");

      const studentInfo = await fetchStudentInfo(studentId, token);
      // Exclude INE from rawData
      const { INE, ...safeStudentInfo } = studentInfo;

      const localAccount: LocalAccount = {
        authentication: undefined,
        instance: undefined,
        identityProvider: {
          identifier: "univ_sorbonne_paris_nord",
          name: "Université Sorbonne Paris Nord",
          rawData: safeStudentInfo
        },
        localID: uuid(),
        service: AccountService.Local,
        isExternal: false,
        linkedExternalLocalIDs: [],
        name: `${safeStudentInfo.NOM_PATRONYMIQUE} ${safeStudentInfo.PRENOM1}`,
        studentName: {
          first: safeStudentInfo.PRENOM1,
          last: safeStudentInfo.NOM_PATRONYMIQUE,
        },
        className: "",
        schoolName: "Université Sorbonne Paris Nord",
        personalization: await defaultPersonalization(),
        identity: {},
        serviceData: {},
        providers: []
      };

      createStoredAccount(localAccount);
      switchTo(localAccount);

      navigation.reset({
        index: 0,
        routes: [{ name: "AccountCreated" }],
      });
    } catch (error) {
      console.error("Error during login process:", error);
      // Here you might want to show an error message to the user
    } finally {
      setIsLoading(false);
    }
  }, [createStoredAccount, switchTo, navigation, fetchStudentInfo]);

  const loginViewProps = useMemo(() => ({
    serviceName: "Université Sorbonne Paris Nord",
    serviceIcon: require("@/../assets/images/service_uspn.png"),
    onLogin: login,
  }), [login]);

  return (
    <View style={{ flex: 1 }}>
      {isLoading ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.colors.background,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PapillonSpinner
            color={theme.colors.primary}
            size={50}
            strokeWidth={4}
          />
          <NativeText style={{ color: theme.colors.text, marginTop: 16 }}>
            {loadingText}
          </NativeText>
        </View>
      ) : (
        <LoginView {...loginViewProps} />
      )}

    </View>
  );
};

export default UnivSorbonneParisNord_login;
