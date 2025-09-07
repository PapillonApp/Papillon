import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import Icon from "@/ui/components/Icon";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

const LanguagePersonalization = () => {
    const { i18n } = useTranslation();
    const { colors } = useTheme();

    const languages = [
        { id: "fr", name: "Français", emoji: "🇫🇷", color: "#0055A4" },
        { id: "en", name: "English", emoji: "🇬🇧", color: "#1E90FF" },
        { id: "de", name: "Deutsch", emoji: "🇩🇪", color: "#FFCE00" },
    ];

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16 }}
            contentInsetAdjustmentBehavior={"always"}
        >
            <List>
                {languages.map((lang) => {
                    const isSelected = i18n.language === lang.id;

                    return (
                        <TouchableOpacity
                            key={lang.id}
                            onPress={() => {
                                log("PRESSED!" + lang.id, " I18NMANAGER")
                                i18n.changeLanguage(lang.id);
                            }}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                padding: 16,
                                margin: 4,
                                borderRadius: 16,
                                backgroundColor: isSelected ? lang.color + "30" : "transparent",
                            }}
                        >
                            <Stack
                                backgroundColor={lang.color + "20"}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 40,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 16,
                                }}
                            >
                                <Typography
                                    style={{
                                        fontSize: 25,
                                        lineHeight: 32,
                                    }}
                                >
                                    {lang.emoji}
                                </Typography>
                            </Stack>

                            <Typography
                                variant={"title"}
                                style={{
                                    flex: 1,
                                    fontWeight: isSelected ? "bold" : "normal"
                                }}
                            >
                                {lang.name}
                            </Typography>

                            {isSelected && (
                                <Icon size={22} papicon>
                                    <Papicons name={"Check"} color={colors.primary} />
                                </Icon>
                            )}
                        </TouchableOpacity>
                    );
                })}

            </List>
        </ScrollView>
    );
};

export default LanguagePersonalization;