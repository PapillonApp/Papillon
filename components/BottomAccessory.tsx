import { useTimetableWidgetData } from '@/app/(tabs)/index/hooks/useTimetableWidgetData';
import Icon from '@/ui/components/Icon';
import Typography from '@/ui/new/Typography';
import i18n from '@/utils/i18n';
import { getSubjectColor } from '@/utils/subjects/colors';
import { getSubjectEmoji } from '@/utils/subjects/emoji';
import { getSubjectName } from '@/utils/subjects/name';
import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { formatDistanceToNowStrict } from 'date-fns';
import * as DateLocale from 'date-fns/locale';
import { useNavigation } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import React from 'react';
import { ActivityIndicator, Platform, Pressable } from 'react-native';
import { View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

function NextCourseAccessory({ placement }) {
  if (Platform.OS !== 'ios') {
    return null;
  }

  const theme = useTheme();
  const { courses, loading } = useTimetableWidgetData();
  const nextCourse = courses.length > 0 ? courses[0] : null;

  // if (placement === 'inline') {}

  const sbjColor = nextCourse ? getSubjectColor(nextCourse.subject) : theme.colors.primary;
  const navigation = useNavigation<any>();

  if(loading) return null;

  if(!nextCourse) return null;

  return (
    <>
      <Pressable
        onPress={() => {
          navigation.navigate("(modals)/course", {
            course: nextCourse,
            subjectInfo: {
              id: nextCourse.subject,
              name: getSubjectName(nextCourse.subject),
              color: getSubjectColor(nextCourse.subject) || theme.colors.primary,
              emoji: getSubjectEmoji(nextCourse.subject),
            },
          });
        }}
        style={{
          height: "100%",
          paddingVertical: 10,
          paddingHorizontal: 14,
          alignItems: "center",
          justifyContent: "start",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <View
          style={{
            backgroundColor: sbjColor,
            height: "100%",
            width: 6,
            borderRadius: 5,
          }}
        />
        <Typography variant="h4">
          {getSubjectEmoji(nextCourse.subject)}
        </Typography>
        <View
          style={{
            flex: 1,
            gap: 0,
          }}
        >
          <Typography variant="title" numberOfLines={1}>
            {getSubjectName(nextCourse?.subject)}
          </Typography>

          {placement === 'inline' ? (
            <View
              style={{
                marginTop: -2,
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Icon size={14} fill={sbjColor}>
                <Papicons name="Clock" />
              </Icon>
              <Typography variant="body2" weight="semibold" color={sbjColor} numberOfLines={1}>
                {formatDistanceToNowStrict(nextCourse.from, {
                    locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                    addSuffix: true
                  })}
              </Typography>
            </View>
          ) : (
            <View
              style={{
                marginTop: -2,
                flexDirection: "row",
                alignItems: "center",
                gap: 3,
                width: "100%",
                overflow: "hidden",
              }}
            >
              <Icon size={14} opacity={0.5}>
                <Papicons name="MapPin" />
              </Icon>
              <Typography variant="body2" weight="semibold" color="textSecondary" numberOfLines={1}>
                {nextCourse?.room}
              </Typography>
              <View style={{ width: 3, height: 3, borderRadius: 8, backgroundColor: theme.colors.text, opacity: 0.5, marginHorizontal: 6 }} />
              <Icon size={14} opacity={0.5}>
                <Papicons name="User" />
              </Icon>
              <Typography variant="body2" weight="semibold" color="textSecondary" numberOfLines={1}>
                {nextCourse?.teacher}
              </Typography>
            </View>
          )}
        </View>

        {placement !== 'inline' && (
          <View
            style={{
              marginTop: -2,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon size={14} fill={sbjColor}>
              <Papicons name="Clock" />
            </Icon>
            <Typography variant="body1" weight="semibold" color={sbjColor}>
              {formatDistanceToNowStrict(nextCourse.from, {
                  locale: DateLocale[i18n.language as keyof typeof DateLocale] || DateLocale.enUS,
                  addSuffix: false
                })}
            </Typography>
          </View>
        )}
      </Pressable>

      <LinearGradient
        colors={[sbjColor, sbjColor + '00']}
        start={{x: 1, y: 0}}
        end={{x: 0, y: 0}}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: "100%",
          zIndex: -1,
          opacity: 0.3,
        }}
      />
    </>
  );
}

export default function BottomAccessory() {
  const placement = NativeTabs.BottomAccessory.usePlacement();

  return (
      <NextCourseAccessory placement={placement} />
  );
}

export function useBottomAccessoryVisible() {
  const { courses, loading } = useTimetableWidgetData();

  if (Platform.OS !== 'ios') {
    return false;
  }

  if (loading) {
    return false;
  }

  return courses.length > 0;
}
