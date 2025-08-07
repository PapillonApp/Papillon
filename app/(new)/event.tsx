import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from "@react-navigation/native";
import * as Localization from "expo-localization";
import { useRouter } from "expo-router";
import { CalendarDays, Check, Clock4Icon, MapPinIcon, TypeIcon, User2Icon, X } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import React, { Platform, Pressable, ScrollView, StyleSheet, TextInput } from "react-native";

import { useDatabase } from "@/database/DatabaseProvider";
import Icon from "@/ui/components/Icon";
import Item, { Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

export default function NewEventScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const database = useDatabase();

  const [canSave, setCanSave] = useState(false);

  const [inputTitle, setInputTitle] = useState("");
  const [inputLocation, setInputLocation] = useState("");

  const [inputOrganizer, setInputOrganizer] = useState("");

  const [inputStartDate, setInputStartDate] = useState(new Date());

  const inHour = new Date();
  inHour.setHours(new Date().getHours() + 1, 0, 0, 0); // Set to one hour later

  const [inputEndDate, setInputEndDate] = useState(inHour);

  const checkCanSave = () => {
    const titleValid = inputTitle.length > 0;
    const locationValid = inputLocation.length > 0;
    const organizerValid = inputOrganizer.length > 0;

    const startDateValid = inputStartDate instanceof Date && !isNaN(inputStartDate.getTime());
    const endDateValid = inputEndDate instanceof Date && !isNaN(inputEndDate.getTime());

    const endDateAfterStartDate = inputEndDate.getTime() > inputStartDate.getTime();

    setCanSave(titleValid && locationValid && organizerValid && startDateValid && endDateValid && endDateAfterStartDate);
  };

  useEffect(() => {
    checkCanSave();
  }, [inputTitle, inputLocation, inputOrganizer, inputStartDate, inputEndDate]);


  // Helper to create an event without linking to subject
  async function createEvent(eventData: {
    title: string;
    start: number;
    end: number;
    color?: string;
    room?: string;
    teacher?: string;
    status?: string;
    canceled?: boolean;
  }) {
    await database.write(async () => {
      await database.get<Event>('events').create((ev: Event) => {
        ev.title = eventData.title;
        ev.start = eventData.start;
        ev.end = eventData.end;
        if (eventData.color) {ev.color = eventData.color;}
        if (eventData.room) {ev.room = eventData.room;}
        if (eventData.teacher) {ev.teacher = eventData.teacher;}
        if (eventData.status) {ev.status = eventData.status;}
        if (typeof eventData.canceled === 'boolean') {ev.canceled = eventData.canceled;}
      });
    });
  }

  const saveEvent = useCallback(async () => {
    if (!canSave) {return;}

    // Create event data
    const eventData = {
      title: inputTitle,
      start: inputStartDate.getTime(),
      end: inputEndDate.getTime(),
      color: "#888888", // Default color, can be changed later
      room: inputLocation,
      teacher: inputOrganizer,
      status: null, // Default status
      canceled: false // Default not canceled
    };

    createEvent(eventData)
      .then(() => {
        router.back();
      })
      .catch((error) => {
        console.error("Error creating event:", error);
        alert(t("Error_CreatingEvent"));
      });
  }, [canSave, inputTitle, inputLocation, inputOrganizer, inputStartDate, inputEndDate, router, t, database]);

  return (
    <>
      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => { router.back() }}>
          <Icon>
            <X />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderSide
        side="Right"
        // @ts-expect-error TypeScript doesn't recognize the `key` prop on NativeHeaderSide
        key={"saveIcon_save=" + canSave + inputTitle + inputLocation + inputOrganizer + inputStartDate.getTime() + inputEndDate.getTime()}
      >
        <NativeHeaderPressable disabled={!canSave} onPress={() => { saveEvent() }}>
          <Check style={{ opacity: canSave ? 1 : 0.5 }} color={canSave ? colors.primary : colors.text} />
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.containerContent}
        style={styles.container}
      >
        <List>
          <Item>
            <Icon>
              <TypeIcon opacity={inputTitle.length > 0 ? 1 : 0.5} />
            </Icon>
            <TextInput
              placeholder={t("Form_Title")}
              value={inputTitle}
              onChangeText={setInputTitle}
              style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium" }}
            />
          </Item>
          <Item>
            <Icon>
              <MapPinIcon opacity={inputLocation.length > 0 ? 1 : 0.5} />
            </Icon>
            <TextInput
              placeholder={t("Form_Location")}
              value={inputLocation}
              onChangeText={setInputLocation}
              style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium" }}
            />
          </Item>
        </List>

        <List>
          <Item>
            <Icon>
              <User2Icon opacity={inputOrganizer.length > 0 ? 1 : 0.5} />
            </Icon>
            <TextInput
              placeholder={t("Form_Organizer")}
              autoCorrect={false}
              autoComplete={"off"}
              value={inputOrganizer}
              onChangeText={text => {
                setInputOrganizer(text);
              }}
              style={{ flex: 1, paddingVertical: 8, fontSize: 16, fontFamily: "medium" }}
            />
          </Item>
        </List>

        <List>
          <Item>
            <Icon>
              <CalendarDays />
            </Icon>
            <Typography variant="body1" style={{ flex: 1, paddingVertical: 6 }}>
              {t("Form_Start")}
            </Typography>
            <Trailing>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={inputStartDate}
                  mode="datetime"
                  accentColor={colors.primary}
                  locale={Localization.getLocales()[0].languageTag}
                  display="compact"
                  onChange={(event, date) => {
                    if (date) {
                      // When changing the start date, update the date part of end date to match, but keep the time part
                      setInputStartDate(date);
                      setInputEndDate(prevEnd => {
                        const newEnd = new Date(date);
                        newEnd.setHours(prevEnd.getHours(), prevEnd.getMinutes(), 0, 0);
                        // If new end is before or equal to new start, add 1 hour
                        if (newEnd.getTime() <= date.getTime()) {
                          newEnd.setTime(date.getTime() + 60 * 60 * 1000);
                        }
                        return newEnd;
                      });
                    }
                  }}
                />
              ) : (
                <Stack direction="horizontal" gap={8}>
                  <Pressable
                    onPress={() => {
                      DateTimePickerAndroid.open({
                        value: inputStartDate,
                        mode: "date",
                        design: "material",
                        locale: Localization.getLocales()[0].languageTag,
                        onChange: (event, date) => {
                          if (date) {
                            setInputStartDate(date);
                          }
                        }
                      });
                    }}
                  >
                    <Typography variant="h5" color="primary">
                      {inputStartDate.toLocaleDateString(Localization.getLocales()[0].languageTag, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })}{" "}
                    </Typography>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      DateTimePickerAndroid.open({
                        value: inputStartDate,
                        mode: "time",
                        design: "material",
                        locale: Localization.getLocales()[0].languageTag,
                        onChange: (event, date) => {
                          if (date) {
                            setInputStartDate(date);
                          }
                        }
                      });
                    }}
                  >
                    <Typography variant="h5" color="primary">
                      {inputStartDate.toLocaleTimeString(Localization.getLocales()[0].languageTag, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                    </Typography>
                  </Pressable>
                </Stack>
              )}
            </Trailing>
          </Item>
          <Item>
            <Icon>
              <Clock4Icon />
            </Icon>
            <Typography variant="body1" style={{ flex: 1, paddingVertical: 6 }}>
              {t("Form_End")}
            </Typography>
            <Trailing>
              {Platform.OS === "ios" ? (
                <DateTimePicker
                  value={inputEndDate}
                  mode="time"
                  accentColor={colors.primary}
                  locale={Localization.getLocales()[0].languageTag}
                  display="compact"
                  onChange={(event, date) => {
                    if (date) {
                      // Only update the time part of end date, keep the date part
                      setInputEndDate(prevEnd => {
                        const newEnd = new Date(prevEnd);
                        newEnd.setHours(date.getHours(), date.getMinutes(), 0, 0);
                        // If new end is before or equal to start, move to next day
                        if (newEnd.getTime() <= inputStartDate.getTime()) {
                          newEnd.setDate(newEnd.getDate() + 1);
                        }
                        return newEnd;
                      });
                    }
                  }}
                />
              ) : (
                <Stack direction="horizontal" gap={8}>
                  <Pressable
                    onPress={() => {
                      DateTimePickerAndroid.open({
                        value: inputEndDate,
                        mode: "time",
                        design: "material",
                        locale: Localization.getLocales()[0].languageTag,
                        onChange: (event, date) => {
                          if (date) {
                            setInputEndDate(date);
                          }
                        }
                      });
                    }}
                  >
                    <Typography variant="h5" color="primary">
                      {inputEndDate.toLocaleTimeString(Localization.getLocales()[0].languageTag, {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}{" "}
                    </Typography>
                  </Pressable>
                </Stack>
              )}
            </Trailing>
          </Item>
        </List>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  containerContent: {
    justifyContent: "center",
    alignItems: "center",
  }
});
