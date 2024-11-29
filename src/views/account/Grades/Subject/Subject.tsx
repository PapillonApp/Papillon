import type { RouteParameters } from "@/router/helpers/types";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { Grade, GradesPerSubject } from "@/services/shared/Grade";
import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { FlatList } from "react-native";
import SubjectItem from "./SubjectList";

interface SubjectProps {
  allGrades: Grade[]
  gradesPerSubject: GradesPerSubject[]
  navigation: NativeStackNavigationProp<RouteParameters, keyof RouteParameters>
}

const Subject: React.FC<SubjectProps> = ({
  gradesPerSubject,
  navigation,
  allGrades
}) => {
  const renderItem = ({ item, index }: { item: GradesPerSubject; index: number }) => (
    <SubjectItem
      key={item.average.subjectName + index}
      subject={item}
      navigation={navigation}
      allGrades={allGrades}
    />
  );

  const ListHeaderComponent = () => (
    <NativeListHeader label="Mes notes" />
  );

  return (
    <Reanimated.View
      layout={animPapillon(LinearTransition)}
    >
      <FlatList
        data={gradesPerSubject}
        renderItem={renderItem}
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={(item, index) => item.average.subjectName + index}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        initialNumToRender={8}
        windowSize={5}
      />
    </Reanimated.View>
  );
};

export default Subject;