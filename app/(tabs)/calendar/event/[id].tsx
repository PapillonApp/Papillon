import { MenuView } from '@react-native-menu/menu';
import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { MoreVertical, Plus } from "lucide-react-native";
import React, { ActivityIndicator, Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { log } from '@/utils/logger/logger';
import { useEventById } from '@/database/useEventsById';
import { useEffect, useLayoutEffect, useState } from 'react';

export default function TabOneScreen() {
  const { id } = useLocalSearchParams();
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
    if (event) {
      navigation.setOptions({
        headerTitle: event ? event.title : "Événement",
      });
    }
  }, [event, navigation]);

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
