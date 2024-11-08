import LoginView from "@/components/Templates/LoginView";
import React, { useMemo, useState } from "react";
import { View } from "react-native";
import loginIUTLannion from "@/services/iutlan/fetch_iutlan";

export const UnivIUTLannion_Login: React.FC = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username, password) => {
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