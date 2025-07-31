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
import React, { useEffect, useState } from "react";
import { ScrollView, Switch } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { CalendarCheck, BookCheck, TrendingUp, Newspaper, NotepadText, BookPlus, } from "lucide-react-native";
import { FadeInDown, FadeOutUp, useSharedValue, withTiming, } from "react-native-reanimated";
import { NativeIcon, NativeItem, NativeList, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import NotificationContainerCard from "@/components/Settings/NotificationContainerCard";
import { createChannelNotification, requestNotificationPermission, } from "@/background/Notifications";
import { useCurrentAccount } from "@/stores/account";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { anim2Papillon } from "@/utils/ui/animations";
import { useAlert } from "@/providers/AlertProvider";
var SettingsNotifications = function (_a) {
    var _b;
    var navigation = _a.navigation;
    var theme = useTheme();
    var colors = theme.colors;
    var showAlert = useAlert().showAlert;
    // User data
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var notifications = account.personalization.notifications;
    // Global state
    var _c = useState((_b = notifications === null || notifications === void 0 ? void 0 : notifications.enabled) !== null && _b !== void 0 ? _b : false), enabled = _c[0], setEnabled = _c[1];
    useEffect(function () {
        var handleNotificationPermission = function () { return __awaiter(void 0, void 0, void 0, function () {
            var statut;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, requestNotificationPermission(showAlert)];
                    case 1:
                        statut = _a.sent();
                        if (!statut) {
                            if (statut === undefined) {
                                setEnabled(undefined);
                            }
                            else {
                                setEnabled(null);
                            }
                            if (notifications === null || notifications === void 0 ? void 0 : notifications.enabled) {
                                setTimeout(function () {
                                    mutateProperty("personalization", {
                                        notifications: __assign(__assign({}, notifications), { enabled: false }),
                                    });
                                }, 1500);
                            }
                        }
                        else if (enabled !== null) {
                            if (enabled)
                                createChannelNotification();
                            setTimeout(function () {
                                mutateProperty("personalization", {
                                    notifications: __assign(__assign({}, notifications), { enabled: enabled }),
                                });
                            }, 1500);
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        handleNotificationPermission();
    }, [enabled]);
    // Animation states
    var opacity = useSharedValue(0);
    var invertedOpacity = useSharedValue(1);
    var borderRadius = useSharedValue(20);
    var width = useSharedValue("90%");
    var marginBottom = useSharedValue(0);
    // Animation effects
    useEffect(function () {
        opacity.value = withTiming(enabled ? 1 : 0, { duration: 200 });
        invertedOpacity.value = withTiming(enabled ? 0 : 1, { duration: 200 });
        borderRadius.value = withTiming(enabled ? 20 : 13, { duration: 200 });
        width.value = withTiming(enabled ? "90%" : "80%", { duration: 300 });
        marginBottom.value = withTiming(enabled ? 0 : -10, { duration: 200 });
    }, [enabled]);
    var askEnabled = function (newValue) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            setEnabled(newValue);
            return [2 /*return*/];
        });
    }); };
    // Schoolary notifications
    var notificationSchoolary = [
        {
            icon: <NativeIcon icon={<CalendarCheck />} color={colors.primary}/>,
            title: "Changement de cours",
            message: "Musique (10:00-11:00) : Prof. absent",
            personalizationValue: "timetable",
        },
        {
            icon: <NativeIcon icon={<BookCheck />} color={colors.primary}/>,
            title: "Nouveau devoir",
            message: "Un nouveau devoir en Mathématiques a été publié",
            personalizationValue: "homeworks",
        },
        {
            icon: <NativeIcon icon={<TrendingUp />} color={colors.primary}/>,
            title: "Nouvelle note",
            message: "Une nouvelle note en Anglais a été publiée",
            personalizationValue: "grades",
        },
        {
            icon: <NativeIcon icon={<Newspaper />} color={colors.primary}/>,
            title: "Nouvelle actualité",
            message: "Chers élèves, chers collègues, Dans le cadre du prix \"Non au harcèlement\", 9 affiches ont été réa...",
            personalizationValue: "news",
        },
        {
            icon: <NativeIcon icon={<NotepadText />} color={colors.primary}/>,
            title: "Vie Scolaire",
            message: "Tu as été en retard de 5 min à 11:10",
            personalizationValue: "attendance",
        },
        {
            icon: <NativeIcon icon={<BookPlus />} color={colors.primary}/>,
            title: "Nouvelle compétence",
            message: "Une nouvelle compétence en Histoire a été publiée",
            personalizationValue: "evaluation",
        },
    ];
    return (<ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
        }}>
      <NotificationContainerCard theme={theme} isEnable={enabled} setEnabled={askEnabled} navigation={navigation}/>

      {enabled && (<>
          <NativeListHeader label="Notifications scolaires" animated entering={anim2Papillon(FadeInDown).delay(50)} exiting={anim2Papillon(FadeOutUp)}/>
          <NativeList animated entering={anim2Papillon(FadeInDown)} exiting={anim2Papillon(FadeOutUp).delay(50)}>
            {notificationSchoolary.map(function (notification, index) {
                var _a, _b;
                return (<NativeItem key={index} leading={notification.icon} animated entering={anim2Papillon(FadeInDown).delay(70 * index)} trailing={<Switch trackColor={{
                            false: colors.border,
                            true: theme.colors.primary
                        }} thumbColor={theme.dark ? colors.text : colors.background} value={(_b = (_a = account.personalization.notifications) === null || _a === void 0 ? void 0 : _a[notification.personalizationValue]) !== null && _b !== void 0 ? _b : false} onValueChange={function (value) {
                            var _a;
                            mutateProperty("personalization", {
                                notifications: __assign(__assign({}, notifications), (_a = {}, _a[notification.personalizationValue] = value, _a)),
                            });
                        }} style={{
                            marginRight: 10,
                        }}/>}>
                <NativeText variant="title">{notification.title}</NativeText>
                <NativeText style={{
                        color: colors.text + "80",
                    }}>
                  {notification.message}
                </NativeText>
              </NativeItem>);
            })}
          </NativeList>
        </>)}

      <InsetsBottomView />
    </ScrollView>);
};
export default SettingsNotifications;
