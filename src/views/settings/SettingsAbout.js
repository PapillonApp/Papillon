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
import React, { useEffect, useState } from "react";
import { ScrollView, Image, StyleSheet, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Euro, Github, MapPin, MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeList, NativeItem, NativeListHeader } from "@/components/Global/NativeComponents";
import { NativeIcon } from "@/components/Global/NativeComponents";
import { NativeText } from "@/components/Global/NativeComponents";
import PackageJSON from "../../../package.json";
import AboutContainerCard from "@/components/Settings/AboutContainerCard";
import * as Linking from "expo-linking";
import teams from "@/utils/data/teams.json";
import { getContributors } from "@/utils/GetRessources/GetContribs";
import { isExpoGo } from "@/utils/native/expoGoAlert";
var SettingsAbout = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var insets = useSafeAreaInsets();
    var colors = theme.colors;
    var _b = useState(0), clickedOnVersion = _b[0], setClickedOnVersion = _b[1];
    var _c = useState([]), contributors = _c[0], setContributors = _c[1];
    var fetchContributors = function () { return __awaiter(void 0, void 0, void 0, function () {
        var fetchedContributors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getContributors()];
                case 1:
                    fetchedContributors = _a.sent();
                    setContributors(fetchedContributors);
                    return [2 /*return*/];
            }
        });
    }); };
    useEffect(function () {
        fetchContributors();
    }, []);
    useEffect(function () {
        if (clickedOnVersion >= 7) {
            navigation.goBack();
            navigation.goBack();
            navigation.goBack();
            navigation.goBack();
            navigation.navigate("DevMenu");
            setClickedOnVersion(0);
        }
    }, [clickedOnVersion, navigation]);
    return (<ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
            paddingBottom: insets.bottom + 16,
        }}>
      <AboutContainerCard theme={theme}/>

      <NativeListHeader label="Communauté"/>

      <NativeList>
        <NativeItem onPress={function () { return navigation.navigate("SettingsDonorsList"); }} leading={<NativeIcon icon={<Euro />} color="#DEAB4A"/>}>
          <NativeText variant="title">Donateurs</NativeText>
          <NativeText variant="subtitle">Voir la liste des donateurs</NativeText>
        </NativeItem>
        <NativeItem onPress={function () { return Linking.openURL("https://go.papillon.bzh/discord"); }} leading={<NativeIcon icon={<MessageCircle />} color="#5865F2"/>}>
          <NativeText variant="title">Serveur Discord</NativeText>
          <NativeText variant="subtitle">Rejoindre le serveur Discord</NativeText>
        </NativeItem>
        <NativeItem onPress={function () { return Linking.openURL("https://github.com/PapillonApp/Papillon"); }} leading={<NativeIcon icon={<Github />} color="#555555"/>}>
          <NativeText variant="title">Projet GitHub</NativeText>
          <NativeText variant="subtitle">Contribuer au projet sur GitHub</NativeText>
        </NativeItem>
      </NativeList>

      <NativeListHeader label="L'équipe Papillon"/>
      <NativeList>
        {teams.map(function (team, index) {
            var _a, _b;
            return (<NativeItem onPress={team.link ? function () { return Linking.openURL(team.link); } : undefined} chevron={team.link ? true : false} key={index} leading={<Image source={{ uri: team.ppimage }} style={{
                        width: 35,
                        height: 35,
                        borderRadius: 10,
                    }}/>}>
            <NativeText variant="title">{team.name}</NativeText>

            <NativeText variant="subtitle" style={{
                    opacity: 0.5,
                    fontFamily: "semibold",
                }}>{team.description}</NativeText>

            <View style={{
                    flexDirection: "row",
                    gap: 4,
                    marginTop: 2,
                }}>
              <Github size={18} color={colors.text} opacity={0.7}/>

              <NativeText variant="subtitle">
                {(_b = (_a = team.github) === null || _a === void 0 ? void 0 : _a.split("/").pop()) === null || _b === void 0 ? void 0 : _b.toLowerCase()}
              </NativeText>
            </View>

            <View style={{
                    flexDirection: "row",
                    gap: 4,
                    marginTop: 2,
                }}>
              <MapPin size={18} color={colors.text} opacity={0.7}/>

              <NativeText variant="subtitle">
                {team.location}
              </NativeText>
            </View>
          </NativeItem>);
        })}
      </NativeList>

      <NativeListHeader label="Contributeurs GitHub"/>
      <NativeList>
        {contributors.map(function (contributor, index) { return (<NativeItem onPress={function () { return Linking.openURL(contributor.html_url); }} chevron={true} key={index} leading={<Image source={{ uri: contributor.avatar_url }} style={{
                    width: 35,
                    height: 35,
                    borderRadius: 10,
                }}/>}>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
            }}>
              <NativeText variant="title">{contributor.login}</NativeText>
              <Github size={18} color={colors.text} strokeWidth={2.5}/>
            </View>
            <NativeText variant="subtitle">
              {contributor.contributions} contribution{contributor.contributions > 1 ? "s" : ""}
            </NativeText>
          </NativeItem>); })}
      </NativeList>

      <NativeListHeader label="Informations"/>

      <NativeList>
        <NativeItem onPress={function () { return setClickedOnVersion(clickedOnVersion + 1); }} chevron={false}>
          <NativeText variant="title">
            Version de l'application
          </NativeText>
          <NativeText variant="subtitle">
            ver. {PackageJSON.version} {isExpoGo() ? "(Expo Go)" : ""} {__DEV__ ? "(debug)" : ""}
          </NativeText>
        </NativeItem>
        <NativeItem onPress={function () { return navigation.navigate("SettingsDevLogs"); }} chevron={false}>
          <NativeText variant="title">
            Version des dépendances
          </NativeText>
          <NativeText variant="subtitle">
            RN : {PackageJSON.dependencies["react-native"].split("^")[1]} |
            Expo :{" "}
            {(PackageJSON.devDependencies.expo ||
            PackageJSON.dependencies.expo).replace("^", "").replace("~", "")}
          </NativeText>
        </NativeItem>
      </NativeList>

    </ScrollView>);
};
// Styles
var styles = StyleSheet.create({
    title: {
        color: "#222222",
        fontSize: 15,
    },
    time: {
        color: "#3F3F3F",
        opacity: 0.5,
        textAlign: "right",
        fontFamily: "sfmedium",
        fontSize: 13,
        marginRight: 10,
    },
    message: {
        color: "#3F3F3F",
        fontFamily: "sfmedium",
        fontSize: 14,
        maxWidth: "85%",
        minWidth: "85%",
        lineHeight: 15,
        letterSpacing: -0.4,
    },
    overlay: {
        backgroundColor: "#EEF5F5",
        borderWidth: 1,
        borderColor: "#00000030",
        borderRadius: 20,
        height: 25,
        padding: 9,
        marginHorizontal: 20,
    },
});
export default SettingsAbout;
