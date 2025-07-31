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
import { useAccounts, useCurrentAccount } from "@/stores/account";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { useIsFocused, useTheme } from "@react-navigation/native";
import { BadgeHelp, PlusIcon, Trash2, Undo2 } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Dimensions, Image, RefreshControl, StatusBar, Text, TouchableHighlight, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import PapillonAvatar from "@/components/Global/PapillonAvatar";
import PackageJSON from "@/../package.json";
import Reanimated, { Extrapolation, FadeInDown, FadeOut, interpolate, LinearTransition, useAnimatedRef, useAnimatedStyle, useScrollViewOffset, ZoomIn, } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { animPapillon } from "@/utils/ui/animations";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { PressableScale } from "react-native-pressable-scale";
import datasets from "@/consts/datasets.json";
import { useAlert } from "@/providers/AlertProvider";
var AccountSelector = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var isFocused = useIsFocused();
    var currentAccount = useCurrentAccount(function (store) { return store.account; });
    var switchTo = useCurrentAccount(function (store) { return store.switchTo; });
    var removeAccount = useAccounts(function (store) { return store.remove; });
    var lastOpenedAccountID = useAccounts(function (store) { return store.lastOpenedAccountID; });
    var accounts = useAccounts(function (store) { return store.accounts; });
    var _b = useState(null), loading = _b[0], setLoading = _b[1];
    var _c = useState(false), downloadedIllustrations = _c[0], setDownloadedIllustrations = _c[1];
    var _d = useState(undefined), illustration = _d[0], setIllustration = _d[1];
    var _e = useState(false), illustrationLoaded = _e[0], setIllustrationLoaded = _e[1];
    var scrollRef = useAnimatedRef();
    var scrollOffset = useScrollViewOffset(scrollRef);
    var headerRatioHeight = 250;
    var headerAnimatedStyle = useAnimatedStyle(function () { return ({
        top: interpolate(scrollOffset.value, [headerRatioHeight - 1000, 0, headerRatioHeight - (insets.top + 64), headerRatioHeight + 1000], [headerRatioHeight - 1000, 0, 0, headerRatioHeight + 1000 - (insets.top + 64)], Extrapolation.CLAMP),
    }); });
    var headerOpacity = useAnimatedStyle(function () { return ({
        opacity: interpolate(scrollOffset.value, [0, 100], [0, 0.75], Extrapolation.CLAMP),
    }); });
    var showAlert = useAlert().showAlert;
    useEffect(function () {
        if (!downloadedIllustrations) {
            updateIllustration();
        }
    }, []);
    var updateIllustration = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fetch(datasets["illustrations"])
                .then(function (response) { return response.json(); })
                .then(function (data) {
                setDownloadedIllustrations(true);
                // select a random illustration
                setIllustration(data[Math.floor(Math.random() * data.length)]);
            });
            return [2 /*return*/];
        });
    }); };
    useEffect(function () {
        void function () {
            return __awaiter(this, void 0, void 0, function () {
                var selectedAccount;
                var _a;
                return __generator(this, function (_b) {
                    if (!useAccounts.persist.hasHydrated())
                        return [2 /*return*/];
                    // If there are no accounts, redirect the user to the first installation page.
                    if (accounts.filter(function (account) { return !account.isExternal; }).length === 0) {
                        // Use the `reset` method to clear the navigation stack.
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "FirstInstallation" }],
                        });
                    }
                    else {
                        selectedAccount = (_a = accounts.find(function (account) { return account.localID === lastOpenedAccountID; })) !== null && _a !== void 0 ? _a : accounts.find(function (account) { return !account.isExternal; });
                        switchTo(selectedAccount);
                    }
                    return [2 /*return*/];
                });
            });
        }();
    }, [accounts]);
    useEffect(function () {
        if (currentAccount && (currentAccount === null || currentAccount === void 0 ? void 0 : currentAccount.localID)) {
            navigation.reset({
                index: 0,
                routes: [{ name: "AccountStack" }],
            });
            SplashScreen.hideAsync();
        }
    }, [currentAccount]);
    if (!accounts)
        return null;
    return (<View style={{
            flex: 1,
        }}>
      <View style={{
            position: "absolute",
            zIndex: 99999999,
            bottom: 0,
            left: 0,
            right: 0,
            height: 70 + insets.bottom,
            shadowColor: "#000000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.2,
            shadowRadius: 4,
        }}>
        <LinearGradient colors={[theme.colors.background + "00", theme.colors.background]} locations={[0, (insets.bottom) / 70]} style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 70 + insets.bottom,
            zIndex: 5,
        }}/>
        <PressableScale style={{
            zIndex: 99999999,
            position: "absolute",
            right: 20,
            bottom: 16 + insets.bottom,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            gap: 10,
            borderRadius: 100,
            backgroundColor: theme.colors.primary,
        }} onPress={function () { return navigation.navigate("ServiceSelector"); }}>
          <PlusIcon size={24} strokeWidth={2.5} color={"#fff"}/>

          <Text style={{
            color: "#ffffff",
            fontFamily: "semibold",
            fontSize: 16,
        }}>
            Ajouter un compte
          </Text>
        </PressableScale>

        <TouchableHighlight style={{
            position: "absolute",
            bottom: 16 + insets.bottom,
            left: 16,
            alignSelf: "flex-start",
            opacity: 0.4,
            zIndex: 99999999,
            paddingHorizontal: 8,
            marginHorizontal: -8,
            paddingVertical: 4,
            borderRadius: 5,
        }} underlayColor={theme.colors.text + "44"} onLongPress={function () { return navigation.navigate("DevMenu"); }} delayLongPress={2000}>
          <NativeText style={{
            fontSize: 12,
        }}>
            ver. {PackageJSON.version}
          </NativeText>
        </TouchableHighlight>
      </View>

      <Reanimated.ScrollView style={{
            paddingBottom: insets.bottom + 16,
            paddingTop: 0,
            flex: 1
        }} ref={scrollRef} scrollEventThrottle={8} refreshControl={<RefreshControl refreshing={false} onRefresh={function () {
                updateIllustration();
            }} progressViewOffset={headerRatioHeight}/>} contentContainerStyle={{
            minHeight: Dimensions.get("window").height,
        }}>
        {isFocused && (<StatusBar barStyle="light-content" backgroundColor="transparent" translucent/>)}

        <Reanimated.View style={[{
                width: "100%",
                zIndex: 2,
                borderBottomColor: theme.colors.border,
                borderBottomWidth: 1,
                height: headerRatioHeight,
            }, headerAnimatedStyle]}>
          {!illustrationLoaded &&
            <Reanimated.View style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    backgroundColor: "#1E212D",
                    zIndex: 3,
                }} exiting={FadeOut}/>}

          <Reanimated.Image source={illustration && { uri: illustration.image }} style={{
            width: "100%",
            height: "100%",
        }} onLoad={function () { return setIllustrationLoaded(true); }}/>
          <Reanimated.View style={[{
                backgroundColor: "#000",
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
            }, headerOpacity]}/>

          <LinearGradient colors={["#00000000", "#000000"]} locations={[0.5, 0.8]} style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "0%",
            height: "100%",
            opacity: 0.85,
            zIndex: 5
        }}/>

          <View style={{
            position: "absolute",
            left: 16,
            right: 16,
            bottom: 16,
            gap: 4,
            zIndex: 9
        }}>
            <Text style={{
            color: "#ffffff",
            fontSize: 18,
            fontFamily: "bold",
        }}>
              Bienvenue sur Papillon !
            </Text>

            <Text style={{
            color: "#ffffff",
            fontSize: 15,
            fontFamily: "medium",
            opacity: 0.8,
        }}>
              Sélectionne un compte pour commencer.
            </Text>
          </View>
        </Reanimated.View>

        {accounts.filter(function (account) { return !account.isExternal; }).length > 0 && (<Reanimated.View entering={animPapillon(FadeInDown)} layout={animPapillon(LinearTransition)} style={{ paddingHorizontal: 16 }}>
            <NativeListHeader label="Comptes connectés"/>
            <NativeList>
              {accounts.map(function (account, index) {
                var _a, _b;
                return !account.isExternal && (<NativeItem key={index} leading={<PapillonAvatar source={account.personalization.profilePictureB64 ? { uri: account.personalization.profilePictureB64 } : defaultProfilePicture(account.service, ((_a = account.identityProvider) === null || _a === void 0 ? void 0 : _a.name) || "")} badgeOffset={4} badge={<Image source={defaultProfilePicture(account.service, ((_b = account.identityProvider) === null || _b === void 0 ? void 0 : _b.name) || "")} style={{
                                width: 22,
                                height: 22,
                                borderRadius: 12,
                                borderColor: theme.colors.card,
                                borderWidth: 2,
                            }}/>}/>} trailing={loading === account.localID && (<PapillonSpinner size={24} strokeWidth={3.5} color={theme.colors.primary} animated entering={animPapillon(ZoomIn)}/>)} onLongPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            // delete account
                            showAlert({
                                title: "Supprimer le compte",
                                message: "Veux-tu vraiment supprimer ce compte ?",
                                icon: <BadgeHelp />,
                                actions: [
                                    {
                                        title: "Annuler",
                                        icon: <Undo2 />,
                                        primary: true,
                                    },
                                    {
                                        title: "Supprimer",
                                        icon: <Trash2 />,
                                        onPress: function () {
                                            // setTimeout pour laisser le temps à la précédente alerte de s'enlever
                                            setTimeout(function () {
                                                showAlert({
                                                    title: "Veux-tu vraiment continuer ?",
                                                    message: "Veux-tu supprimer d\u00E9finitivement ".concat(account.studentName.first, " ").concat(account.studentName.last, " ?"),
                                                    icon: <BadgeHelp />,
                                                    actions: [
                                                        {
                                                            title: "Annuler",
                                                            icon: <Undo2 />,
                                                            primary: false,
                                                        },
                                                        {
                                                            title: "Supprimer",
                                                            icon: <Trash2 />,
                                                            onPress: function () { return removeAccount(account.localID); },
                                                            danger: true,
                                                            delayDisable: 5,
                                                        }
                                                    ]
                                                });
                                            }, 500);
                                        },
                                        danger: true,
                                    }
                                ]
                            });
                            return [2 /*return*/];
                        });
                    }); }} onPress={function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!((currentAccount === null || currentAccount === void 0 ? void 0 : currentAccount.localID) !== account.localID)) return [3 /*break*/, 2];
                                    setLoading(account.localID);
                                    return [4 /*yield*/, switchTo(account)];
                                case 1:
                                    _a.sent();
                                    setLoading(null);
                                    _a.label = 2;
                                case 2:
                                    navigation.reset({
                                        index: 0,
                                        routes: [{ name: "AccountStack" }],
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); }}>
                    <Reanimated.View style={{
                        flex: 1,
                        flexDirection: "column",
                        justifyContent: "center",
                        gap: 3,
                    }} layout={animPapillon(LinearTransition)}>
                      <NativeText animated variant="title" numberOfLines={1}>
                        {account.studentName.first} {account.studentName.last}
                      </NativeText>
                      <NativeText animated variant="subtitle" numberOfLines={1}>
                        {account.schoolName ?
                        account.schoolName :
                        account.identityProvider ?
                            account.identityProvider.name :
                            "Compte local"}
                      </NativeText>
                    </Reanimated.View>
                  </NativeItem>);
            })}
            </NativeList>
          </Reanimated.View>)}

        <View style={{
            height: 100,
        }}/>
      </Reanimated.ScrollView>
    </View>);
};
export default AccountSelector;
