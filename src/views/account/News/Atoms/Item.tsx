import {RouteProp, useTheme} from "@react-navigation/native";
import React from "react";
import {
  Dimensions,
  View,
} from "react-native";
import {
  NativeItem,
  NativeText,
} from "@/components/Global/NativeComponents";
import parse_news_resume from "@/utils/format/format_pronote_news";
import parse_initials from "@/utils/format/format_pronote_initials";
import formatDate from "@/utils/format/format_date_complets";
import InitialIndicator from "@/components/News/InitialIndicator";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteParameters} from "@/router/helpers/types";
import {Information} from "@/services/shared/Information";
import { selectColorSeed } from "@/utils/format/select_color_seed";

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
          important: message.important !== undefined,
          isED
        });
      }}
      chevron={false}
      leading={
        <InitialIndicator
          initial={parse_initials(message.author)}
          color={selectColorSeed(message.author)}
        />
      }
      separator={index !== parentMessages.length - 1}
    >
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <NativeText
          numberOfLines={1}
          variant="subtitle"
        >
          {message.author}
        </NativeText>

        {!message.read && !isED && (
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 5,
            backgroundColor: theme.colors.primary,
          }} />
        )}
      </View>
      {message.title !== "" && <NativeText
        numberOfLines={1}
        variant="title"
      >
        {message.title}
      </NativeText>}

      <NativeText
        numberOfLines={2}
        variant="default"
        style={{
          lineHeight: 20,
          opacity: 0.8,
        }}
      >
        {message.content ? parse_news_resume(message.content) : ""}
      </NativeText>
      <NativeText
        numberOfLines={1}
        variant="subtitle"
        style={{
          marginTop: 6,
        }}
      >
        {formatDate(message.date)}
      </NativeText>
    </NativeItem>
  );
};

export default NewsListItem;
