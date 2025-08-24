import { News } from "@/services/shared/news";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { router, useLocalSearchParams } from "expo-router"
import { Pressable } from "react-native";

export default function NewsPage() {
  const search = useLocalSearchParams();
  const news = JSON.parse(String(search.news)) as News[]

  return (
    <Stack
      direction="vertical"
      style={{
        padding: 20
      }}
    >
      {news.map((item, index) => (
        <Pressable
          key={item.author}
          style={{
            borderWidth: 2,
            marginBottom: 10,
            padding: 10,
          }}
          onPress={() => {
            router.push({
              pathname: "/(news)/specific",
              params: {
                news: JSON.stringify(item)
              }
            })
          }}
        >
          <Typography>
            {item.title}
          </Typography>
          <Typography>
            Auteur: {item.author} - Category: {item.category} - Acknowledged: {item.acknowledged}
          </Typography>
          <Typography>
            {item.content}
          </Typography>
        </Pressable>
      ))}
    </Stack>
  )
}