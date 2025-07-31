import { NativeListHeader } from "@/components/Global/NativeComponents";
import { animPapillon } from "@/utils/ui/animations";
import Reanimated, { LinearTransition } from "react-native-reanimated";
import { FlatList } from "react-native";
import SubjectItem from "./EvaluationList";
var Subject = function (_a) {
    var evaluationsPerSubject = _a.evaluationsPerSubject, navigation = _a.navigation, allEvaluations = _a.allEvaluations;
    var renderItem = function (_a) {
        var item = _a.item, index = _a.index;
        return (<SubjectItem key={item.subjectName + index} subject={item} allEvaluations={allEvaluations} navigation={navigation}/>);
    };
    var ListHeaderComponent = function () { return (<NativeListHeader label="Mes compétences"/>); };
    return (<Reanimated.View layout={animPapillon(LinearTransition)}>
      <FlatList data={evaluationsPerSubject} renderItem={renderItem} ListHeaderComponent={ListHeaderComponent} keyExtractor={function (item, index) { return item.subjectName + index; }} removeClippedSubviews={true} maxToRenderPerBatch={10} initialNumToRender={8} windowSize={5}/>
    </Reanimated.View>);
};
export default Subject;
