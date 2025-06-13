import React, { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MenuView, MenuComponentRef } from '@react-native-menu/menu';

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { useEffect } from "react";

import { useNavigation } from "expo-router";
import { CalendarArrowDown, MoreVertical, Plus } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import Typography from "@/ui/components/Typography";

export default function TabOneScreen({}) {
  const navigation = useNavigation();
  const { colors } = useTheme();

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <Typography variant="h1">
              Lorem ipsum
            </Typography>
            <Typography variant="h2">
              Lorem ipsum
            </Typography>
            <Typography variant="h3">
              Lorem ipsum
            </Typography>
            <Typography variant="h4">
              Lorem ipsum
            </Typography>
            <Typography variant="h5">
              Lorem ipsum
            </Typography>
            <Typography variant="h6">
              Lorem ipsum
            </Typography>
            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet venenatis ipsum. Sed non luctus purus. Fusce vel mollis turpis, non eleifend leo. Praesent id libero tristique, condimentum elit at, condimentum nibh. Curabitur vehicula mauris in turpis mattis, eget posuere erat sagittis.
            </Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet venenatis ipsum. Sed non luctus purus. Fusce vel mollis turpis, non eleifend leo. Praesent id libero tristique, condimentum elit at, condimentum nibh. Curabitur vehicula mauris in turpis mattis, eget posuere erat sagittis.
            </Typography>
            <Typography variant="caption" color="secondary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet venenatis ipsum. Sed non luctus purus. Fusce vel mollis turpis, non eleifend leo. Praesent id libero tristique, condimentum elit at, condimentum nibh.
            </Typography>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    containerContent: {
    }
});
