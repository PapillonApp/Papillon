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
import React, { useRef, useState } from "react";
import { Image, ScrollView, Switch, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import MultiServiceContainerCard from "@/components/Settings/MultiServiceContainerCard";
import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { BadgeInfo, Check, ImageIcon, PlugZap, Plus, ShieldAlert, Type, Undo2 } from "lucide-react-native";
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { useMultiService } from "@/stores/multiService";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import * as ImagePicker from "expo-image-picker";
import { animPapillon } from "@/utils/ui/animations";
import { ZoomIn, ZoomOut } from "react-native-reanimated";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { AccountService } from "@/stores/account/types";
import uuid from "@/utils/uuid-v4";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { defaultTabs } from "@/consts/DefaultTabs";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var SettingsMultiService = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var toggleMultiService = useMultiService(function (store) { return store.toggleEnabledState; });
    var multiServiceEnabled = useMultiService(function (store) { return store.enabled; });
    var multiServiceSpaces = useMultiService(function (store) { return store.spaces; });
    var createMultiServiceSpace = useMultiService(function (store) { return store.create; });
    var deleteMultiServiceSpace = useMultiService(function (store) { return store.remove; });
    var accounts = useAccounts();
    var currentAccount = useCurrentAccount();
    var _b = useState(false), spaceCreationSheetOpened = _b[0], setSpaceCreationSheetOpened = _b[1];
    var _c = useState(""), spaceName = _c[0], setSpaceName = _c[1];
    var spaceNameRef = useRef(null);
    var _d = useState(false), loadingImage = _d[0], setLoadingImage = _d[1];
    var _e = useState(null), selectedImage = _e[0], setSelectedImage = _e[1];
    var showAlert = useAlert().showAlert;
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
                        setSelectedImage(img);
                    }
                    setLoadingImage(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var createSpace = function () {
        var _a, _b;
        if (spaceName == "") {
            showAlert({
                title: "Aucun titre défini",
                message: "Tu dois définir un titre à l'environnement multi service pour pouvoir le créer.",
                icon: <BadgeInfo />,
            });
            return;
        }
        var localID = uuid();
        var defaultSpaceTabs = [
            "Home",
            "Lessons",
            "Homeworks",
            "Grades",
            "News",
            "Attendance"
        ];
        var linkedAccount = {
            isExternal: false,
            linkedExternalLocalIDs: [],
            associatedAccountsLocalIDs: [],
            authentication: null,
            identity: {},
            identityProvider: {
                name: spaceName,
                identifier: undefined,
                rawData: undefined
            },
            instance: null,
            localID: localID,
            name: spaceName,
            personalization: {
                profilePictureB64: selectedImage || undefined,
                tabs: defaultTabs
                    .filter(function (current) { return defaultSpaceTabs.includes(current.tab); })
                    .map(function (tab, index) { return ({
                    name: tab.tab,
                    enabled: index <= 4
                }); })
            },
            service: AccountService.PapillonMultiService,
            studentName: {
                first: ((_a = currentAccount.account) === null || _a === void 0 ? void 0 : _a.studentName.first) || "",
                last: ((_b = currentAccount.account) === null || _b === void 0 ? void 0 : _b.studentName.last) || ""
            },
            serviceData: {},
            providers: []
        };
        var space = {
            accountLocalID: localID,
            featuresServices: {
                grades: undefined,
                timetable: undefined,
                news: undefined,
                homeworks: undefined,
                attendance: undefined
            },
            name: spaceName,
            image: selectedImage || undefined
        };
        createMultiServiceSpace(space, linkedAccount);
        accounts.create(linkedAccount);
        setSpaceCreationSheetOpened(false);
        setSelectedImage(null);
        setSpaceName("");
    };
    var deleteAllSpaces = function () {
        for (var _i = 0, multiServiceSpaces_1 = multiServiceSpaces; _i < multiServiceSpaces_1.length; _i++) {
            var space = multiServiceSpaces_1[_i];
            accounts.remove(space.accountLocalID);
            deleteMultiServiceSpace(space.accountLocalID);
        }
    };
    return (<ScrollView contentContainerStyle={{
            paddingHorizontal: 15,
            paddingBottom: 25
        }}>
      <MultiServiceContainerCard theme={theme}/>

      <NativeListHeader label="Options"/>
      <NativeList>
        <NativeItem trailing={<Switch trackColor={{
                false: theme.colors.border,
                true: theme.colors.primary
            }} thumbColor={theme.dark ? theme.colors.text : theme.colors.background} value={multiServiceEnabled !== null && multiServiceEnabled !== void 0 ? multiServiceEnabled : false} onValueChange={function () {
                if (multiServiceEnabled) {
                    showAlert({
                        title: "Attention",
                        message: "La désactivation du multi-service entrainera la suppression de tes environnement multi-services créés.",
                        icon: <ShieldAlert />,
                        actions: [
                            {
                                title: "Annuler",
                                icon: <Undo2 />,
                                primary: false,
                            },
                            {
                                title: "Confirmer",
                                icon: <Check />,
                                onPress: function () {
                                    deleteAllSpaces();
                                    toggleMultiService();
                                },
                                danger: true,
                                delayDisable: 5,
                            }
                        ]
                    });
                }
                else {
                    toggleMultiService();
                }
            }}/>} leading={<NativeIcon icon={<PlugZap />} color="#1f76ce"/>}>
          <NativeText variant="title">
            Multiservice
          </NativeText>
          <NativeText variant="subtitle">
            Activer le multiservice te permet de créer ton premier espace virtuel.
          </NativeText>
        </NativeItem>
      </NativeList>

      {multiServiceEnabled && (<>
          <NativeListHeader label="Mes Espaces"/>
          <NativeList>
            {multiServiceSpaces.map(function (space, index) { return (<NativeItem key={index} onPress={function () { return navigation.navigate("SettingsMultiServiceSpace", { space: space }); }} leading={<Image source={space.image ?
                        { uri: space.image } :
                        defaultProfilePicture(AccountService.PapillonMultiService, "")} style={{
                        width: 30,
                        height: 30,
                        borderRadius: 3,
                        // @ts-expect-error : borderCurve is not in the Image style
                        borderCurve: "continuous",
                    }}/>}>
                <NativeText variant="title">
                  {space.name}
                </NativeText>
              </NativeItem>); })}
            <NativeItem onPress={function () { return setSpaceCreationSheetOpened(true); }} icon={<Plus />}>
              <NativeText>
                Nouvel espace
              </NativeText>
              <NativeText variant="subtitle">
                Créer un nouvel environnement multi service
              </NativeText>
            </NativeItem>
          </NativeList>
          <NativeText style={{
                paddingTop: 25,
                padding: 10,
                fontFamily: "medium",
                fontSize: 12.5,
                lineHeight: 12,
                color: theme.colors.text + "60",
                textAlign: "center",
            }} variant="subtitle">
            Cette fonctionnalité est instable et peut engendrer des dysfonctionnements sur les comptes associés.
            Si tu rencontres un problème, déconnecte et reconnecte tes comptes pour retrouver leur fonctionnement normal.
          </NativeText>
          <BottomSheet setOpened={function (opened) { return setSpaceCreationSheetOpened(opened); }} opened={spaceCreationSheetOpened} contentContainerStyle={{ paddingHorizontal: 16 }}>
            <NativeListHeader label="Créer un espace"/>
            <NativeList>
              <View style={{
                flexDirection: "row",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                paddingVertical: 12,
                paddingHorizontal: 12,
                gap: 14,
            }}>
                <View style={{ flex: 1 }}>
                  <NativeItem onPress={function () { var _a; return (_a = spaceNameRef.current) === null || _a === void 0 ? void 0 : _a.focus(); }} chevron={false} icon={<Type />}>
                    <NativeText>
                      Titre de l'espace
                    </NativeText>
                    <ResponsiveTextInput style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text,
            }} placeholder="Mon espace multi service" placeholderTextColor={theme.colors.text + "80"} value={spaceName} onChangeText={setSpaceName} ref={spaceNameRef}/>
                  </NativeItem>
                  <NativeItem onPress={function () { return selectPicture(); }} icon={loadingImage ? <PapillonSpinner size={18} color="white" strokeWidth={2.8} entering={animPapillon(ZoomIn)} exiting={animPapillon(ZoomOut)}/> : <ImageIcon />} trailing={selectedImage && <Image source={{ uri: selectedImage }} style={{
                    width: 30,
                    height: 30,
                    borderRadius: 90,
                    // @ts-expect-error : borderCurve is not in the Image style
                    borderCurve: "continuous",
                }}/>}>
                    <NativeText>
                      Image
                    </NativeText>
                    <NativeText style={{
                fontSize: 16,
                fontFamily: "semibold",
                color: theme.colors.text + "80",
            }}>
                      Définir une image
                    </NativeText>
                  </NativeItem>
                </View>
              </View>
            </NativeList>
            <View style={{
                flexDirection: "column",
                paddingTop: 25,
                paddingBottom: 0,
                paddingHorizontal: 0,
                gap: 10,
            }}>
              <ButtonCta primary={true} onPress={function () { return createSpace(); }} value="Créer l'espace"/>
              <ButtonCta primary={false} value="Annuler" onPress={function () { return setSpaceCreationSheetOpened(false); }}/>
            </View>
          </BottomSheet>
        </>)}
    </ScrollView>);
};
export default SettingsMultiService;
