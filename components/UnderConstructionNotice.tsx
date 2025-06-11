import { useTheme } from "@react-navigation/native";
import { AlertTriangle } from "lucide-react-native";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

function UnderConstructionNotice() {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View
            style={{
                justifyContent: "center",
                alignItems: "center",
                gap: 10,
                marginVertical: 20,
                marginHorizontal: 20,
            }}
        >
            <View
                style={{
                    backgroundColor: "#EFA40035",
                    width: 48,
                    height: 48,
                    maxWidth: 48,
                    maxHeight: 48,
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 500,
                }}
            >
                <AlertTriangle strokeWidth={2} size={24} color="#c28500" />
            </View>
            <View
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 5,
                    width: "100%",
                }}
            >
                <Text
                    style={{
                        fontSize: 20,
                        fontFamily: "bold",
                        color: colors.text,
                        textAlign: "center",
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

export default memo(UnderConstructionNotice);