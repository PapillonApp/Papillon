import { useTheme } from "@react-navigation/native";
import { AlertTriangle } from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

export default function UnderConstructionNotice() {
    const { t } = useTranslation();
    const { colors } = useTheme();
    return (
        <View
            style={{
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
            }}
        >
            <View
                style={{
                    backgroundColor: "#EFA40035",
                    padding: 15,
                    borderRadius: 500,
                }}
            >
                <AlertTriangle color="#EFA400" />
            </View>
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                    width: "80%",
                }}
            >
                <Text
                    style={{
                        fontSize: 20,
                        fontFamily: "semibold",
                        color: colors.text,
                    }}
                >
                    {t("TabUnderConstruction")}
                </Text>
                <Text
                    style={{
                        fontSize: 15,
                        textAlign: "center",
                        fontFamily: "medium",
                        color: "#A0A0A0",
                        width: "80%",
                    }}
                >
                    {t("TabUnderConstructionDetails")}
                </Text>
            </View>
        </View>
    );
}
