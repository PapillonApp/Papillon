import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { Image, Platform, RefreshControl as RNRefreshControl, ScrollView, Text, View } from "react-native";
import { TimetableItem } from "./Item";
import { createNativeWrapper } from "react-native-gesture-handler";
import Reanimated, { FadeInDown, FadeOut, FadeOutUp } from "react-native-reanimated";
import { DoorOpen, Moon, Sofa, Utensils } from "lucide-react-native";
import { TimetableClassStatus } from "@/services/shared/Timetable";
import { animPapillon } from "@/utils/ui/animations";
import LessonsLoading from "./Loading";
import MissingItem from "@/components/Global/MissingItem";
import { getHolidayEmoji } from "@/utils/format/holidayEmoji";
import { getDuration } from "@/utils/format/course_duration";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";
var emoji = getHolidayEmoji();
var RefreshControl = createNativeWrapper(RNRefreshControl, {
    disallowInterruption: true,
    shouldCancelWhenOutside: false,
});
export var Page = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j;
    var day = _a.day, date = _a.date, current = _a.current, paddingTop = _a.paddingTop, refreshAction = _a.refreshAction, loading = _a.loading, weekExists = _a.weekExists, hasServiceSetup = _a.hasServiceSetup, maxStart = _a.maxStart, maxEnd = _a.maxEnd;
    var isOnline = useOnlineStatus().isOnline;
    var dateMaxStart = new Date(date);
    dateMaxStart.setHours(maxStart / 60);
    dateMaxStart.setMinutes(maxStart % 60);
    var dateMaxEnd = new Date(date);
    dateMaxEnd.setHours(maxEnd / 60);
    dateMaxEnd.setMinutes(maxEnd % 60);
    return (<ScrollView style={{
            flex: 1,
            width: "100%",
            height: "100%",
        }} showsVerticalScrollIndicator={false} contentContainerStyle={{
            paddingTop: paddingTop
        }} refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshAction} progressViewOffset={paddingTop}/>}>
      {current && (<View style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                gap: 10,
                width: "100%",
            }}>
          {!isOnline && <OfflineWarning cache={true}/>}

          {day[0] && (day[0].status === TimetableClassStatus.CANCELED ? (day.find(function (item) { return item.status !== TimetableClassStatus.CANCELED; }) && (<SeparatorCourse i={day.findIndex(function (item) { return item.status !== TimetableClassStatus.CANCELED; })} start={dateMaxStart.getTime()} end={(_c = (_b = day.find(function (item) { return item.status !== TimetableClassStatus.CANCELED; })) === null || _b === void 0 ? void 0 : _b.startTimestamp) !== null && _c !== void 0 ? _c : dateMaxStart.getTime()} icon={Moon} label={"Début des cours à " + new Date((_e = (_d = day.find(function (item) { return item.status !== TimetableClassStatus.CANCELED; })) === null || _d === void 0 ? void 0 : _d.startTimestamp) !== null && _e !== void 0 ? _e : dateMaxStart.getTime()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })} showDuration={false}/>)) : (day[0].startTimestamp - dateMaxStart.getTime() > 900000 && (<SeparatorCourse i={0} start={dateMaxStart.getTime()} end={day[0].startTimestamp} icon={Moon} label={"Début des cours à " + new Date(day[0].startTimestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })} showDuration={false}/>)))}

          {day && day.length > 0 && day[0].type !== "vacation" && day.map(function (item, i) { return (<View key={item.startTimestamp + i.toString()} style={{ gap: 10 }}>
              <TimetableItem key={item.startTimestamp} item={item} index={i}/>

              {day[i + 1] && day[i + 1].startTimestamp - item.endTimestamp > 1740000 && (<SeparatorCourse i={i} start={item.endTimestamp} end={day[i + 1].startTimestamp}/>)}
            </View>); })}

          {day[day.length - 1] && day.length > 0 && (day[day.length - 1].status === TimetableClassStatus.CANCELED ? (day.slice().reverse().find(function (item) { return item.status !== TimetableClassStatus.CANCELED; }) && (<SeparatorCourse i={day.length} start={(_g = (_f = day.slice().reverse().find(function (item) { return item.status !== TimetableClassStatus.CANCELED; })) === null || _f === void 0 ? void 0 : _f.endTimestamp) !== null && _g !== void 0 ? _g : dateMaxEnd.getTime()} end={dateMaxEnd.getTime()} icon={DoorOpen} label={"Fin des cours à " + new Date((_j = (_h = day.slice().reverse().find(function (item) { return item.status !== TimetableClassStatus.CANCELED; })) === null || _h === void 0 ? void 0 : _h.endTimestamp) !== null && _j !== void 0 ? _j : dateMaxEnd.getTime()).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })} showDuration={false}/>)) : (dateMaxEnd.getTime() - day[day.length - 1].endTimestamp > 900000 && (<SeparatorCourse i={day.length} start={day[day.length - 1].endTimestamp} end={dateMaxEnd.getTime()} icon={DoorOpen} label={"Fin des cours à " + new Date(day[day.length - 1].endTimestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                })} showDuration={false}/>)))}
        </View>)}

      {loading && day.length == 0 && (<Reanimated.View style={{
                padding: 26,
            }} entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOutUp).delay(100)}>
          <LessonsLoading />
        </Reanimated.View>)}

      {hasServiceSetup && day && day.length === 0 && current && !loading && (weekExists && (new Date(date).getDay() == 6 || new Date(date).getDay() == 0) ? (<MissingItem emoji="🌴" title="C'est le week-end !" description="Profite de ton week-end, il n'y a pas de cours aujourd'hui." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)}/>) : (<MissingItem emoji="📆" title="Pas de cours aujourd'hui" description="Aucun cours n'est prévu pour aujourd'hui." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)}/>))}

      {hasServiceSetup && day.length === 1 && current && !loading && (day[0].type === "vacation" ? <MissingItem emoji={emoji} title="C'est les vacances !" description="Profite de tes vacances, à bientôt." entering={animPapillon(FadeInDown)} exiting={animPapillon(FadeOut)}/> : <></>)}

      {!hasServiceSetup && <MissingItem title="Aucun service connecté" description="Tu n'as pas encore paramétré de service pour cette fonctionnalité." emoji="🤷" style={{ marginTop: 16 }}/>}
    </ScrollView>);
};
var SeparatorCourse = function (_a) {
    var i = _a.i, start = _a.start, end = _a.end, icon = _a.icon, label = _a.label, _b = _a.showDuration, showDuration = _b === void 0 ? true : _b;
    var colors = useTheme().colors;
    var startHours = new Date(start).getHours();
    return (<Reanimated.View style={{
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
        }} entering={Platform.OS === "ios" ?
            FadeInDown.delay(50 * i)
                .springify()
                .mass(1)
                .damping(20)
                .stiffness(300)
            : void 0} exiting={Platform.OS === "ios" ? FadeOut.duration(300) : void 0}>
      <View style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
            borderRadius: 10,
            gap: 10,
            overflow: "hidden",
            backgroundColor: colors.text + "11",
        }}>
        <Image source={require("../../../../../assets/images/mask_course.png")} resizeMode='cover' tintColor={colors.text} style={{
            position: "absolute",
            top: "-15%",
            left: "-20%",
            width: "200%",
            height: "300%",
            opacity: 0.05,
        }}/>

        {!icon ? (startHours >= 11 &&
            startHours < 14 ? (<Utensils size={20} color={colors.text}/>) : (<Sofa size={20} color={colors.text}/>)) : (React.createElement(icon, {
            color: colors.text,
            size: 20,
        }))}
        <Text numberOfLines={1} style={{
            flex: 1,
            fontFamily: "semibold",
            fontSize: 16,
            color: colors.text,
        }}>
          {label ? label : startHours >= 11 &&
            startHours < 14
            ? "Pause méridienne"
            : "Pas de cours"}
        </Text>

        {showDuration && (<Text numberOfLines={1} style={{
                fontFamily: "medium",
                fontSize: 15,
                opacity: 0.5,
                color: colors.text,
            }}>
            {getDuration(Math.round((end - start) / 60000))}
          </Text>)}
      </View>
    </Reanimated.View>);
};
