import { Link } from "expo-router";
import { Hamburger } from "lucide-react-native";
import React, { ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import Course from "@/ui/components/Course";

export default function TabOneScreen() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <UnderConstructionNotice />

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
