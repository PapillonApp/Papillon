import React from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  Text,
  Alert
} from "react-native";
import { Download, Trash, Share } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
interface GradeModalProps {
  isVisible: boolean;
  imageBase64: string;
  onClose: () => void;
  DeleteGrade: () => void;
}

const GradeModal: React.FC<GradeModalProps> = ({
  isVisible,
  imageBase64,
  onClose,
  DeleteGrade,
}) => {
  const insets = useSafeAreaInsets();

  const shareImage = async () => {
    try {
      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      await FileSystem.writeAsStringAsync(fileUri, imageBase64, { encoding: FileSystem.EncodingType.Base64 });
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      console.error("Failed to share image:", error);
    }
  };

  const saveimage = async () => {
    try {
      const fileUri = FileSystem.cacheDirectory + "image.jpg";
      await FileSystem.writeAsStringAsync(fileUri, imageBase64, { encoding: FileSystem.EncodingType.Base64 });
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Download", asset, false);
      Alert.alert("Image sauvegardée", "L'image a été sauvegardée dans votre galerie.");
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
      <BlurView
        intensity={100}
        tint="dark"
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 20,
            alignItems: "center",
            flexDirection: "column",
            paddingTop: insets.top,
          }}
        >
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
            style={{
              width: "90%",
              height: 500,
              objectFit: "contain",
            }}
          />
          <View
            style={{
              width: "100%",
              height: 170,
              padding: 20,

              justifyContent: "center",
              alignItems: "center",
              flexDirection: "row",
              gap: 35,
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
              }}
              onPress={saveimage}
            >
              <View
                style={{
                  padding: 15,
                  borderRadius: 100,
                  backgroundColor: "#000000",
                }}
              >
                <Download color="white" size={30} />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontFamily: "semibold",
                  textAlign: "center",
                  textAlignVertical: "center"
                }}
              >
                Télécharger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
              }}
              onPress={shareImage}
            >
              <View
                style={{
                  padding: 15,
                  borderRadius: 100,
                  backgroundColor: "#0E7CCB",
                }}
              >
                <Share color="white" size={30} />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontFamily: "semibold",
                  textAlign: "center",
                  textAlignVertical: "center"
                }}
              >
                Partager
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 7,
              }}
              onPress={DeleteGrade}
            >
              <View
                style={{
                  padding: 15,
                  borderRadius: 100,
                  backgroundColor: "#888888",
                }}
              >
                <Trash color="white" size={30} />
              </View>
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 15,
                  fontFamily: "semibold",
                  textAlign: "center",
                  textAlignVertical: "center"
                }}
              >
                Supprimer
              </Text>
            </TouchableOpacity>

          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              gap: 20,
              paddingHorizontal: 20,
              position: "absolute",
              bottom: insets.bottom+50,
              left: 0,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingHorizontal: 10,
                paddingVertical: 20,
                backgroundColor: "#FFFFFF50",
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
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

export default GradeModal;