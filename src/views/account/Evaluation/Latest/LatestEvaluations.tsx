import React from "react";
import { FlatList } from "react-native";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteParameters } from "@/router/helpers/types";
import {Evaluation} from "@/services/shared/Evaluation";
import EvaluationLatestItem from "./LatestEvaluationsItem";

interface EvaluationsLatestListProps {
  latestEvaluations: Evaluation[]
  allEvaluations: Evaluation[]
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>
}

const EvaluationsLatestList = (props: EvaluationsLatestListProps) => {
  const { latestEvaluations, navigation, allEvaluations } = props;

  const renderItem = ({ item, index }: { item: Evaluation; index: number }) => (
    <EvaluationLatestItem
      key={item.id + index}
      evaluation={item}
      navigation={navigation}
      allEvaluations={allEvaluations}
    />
  );

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <NativeListHeader animated label="Dernières compétences" />

      <FlatList
        data={latestEvaluations}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id + index}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 6,
          paddingHorizontal: 16,
          gap: 10,
        }}
        style={{
          marginHorizontal: -16,
          marginBottom: -2,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={6}
        initialNumToRender={4}
        windowSize={3}
      />

    </Reanimated.View>
  );
};

export default EvaluationsLatestList;