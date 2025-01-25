import React from "react";
import {
  Modal,
  View,
  Image,
  Text,
  Alert,
  ScrollView,
  StyleSheet,
  Dimensions,
  Share
} from "react-native";
import { Download, Trash2, Ellipsis } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { PressableScale } from "react-native-pressable-scale";
import { NativeText } from "@/components/Global/NativeComponents";
import { Reel } from "@/services/shared/Reel";
import { captureRef } from "react-native-view-shot";
import Constants from "expo-constants";
import { Social, type ShareSingleOptions } from "react-native-share";

interface GradeModalProps {
  isVisible: boolean;
  reel: Reel;
  onClose: () => void;
  DeleteGrade: () => void;
}

const convertToBase64 = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const GradeModal: React.FC<GradeModalProps> = ({
  isVisible,
  reel,
  onClose,
  DeleteGrade,
}) => {
  const insets = useSafeAreaInsets();
  const stickersRef = React.useRef<View>(null);

  const shareToSocial = async (option: ShareSingleOptions) => {
    const isExpoGo = Constants.appOwnership === "expo";
    if (isExpoGo) {
      Alert.alert("Fonctionnalité indisponible", "Cette fonctionnalité n'est pas disponible dans Expo Go. Pour l'utiliser, tu peux tester l'application sur ton propre appareil.");
      return;
    }
    await require("react-native-share").default.shareSingle(option);
  };

  const saveimage = async () => {
    try {
      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      await FileSystem.writeAsStringAsync(fileUri, reel.image, { encoding: FileSystem.EncodingType.Base64 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      Alert.alert("Image sauvegardée", "L'image a été sauvegardée dans ta galerie.");
    } catch (error) {
      console.error("Failed to save image:", error);
    }
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View ref={stickersRef} style={{
        width: 300,
        height: 650,
        position: "absolute",
        top: Dimensions.get("screen").width,
        left: Dimensions.get("screen").height,
      }}>
        <View style={styles.infoNoteContainer}>
          <View style={styles.infoNote}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{reel.subjectdata.emoji}</Text>
            </View>
            <View>
              <Text style={styles.subjectText} numberOfLines={1} ellipsizeMode="tail">
                {reel.subjectdata.pretty}
              </Text>
              <Text style={styles.dateText}>
                {new Date(reel.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{reel.grade.value}</Text>
              <Text style={styles.maxScoreText}>/{reel.grade.outOf}</Text>
            </View>
          </View>
        </View>
      </View>
      <BlurView
        intensity={95}
        tint="systemThickMaterialDark"
        style={{
          flex: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          gap: 20,
        }}
      >
        <Image
          source={{ uri: `data:image/jpeg;base64,${reel.image}` }}
          style={{
            flex: 1,
            objectFit: "contain",
            paddingHorizontal: 20,
          }}
        />
        <ScrollView
          horizontal={true}
          style={{
            flex: 1,
            maxHeight: 100,
          }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            justifyContent: "center",
            gap: 16,
          }}
        >
          <PressableScale
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={saveimage}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#000",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
              }}
            >
              <Download color="white" size={24} />
            </View>
            <NativeText style={{color: "#FFF", fontSize: 15}}>Enregistrer</NativeText>
          </PressableScale>
          <PressableScale
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={async () => {
              const compositeUri = await captureRef(stickersRef, {
                format: "png",
                quality: 1,
              });
              const stickers = await convertToBase64(compositeUri);
              await shareToSocial({
                appId: "497734022878553",
                stickerImage: `data:image/png;base64,${stickers}`,
                backgroundImage: `data:image/png;base64,${reel.imagewithouteffect}`,
                social: Social.InstagramStories,
              });
            }}
          >
            <Image
              source={require("assets/images/export_instagram.png")}
              style={{
                width: 60,
                height: 60,
                borderRadius: 100,
              }}
            />
            <NativeText style={{color: "#FFF", fontSize: 15}}>Instagram</NativeText>
          </PressableScale>
          <PressableScale
            style={{
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onPress={async () => {
              await Share.share({
                message: "Voici ma note de " + reel.grade.value + "/" + reel.grade.outOf + " en " + reel.subjectdata.pretty + " ! Qu'en penses-tu ?",
                url: `data:image/png;base64,${reel.image}`,
                title: "Partager ma note",
              });
            }}
          >
            <View
              style={{
                width: 60,
                height: 60,
                backgroundColor: "#FFF",
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 100,
              }}
            >
              <Ellipsis color="#000" size={24} />
            </View>
            <NativeText style={{color: "#FFF", fontSize: 15}}>Autre</NativeText>
          </PressableScale>
        </ScrollView>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
            gap: 10,
            paddingHorizontal: 20,
          }}
        >
          <PressableScale
            style={{
              width: 85,
              height: 55,
              backgroundColor: "#FFFFFF10",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 100,
            }}
            onPress={DeleteGrade}
          >
            <Trash2 color="white" size={24} />
          </PressableScale>
          <PressableScale
            style={{
              flex: 1,
              height: 55,
              backgroundColor: "#FFFFFF40",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 100,
            }}
            onPress={onClose}
          >
            <Text
              style={{
                fontSize: 16,
                fontFamily: "semibold",
                letterSpacing: 1,
                textTransform: "uppercase",
                textAlign: "center",
                color: "#FFFFFF",
              }}
            >
              Fermer
            </Text>
          </PressableScale>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  cameraContainer: {
    alignSelf: "center",
    width: "90%",
    height: 550,
    borderRadius: 16,
    overflow: "hidden",
  },
  logo: {
    position: "absolute",
    width: 100,
    height: 60,
    zIndex: 40,
    right: 20,
  },
  cameraView: {
    width: "100%",
    height: "100%",
  },
  capturedImage: {
    width: "100%",
    height: "100%",
    transform: [{ scaleX: -1 }],
  },
  infoNoteContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoNote: {
    width: "100%",
    height: 60,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emoji: {
    fontSize: 25,
  },
  emojiContainer: {
    marginRight: 5,
    marginLeft: -10,
    backgroundColor: "#00000020",
    padding: 5,
    borderRadius: 20,
  },
  subjectText: {
    fontWeight: "600",
    color: "#000000",
    fontSize: 16,
    maxWidth: 150,
  },
  dateText: {
    color: "#00000090"
  },
  scoreContainer: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreText: {
    fontWeight: "700",
    color: "#000000",
    fontSize: 20
  },
  maxScoreText: {
    fontWeight: "300",
    color: "#000000"
  },
  captureButton: {
    borderRadius: 37.5,
    borderColor: "#FFFFFF",
    borderWidth: 2,
    width: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 30,
  },
  captureButtonInner: {
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    width: 60,
    height: 60,
  },
  headerRight: {
    padding: 5,
    borderRadius: 50,
    marginRight: 5,
    backgroundColor: "#FFFFFF20",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    zIndex: 50,
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 10,
    fontSize: 16,
  },
});

export default GradeModal;
