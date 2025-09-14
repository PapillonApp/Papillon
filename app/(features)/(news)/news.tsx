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
import { View, FlatList, Image } from "react-native";
import { Papicons } from "@getpapillon/papicons";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import { Variant } from "@/ui/components/Typography"
import { useTranslation } from "react-i18next";

export default function NewsPage() {
  const { news: newsParam } = useLocalSearchParams();
  const news = JSON.parse(String(newsParam)) as News[];

  return (
    <FlatList
      data={news.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
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

  const { t } = useTranslation();

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
              <Papicons name={"Sparkles"} />
            </Icon>
            <Typography color="#DD00D2">{t("Magic_Important")}</Typography>
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

export function Avatar({ author, dark = false, squared = false, size = 35, variant = "button", imageURL }: { author: string, dark?: boolean, squared?: boolean, size?: number, variant?: Variant, imageURL?: string }) {
  const backgroundColor = `${getProfileColorByName(author)}20`;
  const textColor = adjust(getProfileColorByName(author), -0.6);
  const initials = getInitials(author)

  const theme = useTheme();
  const { colors } = theme;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: dark ? colors.border : backgroundColor,
        borderRadius: squared ? 10 : 100
      }}
    >
      <Typography variant={variant} color={dark ? colors.text : textColor}>
        {initials || author}
      </Typography>
      {imageURL && (
        <Image
          source={{ uri: imageURL }}
          style={{
            width: size,
            height: size,
            borderRadius: squared ? 10 : 100,
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      )}
    </View>
  );
}

function cleanContent(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
