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
import { NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { View, ScrollView, Text, Platform, Linking, StyleSheet, ActivityIndicator, } from "react-native";
import { getSubjectData } from "@/services/shared/Subject";
import { formatDistance } from "date-fns";
import { fr } from "date-fns/locale";
import { Building, Clock, DoorOpen, FileText, Hourglass, Info, LinkIcon, User2, Users, } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { LinearGradient } from "expo-linear-gradient";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import HTMLView from "react-native-htmlview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PapillonModernHeader } from "@/components/Global/PapillonModernHeader";
import { useClassSubjectStore } from "@/stores/classSubject";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import getAndOpenFile from "@/utils/files/getAndOpenFile";
import { getDuration } from "@/utils/format/course_duration";
import { getCourseRessources } from "@/services/timetable";
var LessonDocument = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var route = _a.route, navigation = _a.navigation;
    var theme = useTheme();
    var stylesText = StyleSheet.create({
        body: {
            color: theme.colors.text,
            fontFamily: "medium",
            fontSize: 16,
            lineHeight: 22,
        },
    });
    var lesson = route.params.lesson;
    var subjects = useClassSubjectStore();
    var _o = useState([]), classSubjects = _o[0], setClassSubjects = _o[1];
    var _p = useState(true), loading = _p[0], setLoading = _p[1];
    var _q = useState(undefined), ressource = _q[0], setRessource = _q[1];
    var account = useCurrentAccount(function (store) { return store.account; });
    var openUrl = function (url) {
        if (account.service === AccountService.EcoleDirecte &&
            Platform.OS === "ios") {
            getAndOpenFile(account, url);
        }
        else {
            WebBrowser.openBrowserAsync(url, {
                presentationStyle: WebBrowser.WebBrowserPresentationStyle.FORM_SHEET,
                controlsColor: theme.colors.primary,
            });
        }
    };
    useEffect(function () {
        var fetchData = function () { return __awaiter(void 0, void 0, void 0, function () {
            var ressource;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, getCourseRessources(account, lesson)];
                    case 1:
                        ressource = _b.sent();
                        setRessource(ressource);
                        setClassSubjects((_a = subjects.subjects.filter(function (b) {
                            return new Date(b.date).getDate() ===
                                new Date(lesson.startTimestamp).getDate() &&
                                new Date(b.date).getMonth() ===
                                    new Date(lesson.startTimestamp).getMonth() &&
                                lesson.subject === b.subject;
                        })) !== null && _a !== void 0 ? _a : []);
                        setLoading(false);
                        return [2 /*return*/];
                }
            });
        }); };
        fetchData();
    }, []);
    var _r = useState({
        color: "#888888",
        pretty: "Matière inconnue",
        emoji: "❓",
    }), subjectData = _r[0], setSubjectData = _r[1];
    var fetchSubjectData = function () {
        var data = getSubjectData(lesson.title || "");
        setSubjectData(data);
    };
    useEffect(function () {
        fetchSubjectData();
    }, [lesson.subject]);
    useLayoutEffect(function () {
        navigation.setOptions({
            headerTitle: subjectData.pretty,
        });
    }, [navigation, subjectData]);
    var informations = [
        {
            title: "Durée et horaires",
            informations: [
                {
                    icon: <Clock />,
                    text: "Début du cours",
                    value: formatDistance(new Date(lesson.startTimestamp), new Date(), {
                        addSuffix: true,
                        locale: fr,
                    }) +
                        " (à " +
                        new Date(lesson.startTimestamp).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }) +
                        ")",
                    enabled: lesson.startTimestamp != null,
                },
                {
                    icon: <Hourglass />,
                    text: "Durée du cours",
                    value: getDuration(Math.round((lesson.endTimestamp - lesson.startTimestamp) / 60000)),
                    enabled: lesson.endTimestamp != null,
                },
            ],
        },
        {
            title: "Cours en ligne",
            informations: [
                {
                    icon: <LinkIcon />,
                    text: "URL du cours",
                    value: lesson.url,
                    enabled: lesson.url != null,
                },
            ],
        },
        {
            title: "Contexte",
            informations: [
                {
                    icon: <Building />,
                    text: ((_b = lesson.building) === null || _b === void 0 ? void 0 : _b.includes(",")) ? "Bâtiments" : "Bâtiment",
                    value: lesson.building,
                    enabled: Boolean((_c = lesson.building) === null || _c === void 0 ? void 0 : _c.trim()), // Check if lesson.building exists, is not null, and not empty
                },
                {
                    icon: <DoorOpen />,
                    text: ((_d = lesson.room) === null || _d === void 0 ? void 0 : _d.includes(",")) ? "Salles de classe" : "Salle de classe",
                    value: (_e = lesson.room) === null || _e === void 0 ? void 0 : _e.split(", ").join("\n"),
                    enabled: Boolean((_f = lesson.room) === null || _f === void 0 ? void 0 : _f.trim()), // Check if lesson.room exists, is not null, and not empty
                },
                {
                    icon: <User2 />,
                    text: ((_g = lesson.teacher) === null || _g === void 0 ? void 0 : _g.includes(",")) ? "Professeurs" : "Professeur",
                    value: lesson.teacher || "Aucun",
                    enabled: Boolean((_h = lesson.teacher) === null || _h === void 0 ? void 0 : _h.trim()), // Check if lesson.teacher exists, is not null, and not empty.
                },
                {
                    icon: <Users />,
                    text: ((_j = lesson.group) === null || _j === void 0 ? void 0 : _j.includes(",")) ? "Groupes" : "Groupe",
                    value: (_k = lesson.group) === null || _k === void 0 ? void 0 : _k.replace(/\[|\]/g, ""),
                    enabled: Boolean((_l = lesson.group) === null || _l === void 0 ? void 0 : _l.trim()), // Check if lesson.group exists, is not null, and not empty
                },
            ],
        },
        {
            title: "Statut",
            informations: [
                {
                    icon: <Info />,
                    text: "Statut",
                    value: lesson.statusText,
                    enabled: lesson.statusText != null,
                },
            ],
        },
    ];
    return (<>
      <PapillonModernHeader native outsideNav={true} startLocation={0.6} height={110}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ marginRight: 4 }}>
            <Text style={{
            fontSize: 28,
            textAlign: "center",
            width: "100%",
            marginLeft: 2,
        }}>
              {subjectData.emoji}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <NativeText variant="title" numberOfLines={1}>
              {subjectData.pretty}
            </NativeText>
            {lesson.itemType && (<NativeText variant="subtitle" numberOfLines={1}>
                {lesson.itemType}
              </NativeText>)}
          </View>
        </View>
      </PapillonModernHeader>

      <ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 70 + 16,
            paddingBottom: useSafeAreaInsets().bottom + 16,
        }} style={{ flex: 1 }}>
        {informations.map(function (info, index) {
            if (info.informations.filter(function (item) { return item.enabled; }).length === 0) {
                return null;
            }
            return (<View key={index}>
              <NativeListHeader label={info.title} key={index}/>
              <NativeList>
                {info.informations.map(function (item, index) {
                    if (!item.enabled) {
                        return null;
                    }
                    return (<NativeItem key={index} icon={item.icon} onPress={item.value && item.value.startsWith("http")
                            ? function () { return Linking.openURL(item.value); }
                            : void 0}>
                      <NativeText variant="subtitle">{item.text}</NativeText>
                      <NativeText variant="default">{item.value}</NativeText>
                    </NativeItem>);
                })}
              </NativeList>
            </View>);
        })}
        {loading && (<ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 10 }}/>)}
        {(classSubjects.length > 0 || ((_m = ressource === null || ressource === void 0 ? void 0 : ressource.length) !== null && _m !== void 0 ? _m : 0) > 0) && (<View>
            <NativeListHeader label="Contenu de séance"/>
            <NativeList>
              {classSubjects.map(function (subject, index) {
                return (<NativeItem key={"classSubject_" + index}>
                    <HTMLView value={"<body>".concat(subject.content, "</body>")} stylesheet={stylesText}/>
                    {subject.attachments.map(function (attachment, index) { return (<NativeItem key={"classSubject_attachement_" + index} onPress={function () {
                            return openUrl("".concat(attachment.name, "\\").concat(attachment.id, "\\").concat(attachment.kind));
                        }} icon={<FileText />}>
                        <NativeText variant="title" numberOfLines={2}>
                          {attachment.name}
                        </NativeText>
                      </NativeItem>); })}
                  </NativeItem>);
            })}

              {ressource === null || ressource === void 0 ? void 0 : ressource.map(function (r, index) {
                var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
                var title = ((_b = (_a = r.title) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) !== null && _b !== void 0 ? _b : "") + ((_d = (_c = r.title) === null || _c === void 0 ? void 0 : _c.slice(1)) !== null && _d !== void 0 ? _d : ""); // S'assurer que la première lettre est en majuscule
                var desc = (_f = (_e = r.description) === null || _e === void 0 ? void 0 : _e.replace("\n\n", "\n").trim()) !== null && _f !== void 0 ? _f : ""; // Remplacer les doubles sauts de ligne par un seul
                var descText = desc.replace(/<[^>]*>/g, "").trim(); // Il peut arriver que le contenu soit vide, mais qu'il y ait du html tout de même
                return (<>
                    <NativeItem key={"res_" + index} separator={((_h = (_g = r.files) === null || _g === void 0 ? void 0 : _g.length) !== null && _h !== void 0 ? _h : 0 > 0) ? true : false}>
                      {index > 0 &&
                        <View style={{
                                height: 1,
                                flex: 1,
                                borderColor: theme.colors.text + "20",
                                borderWidth: 1,
                                borderRadius: 50,
                                marginTop: 10,
                                marginBottom: 10,
                            }}/>}
                      {!!r.category && (<LinearGradient colors={[subjectData.color + "80", subjectData.color]} style={{
                            borderRadius: 50,
                            zIndex: 10,
                            borderWidth: 1,
                            borderColor: theme.colors.text + "20",
                            width: "auto",
                            alignSelf: "flex-start",
                            marginBottom: title ? 0 : void 0,
                        }}>
                          <View style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                            paddingVertical: 3,
                            paddingHorizontal: 8,
                            borderRadius: 8,
                        }}>
                            <NativeText style={{
                            color: "#FFF",
                            fontFamily: "semibold",
                            fontSize: 15,
                            lineHeight: 18,
                        }} numberOfLines={1}>
                              {r.category}
                            </NativeText>
                          </View>
                        </LinearGradient>)}
                      {!!title && (<NativeText variant="title">
                          {title}
                        </NativeText>)}
                      {!!descText &&
                        <HTMLView value={"<body>".concat(desc, "</body>")} stylesheet={stylesText} addLineBreaks={false} onLinkPress={function (url) { return openUrl(url); }} key={"res_html_" + index}/>}
                    </NativeItem>
                    {((_k = (_j = r.files) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 0) > 0 && (<>
                        {(_l = r.files) === null || _l === void 0 ? void 0 : _l.map(function (file, fileIndex) { return (<NativeItem key={"res_attach" + fileIndex} onPress={function () {
                                return openUrl(file.url);
                            }} icon={<FileText />} separator={true}>
                            <NativeText variant="title" numberOfLines={2}>
                              {file.name}
                            </NativeText>
                          </NativeItem>); })}
                      </>)}
                  </>);
            })}

            </NativeList>
          </View>)}
      </ScrollView>
    </>);
};
export default LessonDocument;
