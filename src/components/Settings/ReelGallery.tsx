import React, { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Text,
  Dimensions,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import { useGradesStore } from "@/stores/grades";
import GradeModal from "../Grades/GradeModal";
import { Reel } from "@/services/shared/Reel";

interface ReelModalProps {
  reel: Reel;
  visible: boolean;
  onClose: () => void;
}

// Components
const GradeIndicator = ({ value, outOf, color }: { value: number; outOf: number; color: string }) => (
  <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
    <Text style={[styles.scoreText, {color: color}]}>{value.toFixed(2)}</Text>
    <Text style={[styles.maxScoreText, {color: color+"50"}]}>/{outOf}</Text>
  </View>
);

const SubjectBadge = ({ emoji, color }: { emoji: string; color: string }) => (
  <View style={[styles.subjectBadge, { backgroundColor: color + "80" }]}>
    <Text style={styles.emojiText}>{emoji}</Text>
  </View>
);

const ReelThumbnail = ({ reel, onPress, width }: { reel: Reel; onPress: () => void; width: number }) => {
  const { colors } = useTheme();

  // Vérification de sécurité pour l'image
  const imageSource = reel.imagewithouteffect
    ? { uri: `data:image/jpeg;base64,${reel.imagewithouteffect}` }
    : null; // Tu peux aussi mettre une image par défaut ici

  if (!imageSource) {
    return (
      <View style={[styles.item, {
        backgroundColor: colors.card,
        width: width,
        height: width * 1.5,
        margin: 4,
        justifyContent: "center",
        alignItems: "center"
      }]}>
        <Text style={{color: colors.text}}>Image non disponible</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          backgroundColor: colors.card,
          width: width,
          height: width * 1.5,
          margin: 4,
        }
      ]}
      onPress={onPress}
    >
      <Image
        source={imageSource}
        style={styles.thumbnail}
        resizeMode="cover"
        defaultSource={require("@/../assets/images/service_unknown.png")} // Ajoutez une image par défaut
      />
      <View style={[styles.infoContainer, { backgroundColor: colors.card }]}>
        <SubjectBadge
          emoji={reel.subjectdata.emoji}
          color={reel.subjectdata.color}
        />
        <GradeIndicator
          value={Number(Number(reel.grade.value).toFixed(2))}
          outOf={Number(reel.grade.outOf)}
          color={colors.text}
        />
      </View>
    </TouchableOpacity>
  );
};

interface ReelGalleryProps {
  reels: Reel[];
}

// Sécurisation du composant principal
const ReelGallery = ({ reels }: ReelGalleryProps) => {
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const windowWidth = Dimensions.get("window").width;
  const padding = 40;
  const gap = 8;
  const numColumns = 2;

  // Vérification des reels valides
  const validReels = reels.filter(reel =>
    reel &&
    typeof reel.id === "string" &&
    reel.grade &&
    reel.subjectdata
  );

  const itemWidth = (Math.min(500, windowWidth) - (padding * 2) - (gap * (numColumns - 1))) / numColumns;

  const deleteReel = useCallback((reelId: string) => {
    useGradesStore.setState((store) => {
      const updatedReels = { ...store.reels };
      delete updatedReels[reelId];
      return { reels: updatedReels };
    });
    setSelectedReel(null);
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <View style={[styles.galleryContent, { gap }]}>
          {validReels.map((reel) => (
            <ReelThumbnail
              key={reel.id}
              reel={reel}
              width={itemWidth}
              onPress={() => setSelectedReel(reel)}
            />
          ))}
        </View>
      </View>

      {selectedReel && (
        <GradeModal
          isVisible={!!selectedReel}
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          DeleteGrade={() => selectedReel.id && deleteReel(selectedReel.id)}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  galleryContent: {
    width: "100%",
    maxWidth: 500,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignContent: "flex-start",
  },
  item: {
    borderRadius: 12,
    overflow: "hidden",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    transform: [{ scaleX: -1 }],
  },
  infoContainer: {
    position: "absolute",
    bottom: 10,
    left: 20,
    right: 20,
    padding: 5,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subjectBadge: {
    borderRadius: 100,
    padding: 5,
  },
  emojiText: {
    fontSize: 20,
  },
  scoreText: {
    fontWeight: "700",
    fontSize: 18,
  },
  maxScoreText: {
    fontWeight: "300",
  },
});

export default ReelGallery;