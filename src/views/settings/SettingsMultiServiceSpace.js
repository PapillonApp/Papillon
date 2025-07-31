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
import React, { useRef, useState } from "react";
import { ActivityIndicator, Image, KeyboardAvoidingView, Pressable, ScrollView, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { BadgeHelp, Camera, ChevronDown, CircleAlert, TextCursorInput, Trash2, Type, Undo2, User2 } from "lucide-react-native";
import { useAccounts } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMultiService } from "@/stores/multiService";
import { MultiServiceFeature } from "@/stores/multiService/types";
import LottieView from "lottie-react-native";
import { anim2Papillon } from "@/utils/ui/animations";
import Reanimated, { FadeOut, ZoomIn } from "react-native-reanimated";
import PapillonBottomSheet from "@/components/Modals/PapillonBottomSheet";
import * as Haptics from "expo-haptics";
import AccountItem from "@/components/Global/AccountItem";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var SettingsMultiServiceSpace = function (_a) {
    var _b, _c, _d, _e;
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var space = route.params.space;
    var accounts = useAccounts();
    var availableAccounts = accounts.accounts.filter(function (account) { return !account.isExternal && !(account.service == AccountService.PapillonMultiService); });
    var deleteMultiServiceSpace = useMultiService(function (store) { return store.remove; });
    var updateMultiServiceSpace = useMultiService(function (store) { return store.update; });
    var setMultiServiceSpaceAccountFeature = useMultiService(function (store) { return store.setFeatureAccount; });
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var linkedAccount = accounts.accounts.find(function (account) { return account.localID === space.accountLocalID; });
    var firstNameRef = useRef(null);
    var lastNameRef = useRef(null);
    var spaceNameRef = useRef(null);
    var _f = useState((_c = (_b = linkedAccount === null || linkedAccount === void 0 ? void 0 : linkedAccount.studentName) === null || _b === void 0 ? void 0 : _b.first) !== null && _c !== void 0 ? _c : ""), firstName = _f[0], setFirstName = _f[1];
    var _g = useState((_e = (_d = linkedAccount === null || linkedAccount === void 0 ? void 0 : linkedAccount.studentName) === null || _d === void 0 ? void 0 : _d.last) !== null && _e !== void 0 ? _e : ""), lastName = _g[0], setLastName = _g[1];
    var _h = useState(space.name), spaceName = _h[0], setSpaceName = _h[1];
    var _j = useState(false), loadingImage = _j[0], setLoadingImage = _j[1];
    var _k = useState(null), selectedImage = _k[0], setSelectedImage = _k[1];
    var selectPicture = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, img;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setLoadingImage(true);
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
                        updateMultiServiceSpace(space.accountLocalID, "image", img);
                        // @ts-expect-error
                        accounts.update(space.accountLocalID, "personalization", {
                            profilePictureB64: img
                        });
                        setSelectedImage(img);
                    }
                    setLoadingImage(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var _l = useState(false), accountSelectorOpened = _l[0], setAccountSelectorOpened = _l[1];
    var _m = useState(null), selectedAccount = _m[0], setSelectedAccount = _m[1];
    var _o = useState(MultiServiceFeature.Grades), featureSelection = _o[0], setFeatureSelection = _o[1];
    var _p = useState(""), featureSelectionName = _p[0], setFeatureSelectionName = _p[1];
    var showAlert = useAlert().showAlert;
    var deleteSpace = function () {
        showAlert({
            title: "Veux-tu vraiment continuer ?",
            message: "Cette action entrainera la suppression de ton espace multi-service.",
            icon: <BadgeHelp />,
            actions: [
                {
                    title: "Annuler",
                    icon: <Undo2 />,
                    primary: false,
                },
                {
                    title: "Confirmer",
                    icon: <Trash2 />,
                    onPress: function () {
                        accounts.remove(space.accountLocalID);
                        deleteMultiServiceSpace(space.accountLocalID);
                        navigation.goBack();
                    },
                    danger: true,
                    delayDisable: 5,
                }
            ]
        });
    };
    var openAccountSelector = function (feature, name) {
        setSelectedAccount(availableAccounts.find(function (account) { return account.localID === space.featuresServices[feature]; }) || null);
        setFeatureSelection(feature);
        setFeatureSelectionName(name);
        setAccountSelectorOpened(true);
    };
    var setAccountFeature = function (account, feature) {
        var currentSelectedAccountID = space.featuresServices[feature];
        setMultiServiceSpaceAccountFeature(space.accountLocalID, feature, account);
        var linkedAccountsIds = __spreadArray([], ((linkedAccount === null || linkedAccount === void 0 ? void 0 : linkedAccount.associatedAccountsLocalIDs) || []), true);
        if (account) {
            // Putting the space's associated accounts ids in linkedExternalLocalIDs permits the reload of their instance / authentication fields (like externals accounts)
            linkedAccountsIds.push(account.localID);
            linkedAccountsIds = linkedAccountsIds.filter(function (value, index) { return linkedAccountsIds.indexOf(value) === index; }); // Remove duplicates
        }
        else {
            // If feature's service has been removed and service is not assigned to other feature, we remove it from "associatedAccountsLocalIDs"
            var accountNoMoreUsed = !Object.keys(space.featuresServices).some(function (key) {
                return (space.featuresServices[key] == currentSelectedAccountID && !(key === feature));
            });
            if (accountNoMoreUsed) {
                linkedAccountsIds = linkedAccountsIds.filter(function (localID) { return localID != currentSelectedAccountID; });
            }
        }
        // @ts-expect-error
        accounts.update(space.accountLocalID, "associatedAccountsLocalIDs", linkedAccountsIds);
        setAccountSelectorOpened(false);
        setSelectedAccount(null);
    };
    var lottieRef = React.useRef(null);
    var features = [
        {
            name: "Notes",
            feature: MultiServiceFeature.Grades,
            icon: require("@/../assets/lottie/tab_chart.json")
        },
        {
            name: "Compétences",
            feature: MultiServiceFeature.Evaluations,
            icon: require("@/../assets/lottie/tab_evaluations.json")
        },
        {
            name: "Emploi du temps",
            feature: MultiServiceFeature.Timetable,
            icon: require("@/../assets/lottie/tab_calendar.json")
        },
        {
            name: "Devoirs",
            feature: MultiServiceFeature.Homeworks,
            icon: require("@/../assets/lottie/tab_book_2.json")
        },
        {
            name: "Vie scolaire",
            feature: MultiServiceFeature.Attendance,
            icon: require("@/../assets/lottie/tab_check.json")
        },
        {
            name: "Actualités",
            feature: MultiServiceFeature.News,
            icon: require("@/../assets/lottie/tab_news.json")
        },
        {
            name: "Discussions",
            feature: MultiServiceFeature.Chats,
            icon: require("@/../assets/lottie/tab_chat.json")
        }
    ];
    return (<KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top + 44}>

      <ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
            paddingBottom: 16 + insets.bottom,
        }}>

        <NativeListHeader label="Image"/>

        <NativeList>
          <NativeItem key={0} chevron={true} onPress={function () { return selectPicture(); }} leading={(selectedImage || space.image) &&
            <Image source={{ uri: selectedImage || space.image }} style={{
                    width: 55,
                    height: 55,
                    borderRadius: 90,
                    // @ts-expect-error : borderCurve is not in the Image style
                    borderCurve: "continuous",
                }}/>} icon={!(selectedImage || space.image) && <Camera />} trailing={<ActivityIndicator animating={loadingImage}/>}>
            <NativeText variant="title">
              {selectedImage ? "Changer la photo" : "Ajouter une photo"}
            </NativeText>
            {!selectedImage ? (<NativeText variant="subtitle">
                Personnalise ton espace en ajoutant une photo.
              </NativeText>) : (<NativeText variant="subtitle">
                La photo de l'espace reste sur votre appareil.
              </NativeText>)}
          </NativeItem>
        </NativeList>

        <NativeListHeader label="Titre de l'espace"/>

        <NativeList>

          <NativeItem key={0} onPress={function () { var _a; return (_a = spaceNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} chevron={false} icon={<Type />}>
            <NativeText variant="subtitle">
              Titre
            </NativeText>
            <ResponsiveTextInput style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }} placeholder="Mon super espace" placeholderTextColor={theme.colors.text + "80"} value={spaceName} onChangeText={function (text) {
            updateMultiServiceSpace(space.accountLocalID, "name", text);
            // @ts-expect-error
            accounts.update(space.accountLocalID, "identityProvider", {
                name: text
            });
            setSpaceName(text);
        }} ref={spaceNameRef}/>
          </NativeItem>


        </NativeList>

        <NativeListHeader label="Profil de l'espace"/>

        <NativeList>

          <NativeItem key={0} onPress={function () { var _a; return (_a = firstNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} chevron={false} icon={<User2 />}>
            <NativeText variant="subtitle">
              Prénom
            </NativeText>
            <ResponsiveTextInput style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }} placeholder="Théo" placeholderTextColor={theme.colors.text + "80"} value={firstName} onChangeText={function (text) {
            // @ts-expect-error
            accounts.update(space.accountLocalID, "studentName", {
                first: text,
                last: lastName
            });
            setFirstName(text);
        }} ref={firstNameRef}/>
          </NativeItem>

          <NativeItem key={1} onPress={function () { var _a; return (_a = lastNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} chevron={false} icon={<TextCursorInput />}>
            <NativeText variant="subtitle">
              Nom de famille
            </NativeText>
            <ResponsiveTextInput style={{
            fontSize: 16,
            fontFamily: "semibold",
            color: theme.colors.text,
        }} placeholder="Dubois" placeholderTextColor={theme.colors.text + "80"} value={lastName} onChangeText={function (text) {
            // @ts-expect-error
            accounts.update(space.accountLocalID, "studentName", {
                first: firstName,
                last: text
            });
            setLastName(text);
        }} ref={lastNameRef}/>
          </NativeItem>
        </NativeList>
        <NativeText style={{
            paddingLeft: 7,
            paddingTop: 15
        }} variant="subtitle">
          Accède à plus d'options en sélectionnant l'espace virtuel, et en personnalisant ton profil dans les paramètres.
        </NativeText>

        <NativeListHeader label="Configuration"/>
        <NativeList>
          {features.map(function (feature, index) { return (<>
              <NativeItem key={index * 2} icon={<Reanimated.View entering={anim2Papillon(ZoomIn)} exiting={anim2Papillon(FadeOut)} style={[
                    {
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: theme.colors.primary + "22",
                        borderRadius: 8,
                        borderCurve: "continuous",
                    },
                ]}>
                    <LottieView ref={lottieRef} source={feature.icon} colorFilters={[{
                        keypath: "*",
                        color: theme.colors.primary,
                    }]} style={[
                    {
                        width: 30,
                        height: 30,
                    }
                ]}/>
                  </Reanimated.View>} onPress={function () { return openAccountSelector(feature.feature, feature.name); }} trailing={<ChevronDown color={theme.colors.primary}/>} chevron={false}>
                <NativeText variant="title">{feature.name}</NativeText>
              </NativeItem>
              {accounts.accounts.find(function (account) {
                return account.localID === space.featuresServices[feature.feature];
            }) ?
                (<AccountItem account={accounts.accounts.find(function (account) { return account.localID === space.featuresServices[feature.feature]; })} endCheckMark={false} additionalStyles={{
                        paddingStart: 10,
                        borderBottomWidth: 1,
                        backgroundColor: theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11",
                        borderColor: theme.colors.text + "20"
                    }}/>) :
                (<NativeItem key={index * 2 + 1} icon={<CircleAlert />} separator={true}>
                    <NativeText>Pas de service sélectionné</NativeText>
                  </NativeItem>)}
            </>); })}
        </NativeList>

        <PapillonBottomSheet opened={accountSelectorOpened} setOpened={function (opened) { return setAccountSelectorOpened(opened); }}>
          <View style={{
            paddingHorizontal: 10
        }}>
            <NativeListHeader label={"S\u00E9lectionner un service pour \"".concat(featureSelectionName, "\"")}/>
            <NativeList>
              {availableAccounts.map(function (account, index) { return (<Pressable key={index} onPress={function () {
                playHaptics("impact", {
                    impact: Haptics.ImpactFeedbackStyle.Soft,
                });
                setAccountFeature(account, featureSelection);
            }}>
                  <AccountItem account={account} additionalStyles={{
                backgroundColor: (selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.localID) === account.localID ? (theme.dark ? theme.colors.primary + "09" : theme.colors.primary + "11") : theme.colors.background,
                borderBottomWidth: index !== availableAccounts.length - 1 ? 1 : 0,
                borderColor: theme.colors.text + "20",
            }} endCheckMark={(selectedAccount === null || selectedAccount === void 0 ? void 0 : selectedAccount.localID) === account.localID}/>
                </Pressable>); })}
              {/*setAccountFeature*/}
            </NativeList>
            <ButtonCta style={{
            marginTop: 25
        }} primary={false} value="Réinitialiser" onPress={function () { return setAccountFeature(undefined, featureSelection); }}/>
          </View>
        </PapillonBottomSheet>

        <NativeListHeader label="Actions"/>
        <NativeList>
          <NativeItem onPress={function () { return deleteSpace(); }} leading={<Trash2 color="#CF0029"/>}>
            <NativeText variant="title">
              Supprimer
            </NativeText>
            <NativeText variant="subtitle">
              Supprimer l'environnement
            </NativeText>
          </NativeItem>
        </NativeList>
      </ScrollView>
    </KeyboardAvoidingView>);
};
export default SettingsMultiServiceSpace;
