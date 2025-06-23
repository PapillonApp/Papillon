import { Link } from "expo-router";
import { ChevronDown, Hamburger, ListFilter, Search } from "lucide-react-native";
import React, { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import Course from "@/ui/components/Course";
import { NativeHeaderHighlight, NativeHeaderLeft, NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { useTheme } from "@react-navigation/native";

import DateTimePicker from '@react-native-community/datetimepicker';

import { MenuView, MenuComponentRef } from '@react-native-menu/menu';
import { useState } from "react";
import List from "@/ui/components/List";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import Calendar from "@/ui/components/Calendar";

export default function TabOneScreen() {
  const [date, setDate] = useState(new Date());
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <>
    <Calendar
      date={date}
      onDateChange={setDate}
      showDatePicker={showDatePicker}
      setShowDatePicker={setShowDatePicker}
    />

    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <UnderConstructionNotice />

      <NativeHeaderSide side="Left">
        <MenuView
          title="Filtrer"
          actions={[
            {
              id: 'show_canceled',
              title: 'Cours annulés',
              subtitle: 'Afficher les cours annulés',
              imageColor: colors.text,
              image: Platform.select({
                ios: 'calendar',
                android: 'ic_menu_add',
              }),
              state: "on"
            }
          ]}
        >
          <NativeHeaderPressable
            onPress={() => {Alert.alert("Filtre", "Cette fonctionnalité n'est pas encore implémentée.")}}
          >
            <ListFilter color={colors.text} />
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>

      <NativeHeaderTitle>
        <NativeHeaderPressable
          onPress={() => {setShowDatePicker(!showDatePicker)}}
        >
          <Typography variant="navigation">
            {date.toLocaleDateString("fr-FR", {weekday: "long"})}
          </Typography>
          <NativeHeaderHighlight color="#D6502B">
            {date.toLocaleDateString("fr-FR", {day: "numeric"})}
          </NativeHeaderHighlight>
          <Typography variant="navigation">
            {date.toLocaleDateString("fr-FR", {month: "long"})}
          </Typography>
          <ChevronDown color={colors.text} opacity={0.7} />
        </NativeHeaderPressable>
      </NativeHeaderTitle>

      <NativeHeaderSide side="Right">
        <NativeHeaderPressable
          onPress={() => {Alert.alert("Filtre", "Cette fonctionnalité n'est pas encore implémentée.")}}
        >
          <Search color={colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <Link href="/calendar/item" style={{ marginTop: 20 }}>
        <View style={{ width: "100%", padding: 14, backgroundColor: "#29947A", borderRadius: 300 }}>
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: 16,
              textAlign: "center",
              fontFamily: "bold"
            }}
          >Ouvrir un cours</Text>
        </View>
      </Link>
      <Link href="/calendar/modal" style={{ marginTop: 20 }}>
        <View style={{ width: "100%", padding: 14, backgroundColor: "#29947A22", borderRadius: 300 }}>
          <Text
            style={{
              color: "#29947A",
              fontSize: 16,
              textAlign: "center",
              fontFamily: "bold"
            }}
          >Ouvrir une modal</Text>
        </View>
      </Link>

      <View style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <Course
          name="Traitement des données"
          teacher={{
            firstName: "Lucas",
            lastName: "Martin"
          }}
          room="Bât. 12 amphi 4"
          color="#0095D6"
          status={{ label: "Prof. absent", canceled: false }}
          variant="primary"
          start={1750126049}
          end={1750129649}
        />
        <Course
          name="Pause méridienne"
          variant="separator"
          leading={Hamburger}
          start={1750126049}
          end={1750133249}
        />
        <Course
          name="Anglais"
          teacher={{
            firstName: "Raphaël",
            lastName: "Schröder"
          }}
          room="Bât. 9 salle 6"
          color="#21A467"
          status={{ label: "Professeur absent", canceled: true }}
          variant="primary"
          start={1750126049}
          end={1750129649}
        />
        <Course
          name="Développement web"
          teacher={{
            firstName: "Vince",
            lastName: "Linise"
          }}
          room="Bât. 10 salle 16"
          color="#21A467"
          status={{ label: "Cours magistral", canceled: false }}
          variant="primary"
          start={1750126049}
          end={1750130549}
        />
      </View>
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
