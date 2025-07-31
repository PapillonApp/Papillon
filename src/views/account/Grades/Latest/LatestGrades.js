import React from "react";
import { FlatList } from "react-native";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { anim2Papillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import GradesLatestItem from "./LatestGradesItem";
import * as Haptics from "expo-haptics";
import useSoundHapticsWrapper from "@/utils/native/playSoundHaptics";
var GradesLatestList = function (props) {
    var latestGrades = props.latestGrades, navigation = props.navigation, allGrades = props.allGrades;
    var playHaptics = useSoundHapticsWrapper().playHaptics;
    var renderItem = function (_a) {
        var item = _a.item, index = _a.index;
        return (<GradesLatestItem key={item.id + index} grade={item} i={index} navigation={navigation} allGrades={allGrades}/>);
    };
    return (<Reanimated.View layout={anim2Papillon(LinearTransition)}>
      <NativeListHeader animated label="Dernières notes"/>

      <FlatList data={latestGrades} renderItem={renderItem} keyExtractor={function (item, index) { return item.id + index; }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{
            paddingBottom: 6,
            paddingHorizontal: 16,
            gap: 10,
        }} style={{
            marginHorizontal: -16,
            marginBottom: -2,
        }} removeClippedSubviews={true} maxToRenderPerBatch={6} initialNumToRender={4} windowSize={3} snapToAlignment="start" snapToInterval={240} decelerationRate="fast" onScroll={function (_a) {
            var nativeEvent = _a.nativeEvent;
            if (nativeEvent.contentOffset.x % 240 === 0) {
                playHaptics("impact", {
                    impact: Haptics.ImpactFeedbackStyle.Light,
                });
            }
        }}/>

    </Reanimated.View>);
};
export default GradesLatestList;
