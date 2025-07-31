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
import { ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import React, { useEffect, useState } from "react";
import { get_logs, delete_logs, } from "@/utils/logger/logger";
import { CircleAlert, CircleX, Code, Layers, Trash2, TriangleAlert, Moon, Newspaper, Calendar, Folder, X, BadgeHelp, SunMoon, } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FadeInDown, FadeOutUp, } from "react-native-reanimated";
import { animPapillon } from "@/utils/ui/animations";
import { useTheme } from "@react-navigation/native";
import { useAlert } from "@/providers/AlertProvider";
import MissingItem from "@/components/Global/MissingItem";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
var SettingsDevLogs = function () {
    var colors = useTheme().colors;
    var _a = useState([]), logs = _a[0], setLogs = _a[1];
    var _b = useState(""), searchTerms = _b[0], setSearchTerms = _b[1];
    var insets = useSafeAreaInsets();
    var _c = useState(true), loading = _c[0], setLoading = _c[1];
    var showAlert = useAlert().showAlert;
    useEffect(function () {
        get_logs().then(function (logs) {
            setLogs(logs
                .sort(function (a, b) { return new Date(a.date).getTime() - new Date(b.date).getTime(); })
                .map(function (log) { return (__assign(__assign({}, log), { formattedDate: formatDistanceToNow(new Date(log.date), {
                    addSuffix: true,
                    includeSeconds: true,
                    locale: fr,
                }) })); }));
            setLoading(false);
        });
    }, []);
    return (<ScrollView contentContainerStyle={{
            padding: 16,
            paddingBottom: 16 + insets.bottom,
            paddingTop: 0,
        }}>
      <ResponsiveTextInput placeholder={"Rechercher"} value={searchTerms} onChangeText={setSearchTerms} placeholderTextColor={colors.text + "80"} style={{
            color: colors.text,
            padding: 8,
            borderRadius: 80,
            fontFamily: "medium",
            fontSize: 16.5,
            flex: 1,
            backgroundColor: colors.border,
            marginTop: 12,
        }}/>
      <NativeListHeader animated label="Logs des 2 dernières semaines" trailing={logs.length > 0 && (<TouchableOpacity onPress={function () {
                showAlert({
                    title: "Supprimer les logs ?",
                    message: "Veux-tu vraiment supprimer toutes les logs ?",
                    icon: <BadgeHelp />,
                    actions: [
                        {
                            title: "Annuler",
                            backgroundColor: colors.card,
                            icon: <X color={colors.text}/>,
                        },
                        {
                            title: "Supprimer",
                            primary: true,
                            onPress: function () {
                                delete_logs();
                                setLogs([]);
                            },
                            backgroundColor: "#CF0029",
                            icon: <Trash2 color="#FFFFFF"/>,
                        },
                    ],
                });
            }} style={{
                padding: 5,
                borderRadius: 100,
                backgroundColor: colors.text + "20",
            }}>
              <Trash2 size={25} strokeWidth={2} color="red"/>
            </TouchableOpacity>)}/>

      {loading ? (<NativeList animated entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOutUp)}>
          <NativeItem leading={<ActivityIndicator />} animated>
            <NativeText variant="title">Obtention des logs...</NativeText>
            <NativeText variant="subtitle">
              Cela peut prendre plusieurs secondes, patiente s'il te plaît.
            </NativeText>
          </NativeItem>
        </NativeList>) : logs.length > 0 ? (<NativeList animated entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOutUp)}>
          {logs.slice().reverse().map(function (log, index) {
                var _a;
                if (Number.isNaN(new Date(log.date).getTime()))
                    return;
                if (log.message.toLowerCase().includes(searchTerms.toLowerCase())) {
                    return (<NativeItem animated key={index} leading={<NativeIcon icon={log.from === "BACKGROUND" ? (<SunMoon />) : log.type === "ERROR" ? (<CircleX />) : log.type === "WARN" ? (<TriangleAlert />) : log.type === "INFO" ? (<CircleAlert />) : log.message.startsWith("User navigate into /") ? (<Layers />) : log.message === "App in background" ? (<Moon />) : log.message.toLowerCase().includes("read") ? (<Newspaper />) : log.message.startsWith("[timetable:updateClasses") ? (<Calendar />) : log.message.toLowerCase().includes("folder") ? (<Folder />) : (<Code />)} color={log.from === "BACKGROUND"
                                ? "#34495E"
                                : log.type === "ERROR"
                                    ? "#BE0B00"
                                    : log.type === "WARN"
                                        ? "#CF6B0F"
                                        : log.type === "INFO"
                                            ? "#0E7CCB"
                                            : log.message.startsWith("User navigate into /")
                                                ? "#28B463"
                                                : log.message === "App in background"
                                                    ? "#1F618D"
                                                    : log.message.toLowerCase().includes("read")
                                                        ? "#D4AC02"
                                                        : log.message.startsWith("[timetable:updateClasses")
                                                            ? "#884EA0"
                                                            : log.message.toLowerCase().includes("folder")
                                                                ? "#CA6F1E"
                                                                : "#AAA"} style={{
                                marginLeft: -6,
                            }}/>}>
                  <NativeText variant="title">{log.message}</NativeText>
                  <NativeText variant="subtitle">
                    {(_a = log.formattedDate) !== null && _a !== void 0 ? _a : log.date}
                  </NativeText>
                  <NativeText variant="subtitle">{log.from}</NativeText>
                </NativeItem>);
                }
                return null;
            })}
        </NativeList>) : (<NativeList animated entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOutUp)}>
          <NativeItem animated style={{ paddingVertical: 10 }}>
            <MissingItem emoji="💾" title="Aucun log enregistré" description="Il n'y a pas de logs à te présenter."/>
          </NativeItem>
        </NativeList>)}
    </ScrollView>);
};
export default SettingsDevLogs;
