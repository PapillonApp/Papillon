import { NativeList, NativeItem, NativeText } from "@/components/Global/NativeComponents";
import { ScrollView, StyleSheet, View, Image } from "react-native";
var ChatThemes = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var _b = route.params, themes = _b.themes, onGoBack = _b.onGoBack;
    return (<ScrollView style={styles.container}>
      <NativeList>
        {themes.map(function (theme) { return (<NativeItem key={theme.path} onPress={function () {
                if (onGoBack) {
                    onGoBack(theme);
                }
                navigation.goBack();
            }}>
            <View style={styles.itemContainer}>
              <View style={styles.innerRow}>
                <Image source={theme.icon} style={styles.icon}/>
                <View>
                  <NativeText>{theme.name}</NativeText>
                  <NativeText variant="subtitle">{theme.author}</NativeText>
                </View>
              </View>
            </View>
          </NativeItem>); })}
      </NativeList>
    </ScrollView>);
};
var styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
    },
    itemContainer: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
        justifyContent: "space-between",
    },
    innerRow: {
        flex: 1,
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    icon: {
        width: 35,
        height: 35,
        borderRadius: 12.5,
    },
});
export default ChatThemes;
