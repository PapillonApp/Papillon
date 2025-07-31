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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { useTimetableStore } from "@/stores/timetable";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Calendar, Info, QrCode, X } from "lucide-react-native";
import React, { useEffect } from "react";
import { Alert, Modal, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import * as Clipboard from "expo-clipboard";
import { CameraView } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { fetchIcalData } from "@/services/local/ical";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var ical = require("cal-parser");
var LessonsImportIcal = function (_a) {
    var _b, _c, _d;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var defaultIcal = ((_b = route.params) === null || _b === void 0 ? void 0 : _b.ical) || "";
    var defaultTitle = ((_c = route.params) === null || _c === void 0 ? void 0 : _c.title) || "";
    var autoAdd = ((_d = route.params) === null || _d === void 0 ? void 0 : _d.autoAdd) || false;
    var account = useCurrentAccount(function (store) { return store.account; });
    var timetables = useTimetableStore(function (store) { return store.timetables; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var _e = React.useState(defaultIcal), url = _e[0], setUrl = _e[1];
    var _f = React.useState(defaultTitle), title = _f[0], setTitle = _f[1];
    var _g = React.useState(false), cameraVisible = _g[0], setCameraVisible = _g[1];
    var scanIcalQRCode = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setCameraVisible(true);
            return [2 /*return*/];
        });
    }); };
    var _h = React.useState(false), loading = _h[0], setLoading = _h[1];
    useEffect(function () {
        var _a;
        if (!account.instance)
            return;
        if (defaultIcal && autoAdd) {
            if (((_a = account.personalization.icalURLs) === null || _a === void 0 ? void 0 : _a.filter(function (u) { return u.url === defaultIcal; }).length) === 0) {
                saveIcal().then(function () {
                    if (autoAdd) {
                        navigation.goBack();
                        navigation.navigate("Lessons");
                    }
                });
            }
            else {
                navigation.goBack();
            }
        }
    }, [defaultIcal]);
    var showAlert = useAlert().showAlert;
    var saveIcal = function () { return __awaiter(void 0, void 0, void 0, function () {
        var oldUrls;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoading(true);
                    oldUrls = account.personalization.icalURLs || [];
                    return [4 /*yield*/, fetch(url)
                            .then(function (response) { return response.text(); })
                            .then(function (text) {
                            var parsed = ical.parseString(text);
                            var newParsed = parsed;
                            newParsed.events = [];
                            var defaultTitle = "Mon calendrier" + (oldUrls.length > 0 ? " ".concat(oldUrls.length + 1) : "");
                            mutateProperty("personalization", __assign(__assign({}, account.personalization), { icalURLs: __spreadArray(__spreadArray([], oldUrls, true), [{
                                        name: title.trim().length > 0 ? title : defaultTitle,
                                        url: url,
                                    }], false) }));
                            fetchIcalData(account);
                        })
                            .catch(function () {
                            Alert.alert("Erreur", "Impossible de récupérer les données du calendrier. Vérifie l'URL et réessaye.");
                        })
                            .finally(function () {
                            setLoading(false);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    return (<ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
        }} contentInsetAdjustmentBehavior="automatic">
      <Modal visible={cameraVisible} animationType="slide" presentationStyle="formSheet" onRequestClose={function () { return setCameraVisible(false); }}>
        <TouchableOpacity onPress={function () { return setCameraVisible(false); }} style={{
            padding: 8,
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 999,
            borderRadius: 100,
            backgroundColor: "#ffffff39",
            opacity: 1,
        }}>
          <X size={20} strokeWidth={2.5} color={"#fff"}/>
        </TouchableOpacity>

        <View style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 10,
            height: "100%",
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
        }}>
          <View style={{
            width: 260,
            maxWidth: "90%",
            aspectRatio: 1,
            borderWidth: 3,
            borderColor: "#fff",
            borderRadius: 8,
        }}/>
        </View>

        <CameraView style={{
            flex: 1,
        }} barcodeScannerSettings={{
            barcodeTypes: ["qr"],
        }} onBarcodeScanned={function (_a) {
            var data = _a.data;
            setUrl(data);
            setCameraVisible(false);
        }}/>
      </Modal>

      <NativeList>
        <NativeItem icon={<Info />}>
          <NativeText variant="subtitle">
            Les liens iCal permettent d'importer des calendriers en temps réel depuis un agenda compatible.
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="Utiliser un lien iCal"/>

      <NativeList>
        <NativeItem trailing={<TouchableOpacity style={{
                marginRight: 8,
            }} onPress={function () { return scanIcalQRCode(); }}>
              <QrCode size={24} color={theme.colors.primary}/>
            </TouchableOpacity>}>
          <ResponsiveTextInput value={url} onChangeText={setUrl} placeholder="Adresse URL du calendrier" placeholderTextColor={theme.colors.text + 50} style={{
            flex: 1,
            paddingHorizontal: 6,
            paddingVertical: 0,
            fontFamily: "medium",
            fontSize: 16,
            color: theme.colors.text,
        }}/>
        </NativeItem>
      </NativeList>

      <ButtonCta value="Importer" icon={loading ?
            <View>
            <PapillonSpinner strokeWidth={3} size={22} color={theme.colors.text}/>
          </View> : undefined} primary={!loading} style={{
            marginTop: 16,
        }} onPress={function () { saveIcal(); }}/>

      {account.personalization.icalURLs && account.personalization.icalURLs.length > 0 && (<>
        <NativeListHeader label="URLs ajoutées"/>

        <NativeList>
          {account.personalization.icalURLs.map(function (url, index) { return (<NativeItem key={index} icon={<Calendar />} onPress={function () {
                    Alert.alert(url.name, url.url, [
                        {
                            text: "Annuler",
                            style: "cancel",
                        },
                        {
                            text: "Copier l'URL",
                            onPress: function () {
                                Clipboard.setString(url.url);
                                Alert.alert("URL copiée", url.url);
                            },
                        },
                        {
                            text: "Supprimer le calendrier",
                            style: "destructive",
                            onPress: function () {
                                useTimetableStore.getState().removeClassesFromSource("ical://" + url.url);
                                var urls = account.personalization.icalURLs || [];
                                urls.splice(index, 1);
                                mutateProperty("personalization", __assign(__assign({}, account.personalization), { icalURLs: urls }));
                            },
                        },
                    ]);
                }}>
              <NativeText variant="title">{url.name}</NativeText>
              <NativeText variant="subtitle">{url.url}</NativeText>
            </NativeItem>); })}
        </NativeList>
      </>)}

    </ScrollView>);
};
export default LessonsImportIcal;
