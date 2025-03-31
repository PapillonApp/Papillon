import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import React from "react";
import { View } from "react-native";
import { NativeItem, NativeText } from "@/components/Global/NativeComponents";
import parse_news_resume from "@/utils/format/format_pronote_news";
import formatDate from "@/utils/format/format_date_complets";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteParameters } from "@/router/helpers/types";
import { Information } from "@/services/shared/Information";

type NewsItem = Omit<Information, "date"> & { date: string, important: boolean };

interface NewsListItemProps {
  index: number
  message: NewsItem
  navigation: NativeStackNavigationProp<RouteParameters, "News", undefined>
  isED: boolean
  parentMessages: NewsItem[]
}

const NewsListItem: React.FC<NewsListItemProps> = ({ index, message, navigation, parentMessages, isED }) => {
  const theme = useTheme();
  return (
    <NativeItem
      onPress={() => {
        navigation.navigate("NewsItem", {
          message: JSON.stringify(message),
          important: !!message.important,
          isED
        });
      }}
      chevron={false}
      separator={index !== parentMessages.length - 1}
    >
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
        marginBottom: 2,
        justifyContent: "space-between",
      }}>
        {message.title !== "" && (
          <NativeText
            numberOfLines={1}
            variant="title"
            style={{
              flex: 1,
            }}
          >
            {message.title ?? "Sans titre"}
          </NativeText>)
        }
        {!message.read && !isED && (
          <View
            style={{
              width: 9,
              height: 9,
              borderRadius: 5,
              marginTop: 1,
              backgroundColor: theme.colors.primary,
            }}
          />
        )}
      </View>

      {message.content && (
        <NativeText
          numberOfLines={2}
          variant="default"
          style={{
            lineHeight: 20,
            opacity: 0.8,
          }}
        >
          {!message.content.includes("<img")
            ? parse_news_resume(message.content)
            : "Contient une image"}
        </NativeText>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 5,
        }}
      >
        <NativeText
          numberOfLines={1}
          variant="subtitle"
        >
          {formatDate(message.date)}
        </NativeText>
        <NativeText
          numberOfLines={1}
          variant="subtitle"
        >
          {message.author}
        </NativeText>
      </View>
    </NativeItem>
  );
};

export default NewsListItem;
