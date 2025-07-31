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
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import * as ImagePicker from "expo-image-picker";
import { BadgeX, Camera, CameraOff, ChevronDown, ChevronUp, ClipboardCopy, TextCursorInput, Trash, Undo2, User2, UserCircle2, WholeWord } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAlert } from "@/providers/AlertProvider";
import * as Clipboard from "expo-clipboard";
import { TouchableOpacity } from "react-native-gesture-handler";
import { getDefaultProfilePicture } from "@/utils/GetRessources/GetDefaultProfilePicture";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var SettingsProfile = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var _m = useState((_c = (_b = account.studentName) === null || _b === void 0 ? void 0 : _b.first) !== null && _c !== void 0 ? _c : ""), oldFirstName = _m[0], setOldFirstName = _m[1];
    var _o = useState((_e = (_d = account.studentName) === null || _d === void 0 ? void 0 : _d.last) !== null && _e !== void 0 ? _e : ""), oldLastName = _o[0], setOldLastName = _o[1];
    var firstNameRef = useRef(null);
    var lastNameRef = useRef(null);
    var _p = useState((_g = (_f = account.studentName) === null || _f === void 0 ? void 0 : _f.first) !== null && _g !== void 0 ? _g : ""), firstName = _p[0], setFirstName = _p[1];
    var _q = useState((_j = (_h = account.studentName) === null || _h === void 0 ? void 0 : _h.last) !== null && _j !== void 0 ? _j : ""), lastName = _q[0], setLastName = _q[1];
    var showAlert = useAlert().showAlert;
    // on name change, update the account name
    useEffect(function () {
        var newLastName = lastName;
        var newFirstName = firstName;
        if (newFirstName.trim() === "") {
            newFirstName = oldFirstName;
        }
        if (newLastName.trim() === "") {
            newLastName = oldLastName;
        }
        mutateProperty("studentName", {
            first: newFirstName.trim(),
            last: newLastName.trim(),
        });
    }, [firstName, lastName]);
    var _r = useState(account.personalization.profilePictureB64), profilePic = _r[0], setProfilePic = _r[1];
    var _s = useState(false), loadingPic = _s[0], setLoadingPic = _s[1];
    var resetProfilePic = function () { return __awaiter(void 0, void 0, void 0, function () {
        var img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingPic(true);
                    return [4 /*yield*/, getDefaultProfilePicture(account)];
                case 1:
                    img = _a.sent();
                    // If the image is undefined, an alert is displayed with an error message
                    if (!img) {
                        showAlert({
                            title: "Erreur",
                            message: "Impossible de récupérer de la photo de profil",
                            icon: <BadgeX />,
                            actions: [
                                {
                                    title: "OK",
                                    primary: true,
                                    icon: <Undo2 />,
                                },
                                {
                                    title: "Supprimer la photo",
                                    primary: false,
                                    onPress: function () {
                                        setProfilePic(undefined);
                                        mutateProperty("personalization", __assign(__assign({}, account.personalization), { profilePictureB64: undefined }));
                                    },
                                    icon: <Trash />,
                                }
                            ],
                        });
                    }
                    else {
                        // If image available, update profile picture
                        setProfilePic(img);
                        mutateProperty("personalization", __assign(__assign({}, account.personalization), { profilePictureB64: img }));
                    }
                    setLoadingPic(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var updateProfilePic = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingPic(true);
                    return [4 /*yield*/, ImagePicker.launchImageLibraryAsync({
                            mediaTypes: ImagePicker.MediaTypeOptions.Images,
                            allowsEditing: true,
                            aspect: [1, 1],
                            quality: 1,
                            base64: true,
                        })];
                case 1:
                    result = _a.sent();
                    if (!result.canceled) {
                        img = "data:image/jpeg;base64," + result.assets[0].base64;
                        setProfilePic(img);
                        mutateProperty("personalization", __assign(__assign({}, account.personalization), { profilePictureB64: img }), true);
                    }
                    setLoadingPic(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var _t = useState(account.personalization.hideNameOnHomeScreen), hideNameOnHomeScreen = _t[0], setHideNameOnHomeScreen = _t[1];
    var _u = useState(account.personalization.hideProfilePicOnHomeScreen), hideProfilePicOnHomeScreen = _u[0], setHideProfilePicOnHomeScreen = _u[1];
    useEffect(function () {
        mutateProperty("personalization", __assign(__assign({}, account.personalization), { hideNameOnHomeScreen: hideNameOnHomeScreen, hideProfilePicOnHomeScreen: hideProfilePicOnHomeScreen }));
    }, [hideNameOnHomeScreen, hideProfilePicOnHomeScreen]);
    var identityData = account.identity ? [
        account.identity.civility && {
            label: "Civilité",
            value: account.identity.civility === "M" ? "Monsieur" : "Madame",
        },
        account.identity.birthDate && {
            label: "Date de naissance",
            value: new Date(account.identity.birthDate).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
            }),
        },
        account.identity.birthPlace && {
            label: "Lieu de naissance",
            value: account.identity.birthPlace,
        },
        account.identity.ine && {
            label: "INE",
            value: account.identity.ine,
        },
        account.identity.boursier && {
            label: "Boursier",
            value: "Oui",
        },
        account.identity.email && {
            label: "Email",
            value: account.identity.email[0],
        },
        account.identity.phone && {
            label: "Téléphone",
            value: account.identity.phone[0],
        },
        account.identity.address && {
            label: "Adresse",
            value: "".concat(account.identity.address.street, ", ").concat(account.identity.address.zipCode, " ").concat(account.identity.address.city),
        },
    ].filter(Boolean) : [];
    var _v = useState(false), showIdentity = _v[0], setShowIdentity = _v[1];
    return (<KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top + 44}>
      <ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
            paddingBottom: 16 + insets.bottom,
        }}>

        <NativeListHeader label="Photo de profil"/>

        <NativeList>
          <NativeItem chevron={true} onPress={function () { return updateProfilePic(); }} leading={profilePic &&
            <Image source={{ uri: profilePic }} style={{
                    width: 70,
                    height: 70,
                    borderRadius: 16,
                    // @ts-expect-error : borderCurve is not in the Image style
                    borderCurve: "continuous",
                }}/>} icon={!profilePic && <Camera />} trailing={<ActivityIndicator animating={loadingPic}/>}>
            <NativeText variant="title">
              {profilePic ? "Changer la photo de profil" : "Ajouter une photo de profil"}
            </NativeText>
            {!profilePic ? (<NativeText variant="subtitle">
                Personnalise ton compte en ajoutant une photo de profil.
              </NativeText>) : (<NativeText variant="subtitle">
                Ta photo de profil reste sur ton appareil.
              </NativeText>)}
          </NativeItem>

          {profilePic && (<NativeItem chevron={false} onPress={resetProfilePic} icon={<CameraOff />}>
              <NativeText variant="title">
                Réinitialiser la photo de profil
              </NativeText>
              <NativeText variant="subtitle">
                Supprime la photo actuelle et rétablit l'image par défaut.
              </NativeText>
            </NativeItem>)}
        </NativeList>

        <NativeListHeader label="Mes informations"/>

        <NativeList>

          <NativeItem onPress={function () { var _a; return (_a = firstNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} chevron={false} icon={<User2 />}>
            <NativeText variant="subtitle">
              Prénom
            </NativeText>
            <ResponsiveTextInput style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }} placeholder="Théo" placeholderTextColor={theme.colors.text + "80"} value={firstName} onChangeText={setFirstName} ref={firstNameRef}/>
          </NativeItem>

          <NativeItem onPress={function () { var _a; return (_a = lastNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} chevron={false} icon={<TextCursorInput />}>
            <NativeText variant="subtitle">
              Nom de famille
            </NativeText>
            <ResponsiveTextInput style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }} placeholder="Dubois" placeholderTextColor={theme.colors.text + "80"} value={lastName} onChangeText={setLastName} ref={lastNameRef}/>
          </NativeItem>

        </NativeList>

        <NativeListHeader label="Afficher sur la page d'accueil"/>

        <NativeList>
          <NativeItem chevron={false} icon={<WholeWord />} trailing={<Switch value={!hideNameOnHomeScreen} onValueChange={function () { return setHideNameOnHomeScreen(!hideNameOnHomeScreen); }} trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary
            }} thumbColor={theme.dark ? theme.colors.text : theme.colors.background}/>}>
            <NativeText style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }}>
              Nom de famille
            </NativeText>
          </NativeItem>

          <NativeItem chevron={false} icon={<UserCircle2 />} trailing={<Switch value={!hideProfilePicOnHomeScreen} onValueChange={function () { return setHideProfilePicOnHomeScreen(!hideProfilePicOnHomeScreen); }} trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary
            }} thumbColor={theme.dark ? theme.colors.text : theme.colors.background}/>}>
            <NativeText style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }}>
              Photo de profil
            </NativeText>
          </NativeItem>
        </NativeList>

        {((_l = Object.keys((_k = account.identity) !== null && _k !== void 0 ? _k : {})) === null || _l === void 0 ? void 0 : _l.length) > 0 && (<NativeListHeader label="Informations d'identité" trailing={<TouchableOpacity onPress={function () { return setShowIdentity(!showIdentity); }}>
                {showIdentity ?
                    <ChevronUp size={24} color={theme.colors.primary}/> :
                    <ChevronDown size={24} color={theme.colors.primary}/>}
              </TouchableOpacity>}/>)}

        {showIdentity && (<NativeList>
            {identityData.map(function (item, index) { return (<NativeItem key={"identityData_" + index} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Clipboard.setStringAsync(item.value)];
                            case 1:
                                _a.sent();
                                showAlert({
                                    title: "Copié",
                                    message: "L'information a été copiée dans le presse-papier.",
                                    icon: <ClipboardCopy />,
                                });
                                return [2 /*return*/];
                        }
                    });
                }); }} chevron={false}>
                <NativeText variant="subtitle">
                  {item.label}
                </NativeText>
                <NativeText variant="body">
                  {item.value}
                </NativeText>
              </NativeItem>); })}
          </NativeList>)}
      </ScrollView>
    </KeyboardAvoidingView>);
};
export default SettingsProfile;
