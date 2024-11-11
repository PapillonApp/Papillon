import LoginView from "@/components/Templates/LoginView";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import type { Screen } from "@/router/helpers/types";

export const UnivIUTLannion_Login: Screen<"UnivIUTLannion_Login"> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    try {
      navigation.navigate("BackgroundIUTLannion", {
        username,
        password,
        firstLogin: true,
      });
    }
    catch (e) {
      console.error(e);
      // setLoading(false);
      // @ts-ignore
      setError(e.toString());
    }
  };

  const loginViewProps = useMemo(() => ({
    serviceName: "IUT de Lannion",
    serviceIcon: require("@/../assets/images/service_iutlan.png"),
    onLogin: login,
    loading,
    error,
  }), [login]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <LoginView {...loginViewProps} />
    </View>
  );
};
