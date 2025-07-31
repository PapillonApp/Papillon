import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { View } from "react-native";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import parse_news_resume from "@/utils/format/format_pronote_news";
import formatDate from "@/utils/format/format_date_complets";
var NewsListItem = function (_a) {
    var _b;
    var index = _a.index, message = _a.message, navigation = _a.navigation, parentMessages = _a.parentMessages, isED = _a.isED;
    var theme = useTheme();
    return (<NativeItem onPress={function () {
            navigation.navigate("NewsItem", {
                message: JSON.stringify(message),
                important: !!message.important,
                isED: isED
            });
        }} chevron={false} separator={index !== parentMessages.length - 1}>
      <View style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 1,
            gap: 10,
            marginBottom: 2,
            justifyContent: "space-between",
        }}>
        {message.title !== "" && (<NativeText numberOfLines={1} variant="title" style={{
                flex: 1,
            }}>
            {(_b = message.title) !== null && _b !== void 0 ? _b : "Sans titre"}
          </NativeText>)}
        {!message.read && !isED && (<View style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                marginTop: 1,
                backgroundColor: theme.colors.primary,
            }}/>)}
      </View>

      {message.content && (<NativeText numberOfLines={2} variant="default" style={{
                lineHeight: 20,
                opacity: 0.8,
            }}>
          {!message.content.includes("<img")
                ? parse_news_resume(message.content)
                : "Contient une image"}
        </NativeText>)}
      <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 5,
        }}>
        <NativeText numberOfLines={1} variant="subtitle">
          {formatDate(message.date)}
        </NativeText>
        <NativeText numberOfLines={1} variant="subtitle">
          {message.author}
        </NativeText>
      </View>
    </NativeItem>);
};
export default NewsListItem;
