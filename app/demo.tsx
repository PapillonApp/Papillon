import React, { ScrollView, StyleSheet, View } from "react-native";
import { Hamburger } from "lucide-react-native";

import Typography from "@/ui/components/Typography";
import Course from "@/ui/components/Course";
import { useTheme } from "@react-navigation/native";
import { log } from "@/utils/logger/logger";



export default function TabOneScreen() {
  const { colors } = useTheme();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <SectionTitle title={"Typography"} colors={colors} />
      <View style={styles.typographyContainer}>
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
      </View>
      <SectionTitle title={"Timetable"} colors={colors} />
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
          onPress={() => log("Bât. 12 amphi 4")}
        />
        <Course
          name="Pause méridienne"
          variant="separator"
          leading={Hamburger}
          start={1750126049}
          end={1750133249}
          onPress={() => log("Bât. 12 amphi 4")}
          
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
          onPress={() => log("Bât. 12 amphi 4", "Bât. 9 salle 6")}
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
          onPress={() => log("Bât. 12 amphi 4")}
        />
      </View>
    </ScrollView>
  );
}

interface SectionTitleProps {
  title: string;
  colors: { primary: string };
}

const SectionTitle = ({ title, colors }: SectionTitleProps) => (
  <View
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 5,
    }}
  >
    <Typography variant="h4" color="primary">
      {title}
    </Typography>
    <View 
      style={{ 
        width: "100%",
        height: 2,
        borderRadius: 100,
        backgroundColor: colors.primary,
      }} 
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerContent: {
    gap: 16,
  },
  typographyContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
});
