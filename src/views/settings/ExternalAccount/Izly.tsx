import { useState } from "react";
import LoginView from "@/components/Templates/LoginView";
import { Screen } from "@/router/helpers/types";

import { login } from "ezly";

const ExternalIzlyLogin: Screen<"ExternalIzlyLogin"> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (username: string, password: string): Promise<void> => {
    try {
      await login(username, password);
      navigation.navigate("IzlyActivation", {username, password});
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      else {
        setError("Une erreur est survenue lors de la connexion.");
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <LoginView
      serviceIcon={require("@/../assets/images/service_izly.png")}
      serviceName="Izly"
      onLogin={(username, password) => handleLogin(username, password)}
      loading={loading}
      error={error}
      usernamePlaceholder="Identifiant ou adresse e-mail"
      passwordLabel="Code Izly"
      passwordPlaceholder="Code Izly à 6 chiffres"
    />
  );
};

export default ExternalIzlyLogin;
