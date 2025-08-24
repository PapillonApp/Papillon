import { getManager } from "@/services/shared";
import { News } from "@/services/shared/news";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useLocalSearchParams } from "expo-router"
import { useEffect } from "react";
import { View } from "react-native";
import { Attachment, News as SkolengoNews } from "skolengojs"

export default function NewsPage() {
  const search = useLocalSearchParams();
  const news = JSON.parse(String(search.news)) as News

  useEffect(() => {
    const acknowledgeNews = async () => {
      if (!news.acknowledged) {
        console.log("set to acknowledge");
        const manager = getManager();
        console.log(news)

        const store = useAccountStore.getState()
        const account = store.accounts.find(account => account.id === store.lastUsedAccount)
        const service = account?.services.find(service => service.id === news.createdByAccount)

        if (service?.serviceId === Services.SKOLENGO) {
          const attachment = new Attachment("", "", "")
          const ref = new SkolengoNews(news.id, news.createdAt, news.title ?? "", news.content, news.content, { id: "", name: "" }, "", attachment)
          news.ref = ref
        }

        await manager.setNewsAsDone(news);
      }
    };

    acknowledgeNews();
  }, [])

  return (
    <Stack
      direction="vertical"
      style={{
        padding: 20
      }}
    >
      <View style={{
        borderWidth: 2
      }}>
        <Typography>
          Auteur: {news.author} - Category: {news.category}
        </Typography>
        <Typography>
          {news.content}
        </Typography>
      </View>
    </Stack>
  )
}