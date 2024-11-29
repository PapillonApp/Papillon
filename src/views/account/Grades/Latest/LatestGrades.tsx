import React from "react";
import { FlatList, View } from "react-native";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import GradesLatestItem from "./LatestGradesItem";
import { Grade } from "@/services/shared/Grade";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteParameters } from "@/router/helpers/types";

interface GradesLatestListProps {
  latestGrades: Grade[]
  allGrades: Grade[]
  navigation: NativeStackNavigationProp<RouteParameters, "Grades", undefined>
}

const GradesLatestList = (props: GradesLatestListProps) => {
  const { latestGrades, navigation, allGrades } = props;

  const renderItem = ({ item, index }: { item: Grade; index: number }) => (
    <GradesLatestItem
      key={item.id + index}
      grade={item}
      i={index}
      navigation={navigation}
      allGrades={allGrades}
    />
  );

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <NativeListHeader animated label="Dernières notes" />

      <FlatList
        data={latestGrades}
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

export default GradesLatestList;