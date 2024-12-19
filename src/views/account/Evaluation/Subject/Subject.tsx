import type { RouteParameters } from "@/router/helpers/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { FlatList } from "react-native";
import SubjectItem from "./EvaluationList";
import {Evaluation, EvaluationsPerSubject} from "@/services/shared/Evaluation";

interface SubjectProps {
  allEvaluations: Evaluation[]
  evaluationsPerSubject: EvaluationsPerSubject[]
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>
}

const Subject: React.FC<SubjectProps> = ({
  evaluationsPerSubject,
  navigation,
  allEvaluations
}) => {
  const renderItem = ({ item, index }: { item: EvaluationsPerSubject; index: number }) => (
    <SubjectItem
      key={item.subjectName + index}
      subject={item}
      allEvaluations={allEvaluations}
      navigation={navigation}
    />
  );

  const ListHeaderComponent = () => (
    <NativeListHeader label="Mes compétences" />
  );

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <FlatList
        data={evaluationsPerSubject}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={(item, index) => item.subjectName + index}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
      />
    </Reanimated.View>
  );
};

export default Subject;