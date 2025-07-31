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
import React, { useState, useEffect, useLayoutEffect } from "react";
import { Image, Linking, Platform, ScrollView, View } from "react-native";
import PackageJSON from "../../../package.json";
import datasets from "@/consts/datasets.json";
import uuid from "@/utils/uuid-v4";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { AlertTriangle, Bug, Sparkles, X } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { FadeInUp, FadeOutUp, LinearTransition } from "react-native-reanimated";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
import { animPapillon } from "@/utils/ui/animations";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { TouchableOpacity } from "react-native-gesture-handler";
import { PressableScale } from "react-native-pressable-scale";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
import useScreenDimensions from "@/hooks/useScreenDimensions";
var currentVersion = PackageJSON.version;
var changelogURL = datasets.changelog.replace("[version]", currentVersion.split(".").slice(0, 2).join("."));
var ChangelogScreen = function (_a) {
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var isTablet = useScreenDimensions().isTablet;
    var isOnline = useOnlineStatus().isOnline;
    var _b = useState(null), changelog = _b[0], setChangelog = _b[1];
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var _d = useState(false), notFound = _d[0], setNotFound = _d[1];
    var acknowledgeUpdate = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            AsyncStorage.setItem("changelog.lastUpdate", PackageJSON.version);
            return [2 /*return*/];
        });
    }); };
    useEffect(function () {
        if (!changelog) {
            setLoading(true);
            fetch(changelogURL + "#update=" + uuid()) // #TODO : remove, it's for development
                .then(function (response) { return response.json(); })
                .then(function (json) {
                if (json.version) {
                    setChangelog(json);
                    setLoading(false);
                    setNotFound(false);
                    acknowledgeUpdate();
                }
            })
                .catch(function (err) {
                setLoading(false);
                setNotFound(true);
            });
        }
    }, []);
    useLayoutEffect(function () {
        navigation.setOptions({
            headerRight: function () { return (Platform.OS == "ios" &&
                <TouchableOpacity onPress={function () { return navigation.goBack(); }} style={{
                        width: 32,
                        aspectRatio: 1 / 1,
                        backgroundColor: theme.colors.text + "18",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 30,
                    }}>
          <X color={theme.colors.text} size={20} strokeWidth={3} opacity={0.7}/>
        </TouchableOpacity>); }
        });
    }, [navigation, route.params, theme.colors.text]);
    return (<ScrollView style={[
            {
                padding: 16,
                paddingTop: 0
            }
        ]} contentInsetAdjustmentBehavior="automatic">
      {!isOnline ? (<OfflineWarning cache={false}/>) : loading ? (<NativeList inline animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutUp)}>
          <NativeItem leading={<PapillonSpinner color={theme.colors.primary} size={24} strokeWidth={3.5}/>}>
            <NativeText variant="title">
              Chargement des nouveautés...
            </NativeText>
            <NativeText variant="subtitle">
              Obtention des dernières nouveautés de l'application Papillon
            </NativeText>
          </NativeItem>
        </NativeList>) : notFound ? (<NativeList inline animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutUp)}>
          <NativeItem icon={<AlertTriangle />}>
            <NativeText variant="title">
              Impossible de trouver les notes de mise à jour
            </NativeText>
            <NativeText variant="subtitle">
              Les nouveautés de la version n'ont pas du être publiées ou
              alors une erreur est survenue...
            </NativeText>
          </NativeItem>
        </NativeList>) : (changelog && (<Reanimated.View entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutUp)} layout={animPapillon(LinearTransition)}>
            <PressableScale>
              <NativeList animated inline style={{
                flex: 1,
                width: isTablet ? "50%" : "100%",
                alignSelf: "center",
                justifyContent: "center",
            }}>
                <Image source={{ uri: changelog.illustration }} style={{
                width: "100%",
                aspectRatio: 2 / 1,
            }}/>
                <NativeItem pointerEvents="none">
                  <NativeText variant="default" style={{
                color: theme.colors.primary,
                fontFamily: "semibold",
            }}>
                    Papillon - version {changelog.version}
                  </NativeText>
                  <NativeText variant="titleLarge">
                    {changelog.title}
                  </NativeText>
                  <NativeText variant="subtitle">
                    {changelog.subtitle}
                  </NativeText>
                </NativeItem>
                <NativeItem pointerEvents="none">
                  <NativeText variant="default">
                    {changelog.description}
                  </NativeText>
                </NativeItem>
              </NativeList>
            </PressableScale>

            <Reanimated.View>
              {changelog.features.length > 0 && (<NativeListHeader animated label="Nouveautés" icon={<Sparkles />}/>)}

              <Reanimated.ScrollView horizontal style={{
                width: "100%",
                overflow: "visible",
                marginTop: 9,
            }} contentContainerStyle={{
                gap: 10,
            }} showsHorizontalScrollIndicator={false}>
                {changelog.features.map(function (feature, index) {
                return (<ChangelogFeature key={index} feature={feature} navigation={navigation} theme={theme}/>);
            })}
              </Reanimated.ScrollView>
            </Reanimated.View>

            <Reanimated.View>
              {changelog.bugfixes.length > 0 && (<NativeListHeader animated label="Correctifs" icon={<Bug />}/>)}

              <Reanimated.ScrollView horizontal style={{
                width: "100%",
                overflow: "visible",
                marginTop: 9,
            }} contentContainerStyle={{
                gap: 10,
            }} showsHorizontalScrollIndicator={false}>
                {changelog.bugfixes.map(function (feature, index) {
                return (<ChangelogFeature key={index} feature={feature} navigation={navigation} theme={theme}/>);
            })}
              </Reanimated.ScrollView>
            </Reanimated.View>
          </Reanimated.View>))}

      <InsetsBottomView />
    </ScrollView>);
};
var ChangelogFeature = function (_a) {
    var feature = _a.feature, navigation = _a.navigation, theme = _a.theme;
    return (<PressableScale>
      <NativeList inline style={{
            width: 240,
        }}>
        {feature.image && (<Image source={{ uri: feature.image }} style={{
                width: "100%",
                aspectRatio: 3 / 2
            }}/>)}
        <View pointerEvents="none" style={{
            height: 142,
            padding: 12,
            gap: 6,
            paddingLeft: 0,
            marginLeft: 12,
            borderBottomColor: theme.colors.text + "18",
            borderBottomWidth: 0.5,
        }}>
          <NativeText variant="title" numberOfLines={2}>
            {feature.title}
          </NativeText>
          <NativeText variant="subtitle" style={{
            height: "100%"
        }} ellipsizeMode="tail" numberOfLines={4}>
            {feature.subtitle}
          </NativeText>
        </View>
        {feature.navigation && (<NativeItem onPress={(feature.href || feature.navigation) ? function () {
                if (feature.href) {
                    Linking.openURL(feature.href);
                }
                else if (feature.navigation) {
                    try {
                        navigation.goBack();
                        navigation.navigate(feature.navigation);
                    }
                    catch (_a) { }
                }
            } : undefined}>

            <NativeText variant="default" style={{
                color: (feature.href || feature.navigation) ? theme.colors.primary : theme.colors.text + "50"
            }}>
              {feature.button || "En savoir plus"}
            </NativeText>
          </NativeItem>)}
      </NativeList>
    </PressableScale>);
};
export default ChangelogScreen;
