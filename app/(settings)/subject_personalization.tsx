import { Papicons } from "@getpapillon/papicons";
import { Q } from "@nozbe/watermelondb";
import { router } from "expo-router";
import { useTheme } from "expo-router/react-navigation";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, TouchableOpacity, View } from "react-native";
import Reanimated, {
  Easing,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useDatabase } from "@/database/DatabaseProvider";
import { Grade } from "@/database/models/Grades";
import Homework from "@/database/models/Homework";
import Course from "@/database/models/Timetable";
import { useIcals } from "@/database/useIcals";
import { convertMultipleEvents } from "@/services/local/event-converter";
import { fetchAndParseICal } from "@/services/local/ical";
import { useAccountStore } from "@/stores/account";
import Icon from "@/ui/components/Icon";
import {
  NativeHeaderPressable,
  NativeHeaderSide,
} from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import { useDragSafePress } from "@/ui/utils/useDragSafePress";
import { cleanSubjectName } from "@/utils/subjects/utils";

interface SubjectItem {
  id: string;
  emoji: string;
  name: string;
  color: string;
}

interface SubjectSection {
  id: string;
  title: string;
  items: SubjectItem[];
}

interface SubjectSectionHeaderProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
}

const COLLAPSE_EASING = Easing.bezier(0.3, 0.3, 0, 1);

const SubjectSectionHeader = memo(
  ({ title, isCollapsed, onToggle }: SubjectSectionHeaderProps) => {
    const dragSafeToggle = useDragSafePress(onToggle);

    const animatedChevronStyle = useAnimatedStyle(() => ({
      transform: [
        {
          rotate: withTiming(isCollapsed ? "-180deg" : "0deg", {
            duration: 350,
            easing: COLLAPSE_EASING,
          }),
        },
      ],
    }));

    return (
      <TouchableOpacity
        {...dragSafeToggle}
        activeOpacity={0.6}
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: isCollapsed ? 0.7 : 1,
        }}
      >
        <Typography variant="body1" weight="semibold" color="textSecondary">
          {title}
        </Typography>
        <Reanimated.View style={animatedChevronStyle}>
          <Icon size={18} opacity={0.6}>
            <Papicons name="ChevronDown" />
          </Icon>
        </Reanimated.View>
      </TouchableOpacity>
    );
  }
);
SubjectSectionHeader.displayName = "SubjectSectionHeader";

