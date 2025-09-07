import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import React from "react";
import { ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import { t } from "i18next";
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

        >
            <List>
                {languages.map((lang) => {
                    const isSelected = i18n.language === lang.id;

                    return (
                        <Item
                            key={lang.id}
                            onPress={() => {
                                i18n.changeLanguage(lang.id);
                            }}
                        >
                            <Typography style={{
                                fontSize: 25,
                                lineHeight: 32,
                            }}>
                                {lang.emoji}
                            </Typography>

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
                                <Trailing>
                                    <Icon size={22} papicon>
                                        <Papicons name={"Check"} color={colors.primary} />
                                    </Icon>
                                </Trailing>

                            )}
                        </Item>
                    );
                })}
            </List>
        </ScrollView>
    );
};

export default LanguagePersonalization;