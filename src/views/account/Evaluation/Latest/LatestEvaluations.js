import React from "react";
import { FlatList } from "react-native";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import EvaluationLatestItem from "./LatestEvaluationsItem";
var EvaluationsLatestList = function (props) {
    var latestEvaluations = props.latestEvaluations, navigation = props.navigation, allEvaluations = props.allEvaluations;
    var renderItem = function (_a) {
        var item = _a.item, index = _a.index;
        return (<EvaluationLatestItem key={item.id + index} evaluation={item} navigation={navigation} allEvaluations={allEvaluations}/>);
    };
    return (<Reanimated.View layout={animPapillon(LinearTransition)}>
      <NativeListHeader animated label="Dernières compétences"/>

      <FlatList data={latestEvaluations} renderItem={renderItem} keyExtractor={function (item, index) { return item.id + index; }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{
            paddingBottom: 6,
            paddingHorizontal: 16,
            gap: 10,
        }} style={{
            marginHorizontal: -16,
            marginBottom: -2,
        }} removeClippedSubviews={true} maxToRenderPerBatch={6} initialNumToRender={4} windowSize={3}/>

    </Reanimated.View>);
};
export default EvaluationsLatestList;
