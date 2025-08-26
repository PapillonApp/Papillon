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
import { View, ScrollView, Pressable, FlatList } from "react-native";
import * as Papicons from "@getpapillon/papicons";
import TableFlatList from "@/ui/components/TableFlatList";
import AnimatedPressable from "@/ui/components/AnimatedPressable";

export default function NewsPage() {
  const { news: newsParam } = useLocalSearchParams();
  const news = JSON.parse(String(newsParam)) as News[];

  return (
    <FlatList
      data={news}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <NewsItem news={item} />}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        gap: 8,
        padding: 16,
        overflow: "visible"
      }}
      style={{
        overflow: "visible"
      }}
    />
  );
}

function NewsItem({ news, important }: { news: News; important?: boolean }) {
  const { author, title, content, createdAt, attachments } = news;
  const { colors } = useTheme();

  const handlePress = () => {
    router.push({
      pathname: "/(features)/(news)/specific",
      params: { news: JSON.stringify(news) },
    });
  };

  return (
    <AnimatedPressable onPress={handlePress} style={{ overflow: "visible" }}>
      <Stack
        backgroundColor={important ? "#F5B2F1" : "transparent"}
        card
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
            paddingHorizontal: 16,
            paddingVertical: 10,
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
              {formatRelativeTime(createdAt)} {attachments.length > 0 && ` • (${attachments.length} pièce(s) jointe(s))`}
            </Typography>
          </Stack>
        </View>
      </Stack>
    </AnimatedPressable>
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
