import { News } from "@/services/shared/news";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import { getProfileColorByName } from "@/utils/chats/colors";
import { getInitials } from "@/utils/chats/initials";
import { formatRelativeTime } from "@/utils/date";
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { View, ScrollView, Pressable } from "react-native";
import * as Papicons from "@getpapillon/papicons";

export default function NewsPage() {
  const { news: newsParam } = useLocalSearchParams();
  const news = JSON.parse(String(newsParam)) as News[];

  return (
    <ScrollView contentContainerStyle={{ padding: 20, flex: 1, gap: 20 }}>
      {news.map((item, index) => (
        <NewsItem
          key={item.id}
          news={item}
          important={index === 0}
        />
      ))}
    </ScrollView>
  );
}

function NewsItem({ news, important }: { news: News; important?: boolean }) {
  const { author, title, content, createdAt } = news;
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: "/(news)/specific",
      params: { news: JSON.stringify(news) },
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <Stack
        backgroundColor={important ? "#F5B2F1" : "transparent"}
        style={{
          borderRadius: 25,
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.5,
          shadowRadius: 4,
          elevation: 5,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        {important && (
          <Stack
            direction="horizontal"
            style={{ paddingHorizontal: 15, paddingTop: 5 }}
          >
            <Icon papicon fill="#DD00D2">
              <Papicons.Sparkles />
            </Icon>
            <Typography color="#DD00D2">Peut-être important</Typography>
          </Stack>
        )}
        <View
          style={{
            padding: 15,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            backgroundColor: colors.card,
            borderRadius: 25,
          }}
        >
          <Avatar author={author} />
          <Stack direction="vertical" style={{ flex: 1 }}>
            <Typography color={`${colors.text}80`}>{author}</Typography>
            <Typography variant="title">{title || "Aucun titre"}</Typography>
            <Typography
              variant="body1"
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {cleanContent(content)}
            </Typography>
            <Typography color={`${colors.text}80`}>
              {formatRelativeTime(createdAt)}
            </Typography>
          </Stack>
        </View>
      </Stack>
    </Pressable>
  );
}

function Avatar({ author }: { author: string }) {
  const backgroundColor = `${getProfileColorByName(author)}90`;
  const textColor = adjust(getProfileColorByName(author), -0.6);

  return (
    <View
      style={{
        width: 35,
        height: 35,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor,
        borderRadius: 50,
      }}
    >
      <Typography variant="button" color={textColor}>
        {getInitials(author)}
      </Typography>
    </View>
  );
}

function cleanContent(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
