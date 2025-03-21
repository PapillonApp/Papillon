import LoginView from "@/components/Templates/LoginView";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { error as error_logger } from "@/utils/logger/logger";

export const UnivIUTLannion_Login: Screen<"UnivIUTLannion_Login"> = ({ navigation }) => {
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
      error_logger("" + e, "UnivIUTLannion_Login/login");
      // @ts-expect-error
      setError(e.toString());
    }
  };

  const loginViewProps = useMemo(() => ({
    serviceName: "IUT de Lannion",
    serviceIcon: require("@/../assets/images/service_iutlan.png"),
    onLogin: login,
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
