import { NativeList, NativeItem, NativeText } from "@/components/Global/NativeComponents";
import { ScrollView, StyleSheet, View, Image } from "react-native";
import type { Screen } from "@/router/helpers/types";

const ChatThemes: Screen<"ChatThemes"> = ({ navigation, route }) => {
  const { themes, onGoBack } = route.params;

  return (
    <ScrollView style={styles.container}>
      <NativeList>
        {themes.map((theme) => (
          <NativeItem
            key={theme.path}
            onPress={() => {
              if (onGoBack) {
                onGoBack(theme);
              }
              navigation.goBack();
            }}
          >
            <View style={styles.itemContainer}>
              <View style={styles.innerRow}>
                <Image
                  source={theme.icon}
                  style={styles.icon}
                />
                <View>
                  <NativeText>{theme.name}</NativeText>
                  <NativeText variant="subtitle">{theme.author}</NativeText>
                </View>
              </View>
            </View>
          </NativeItem>
        ))}
      </NativeList>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
