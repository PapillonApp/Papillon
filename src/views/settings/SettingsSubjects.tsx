import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { useCurrentAccount } from "@/stores/account";
import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { Alert, FlatList, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import Reanimated, { ZoomIn, ZoomOut } from "react-native-reanimated";
import MissingItem from "@/components/Global/MissingItem";
import BottomSheet from "@/components/Modals/PapillonBottomSheet";
import { Trash2 } from "lucide-react-native";
import ColorIndicator from "@/components/Lessons/ColorIndicator";
import { COLORS_LIST } from "@/services/shared/Subject";
import type { Screen } from "@/router/helpers/types";
import SubjectContainerCard from "@/components/Settings/SubjectContainerCard";

const MemoizedNativeItem = React.memo(NativeItem);
const MemoizedNativeList = React.memo(NativeList);
const MemoizedNativeText = React.memo(NativeText);

type Item = [key: string, value: { color: string; pretty: string; emoji: string; }];

const SettingsSubjects: Screen<"SettingsSubjects"> = ({ navigation }) => {
  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);
  const insets = useSafeAreaInsets();
  const colors = useTheme().colors;

  const [subjects, setSubjects] = useState<Array<Item>>([]);
  const [currentCourseTitle, setCurrentCourseTitle] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<Item | null>(null);
  const [opened, setOpened] = useState(false);

  const emojiInput = React.useRef<TextInput>(null);

  useEffect(() => {
    void async function () {
      if (subjects.length === 0 && account.personalization.subjects) {
        setSubjects(Object.entries(account.personalization.subjects));
      }
    }();
  }, []);

  useEffect(() => {
    if (selectedSubject && currentCourseTitle !== selectedSubject[1].pretty && currentCourseTitle.trim() !== "") {
      setOnSubjects(
        subjects.map((subject) => {
          if (subject[0] === selectedSubject[0]) {
            return [selectedSubject[0], {
              ...subject[1],
              pretty: currentCourseTitle,
            }];
          }

          return subject;
        })
      );
    }
  }, [currentCourseTitle]);

  const setOnSubjects = useCallback((newSubjects: Item[]) => {
    setSubjects(newSubjects);
    mutateProperty("personalization", {
      ...account.personalization,
      subjects: Object.fromEntries(newSubjects),
    });
  }, [subjects]);

  // Add reset button in header.
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              "Réinitialiser les matières",
              "Voulez-vous vraiment réinitialiser les matières ?",
              [
                {
                  text: "Annuler",
                  style: "cancel",
                },
                {
                  text: "Réinitialiser",
                  style: "destructive",
                  onPress: () => {
                    setSubjects([]);
                  },
                },
              ]
            );
          }}
          style={{
            marginRight: 2,
          }}
        >
          <Trash2
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={insets.top + 44}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: 16 + insets.bottom,
        }}
      >
        {subjects.length > 0 && selectedSubject && (
          <BottomSheet
            opened={opened}
            setOpened={(bool: boolean) => {
              if (subjects.find((subject) => subject[0] === selectedSubject[0])?.[1].emoji != "") {
                setOpened(bool);
              } else {
                Alert.alert("Aucun émoji défini", "Vous devez définir un émoji pour cette matière avant de pouvoir quitter cette page.");
                emojiInput.current?.focus();
              }
            }}
            contentContainerStyle={{
              paddingHorizontal: 16,
            }}
          >
            {selectedSubject &&
              <MemoizedNativeList>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    justifyContent: "flex-start",
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    gap: 14,
                  }}
                >
                  <ColorIndicator style={{ flex: 0 }} color={subjects.find((subject) => subject[0] === selectedSubject[0])?.[1].color ?? "#ffffff"} />
                  <View
                    style={{
                      flex: 1,
                      gap: 4,
                    }}
                  >
                    <MemoizedNativeText variant="title" numberOfLines={2}>
                      {currentCourseTitle}
                    </MemoizedNativeText>
                    <MemoizedNativeText
                      variant="subtitle"
                      style={{
                        backgroundColor: subjects.find((subject) => subject[0] === selectedSubject[0])?.[1].color + "22",
                        color: subjects.find((subject) => subject[0] === selectedSubject[0])?.[1].color,
                        alignSelf: "flex-start",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 8,
                        overflow: "hidden",
                        borderCurve: "continuous",
                        opacity: 1,
                      }}
                    >
                      Papillon Park
                    </MemoizedNativeText>
                    <MemoizedNativeText variant="subtitle">
                      HLR T.
                    </MemoizedNativeText>
                  </View>
                </View>
              </MemoizedNativeList>
            }

            <View
              style={{
                flexDirection: "row",
                gap: 16,
              }}
            >
              <MemoizedNativeList
                style={{ marginTop: 16, width: 72 }}
              >
                <MemoizedNativeItem
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 64,
                    width: 42,
                  }}
                >
                  <TextInput
                    ref={emojiInput}
                    style={{
                      fontFamily: "medium",
                      fontSize: 26,
                      color: colors.text,
                      textAlign: "center",
                      textAlignVertical: "center",
                      padding: 0,
                      height: 46,
                      width: 42,
                    }}
                    value={subjects.find((subject) => subject[0] === selectedSubject[0])?.[1].emoji}
                    onChangeText={(text) => {
                      if (text.length < 1) {
                        setOnSubjects(
                          subjects.map((subject) => {
                            if (subject[0] === selectedSubject[0]) {
                              return [selectedSubject[0], {
                                ...subject[1],
                                emoji: "",
                              }];
                            }
                            return subject;
                          })
                        );
                        return;
                      } else {
                        var regexp = /((\ud83c[\udde6-\uddff]){2}|([#*0-9]\u20e3)|(\u00a9|\u00ae|[\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])((\ud83c[\udffb-\udfff])?(\ud83e[\uddb0-\uddb3])?(\ufe0f?\u200d([\u2000-\u3300]|[\ud83c-\ud83e][\ud000-\udfff])\ufe0f?)?)*)/g;

                        const emojiMatch = text.match(regexp);

                        if (emojiMatch) {
                          const lastEmoji = emojiMatch[emojiMatch.length - 1];
                          setOnSubjects(
                            subjects.map((subject) => {
                              if (subject[0] === selectedSubject[0]) {
                                return [selectedSubject[0], {
                                  ...subject[1],
                                  emoji: lastEmoji,
                                }];
                              }
                              return subject;
                            })
                          );
                        }
                      }
                    }}
                  />
                </MemoizedNativeItem>
              </MemoizedNativeList>

              <MemoizedNativeList
                style={{ marginTop: 16, flex: 1 }}
              >
                <MemoizedNativeItem>
                  <MemoizedNativeText variant="subtitle" numberOfLines={1}>
                    Nom de la matière
                  </MemoizedNativeText>
                  <TextInput
                    style={{
                      fontFamily: "medium",
                      fontSize: 16,
                      color: colors.text,
                    }}
                    value={currentCourseTitle}
                    onChangeText={setCurrentCourseTitle}
                  />
                </MemoizedNativeItem>
              </MemoizedNativeList>
            </View>

            <MemoizedNativeList
              style={{ marginTop: 16 }}
            >
              <MemoizedNativeItem
              >
                <MemoizedNativeText variant="subtitle">
                  Couleur
                </MemoizedNativeText>

                <FlatList
                  style={{
                    marginHorizontal: -18,
                    paddingHorizontal: 12,
                    marginTop: 4,
                  }}
                  data={COLORS_LIST}
                  horizontal
                  keyExtractor={(item) => item}
                  ListFooterComponent={<View style={{ width: 16 }} />}
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setOnSubjects(
                          subjects.map((subject) => {
                            if (subject[0] === selectedSubject[0]) {
                              return [selectedSubject[0], {
                                ...subject[1],
                                color: item,
                              }];
                            }
                            return subject;
                          })
                        );
                      }}
                    >
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 80,
                          backgroundColor: item,
                          marginHorizontal: 5,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {subjects.find((subject) => subject[0] === selectedSubject[0])?.[1].color === item && (
                          <Reanimated.View
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 80,
                              backgroundColor: item,
                              borderColor: colors.background,
                              borderWidth: 3,
                            }}
                            entering={ZoomIn.springify().mass(1).damping(20).stiffness(300)}
                            exiting={ZoomOut.springify().mass(1).damping(20).stiffness(300)}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </MemoizedNativeItem>
            </MemoizedNativeList>
          </BottomSheet>
        )}

        <SubjectContainerCard theme={{ colors }} />

        {subjects.length > 0 && (
          <MemoizedNativeList
            style={{
              marginTop: 16,
            }}
          >
            {subjects.map((subject, index) => {
              if (!subject[0] || !subject[1] || !subject[1].emoji || !subject[1].pretty || !subject[1].color)
                return <View key={index} />;

              return (
                <MemoizedNativeItem
                  key={index + subject[0] + subject[1].emoji + subject[1].pretty + subject[1].color}
                  onPress={() => {
                    setSelectedSubject(subject);
                    setCurrentCourseTitle(subject[1].pretty);
                    setOpened(true);
                  }}
                  leading={
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 14,
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          width: 4,
                          height: 40,
                          borderRadius: 8,
                          backgroundColor: subject[1].color || "#000000",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      />

                      <Text
                        style={{
                          fontSize: 26,
                        }}
                      >
                        {subject[1].emoji || "🎨"}
                      </Text>
                    </View>
                  }
                >
                  <MemoizedNativeText variant="body" numberOfLines={2}>
                    {subject[1].pretty || "Matière"}
                  </MemoizedNativeText>
                </MemoizedNativeItem>
              );
            })}
          </MemoizedNativeList>
        )}

        {subjects.length === 0 && (
          <MissingItem
            style={{
              marginTop: 16,
            }}
            emoji={"🎨"}
            title={"Une matière manque ?"}
            description={"Essayez d'ouvrir quelques journées dans votre emploi du temps"}
          />
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsSubjects;
