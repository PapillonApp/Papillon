import React, { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MenuView, MenuComponentRef } from '@react-native-menu/menu';

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { useEffect } from "react";

import { useNavigation } from "expo-router";
import { CalendarArrowDown, MoreVertical, Plus } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";

export default function TabOneScreen({}) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  navigation.setOptions({
    headerTitle: "Au dela de la navigation",
    headerRight: () => (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <MenuView
        title="Apayinye"
        actions={[
          {
            id: "addEvent",
            title: "Ajouter au calendrier",
            image: Platform.select({
              ios: 'plus',
              android: 'ic_menu_add',
            }),
            imageColor: colors.text,
          },
          {
            id: "edit",
            title: "Modifier",
            image: Platform.select({
              ios: 'pencil',
              android: 'ic_menu_edit',
            }),
            imageColor: colors.text,
          },
          {
            id: "delete",
            title: "Supprimer",
            attributes: {
              destructive: true,
            },
            image: Platform.select({
              ios: 'trash',
              android: 'ic_menu_delete',
            }),
            imageColor: "#FF3B30",
          },
        ]}

      >
        <Pressable
          style={{
            height: 35,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MoreVertical color={colors.text} size={24} />
        </Pressable>
      </MenuView>
      </View>
    )
  });

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <UnderConstructionNotice />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    containerContent: {
        justifyContent: "center",
        alignItems: "center",
    }
});
