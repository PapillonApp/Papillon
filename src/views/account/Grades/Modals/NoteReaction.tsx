import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
  PermissionStatus,
} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { X, Share2, Save } from "lucide-react-native";
import * as Sharing from "expo-sharing";
import { useCurrentAccount } from "@/stores/account";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { Screen } from "@/router/helpers/types";
import { getSubjectData } from "@/services/shared/Subject";

const GradeReaction: Screen<"GradeReaction"> = ({ navigation, route }) => {
  const inset = useSafeAreaInsets();
  const [mediaLibraryPermission, requestMediaLibraryPermission] =
        MediaLibrary.usePermissions();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const composerRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState<string | undefined>(
    undefined
  );
  const account = useCurrentAccount((store) => store.account);
  const [grade, setGrade] = useState(route.params.grade);

  useEffect(() => {
    const setupPermissions = async () => {
      if (mediaLibraryPermission?.status !== PermissionStatus.GRANTED) {
        await requestMediaLibraryPermission();
      }
      if (cameraPermission?.status !== PermissionStatus.GRANTED) {
        await requestCameraPermission();
      }
    };
    setupPermissions();
  }, [
    mediaLibraryPermission,
    cameraPermission,
    requestMediaLibraryPermission,
    requestCameraPermission,
  ]);

  const captureImage = async () => {
    if (cameraPermission?.status !== PermissionStatus.GRANTED) {
      Alert.alert("Permission Error", "Camera permission not granted");
      return;
    }
    try {
      const photo = await cameraRef.current?.takePictureAsync({
        quality: 0.5,
        skipProcessing: true,
      });
      setCapturedImage(photo?.uri);
    } catch (error) {
      console.error("Failed to take picture:", error);
      Alert.alert("Error", "Failed to capture image");
    }
  };

  const saveImage = async () => {
    try {
      const uri = await captureRef(composerRef, {
        format: "png",
        quality: 0.5,
      });
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert("Success", "Image saved to gallery");
    } catch (error) {
      console.error("Failed to save image:", error);
      Alert.alert("Error", "Failed to save image");
    }
  };

  const shareImage = async () => {
    try {
      const uri = await captureRef(composerRef, {
        format: "png",
        quality: 0.5,
      });
      await Sharing.shareAsync(uri);
    } catch (error) {
      console.error("Failed to share image:", error);
      Alert.alert("Error", "Failed to share image");
    }
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => navigation.goBack()}
        >
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    console.log("grade", route.params.grade);
  }, [route.params.grade]);

  const [subjectData, setSubjectData] = useState({
    color: "#888888",
    pretty: "Matière inconnue",
    emoji: "❓",
  });

  const fetchSubjectData = () => {
    const data = getSubjectData(grade.subjectName);
    setSubjectData(data);
  };

  useEffect(() => {
    fetchSubjectData();
  }, [grade.subjectName]);

  const getAdjustedGrade = (grade: number | null, outOf: number | null) => {
    if (outOf === 20) {
      return grade;
    }
    return grade !== null && outOf ? (grade / outOf) * 20 : null;
  };

  const getMessageForGrade = (adjustedGrade: number) => {
    if (adjustedGrade === 20) {
      return "Parfait ! Un sans faute, bravo !";
    } else if (adjustedGrade >= 18) {
      return "Très bien ! Une performance remarquable.";
    } else if (adjustedGrade >= 15) {
      return "Bien joué, tu es sur la bonne voie.";
    } else if (adjustedGrade >= 12) {
      return "Pas mal, mais tu peux encore t'améliorer.";
    } else if (adjustedGrade >= 10) {
      return "C'est moyen, un petit effort supplémentaire te fera du bien.";
    } else if (adjustedGrade >= 5) {
      return "Attention, tu dois vraiment travailler davantage.";
    } else {
      return "C'est très insuffisant, il faudra redoubler d'efforts.";
    }
  };

  const adjustedGrade = getAdjustedGrade(grade.student.value, grade.outOf.value);
  const message = adjustedGrade !== null ? getMessageForGrade(adjustedGrade) : "Grade not available";

  return (
    <View style={styles.container}>
      <View
        ref={composerRef}
        style={[styles.cameraContainer, { marginTop: inset.top + 10 }]}
      >
        <Image
          source={require("../../../../../assets/images/mask_logotype.png")}
          tintColor={"#FFFFFF50"}
          resizeMode="contain"
          style={styles.logo}
        />
        {capturedImage ? (
          <Image
            source={{ uri: capturedImage }}
            style={styles.capturedImage}
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.cameraView}
            facing="front"
          />
        )}
        <View style={styles.infoNoteContainer}>
          <View style={styles.infoNote}>
            <View style={styles.emojiContainer}>
              <Text style={styles.emoji}>{subjectData.emoji}</Text>
            </View>
            <View>
              <Text
                style={styles.subjectText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {subjectData.pretty}
              </Text>
              <Text style={styles.dateText}>
                {new Date(grade.timestamp).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{grade.student.value}</Text>
              <Text style={styles.maxScoreText}>/{grade.outOf.value}</Text>
            </View>
          </View>
        </View>
      </View>
      {!capturedImage && (
        <>
          <Text style={styles.titleText}>Une réaction ?</Text>
          <Text style={styles.descText}>
            {message}
          </Text>
          <Text style={styles.descText}>
            Qu'as tu à dire {account?.studentName?.first || ""} ?
          </Text>
        </>
      )}
      {capturedImage ? (
        <View style={styles.actionContainer}>
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              gap: 50,
            }}
          >
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.savebutton}
                onPress={saveImage}
              >
                <Text style={styles.savebuttonText}>Enregistrer</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={shareImage}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >Partager</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.captureButton}
          onPress={captureImage}
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      )}
      <View style={{ height: inset.bottom }}>
        <Text>sus</Text>
      </View>
    </View>
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
    height: 450,
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
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  infoNote: {
    width: "90%",
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
  dateText: { color: "#00000090" },
  scoreContainer: {
    marginLeft: "auto",
    flexDirection: "row",
    alignItems: "baseline",
  },
  scoreText: { fontWeight: "700", color: "#000000", fontSize: 20 },
  maxScoreText: { fontWeight: "300", color: "#000000" },
  titleText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
    color: "#FFFFFF",
  },
  descText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 5,
    color: "#FFFFFF90",
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
  savebutton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    height: 60,
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  captureButtonInner: {
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    width: 60,
    height: 60,
  },
  actionButtons: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginHorizontal: 20,
  },
  actionContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 20,
    alignItems: "center",
    alignSelf: "center",
  },
  actionButton: {
    alignItems: "center",
    gap: 5,
  },
  buttonText: {
    fontSize: 17,
    fontFamily: "semibold",
    color: "#FFFFFF",
  },
  savebuttonText: {
    fontSize: 17,
    fontFamily: "semibold",
    color: "#000000",
  },
  headerRight: {
    padding: 5,
    borderRadius: 50,
    marginRight: 5,
    backgroundColor: "#FFFFFF20",
  },
});

export default GradeReaction;
