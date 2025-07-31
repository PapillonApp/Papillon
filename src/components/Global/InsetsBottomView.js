import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
var InsetsBottomView = function () {
    var insets = useSafeAreaInsets();
    return <View style={{ height: insets.bottom + 16 }}/>;
};
export default InsetsBottomView;
