import { useTheme } from "@react-navigation/native";
import { CheckSquare } from "lucide-react-native"; // Utilisation de PieChart comme icône de matière
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import Reanimated, { LinearTransition } from "react-native-reanimated";

import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { NativeText } from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { updateGradesAndAveragesInCache } from "@/services/grades";
import { getSubjectData } from "@/services/shared/Subject"; // Importation pour l'obtention des données sur la matière
import { useCurrentAccount } from "@/stores/account";
import { useGradesStore } from "@/stores/grades";

// Déclaration du composant LastGradeWidget en utilisant forwardRef pour exposer des méthodes au parent
const LastGradeWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  // Récupération du thème pour les couleurs
  const theme = useTheme();
  const { colors } = theme;

  // Accès à l'information du compte utilisateur courant
  const account = useCurrentAccount((store) => store.account);

  // Accès aux notes et à la période par défaut depuis le store
  const grades = useGradesStore((store) => store.grades);
  const defaultPeriod = useGradesStore((store) => store.defaultPeriod);

  // Expose la méthode handlePress au parent via ref
  useImperativeHandle(ref, () => ({
    handlePress: () => "Grades"
  }));

  // Utilisation de useMemo pour calculer la dernière note
  const lastGrade = useMemo(() => {
    const periodGrades = grades[defaultPeriod] || [];
    return periodGrades[periodGrades.length - 1]; // Récupération de la dernière note.
  }, [grades, defaultPeriod]);

  // Extraction de la valeur de la note et de l'échelle de notation
  const gradeValue = lastGrade?.student.value ?? 0;
  const maxGradeValue = lastGrade?.outOf?.value ?? 20; // Récupération de l'échelle de notation du professeur

  // Détermination de la couleur de la note en fonction du pourcentage

  // Récupération des données de la matière pour obtenir l'émoji associé
  const subjectData = getSubjectData(lastGrade?.subjectName || "");
  const subjectEmoji = subjectData.emoji;
  const subjectColor = subjectData.color;

  // Effet pour mettre à jour les notes et moyennes en cache
  useEffect(() => {
    void async function () {
      if (!account?.instance || !defaultPeriod) return;
      setLoading(true);

      await updateGradesAndAveragesInCache(account, defaultPeriod);
      setLoading(false);
    }();
  }, [defaultPeriod]);

  // Détermination du texte à afficher pour la description
  const descriptionText = getSubjectData(lastGrade?.subjectName || "").pretty;

  // Effet pour cacher le widget si la valeur de la note n'est pas un nombre valide
  useEffect(() => {
    setHidden(typeof gradeValue !== "number" || gradeValue < 0);
  }, [gradeValue]);

  // Cacher le widget si aucune note n'est disponible
  if (!lastGrade) {
    setHidden(true);
  }

  return (
    <>
      {/* Titre du widget */}
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <CheckSquare size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Dernière note
        </Text>
      </View>

      {/* Contenu principal : Emoji + Description */}
      <Reanimated.View
        style={{
          alignItems: "center",
          flexDirection: "row", // Même ligne pour l'emoji et la description
          justifyContent: "space-between", // Espace entre l'emoji et la description
          width: "100%",
          marginTop: "auto",
          gap: 10,
        }}
        layout={LinearTransition}
      >
        {/* Affichage de l'émoji dans un cadre rond */}
        <View
          style={{
            backgroundColor: subjectColor + "22",
            borderRadius: 50, // Pour faire un cadre rond
            padding: 6,
          }}
        >
          <Text style={{ fontSize: 18 }}>{subjectEmoji}</Text>
        </View>

        {/* Affichage du nom de la matière en gras */}
        <NativeText
          variant="title"
          style={{
            width: "70%",
          }}
          numberOfLines={2} // Ajout de la propriété numberOfLines
        >
          {descriptionText}
        </NativeText>
      </Reanimated.View>

      {/* Affichage de la note en bas */}
      <Reanimated.View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "flex-start", // Met la note à gauche
          marginTop: 10, // Espace avec le reste
          gap: 4,
        }}
      >
        {/* Affichage de la valeur de la note */}
        <AnimatedNumber
          value={gradeValue?.toFixed(2) ?? ""}
          style={{
            fontSize: 24.5,
            lineHeight: 24,
            fontFamily: "semibold",
            color: colors.text,
          }}
          contentContainerStyle={{
            paddingLeft: 6,
          }}
        />
        {/* Affichage de l'unité de notation */}
        <Text
          style={{
            color: colors.text + "50", // Couleur du barème de notation
            fontFamily: "semiBold",
            fontSize: 15,
          }}
        >
          /{maxGradeValue}
        </Text>
      </Reanimated.View>
    </>
  );
});

export default LastGradeWidget;
