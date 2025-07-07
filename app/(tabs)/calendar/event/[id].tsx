import { MenuView } from '@react-native-menu/menu';
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { MoreVertical, Plus } from "lucide-react-native";
import React, { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { log } from '@/utils/logger/logger';
import { useEventById } from '@/database/useEventsById';

import { useEffect, useLayoutEffect, useState } from 'react';
import { NativeHeaderPressable, NativeHeaderSide } from '@/ui/components/NativeHeader';
import { useDatabase } from '@/database/DatabaseProvider';
import { t } from 'i18next';

export default function TabOneScreen() {
  const { id, title } = useLocalSearchParams();
  const database = useDatabase();
  const router = useRouter();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const { colors } = useTheme();

  // Ensure id is a string or number, not an array
  const eventId = Array.isArray(id) ? id[0] : id;
  const event = useEventById(eventId);

  useEffect(() => {
    if (event && event.id) {
      setIsLoading(false);
    }
  }, [event]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: event ? event.title : title ?? t("Event_EventDetails"),
    });
  }, [event, navigation]);

  return (
    <>
      <NativeHeaderSide side='Right'>
        <MenuView
          actions={[
            {
              id: 'delete',
              title: t("Event_DeleteEvent"),
              attributes: {
                destructive: true,
              },
              imageColor: "#ff0000",
              image: Platform.select({
                ios: 'trash',
                android: 'ic_menu_delete',
              }),
            }
          ]}
          onPressAction={({ nativeEvent }) => {
            if (nativeEvent.event === 'delete') {
              Alert.alert(
                t("Event_DeleteEvent"),
                t("Event_Confirm_DeleteEvent"),
                [
                  {
                    text: t("Context_Cancel"),
                    style: "cancel"
                  },
                  {
                    text: t("Event_DeleteEvent"),
                    style: "destructive",
                    onPress: async () => {
                      try {
                        await database.write(async () => {
                          const eventToDelete = await database.get('events').find(eventId);
                          await eventToDelete.destroyPermanently();
                        });
                        router.back();
                      } catch (error) {
                        console.error("Error deleting event:", error);
                        Alert.alert(
                          "Erreur",
                          "Une erreur est survenue lors de la suppression de l’événement.",
                          [{ text: "OK" }]
                        );
                      }
                    }
                  }
                ]
              );
            }
          }}
        >
          <NativeHeaderPressable>
            <MoreVertical color={colors.text} />
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.containerContent}
        style={styles.container}
      >
        <UnderConstructionNotice />
      </ScrollView>
    </>
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