export default function SubjectPersonalization() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const database = useDatabase();
  const icals = useIcals();

  const accounts = useAccountStore(state => state.accounts);
  const lastUsedAccount = useAccountStore(state => state.lastUsedAccount);

  const account = accounts.find(a => a.id === lastUsedAccount);
  const serviceIds = useMemo(
    () =>
      (account?.services ?? [])
        .map(service => service.id)
        .filter(id => !id.startsWith("ical_")),
    [account?.services]
  );

  const subjects = useMemo<SubjectItem[]>(
    () =>
      Object.entries(account?.customisation?.subjects ?? {})
        .map(([key, value]) => ({
          id: key,
          emoji: value.emoji,
          name: value.name,
          color: value.color,
        }))
        .filter(item => item.name && item.emoji && item.color),
    [account?.customisation?.subjects]
  );

  const [schoolSubjectIds, setSchoolSubjectIds] = useState<Set<string>>(
    () => new Set()
  );
  const [icalSubjectsById, setIcalSubjectsById] = useState<
    Record<string, Set<string>>
  >({});
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;

    const loadSchoolSubjects = async () => {
      const homeworkOwners = [
        ...serviceIds,
        ...(account?.id ? [account.id] : []),
      ];

      if (serviceIds.length === 0 && homeworkOwners.length === 0) {
        if (!cancelled) {
          setSchoolSubjectIds(new Set());
        }
        return;
      }

      const [courses, grades, homeworks] = await Promise.all([
        serviceIds.length > 0
          ? database
            .get<Course>("courses")
            .query(Q.where("createdByAccount", Q.oneOf(serviceIds)))
            .fetch()
          : Promise.resolve([] as Course[]),
        serviceIds.length > 0
          ? database
            .get<Grade>("grades")
            .query(Q.where("createdByAccount", Q.oneOf(serviceIds)))
            .fetch()
          : Promise.resolve([] as Grade[]),
        homeworkOwners.length > 0
          ? database
            .get<Homework>("homework")
            .query(Q.where("createdByAccount", Q.oneOf(homeworkOwners)))
            .fetch()
          : Promise.resolve([] as Homework[]),
      ]);

      if (cancelled) {
        return;
      }

      const ids = new Set<string>();
      for (const course of courses) {
        if (course.subject) {
          ids.add(cleanSubjectName(course.subject));
        }
      }
      for (const grade of grades) {
        if (grade.subjectName) {
          ids.add(cleanSubjectName(grade.subjectName));
        }
      }
      for (const hw of homeworks) {
        if (hw.subject) {
          ids.add(cleanSubjectName(hw.subject));
        }
      }
      setSchoolSubjectIds(ids);
    };

    loadSchoolSubjects().catch(() => {
      if (!cancelled) {
        setSchoolSubjectIds(new Set());
      }
    });

    return () => {
      cancelled = true;
    };
  }, [account?.id, database, serviceIds]);

  useEffect(() => {
    let cancelled = false;

    const loadIcalSubjects = async () => {
      if (icals.length === 0) {
        if (!cancelled) {
          setIcalSubjectsById({});
        }
        return;
      }

      const entries = await Promise.all(
        icals.map(async ical => {
          try {
            const parsedData = await fetchAndParseICal(ical.url);
            const events = convertMultipleEvents(parsedData.events, {
              icalId: ical.id,
              icalTitle: ical.title,
              isADE: parsedData.isADE,
              isHyperplanning: parsedData.isHyperplanning,
              intelligentParsing: ical.intelligentParsing || false,
              isSchool: parsedData.isSchool ?? false,
              schoolName: parsedData.schoolName,
            });
            const ids = new Set<string>();
            for (const event of events) {
              if (event.subject) {
                ids.add(cleanSubjectName(event.subject));
              }
            }
            return [ical.id, ids] as const;
          } catch {
            return [ical.id, new Set<string>()] as const;
          }
        })
      );

      if (!cancelled) {
        setIcalSubjectsById(Object.fromEntries(entries));
      }
    };

    loadIcalSubjects();

    return () => {
      cancelled = true;
    };
  }, [icals]);

  const sections = useMemo<SubjectSection[]>(() => {
    const sortByName = (items: SubjectItem[]) =>
      [...items].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );

    const schoolItems: SubjectItem[] = [];
    const icalBuckets = new Map<string, SubjectItem[]>();
    const otherItems: SubjectItem[] = [];

    for (const ical of icals) {
      icalBuckets.set(ical.id, []);
    }

    for (const subject of subjects) {
      if (schoolSubjectIds.has(subject.id)) {
        schoolItems.push(subject);
        continue;
      }

      const matchingIcal = icals.find(ical =>
        icalSubjectsById[ical.id]?.has(subject.id)
      );
      if (matchingIcal) {
        icalBuckets.get(matchingIcal.id)?.push(subject);
      } else {
        otherItems.push(subject);
      }
    }

    const result: SubjectSection[] = [];
    if (schoolItems.length > 0) {
      result.push({
        id: "school",
        title: t("Settings_Subjects_SchoolService"),
        items: sortByName(schoolItems),
      });
    }

    for (const ical of icals) {
      const items = icalBuckets.get(ical.id) ?? [];
      if (items.length > 0) {
        result.push({
          id: `ical_${ical.id}`,
          title: ical.title,
          items: sortByName(items),
        });
      }
    }

    if (otherItems.length > 0) {
      result.push({
        id: "other",
        title: t("Settings_Subjects_Other"),
        items: sortByName(otherItems),
      });
    }

    return result;
  }, [icals, icalSubjectsById, schoolSubjectIds, subjects, t]);

  const isSectionOpen = useCallback(
    (sectionId: string) =>
      expandedSections[sectionId] ?? !sectionId.startsWith("ical_"),
    [expandedSections]
  );

  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const currentlyOpen = prev[sectionId] ?? !sectionId.startsWith("ical_");
      return { ...prev, [sectionId]: !currentlyOpen };
    });
  }, []);

  const resetAllSubjects = () => {
    Alert.alert(
      t("Settings_Subjects_Reset_Title"),
      t("Settings_Subjects_Reset_Message"),
      [
        {
          text: t("CANCEL_BTN"),
          style: "cancel",
        },
        {
          text: t("Settings_Subjects_Reset_Button"),
          style: "destructive",
          onPress: () => {
            useAccountStore.getState().setSubjects({});
          },
        },
      ]
    );
  };

  function renderItem(emoji: string, name: string, id: string, color: string) {
    return (
      <List.Item
        key={id}
        id={id}
        onPress={() => {
          router.push({
            pathname: "/(settings)/edit_subject",
            params: {
              id,
              emoji,
              color,
              name,
            },
          });
        }}
      >
        <List.Leading>
          <Stack
            backgroundColor={color + "20"}
            style={{
              width: 40,
              height: 40,
              borderRadius: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              style={{
                fontSize: 25,
                lineHeight: 32,
              }}
            >
              {emoji}
            </Typography>
          </Stack>
        </List.Leading>
        <Typography variant={"title"}>{name}</Typography>
        <List.Trailing>
          <Icon>
            <Papicons name="ChevronRight" opacity={0.7} />
          </Icon>
        </List.Trailing>
      </List.Item>
    );
  }

  return (
    <>
      <NativeHeaderSide side="Right">
        <NativeHeaderPressable onPress={() => resetAllSubjects()}>
          <Icon>
            <Papicons name="Trash" />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <List
        animated
        style={{ flex: 1, backgroundColor: colors.overground }}
        safeHorizontalPadding={16}
        contentContainerStyle={{ paddingVertical: 16 }}
        contentInsetAdjustmentBehavior="automatic"
      >
        {sections.length > 0 ? (
          sections.map(section => {
            const isCollapsed = !isSectionOpen(section.id);

            return (
              <List.Section key={section.id} id={section.id}>
                <List.SectionTitle id={`${section.id}-title`}>
                  <SubjectSectionHeader
                    title={section.title}
                    isCollapsed={isCollapsed}
                    onToggle={() => toggleSection(section.id)}
                  />
                </List.SectionTitle>
                {!isCollapsed &&
                  section.items.map(item =>
                    renderItem(item.emoji, item.name, item.id, item.color)
                  )}
              </List.Section>
            );
          })
        ) : (
          <List.View>
            <Stack hAlign="center" vAlign="center" margin={16} gap={16}>
              <View
                style={{
                  alignItems: "center",
                }}
              >
                <Icon
                  papicon
                  opacity={0.5}
                  size={32}
                  style={{ marginBottom: 3 }}
                >
                  <Papicons name={"Alert"} />
                </Icon>
                <Typography variant="h4" color="textPrimary" align="center">
                  {t("Settings_Subjects_None_Title")}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  align="center"
                >
                  {t("Settings_Subjects_None_Description")}
                </Typography>
              </View>
            </Stack>
          </List.View>
        )}
      </List>
    </>
  );
}
