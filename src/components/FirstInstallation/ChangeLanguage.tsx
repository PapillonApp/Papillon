import { View, Text } from "react-native";
import { useState, useEffect } from "react";
import { useTheme } from "@react-navigation/native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Globe } from "lucide-react-native";
import "@/lang/i18n.config";
import { useTranslation } from "react-i18next";

const ChangeLanguage: React.FC = () => {
  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  const [expanded, setExpanded] = useState<boolean>(false);
  const [language, setLanguage] = useState<string>("fr");

  useEffect(() => {
    const getLanguage = async () => {
      const lang = await AsyncStorage.getItem("language");
      if (lang) {
        setLanguage(lang);
      } else {
        setLanguage("fr");
        AsyncStorage.setItem("language", "fr");
      }
    };

    getLanguage();
  }, [language]);
  // TODO: create the switcher
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 8,
        position: "absolute",
        top: 40,
        right: 16,
      }}
    >
      <Globe size={24} color={colors.text} />
      <Text style={{ color: colors.text }}>{"TODO"}</Text>
    </View>
  );
};

export default ChangeLanguage;
