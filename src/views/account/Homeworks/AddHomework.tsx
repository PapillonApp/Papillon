import React, { useEffect, useLayoutEffect, useState } from "react";

import { Screen } from "@/router/helpers/types";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import { useHomeworkStore } from "@/stores/homework";
import { useCurrentAccount } from "@/stores/account";

import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ActivityIndicator, Alert, Dimensions, Platform, TextInput, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import PapillonPicker from "@/components/Global/PapillonPicker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BookOpen, Calendar } from "lucide-react-native";
import ButtonCta from "@/components/FirstInstallation/ButtonCta";
import { dateToEpochWeekNumber } from "@/utils/epochWeekNumber";
import { Homework } from "@/services/shared/Homework";
import HomeworkItem from "./Atoms/Item";


const AddHomeworkScreen: Screen<"AddHomework"> = ({ route, navigation }) => {
  const account = useCurrentAccount(store => store.account!);
  const theme = useTheme();
  const homeworks = useHomeworkStore(store => store.homeworks);
  const localSubjects = account.personalization.subjects ?? {};
  const [selectedPretty, setSelectedPretty] = useState(
    Object.entries(localSubjects || {})[0]?.[1] ?? null
  );

  // Création de devoirs personnalisés
  const [currentHw, setCurrentHw] = useState<Homework | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [idHomework, setIdHomework] = useState(NaN);
  const [contentHomework, setContentHomework] = useState<string | null>(null);
  const [dateHomework, setDateHomework] = useState(Date.now());


  useEffect(() => {
    if (route.params?.hwid) {
      const allHomeworks = Object.values(homeworks).flat();
      const homework = allHomeworks.find(hw => hw.id === route.params?.hwid);
      if (homework) {
        const THEpretty = Object.entries(localSubjects).find((element) => element[1].pretty === homework.subject);
        if (THEpretty) setSelectedPretty(THEpretty[1]);
        setIdHomework(parseInt(homework.id));
        setContentHomework(homework.content);
        setDateHomework(homework.due);
        setCurrentHw(homework);
      }
    } else {
      let createId: number = Math.floor(Math.random() * 100000 + 1);
      let idAlreadyExist = useHomeworkStore
        .getState()
        .existsHomework(
          dateToEpochWeekNumber(new Date(dateHomework)),
          String(createId)
        );

      while (idAlreadyExist) {
        createId = Math.floor(Math.random() * 100000 + 1);
        idAlreadyExist = useHomeworkStore
          .getState()
          .existsHomework(
            dateToEpochWeekNumber(new Date(dateHomework)),
            String(createId)
          );
      }

      setIdHomework(createId);
    }
  }, [route.params?.hwid]);

  const createHomework = async () => {
    setLoading(true);

    if (!selectedPretty || !contentHomework) {
      Alert.alert("Veuillez remplir tous les champs avant de valider.");
      setLoading(false);
      return;
    }

    // Créez un objet représentant le devoir
    const newHomework: Homework = {
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
      .addHomework(
        dateToEpochWeekNumber(new Date(dateHomework)),
        newHomework
      );

    setSelectedPretty(Object.entries(localSubjects || {})[0]?.[1] ?? null);
    setIdHomework(NaN);
    setContentHomework(null);
    setDateHomework(Date.now());
    setLoading(false);

    navigation.goBack();
  };

  const updateHomework = async () => {
    if (!currentHw) return;

    const newHomework: Homework = {
      ...currentHw,
      subject: selectedPretty.pretty,
      color: selectedPretty.color,
      content: contentHomework ?? "",
      due: dateHomework,
    };

    useHomeworkStore
      .getState()
      .updateHomework(
        dateToEpochWeekNumber(new Date(dateHomework)),
        currentHw.id,
        newHomework
      );

    setSelectedPretty(Object.entries(localSubjects || {})[0]?.[1] ?? null);
    setIdHomework(NaN);
    setContentHomework(null);
    setDateHomework(Date.now());
    navigation.goBack();
    if(route.params?.modal) {
      navigation.goBack();
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: currentHw ? "Modifier le devoir" : "Ajouter un devoir",
    });
  }, [navigation, currentHw]);

  const [exampleDone, setExampleDone] = useState(false);

  return (
    <ScrollView style={{
      paddingHorizontal: 12
    }}>
      <NativeList inline>
        <NativeItem>
          <View style={{ marginHorizontal: -20, marginTop: -8, marginBottom: -10 }}>
            <HomeworkItem
              homework={{
                attachments: [],
                color: selectedPretty.color,
                content: contentHomework ?? "Commence par ajouter du contenu",
                done: exampleDone,
                due: dateHomework,
                id: String(idHomework),
                personalizate: true,
                subject: selectedPretty.pretty,
                exam: false,
              }}
              contentOpacity={!contentHomework ? 0.5 : undefined}
              index={idHomework}
              key={idHomework}
              // @ts-expect-error
              navigation={navigation}
              onDonePressHandler={() => {
                setExampleDone(!exampleDone);
              }}
              total={1}
            />
          </View>
        </NativeItem>
      </NativeList>

      <NativeList inline>
        <NativeItem
          icon={<BookOpen size={22} strokeWidth={2} />}
          trailing={
            <View
              style={[
                Platform.OS === "android" && {
                  width: "50%",
                  minWidth: 200,
                },
                {
                  maxWidth: Dimensions.get("window").width - 200,
                }
              ]}
            >
              {Platform.OS === "ios" ? (
                <PapillonPicker
                  data={Object.entries(localSubjects).map(([key, subject]) => ({
                    label: subject.pretty,
                    onPress: () => setSelectedPretty(subject),
                    checked: selectedPretty?.pretty === subject.pretty,
                    ios: {
                      icon: {
                        type: "IMAGE_SYSTEM" ,
                        imageValue: {
                          systemName: "circle.fill",
                          pointSize: 12,
                          hierarchicalColor: subject?.color,
                        },
                      }
                    }
                  }))}
                  selected={selectedPretty?.pretty}
                >
                  <Pressable
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      paddingVertical: 9,
                      paddingHorizontal: 6,
                      alignSelf: "flex-end",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: selectedPretty?.color,
                        width: 10,
                        height: 10,
                        borderRadius: 30,
                      }}
                    />

                    <NativeText variant="overtitle" numberOfLines={1}>
                      {selectedPretty?.pretty}
                    </NativeText>
                  </Pressable>
                </PapillonPicker>
              ) : (
                <Picker
                  selectedValue={selectedPretty?.pretty}
                  onValueChange={(itemValue) => {
                    const selectedSubject = Object.entries(localSubjects).find(
                      ([, subject]) => subject.pretty === itemValue
                    );

                    if (selectedSubject) {
                      setSelectedPretty(selectedSubject[1]);
                    }
                  }}
                  style={{
                    color: theme.colors.text,
                  }}
                >
                  {Object.entries(localSubjects).map(([key, subject]) => (
                    <Picker.Item
                      key={key}
                      label={subject.pretty}
                      value={subject.pretty}
                    />
                  ))}
                </Picker>
              )}
            </View>
          }
        >
          <NativeText variant="subtitle">
            Matière
          </NativeText>
        </NativeItem>
        <NativeItem
          icon={<Calendar size={22} strokeWidth={2} />}
          onPress={Platform.OS !== "ios" ? () => setShowDatePicker(true) : undefined}
          trailing={
            showDatePicker || Platform.OS === "ios" ? (
              <DateTimePicker
                value={new Date(dateHomework)}
                mode="date"
                display="default"
                onChange={(_event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const dateSelected = Date.UTC(
                      selectedDate.getFullYear(),
                      selectedDate.getMonth(),
                      selectedDate.getDate(),
                    );
                    setDateHomework(dateSelected);
                  }
                }}
              />
            ) : (
              <NativeText variant="subtitle">
                {new Date(dateHomework).toLocaleDateString()}
              </NativeText>
            )
          }
        >
          <NativeText variant="subtitle">
            {Platform.OS !== "ios" ? "Date" : "Sélectionner la date"}
          </NativeText>
        </NativeItem>
      </NativeList>

      <NativeList inline>
        <NativeItem>
          <TextInput
            style={{
              fontFamily: "medium",
              fontSize: 16,
              color: theme.colors.text,
            }}
            placeholder="Contenu du devoir"
            multiline
            placeholderTextColor={theme.colors.text + "55"}
            value={contentHomework ?? ""}
            onChangeText={(input) => {
              if (input === "") {
                setContentHomework(null);
              } else {
                setContentHomework(input);
              }
            }}
          />
        </NativeItem>
      </NativeList>

      <ButtonCta
        value={currentHw ? "Mettre à jour" : "Valider"}
        onPress={() => {
          if (currentHw) {
            updateHomework();
          } else {
            createHomework();
          }
        }}
        primary={!loading}
        icon={loading ? <ActivityIndicator /> : void 0}
        disabled={loading}
        style={{
          minWidth: undefined,
          maxWidth: undefined,
          width: "50%",
          alignSelf: "center",
          marginTop: 15,
        }}
        backgroundColor={selectedPretty.color}
      />
    </ScrollView>
  );
};

export default AddHomeworkScreen;