import { useTheme } from "@react-navigation/native";
import React from "react";
import { Image, Platform, RefreshControl as RNRefreshControl, ScrollView, Text, View } from "react-native";
import { TimetableItem } from "./Item";
import { createNativeWrapper } from "react-native-gesture-handler";

import Reanimated, {
  FadeInDown,
  FadeOut,
  FadeOutUp
} from "react-native-reanimated";

import { Sofa, Utensils } from "lucide-react-native";
import { TimetableClass } from "@/services/shared/Timetable";
import { animPapillon } from "@/utils/ui/animations";
import LessonsLoading from "./Loading";
import MissingItem from "@/components/Global/MissingItem";
import { getHolidayEmoji } from "@/utils/format/holidayEmoji";
import { getDuration } from "@/utils/format/course_duration";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";

const emoji = getHolidayEmoji();

const RefreshControl = createNativeWrapper(RNRefreshControl, {
  disallowInterruption: true,
  shouldCancelWhenOutside: false,
});

interface PageProps {
  current: boolean
  date: Date
  day: TimetableClass[]
  loading: boolean
  paddingTop: number
  refreshAction: () => unknown
  weekExists: boolean
  hasServiceSetup: boolean
}

export const Page = ({ day, date, current, paddingTop, refreshAction, loading, weekExists, hasServiceSetup }: PageProps) => {
  const { isOnline } = useOnlineStatus();

  return (
    <ScrollView
      style={{
        flex: 1,
        width: "100%",
        height: "100%",
      }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: paddingTop
      }}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={refreshAction}
          progressViewOffset={paddingTop}
        />
      }
    >
      {current &&
        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 10,
            gap: 10,
            width: "100%"
          }}
        >
          {!isOnline && <OfflineWarning cache={true} />}

          {day && day.length > 0 && day[0].type !== "vacation" && day.map((item, i) => (
            <View key={item.startTimestamp + i.toString()} style={{ gap: 10 }}>
              <TimetableItem key={item.startTimestamp} item={item} index={i} />

              {day[i + 1] &&
                day[i + 1].startTimestamp - item.endTimestamp > 1740000 && (
                <SeparatorCourse
                  i={i}
                  start={item.endTimestamp}
                  end={day[i + 1].startTimestamp}
                />
              )}
            </View>
          ))}
        </View>
      }

      {loading && day.length == 0 && (
        <Reanimated.View
          style={{
            padding: 26,
          }}
          entering={animPapillon(FadeInDown)}
          exiting={animPapillon(FadeOutUp).delay(100)}
        >
          <LessonsLoading />
        </Reanimated.View>
      )}

      {hasServiceSetup && day && day.length === 0 && current && !loading && (
        weekExists && (new Date(date).getDay() == 6 || new Date(date).getDay() == 0) ? (
          <MissingItem
            emoji="🌴"
            title="C'est le week-end !"
            description="Profite de ton week-end, il n'y a pas de cours aujourd'hui."
            entering={animPapillon(FadeInDown)}
            exiting={animPapillon(FadeOut)}
          />
        ) : (
          <MissingItem
            emoji="📆"
            title="Pas de cours aujourd'hui"
            description="Aucun cours n'est prévu pour aujourd'hui."
            entering={animPapillon(FadeInDown)}
            exiting={animPapillon(FadeOut)}
          />
        )
      )}

      {hasServiceSetup && day.length === 1 && current && !loading && (day[0].type === "vacation" ? <MissingItem
        emoji={emoji}
        title="C'est les vacances !"
        description="Profite de tes vacances, à bientôt."
        entering={animPapillon(FadeInDown)}
        exiting={animPapillon(FadeOut)}
      />: <></>
      )}

      {!hasServiceSetup && <MissingItem
        title="Aucun service connecté"
        description="Tu n'as pas encore paramétré de service pour cette fonctionnalité."
        emoji="🤷"
        style={{ marginTop: 16 }}
      />}
    </ScrollView>
  );
};

const SeparatorCourse: React.FC<{
  i: number
  start: number
  end: number
}> = ({ i, start, end }) => {
  const { colors } = useTheme();
  const startHours = new Date(start).getHours();
  return (
    <Reanimated.View
      style={{
        borderRadius: 10,
        backgroundColor: colors.card,
        borderColor: colors.text + "33",
        borderWidth: 0.5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
        elevation: 1,
        marginLeft: 70,
      }}
      entering={
        Platform.OS === "ios" ?
          FadeInDown.delay(50 * i)
            .springify()
            .mass(1)
            .damping(20)
            .stiffness(300)
          : void 0
      }
      exiting={Platform.OS === "ios" ? FadeOut.duration(300) : void 0}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderRadius: 10,
          gap: 10,
          overflow: "hidden",
          backgroundColor: colors.text + "11",
        }}
      >
        <Image
          source={require("../../../../../assets/images/mask_course.png")}
          resizeMode='cover'
          tintColor={colors.text}
          style={{
            position: "absolute",
            top: "-15%",
            left: "-20%",
            width: "200%",
            height: "300%",
            opacity: 0.05,
          }}
        />

        {startHours >= 11 &&
          startHours < 14 ? (
            <Utensils size={20} color={colors.text} />
          ) : (
            <Sofa size={20} color={colors.text} />
          )}
        <Text
          numberOfLines={1}
          style={{
            flex: 1,
            fontFamily: "semibold",
            fontSize: 16,
            color: colors.text,
          }}
        >
          {startHours >= 11 &&
            startHours < 14
            ? "Pause méridienne"
            : "Pas de cours"}
        </Text>

        <Text
          numberOfLines={1}
          style={{
            fontFamily: "medium",
            fontSize: 15,
            opacity: 0.5,
            color: colors.text,
          }}
        >
          {getDuration(
            Math.round((end - start) / 60000)
          )}
        </Text>
      </View>
    </Reanimated.View>
  );
};
