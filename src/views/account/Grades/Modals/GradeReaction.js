var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Text, View, Linking, StyleSheet, TouchableOpacity, Image } from "react-native";
import { CameraView, useCameraPermissions, PermissionStatus } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { BadgeX, CameraOff, Check, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";
import { getSubjectData } from "@/services/shared/Subject";
import { useGradesStore } from "@/stores/grades";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { NativeText } from "@/components/Global/NativeComponents";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { isExpoGo } from "@/utils/native/expoGoAlert";
import { useAlert } from "@/providers/AlertProvider";
import useScreenDimensions from "@/hooks/useScreenDimensions";
// Helper Functions
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
var createReel = function (grade, imageUri, imageWithoutEffectUri) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, image, imageWithoutEffect;
    var _b, _c, _d, _e, _f, _g;
    return __generator(this, function (_h) {
        switch (_h.label) {
            case 0: return [4 /*yield*/, Promise.all([
                    convertToBase64(imageUri),
                    convertToBase64(imageWithoutEffectUri)
                ])];
            case 1:
                _a = _h.sent(), image = _a[0], imageWithoutEffect = _a[1];
                return [2 /*return*/, {
                        id: grade.id,
                        timestamp: Date.now(),
                        image: image,
                        imagewithouteffect: imageWithoutEffect,
                        subjectdata: getSubjectData(grade.subjectName),
                        grade: {
                            value: (_c = (grade.student.disabled
                                ? grade.student.status
                                : (_b = grade.student.value) === null || _b === void 0 ? void 0 : _b.toFixed(2))) !== null && _c !== void 0 ? _c : "",
                            outOf: (_e = (_d = grade.outOf.value) === null || _d === void 0 ? void 0 : _d.toString()) !== null && _e !== void 0 ? _e : "",
                            coef: (_g = (_f = grade.coefficient) === null || _f === void 0 ? void 0 : _f.toString()) !== null && _g !== void 0 ? _g : "",
                        }
                    }];
        }
    });
}); };
var GradeReaction = function (_a) {
    var _b;
    var navigation = _a.navigation, route = _a.route;
    var inset = useSafeAreaInsets();
    var _c = MediaLibrary.usePermissions(), mediaLibraryPermission = _c[0], requestMediaLibraryPermission = _c[1];
    var _d = useCameraPermissions(), cameraPermission = _d[0], requestCameraPermission = _d[1];
    var cameraRef = useRef(null);
    var composerRef = useRef(null);
    var _e = useState(), capturedImage = _e[0], setCapturedImage = _e[1];
    var _f = useState(false), isLoading = _f[0], setIsLoading = _f[1];
    var grade = useState(route.params.grade)[0];
    var _g = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _g[0], setSubjectData = _g[1];
    var _h = useState(PermissionStatus.UNDETERMINED), isMediaLibraryPermissionGranted = _h[0], setIsMediaLibraryPermissionGranted = _h[1];
    var _j = useState(PermissionStatus.UNDETERMINED), isCameraPermissionGranted = _j[0], setIsCameraPermissionGranted = _j[1];
    var setupPermissions = function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    setIsMediaLibraryPermissionGranted((_a = mediaLibraryPermission === null || mediaLibraryPermission === void 0 ? void 0 : mediaLibraryPermission.status) !== null && _a !== void 0 ? _a : PermissionStatus.UNDETERMINED);
                    setIsCameraPermissionGranted((_b = cameraPermission === null || cameraPermission === void 0 ? void 0 : cameraPermission.status) !== null && _b !== void 0 ? _b : PermissionStatus.UNDETERMINED);
                    if (!(isMediaLibraryPermissionGranted !== PermissionStatus.GRANTED)) return [3 /*break*/, 2];
                    return [4 /*yield*/, requestMediaLibraryPermission()];
                case 1:
                    _c.sent();
                    _c.label = 2;
                case 2:
                    if (!(isCameraPermissionGranted !== PermissionStatus.GRANTED)) return [3 /*break*/, 4];
                    return [4 /*yield*/, requestCameraPermission()];
                case 3:
                    _c.sent();
                    _c.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var isTablet = useScreenDimensions().isTablet;
    var showAlert = useAlert().showAlert;
    // Setup permissions
    useEffect(function () {
        setupPermissions();
    }, [mediaLibraryPermission === null || mediaLibraryPermission === void 0 ? void 0 : mediaLibraryPermission.status, cameraPermission === null || cameraPermission === void 0 ? void 0 : cameraPermission.status]);
    // Fetch subject data
    useEffect(function () {
        setSubjectData(getSubjectData(grade.subjectName));
    }, [grade.subjectName]);
    // Volume button to take picture
    useEffect(function () {
        if (isExpoGo())
            return;
    }, []);
    useLayoutEffect(function () {
        navigation.setOptions({
            headerRight: function () { return (<TouchableOpacity style={styles.headerRight} onPress={function () { return navigation.goBack(); }}>
          <X size={24} color="#FFFFFF"/>
        </TouchableOpacity>); },
        });
    }, [navigation]);
    var handleCapture = function () { return __awaiter(void 0, void 0, void 0, function () {
        var photo_1, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if ((cameraPermission === null || cameraPermission === void 0 ? void 0 : cameraPermission.status) !== PermissionStatus.GRANTED) {
                        showAlert({
                            title: "Accès à la caméra",
                            message: "L'autorisation d'accès à la caméra n'a pas été acceptée.",
                            icon: <CameraOff />,
                        });
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, ((_a = cameraRef.current) === null || _a === void 0 ? void 0 : _a.takePictureAsync({
                            quality: 0.75,
                            skipProcessing: true,
                        }))];
                case 2:
                    photo_1 = _b.sent();
                    if (!(photo_1 === null || photo_1 === void 0 ? void 0 : photo_1.uri))
                        return [2 /*return*/];
                    setCapturedImage(photo_1.uri);
                    setIsLoading(true);
                    setTimeout(function () { return __awaiter(void 0, void 0, void 0, function () {
                        var compositeUri, reel_1, error_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, 4, 5]);
                                    return [4 /*yield*/, captureRef(composerRef, {
                                            format: "png",
                                            quality: 0.75,
                                        })];
                                case 1:
                                    compositeUri = _a.sent();
                                    return [4 /*yield*/, createReel(grade, compositeUri, photo_1.uri)];
                                case 2:
                                    reel_1 = _a.sent();
                                    useGradesStore.setState(function (state) {
                                        var _a;
                                        return (__assign(__assign({}, state), { reels: __assign(__assign({}, state.reels), (_a = {}, _a[grade.id] = reel_1, _a)) }));
                                    });
                                    navigation.goBack();
                                    return [3 /*break*/, 5];
                                case 3:
                                    error_2 = _a.sent();
                                    console.error("Failed to save image:", error_2);
                                    showAlert({
                                        title: "Erreur",
                                        message: "Erreur lors de l'enregistrement de l'image",
                                        icon: <BadgeX />
                                    });
                                    return [3 /*break*/, 5];
                                case 4:
                                    setIsLoading(false);
                                    return [7 /*endfinally*/];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); }, 1000);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _b.sent();
                    console.error("Failed to take picture:", error_1);
                    showAlert({
                        title: "Erreur",
                        message: "Impossible de capturer l'image.",
                        icon: <BadgeX />,
                    });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (isCameraPermissionGranted == PermissionStatus.DENIED || isMediaLibraryPermissionGranted == PermissionStatus.DENIED) ? (<View style={[styles.container, { alignItems: "center", justifyContent: "center", padding: 16 }]}>
      <NativeText style={{ fontSize: 100, lineHeight: 115, marginTop: -20 }}>🫣</NativeText>
      <NativeText variant={"titleLarge2"} color={"#FFF"} style={{ textAlign: "center" }}>On ne te voit pas…</NativeText>
      <NativeText color={"#FFF"} style={{ textAlign: "center" }}>Pour réagir à tes notes, Papillon a besoin d'un accès à ta caméra et à ta librairie photo.</NativeText>

      <View style={{ position: "absolute", bottom: 16 + inset.bottom, left: 16, right: 16, gap: 10 }}>
        <ButtonCta value={"Accès à ta caméra"} backgroundColor={"#000"} primary={true} icon={isCameraPermissionGranted == PermissionStatus.GRANTED ? <Check /> : undefined} onPress={function () { isCameraPermissionGranted != PermissionStatus.GRANTED && Linking.openSettings(); }}/>
        <ButtonCta value={"Accès à ta librairie photo"} backgroundColor={"#000"} primary={true} icon={isMediaLibraryPermissionGranted == PermissionStatus.GRANTED ? <Check /> : undefined} onPress={function () { isMediaLibraryPermissionGranted != PermissionStatus.GRANTED && Linking.openSettings(); }}/>
      </View>
    </View>)
        :
            (<View style={styles.container}>
        <View ref={composerRef} style={[
                    styles.cameraContainer,
                    {
                        marginTop: inset.top,
                        maxHeight: isTablet ? "65%" : "75%",
                    }
                ]}>
          <Image source={require("../../../../../assets/images/mask_logotype.png")} tintColor={"#FFFFFF50"} resizeMode="contain" style={styles.logo}/>
          {capturedImage ? (<Image source={{ uri: capturedImage }} style={styles.capturedImage}/>) : (<CameraView ref={cameraRef} style={styles.cameraView} facing="front"/>)}
          <View style={styles.infoNoteContainer}>
            <View style={styles.infoNote}>
              <View style={styles.emojiContainer}>
                <Text style={styles.emoji}>{subjectData.emoji}</Text>
              </View>
              <View>
                <Text style={styles.subjectText} numberOfLines={1} ellipsizeMode="tail">
                  {subjectData.pretty}
                </Text>
                <Text style={styles.dateText}>
                  {new Date(grade.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>
                  {grade.student.disabled
                    ? grade.student.status
                    : (_b = grade.student.value) === null || _b === void 0 ? void 0 : _b.toFixed(2)}
                </Text>
                <Text style={styles.maxScoreText}>/{grade.outOf.value}</Text>
              </View>
            </View>
          </View>
        </View>

        {isLoading && (<View style={styles.loadingContainer}>
            <PapillonSpinner size={30} color="#FFF"/>
            <Text style={styles.loadingText}>Enregistrement en cours...</Text>
          </View>)}

        {!capturedImage && !isLoading && (<TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <View style={styles.captureButtonInner}/>
          </TouchableOpacity>)}
      </View>);
};
var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
    },
    cameraContainer: {
        alignSelf: "center",
        width: "90%",
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
export default GradeReaction;
