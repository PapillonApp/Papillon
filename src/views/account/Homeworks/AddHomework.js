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
import React, { useEffect, useLayoutEffect, useState } from "react";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { useHomeworkStore } from "@/stores/homework";
import { useCurrentAccount } from "@/stores/account";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ActivityIndicator, Alert, Dimensions, Platform, TextInput, View, ScrollView, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import PapillonPicker from "@/components/Global/PapillonPicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BookOpen, Calendar } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import HomeworkItem from "./Atoms/Item";
var AddHomeworkScreen = function (_a) {
    var _b, _c, _d, _e;
    var route = _a.route, navigation = _a.navigation;
    var account = useCurrentAccount(function (store) { return store.account; });
    var theme = useTheme();
    var homeworks = useHomeworkStore(function (store) { return store.homeworks; });
    var localSubjects = (_b = account.personalization.subjects) !== null && _b !== void 0 ? _b : {};
    var _f = useState((_d = (_c = Object.entries(localSubjects || {})[0]) === null || _c === void 0 ? void 0 : _c[1]) !== null && _d !== void 0 ? _d : null), selectedPretty = _f[0], setSelectedPretty = _f[1];
    // Création de devoirs personnalisés
    var _g = useState(null), currentHw = _g[0], setCurrentHw = _g[1];
    var _h = useState(false), loading = _h[0], setLoading = _h[1];
    var _j = useState(false), showDatePicker = _j[0], setShowDatePicker = _j[1];
    var _k = useState(NaN), idHomework = _k[0], setIdHomework = _k[1];
    var _l = useState(null), contentHomework = _l[0], setContentHomework = _l[1];
    var _m = useState(Date.now()), dateHomework = _m[0], setDateHomework = _m[1];
    useEffect(function () {
        var _a;
        if ((_a = route.params) === null || _a === void 0 ? void 0 : _a.hwid) {
            var allHomeworks = Object.values(homeworks).flat();
            var homework_1 = allHomeworks.find(function (hw) { var _a; return hw.id === ((_a = route.params) === null || _a === void 0 ? void 0 : _a.hwid); });
            if (homework_1) {
                var THEpretty = Object.entries(localSubjects).find(function (element) { return element[1].pretty === homework_1.subject; });
                if (THEpretty)
                    setSelectedPretty(THEpretty[1]);
                setIdHomework(parseInt(homework_1.id));
                setContentHomework(homework_1.content);
                setDateHomework(homework_1.due);
                setCurrentHw(homework_1);
            }
        }
        else {
            var createId = Math.floor(Math.random() * 100000 + 1);
            var idAlreadyExist = useHomeworkStore
                .getState()
                .existsHomework(dateToEpochWeekNumber(new Date(dateHomework)), String(createId));
            while (idAlreadyExist) {
                createId = Math.floor(Math.random() * 100000 + 1);
                idAlreadyExist = useHomeworkStore
                    .getState()
                    .existsHomework(dateToEpochWeekNumber(new Date(dateHomework)), String(createId));
            }
            setIdHomework(createId);
        }
    }, [(_e = route.params) === null || _e === void 0 ? void 0 : _e.hwid]);
    var createHomework = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newHomework;
        var _a, _b;
        return __generator(this, function (_c) {
            setLoading(true);
            if (!selectedPretty || !contentHomework) {
                Alert.alert("Veuillez remplir tous les champs avant de valider.");
                setLoading(false);
                return [2 /*return*/];
            }
            newHomework = {
                id: String(idHomework),
                subject: selectedPretty.pretty,
                color: selectedPretty.color,
                content: contentHomework,
                due: dateHomework,
                done: false,
                personalizate: true,
                attachments: [],
                exam: false,
            };
            useHomeworkStore
                .getState()
                .addHomework(dateToEpochWeekNumber(new Date(dateHomework)), newHomework);
            setSelectedPretty((_b = (_a = Object.entries(localSubjects || {})[0]) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null);
            setIdHomework(NaN);
            setContentHomework(null);
            setDateHomework(Date.now());
            setLoading(false);
            navigation.goBack();
            return [2 /*return*/];
        });
    }); };
    var updateHomework = function () { return __awaiter(void 0, void 0, void 0, function () {
        var newHomework;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            if (!currentHw)
                return [2 /*return*/];
            newHomework = __assign(__assign({}, currentHw), { subject: selectedPretty.pretty, color: selectedPretty.color, content: contentHomework !== null && contentHomework !== void 0 ? contentHomework : "", due: dateHomework });
            useHomeworkStore
                .getState()
                .updateHomework(dateToEpochWeekNumber(new Date(dateHomework)), currentHw.id, newHomework);
            setSelectedPretty((_b = (_a = Object.entries(localSubjects || {})[0]) === null || _a === void 0 ? void 0 : _a[1]) !== null && _b !== void 0 ? _b : null);
            setIdHomework(NaN);
            setContentHomework(null);
            setDateHomework(Date.now());
            navigation.goBack();
            if ((_c = route.params) === null || _c === void 0 ? void 0 : _c.modal) {
                navigation.goBack();
            }
            return [2 /*return*/];
        });
    }); };
    useLayoutEffect(function () {
        navigation.setOptions({
            headerTitle: currentHw ? "Modifier le devoir" : "Ajouter un devoir",
        });
    }, [navigation, currentHw]);
    var _o = useState(false), exampleDone = _o[0], setExampleDone = _o[1];
    return (<ScrollView style={{
            paddingHorizontal: 12
        }}>
      <NativeList inline>
        <NativeItem>
          <View style={{ marginHorizontal: -20, marginTop: -8, marginBottom: -10 }}>
            <HomeworkItem homework={{
            attachments: [],
            color: selectedPretty.color,
            content: contentHomework !== null && contentHomework !== void 0 ? contentHomework : "Commence par ajouter du contenu",
            done: exampleDone,
            due: dateHomework,
            id: String(idHomework),
            personalizate: true,
            subject: selectedPretty.pretty,
            exam: false,
        }} contentOpacity={!contentHomework ? 0.5 : undefined} index={idHomework} key={idHomework} 
    // @ts-expect-error
    navigation={navigation} onDonePressHandler={function () {
            setExampleDone(!exampleDone);
        }} total={1}/>
          </View>
        </NativeItem>
      </NativeList>

      <NativeList inline>
        <NativeItem icon={<BookOpen size={22} strokeWidth={2}/>} trailing={<View style={[
                Platform.OS === "android" && {
                    width: "50%",
                    minWidth: 200,
                },
                {
                    maxWidth: Dimensions.get("window").width - 200,
                }
            ]}>
              {Platform.OS === "ios" ? (<PapillonPicker data={Object.entries(localSubjects).map(function (_a) {
                    var key = _a[0], subject = _a[1];
                    return ({
                        label: subject.pretty,
                        onPress: function () { return setSelectedPretty(subject); },
                        checked: (selectedPretty === null || selectedPretty === void 0 ? void 0 : selectedPretty.pretty) === subject.pretty,
                        ios: {
                            icon: {
                                type: "IMAGE_SYSTEM",
                                imageValue: {
                                    systemName: "circle.fill",
                                    pointSize: 12,
                                    hierarchicalColor: subject === null || subject === void 0 ? void 0 : subject.color,
                                },
                            }
                        }
                    });
                })} selected={selectedPretty === null || selectedPretty === void 0 ? void 0 : selectedPretty.pretty}>
                  <Pressable style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    paddingVertical: 9,
                    paddingHorizontal: 6,
                    alignSelf: "flex-end",
                }}>
                    <View style={{
                    backgroundColor: selectedPretty === null || selectedPretty === void 0 ? void 0 : selectedPretty.color,
                    width: 10,
                    height: 10,
                    borderRadius: 30,
                }}/>

                    <NativeText variant="overtitle" numberOfLines={1}>
                      {selectedPretty === null || selectedPretty === void 0 ? void 0 : selectedPretty.pretty}
                    </NativeText>
                  </Pressable>
                </PapillonPicker>) : (<Picker selectedValue={selectedPretty === null || selectedPretty === void 0 ? void 0 : selectedPretty.pretty} onValueChange={function (itemValue) {
                    var selectedSubject = Object.entries(localSubjects).find(function (_a) {
                        var subject = _a[1];
                        return subject.pretty === itemValue;
                    });
                    if (selectedSubject) {
                        setSelectedPretty(selectedSubject[1]);
                    }
                }} style={{
                    color: theme.colors.text,
                }}>
                  {Object.entries(localSubjects).map(function (_a) {
                    var key = _a[0], subject = _a[1];
                    return (<Picker.Item key={key} label={subject.pretty} value={subject.pretty}/>);
                })}
                </Picker>)}
            </View>}>
          <NativeText variant="subtitle">
            Matière
          </NativeText>
        </NativeItem>
        <NativeItem icon={<Calendar size={22} strokeWidth={2}/>} onPress={Platform.OS !== "ios" ? function () { return setShowDatePicker(true); } : undefined} trailing={showDatePicker || Platform.OS === "ios" ? (<DateTimePicker value={new Date(dateHomework)} mode="date" display="default" onChange={function (_event, selectedDate) {
                setShowDatePicker(false);
                if (selectedDate) {
                    var dateSelected = Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
                    setDateHomework(dateSelected);
                }
            }}/>) : (<NativeText variant="subtitle">
                {new Date(dateHomework).toLocaleDateString()}
              </NativeText>)}>
          <NativeText variant="subtitle">
            {Platform.OS !== "ios" ? "Date" : "Sélectionner la date"}
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList inline>
        <NativeItem>
          <TextInput style={{
            fontFamily: "medium",
            fontSize: 16,
            color: theme.colors.text,
        }} placeholder="Contenu du devoir" multiline placeholderTextColor={theme.colors.text + "55"} value={contentHomework !== null && contentHomework !== void 0 ? contentHomework : ""} onChangeText={function (input) {
            if (input === "") {
                setContentHomework(null);
            }
            else {
                setContentHomework(input);
            }
        }}/>
        </NativeItem>
      </NativeList>

      <ButtonCta value={currentHw ? "Mettre à jour" : "Valider"} onPress={function () {
            if (currentHw) {
                updateHomework();
            }
            else {
                createHomework();
            }
        }} primary={!loading} icon={loading ? <ActivityIndicator /> : void 0} disabled={loading} style={{
            minWidth: undefined,
            maxWidth: undefined,
            width: "50%",
            alignSelf: "center",
            marginTop: 15,
        }} backgroundColor={selectedPretty.color}/>
    </ScrollView>);
};
export default AddHomeworkScreen;
