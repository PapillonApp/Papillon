var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import React from "react";
import { Modal, View, Image, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Download, Trash2, Ellipsis, OctagonX, ImageDown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { PressableScale } from "react-native-pressable-scale";
import { NativeText } from "@/components/Global/NativeComponents";
import { captureRef } from "react-native-view-shot";
import Animated, { Easing, FadeInRight, ZoomIn } from "react-native-reanimated";
import PapillonBottomSheet from "@/components/Modals/PapillonBottomSheet";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { useAlert } from "@/providers/AlertProvider";
import { isExpoGo } from "@/utils/native/expoGoAlert";
var convertToBase64 = function (uri) { return __awaiter(void 0, void 0, void 0, function () {
    var response, blob;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch(uri)];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.blob()];
            case 2:
                blob = _a.sent();
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var reader = new FileReader();
                        reader.onload = function () { return resolve(reader.result.split(",")[1]); };
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    })];
        }
    });
}); };
var GradeModal = function (_a) {
    var isVisible = _a.isVisible, reel = _a.reel, onClose = _a.onClose, DeleteGrade = _a.DeleteGrade;
    var insets = useSafeAreaInsets();
    var stickersRef = React.useRef(null);
    var _b = React.useState(false), showDeleteWarning = _b[0], setShowDeleteWarning = _b[1];
    var showAlert = useAlert().showAlert;
    var shareToSocial = function (option) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isExpoGo()) {
                        showAlert({
                            title: "Fonctionnalité indisponible",
                            message: "Cette fonctionnalité n'est pas disponible dans Expo Go. Pour l'utiliser, tu peux tester l'application sur ton propre appareil.",
                            icon: <OctagonX />,
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, require("react-native-share").default.shareSingle(option)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var saveimage = function () { return __awaiter(void 0, void 0, void 0, function () {
        var fileUri, asset, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    fileUri = FileSystem.cacheDirectory + "image.jpg";
                    return [4 /*yield*/, FileSystem.writeAsStringAsync(fileUri, reel.image, { encoding: FileSystem.EncodingType.Base64 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, MediaLibrary.createAssetAsync(fileUri)];
                case 2:
                    asset = _a.sent();
                    return [4 /*yield*/, MediaLibrary.createAlbumAsync("Download", asset, false)];
                case 3:
                    _a.sent();
                    showAlert({
                        title: "Image sauvegardée",
                        message: "L'image a été sauvegardée dans ta galerie.",
                        icon: <ImageDown />,
                    });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error("Failed to save image:", error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (<Modal transparent={true} visible={isVisible} animationType="fade" onRequestClose={onClose}>
      <PapillonBottomSheet opened={showDeleteWarning} setOpened={setShowDeleteWarning} contentContainerStyle={{ overflow: "hidden" }}>
        <View style={{ height: 180, justifyContent: "center", alignItems: "center", flexDirection: "row" }}>
          <Image source={{ uri: "data:image/jpeg;base64,".concat(reel.image) }} style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        }} blurRadius={200}/>
          <Image source={{ uri: "data:image/jpeg;base64,".concat(reel.image) }} style={{
            width: 150,
            height: 150,
            objectFit: "contain",
            transform: [{ rotate: "-10deg" }],
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
        }}/>
        </View>
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <NativeText variant={"titleLarge"}>Veux-tu vraiment supprimer cette réaction ?</NativeText>
          <NativeText variant={"subtitle"}>Cette action est irréversible.</NativeText>
          <View style={{ flexDirection: "row", gap: 10, height: 46, marginTop: 20 }}>
            <PressableScale style={{
            flex: 1,
            borderWidth: 2,
            borderColor: useTheme().colors.text + "30",
            borderRadius: 120,
            justifyContent: "center",
            alignItems: "center",
        }} onPress={function () { return setShowDeleteWarning(false); }}>
              <NativeText style={{
            fontSize: 15,
            fontFamily: "semibold",
            letterSpacing: 1,
            textTransform: "uppercase",
            alignSelf: "center",
            textAlign: "center",
            color: useTheme().colors.text + "80",
        }}>
                ANNULER
              </NativeText>
            </PressableScale>
            <PressableScale style={{
            flex: 1,
            backgroundColor: "#BE0B00",
            borderRadius: 120,
            justifyContent: "center",
            alignItems: "center",
        }} onPress={DeleteGrade}>
              <NativeText style={{
            fontSize: 15,
            fontFamily: "semibold",
            letterSpacing: 1,
            textTransform: "uppercase",
            alignSelf: "center",
            textAlign: "center",
            color: "#FFF",
        }}>
                SUPPRIMER
              </NativeText>
            </PressableScale>
          </View>
        </View>
      </PapillonBottomSheet>
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
      <BlurView intensity={95} tint="systemThickMaterialDark" style={{
            flex: 1,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            gap: 20,
        }}>
        <Animated.View style={{ flex: 1 }} entering={ZoomIn
            .easing(Easing.bezierFn(0, 0.5, 0.1, 1.15))
            .duration(300)}>
          <Image source={{ uri: "data:image/jpeg;base64,".concat(reel.image) }} style={{
            flex: 1,
            objectFit: "contain",
            paddingHorizontal: 20,
        }}/>
        </Animated.View>
        <ScrollView horizontal={true} style={{
            flex: 1,
            maxHeight: 100,
        }} contentContainerStyle={{
            paddingHorizontal: 20,
            justifyContent: "center",
            gap: 16,
        }}>
          <Animated.View entering={FadeInRight
            .easing(Easing.bezierFn(0, 0.5, 0.1, 1.5))
            .duration(300)
            .delay(50)}>
            <PressableScale style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        }} onPress={saveimage}>
              <View style={{
            width: 60,
            height: 60,
            backgroundColor: "#000",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
        }}>
                <Download color="white" size={24}/>
              </View>
              <NativeText style={{ color: "#FFF", fontSize: 15 }}>Enregistrer</NativeText>
            </PressableScale>
          </Animated.View>
          <Animated.View entering={FadeInRight
            .easing(Easing.bezierFn(0, 0.5, 0.1, 1.5))
            .duration(300)
            .delay(100)}>
            <PressableScale style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        }} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
            var compositeUri, stickers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, captureRef(stickersRef, {
                            format: "png",
                            quality: 1,
                        })];
                    case 1:
                        compositeUri = _a.sent();
                        return [4 /*yield*/, convertToBase64(compositeUri)];
                    case 2:
                        stickers = _a.sent();
                        return [4 /*yield*/, shareToSocial({
                                appId: "497734022878553",
                                stickerImage: "data:image/png;base64,".concat(stickers),
                                backgroundImage: "data:image/png;base64,".concat(reel.imagewithouteffect),
                                social: "instagramstories",
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}>
              <Image source={require("assets/images/export_instagram.png")} style={{
            width: 60,
            height: 60,
            borderRadius: 100,
        }}/>
              <NativeText style={{ color: "#FFF", fontSize: 15 }}>Instagram</NativeText>
            </PressableScale>
          </Animated.View>
          <Animated.View entering={FadeInRight
            .easing(Easing.bezierFn(0, 0.5, 0.1, 1.5))
            .duration(300)
            .delay(150)}>
            <PressableScale style={{
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        }} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (isExpoGo()) {
                            showAlert({
                                title: "Fonctionnalité indisponible",
                                message: "Cette fonctionnalité n'est pas disponible dans Expo Go. Pour l'utiliser, tu peux tester l'application sur ton propre appareil.",
                                icon: <OctagonX />,
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, require("react-native-share").default.open({
                                url: "data:image/png;base64,".concat(reel.image),
                                type: "image/png",
                                message: "Voici ma note de " + reel.grade.value + "/" + reel.grade.outOf + " en " + reel.subjectdata.pretty + " ! Qu'en penses-tu ?",
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }}>
              <View style={{
            width: 60,
            height: 60,
            backgroundColor: "#FFF",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
        }}>
                <Ellipsis color="#000" size={24}/>
              </View>
              <NativeText style={{ color: "#FFF", fontSize: 15 }}>Autre</NativeText>
            </PressableScale>
          </Animated.View>
        </ScrollView>
        <View style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            width: "100%",
            gap: 10,
            paddingHorizontal: 20,
        }}>
          <PressableScale style={{
            width: 85,
            height: 55,
            backgroundColor: "#FFFFFF10",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
        }} onPress={function () { return setShowDeleteWarning(true); }}>
            <Trash2 color="white" size={24}/>
          </PressableScale>
          <PressableScale style={{
            flex: 1,
            height: 55,
            backgroundColor: "#FFFFFF40",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 100,
        }} onPress={onClose}>
            <Text style={{
            fontSize: 16,
            fontFamily: "semibold",
            letterSpacing: 1,
            textTransform: "uppercase",
            textAlign: "center",
            color: "#FFFFFF",
        }}>
              Fermer
            </Text>
          </PressableScale>
        </View>
      </BlurView>
    </Modal>);
};
var styles = StyleSheet.create({
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
