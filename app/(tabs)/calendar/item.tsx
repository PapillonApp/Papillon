import { MenuComponentRef,MenuView } from '@react-native-menu/menu';
import { useTheme } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { CalendarArrowDown, MoreVertical, Plus } from "lucide-react-native";
import { useEffect } from "react";
import React, { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";

export default function TabOneScreen({}) {
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  navigation.setOptions({
    headerTitle: "Anglais LV2",
    headerRight: () => (
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          onPress={() => {
            setTimeout(() => {
              Alert.alert("Pressé !", "Vous avez appuyé sur le bouton d'ajout.", [
                {
                  text: "OK",
                  onPress: () => console.log("OK Pressed"),
                  isPreferred: true,
                },
                {
                  text: "Quoicoubeh",
                  onPress: () => console.log("Quoicoubeh Pressed"),
                  style: "cancel",
                },
                {
                  text: "Apayinye",
                  onPress: () => console.log("Quoicoubeh Pressed"),
                  style: "destructive",
                },
              ]);
            }, 100);
          }}
          style={{
            height: 35,
            aspectRatio: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Plus color={colors.text} size={24} />
        </Pressable>
      <MenuView
        title="Anglais LV2"
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
