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
import React, { useEffect, useState, useCallback, useLayoutEffect, useMemo } from "react";
import { FlatList, KeyboardAvoidingView, Text, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import Reanimated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import debounce from "lodash/debounce";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import MissingItem from "@/components/Global/MissingItem";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import { BadgeHelp, BadgeX, Trash2, X } from "lucide-react-native";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { COLORS_LIST } from "@/services/shared/Subject";
import SubjectContainerCard from "@/components/Settings/SubjectContainerCard";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
var MemoizedNativeItem = React.memo(NativeItem);
var MemoizedNativeList = React.memo(NativeList);
var MemoizedNativeText = React.memo(NativeText);
var MemoizedSubjectContainerCard = React.memo(SubjectContainerCard);
var SettingsSubjects = function (_a) {
    var navigation = _a.navigation;
    var account = useCurrentAccount(function (store) { return store.account; });
    var mutateProperty = useCurrentAccount(function (store) { return store.mutateProperty; });
    var insets = useSafeAreaInsets();
    var colors = useTheme().colors;
    var showAlert = useAlert().showAlert;
    var _b = useState([]), subjects = _b[0], setSubjects = _b[1];
    var _c = useState([]), localSubjects = _c[0], setLocalSubjects = _c[1];
    var _d = useState(null), selectedSubject = _d[0], setSelectedSubject = _d[1];
    var _e = useState(false), opened = _e[0], setOpened = _e[1];
    var _f = useState(""), currentTitle = _f[0], setCurrentTitle = _f[1]; // New state for unsynced text input
    var _g = useState(""), currentEmoji = _g[0], setCurrentEmoji = _g[1]; // New state for unsynced text input
    var emojiInput = React.useRef(null);
    useEffect(function () {
        if (subjects.length === 0 && account.personalization.subjects) {
            var initialSubjects = Object.entries(account.personalization.subjects);
            setSubjects(initialSubjects);
            setLocalSubjects(initialSubjects);
        }
    }, []);
    useEffect(function () {
        if (selectedSubject) {
            setCurrentTitle(selectedSubject[1].pretty);
            setCurrentEmoji(selectedSubject[1].emoji);
        }
    }, [selectedSubject]);
    var updateSubject = useCallback(function (subjectKey, updates) {
        setSubjects(function (prevSubjects) {
            return prevSubjects.map(function (subject) {
                return subject[0] === subjectKey ? [subject[0], __assign(__assign({}, subject[1]), updates)] : subject;
            });
        });
    }, []);
    var debouncedUpdateSubject = useMemo(function () { return debounce(function (subjectKey, updates) {
        updateSubject(subjectKey, updates);
        setOnSubjects(localSubjects);
    }, 1000); }, [updateSubject, localSubjects]);
    var handleSubjectTitleChange = useCallback(function (newTitle) {
        setCurrentTitle(newTitle);
    }, []);
    var handleSubjectTitleBlur = useCallback(function () {
        if (selectedSubject && currentTitle.trim() !== "") {
            setLocalSubjects(function (prevSubjects) {
                return prevSubjects.map(function (subject) {
                    return subject[0] === selectedSubject[0] ? [subject[0], __assign(__assign({}, subject[1]), { pretty: currentTitle })] : subject;
                });
            });
            debouncedUpdateSubject(selectedSubject[0], { pretty: currentTitle });
        }
    }, [selectedSubject, currentTitle, debouncedUpdateSubject]);
    var handleSubjectEmojiChange = useCallback(function (subjectKey, newEmoji) {
        var emoji = "";
        if (newEmoji.length >= 1) {
            var regexp = /((\ud83c[\udde6-\uddff]){2}|([#*0-9]\u20e3)|(\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*)/g;
            var emojiMatch = newEmoji.match(regexp);
            if (emojiMatch) {
                emoji = emojiMatch[emojiMatch.length - 1];
            }
        }
        setLocalSubjects(function (prevSubjects) {
            return prevSubjects.map(function (subject) {
                return subject[0] === subjectKey ? [subject[0], __assign(__assign({}, subject[1]), { emoji: emoji })] : subject;
            });
        });
        setCurrentEmoji(emoji);
        debouncedUpdateSubject(subjectKey, { emoji: emoji });
    }, [debouncedUpdateSubject]);
    var handleSubjectColorChange = useCallback(function (subjectKey, newColor) {
        setLocalSubjects(function (prevSubjects) {
            return prevSubjects.map(function (subject) {
                return subject[0] === subjectKey ? [subject[0], __assign(__assign({}, subject[1]), { color: newColor })] : subject;
            });
        });
        debouncedUpdateSubject(subjectKey, { color: newColor });
        setCustomColor(newColor);
    }, [debouncedUpdateSubject]);
    var setOnSubjects = useCallback(function (newSubjects) {
        setSubjects(newSubjects);
        mutateProperty("personalization", __assign(__assign({}, account.personalization), { subjects: Object.fromEntries(newSubjects) }));
    }, [account.personalization, mutateProperty]);
    useLayoutEffect(function () {
        navigation.setOptions({
            headerRight: function () { return (<TouchableOpacity onPress={function () {
                    showAlert({
                        title: "Réinitialiser les matières",
                        message: "Veux-tu vraiment réinitialiser toutes les matières ?",
                        icon: <BadgeHelp />,
                        actions: [
                            {
                                title: "Annuler",
                                icon: <X />,
                            },
                            {
                                title: "Réinitialiser",
                                icon: <Trash2 />,
                                primary: true,
                                danger: true,
                                delayDisable: 3,
                                onPress: function () {
                                    setSubjects([]);
                                    setLocalSubjects([]);
                                    setCurrentTitle("");
                                    setCurrentEmoji("");
                                    mutateProperty("personalization", __assign(__assign({}, account.personalization), { subjects: {} }));
                                },
                            },
                        ],
                    });
                }} style={{ marginRight: 2 }}>
          <Trash2 size={22} color={colors.primary}/>
        </TouchableOpacity>); },
        });
    }, [navigation, colors.primary]);
    var _h = useState(""), customColor = _h[0], setCustomColor = _h[1];
    var renderSubjectItem = useCallback(function (_a) {
        var subject = _a.item, index = _a.index;
        if (!subject[0] || !subject[1] || !subject[1].emoji || !subject[1].pretty || !subject[1].color)
            return null;
        return (<MemoizedNativeItem onPress={function () {
                setSelectedSubject(subject);
                setCustomColor(subject[1].color);
                setCurrentTitle(subject[1].pretty);
                setCurrentEmoji(subject[1].emoji);
                setOpened(true);
            }} separator={index !== localSubjects.length - 1} leading={<View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <View style={{
                    width: 4,
                    height: 40,
                    borderRadius: 8,
                    backgroundColor: subject[1].color || "#000000",
                }}/>
            <Text style={{ fontSize: 26 }}>{subject[1].emoji || "🎨"}</Text>
          </View>}>
        <MemoizedNativeText variant="title" numberOfLines={2}>
          {subject[1].pretty || "Matière"}
        </MemoizedNativeText>
        <MemoizedNativeText variant="subtitle" numberOfLines={2}>
          {subject[1].color || "Sans couleur"}
        </MemoizedNativeText>
      </MemoizedNativeItem>);
    }, []);
    return (<KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={insets.top + 44}>
      <ScrollView contentContainerStyle={{
            padding: 16,
            paddingTop: 0,
            paddingBottom: 16 + insets.bottom,
        }}>
        {localSubjects.length > 0 && selectedSubject && (<BottomSheet opened={opened} setOpened={function (bool) {
                var _a, _b;
                if (((_a = localSubjects.find(function (subject) { return subject[0] === selectedSubject[0]; })) === null || _a === void 0 ? void 0 : _a[1].emoji) != "") {
                    setOpened(bool);
                    if (!bool) {
                        handleSubjectTitleBlur(); // Update subject title when closing the bottom sheet
                    }
                }
                else {
                    showAlert({
                        title: "Aucun émoji défini",
                        message: "Tu dois définir un émoji pour cette matière avant de pouvoir quitter cette page.",
                        icon: <BadgeX />,
                    });
                    (_b = emojiInput.current) === null || _b === void 0 ? void 0 : _b.focus();
                }
            }} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {selectedSubject && (<>
                <MemoizedNativeList>
                  <View style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    gap: 14,
                }}>
                    <ColorIndicator style={{ flex: 0 }} color={customColor}/>
                    <View style={{ flex: 1, gap: 4 }}>
                      <MemoizedNativeText variant="title" numberOfLines={2}>
                        {currentTitle}
                      </MemoizedNativeText>
                      <MemoizedNativeText variant="subtitle" style={{
                    backgroundColor: customColor + "22",
                    color: customColor,
                    alignSelf: "flex-start",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    overflow: "hidden",
                    borderCurve: "continuous",
                    opacity: 1,
                }}>
                        Papillon Park
                      </MemoizedNativeText>
                      <MemoizedNativeText variant="subtitle">
                        HLR T.
                      </MemoizedNativeText>
                    </View>
                  </View>
                </MemoizedNativeList>

                <View style={{ flexDirection: "row", gap: 16 }}>
                  <MemoizedNativeList style={{ marginTop: 16, width: 72 }}>
                    <MemoizedNativeItem style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 64,
                    width: 42,
                }}>
                      <View style={{ justifyContent: "center", alignItems: "center", height: 46, width: 42 }}>
                        <ResponsiveTextInput ref={emojiInput} style={{
                    fontFamily: "medium",
                    fontSize: 26,
                    color: colors.text,
                    textAlign: "center",
                    height: "100%",
                }} value={currentEmoji} onChangeText={function (newEmoji) { return handleSubjectEmojiChange(selectedSubject[0], newEmoji); }}/>
                      </View>
                    </MemoizedNativeItem>
                  </MemoizedNativeList>

                  <MemoizedNativeList style={{ marginTop: 16, flex: 1 }}>
                    <MemoizedNativeItem>
                      <MemoizedNativeText variant="subtitle" numberOfLines={1}>
                        Nom de la matière
                      </MemoizedNativeText>
                      <ResponsiveTextInput style={{
                    fontFamily: "medium",
                    fontSize: 16,
                    color: colors.text,
                }} value={currentTitle} onChangeText={handleSubjectTitleChange} onBlur={handleSubjectTitleBlur}/>
                    </MemoizedNativeItem>
                  </MemoizedNativeList>
                </View>

                <MemoizedNativeList style={{ marginTop: 16 }}>
                  <MemoizedNativeItem>
                    <MemoizedNativeText variant="subtitle">
                      Couleur
                    </MemoizedNativeText>

                    <FlatList style={{
                    marginHorizontal: -18,
                    paddingHorizontal: 12,
                    marginTop: 4,
                }} data={COLORS_LIST} horizontal keyExtractor={function (item) { return item; }} ListFooterComponent={<View style={{ width: 16 }}/>} showsHorizontalScrollIndicator={false} renderItem={function (_a) {
                    var item = _a.item;
                    return (<TouchableOpacity onPress={function () { return handleSubjectColorChange(selectedSubject[0], item); }}>
                            <View style={{
                            width: 32,
                            height: 32,
                            borderRadius: 80,
                            backgroundColor: item,
                            marginHorizontal: 5,
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                              {customColor === item && (<Reanimated.View style={{
                                width: 26,
                                height: 26,
                                borderRadius: 80,
                                backgroundColor: item,
                                borderColor: colors.background,
                                borderWidth: 3,
                            }} entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)} exiting={ZoomOut.springify().mass(1).damping(20).stiffness(300)}/>)}
                            </View>
                          </TouchableOpacity>);
                }}/>
                  </MemoizedNativeItem>
                  <MemoizedNativeItem>
                    <MemoizedNativeText variant="subtitle" numberOfLines={1}>
                      Code hexadécimal personnalisé
                    </MemoizedNativeText>
                    <View style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 36,
                }}>
                      <View style={{
                    width: 26,
                    height: 26,
                    backgroundColor: /^#[0-9A-F]{6}$/i.test(customColor) ? customColor : colors.text,
                    borderWidth: 1,
                    borderColor: colors.border,
                    marginRight: 8,
                    borderRadius: 80
                }}/>
                      <ResponsiveTextInput style={{
                    fontFamily: "regular",
                    letterSpacing: 1,
                    fontSize: 20,
                    color: colors.text,
                    flex: 1,
                }} value={customColor !== "" ? customColor : "#"} onChangeText={function (text) {
                    if (!text.startsWith("#")) {
                        text = "#" + text;
                    }
                    text = text.replaceAll(/[G-Z]/g, "");
                    text = text.slice(0, 7).toUpperCase();
                    setCustomColor(text);
                    if (/^#[0-9A-F]{6}$/i.test(text)) {
                        handleSubjectColorChange(selectedSubject[0], text);
                    }
                }}/>
                    </View>
                  </MemoizedNativeItem>
                </MemoizedNativeList>
              </>)}
          </BottomSheet>)}

        <MemoizedSubjectContainerCard theme={{ colors: colors }}/>

        {localSubjects.length > 0 ? (<NativeList>
            <FlatList data={localSubjects} renderItem={renderSubjectItem} keyExtractor={function (item) { return item[0]; }} initialNumToRender={10} maxToRenderPerBatch={10} windowSize={5} removeClippedSubviews={true}/>
          </NativeList>) : (<MissingItem style={{ marginTop: 16 }} emoji={"🎨"} title={"Une matière manque ?"} description={"Essaye d'ouvrir quelques journées dans ton emploi du temps"}/>)}
      </ScrollView>
    </KeyboardAvoidingView>);
};
export default React.memo(SettingsSubjects);
