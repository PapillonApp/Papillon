import { getManager } from "@/services/shared";
import { News } from "@/services/shared/news";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Stack from "@/ui/components/Stack";
import TypographyLegacy from "@/ui/components/Typography";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router"
import { useEffect, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Attachment, News as SkolengoNews } from "skolengojs"

import { VARIANTS } from "@/ui/components/Typography";

import HTMLView from 'react-native-htmlview';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from "@react-navigation/native";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import { MenuView } from "@react-native-menu/menu";
import Icon from "@/ui/components/Icon";
import { t } from "i18next";
import ListLegacy from "@/ui/components/List";
import Item, { Leading } from "@/ui/components/Item";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { cleanHtmlForArticle } from "@/utils/news/cleanUpHTMLNews";
import { news } from "pawnote";
import Avatar from "@/ui/components/Avatar";
import { getInitials } from "@/utils/chats/initials";
import { HeaderBackButton } from "@react-navigation/elements";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import { IconNames, Papicons } from "@getpapillon/papicons";
import { getAttachmentIcon } from "@/utils/news/getAttachmentIcon";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const NewsModal = () => {
  const search = useLocalSearchParams();
  const news = JSON.parse(String(search.news)) as News
  const insets = useSafeAreaInsets();

  const navigation = useNavigation()
  const router = useRouter()

  useEffect(() => {
    const acknowledgeNews = async () => {
      if (!news.acknowledged) {
        const manager = getManager();

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


  const { colors } = useTheme();

  const stylesheet = StyleSheet.create({
    ...VARIANTS,
    p: {
      ...VARIANTS.body1,
      color: colors.text,
    },
    div: {
      ...VARIANTS.body1,
      color: colors.text,
    },
    a: {
      color: colors.primary,
      textDecorationLine: 'underline'
    },
    ul: {
      ...VARIANTS.body1,
      paddingHorizontal: 4,
      color: colors.text,
    },
  });

  const [HTMLCleanupEnabled, setHTMLCleanupEnabled] = useState(true)
  const cleanedContent = HTMLCleanupEnabled ? cleanHtmlForArticle(news.content) : news.content

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20 + insets.bottom,
        gap: 24
      }}
    >
      {
        Platform.OS === 'ios' && (
          <NativeHeaderSide side="Left">
            <HeaderBackButton
              tintColor={runsIOS26 ? colors.text : colors.primary}
              onPress={() => router.back()}

              style={{
                marginLeft: runsIOS26 ? 3 : -32,
              }}
            />
          </NativeHeaderSide>
        )
      }

      <Stack gap={10}>
        <Stack padding={[10, 4]} radius={200} backgroundColor={colors.text + "16"}>
          <TypographyLegacy variant="body2">
            {news.category}
          </TypographyLegacy>
        </Stack>

        <TypographyLegacy variant="h3">
          {news.title}
        </TypographyLegacy>

        <Stack direction="horizontal" hAlign="center">
          <Stack direction="horizontal" gap={8} inline flex hAlign="center">
            <Avatar initials={getInitials(news.author)} size={28} />
            <TypographyLegacy nowrap variant="body2">
              {news.author}
            </TypographyLegacy>
          </Stack>

          <TypographyLegacy nowrap variant="body2" color="secondary">
            {new Date(news.createdAt).toLocaleDateString(undefined, {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </TypographyLegacy>
        </Stack>
      </Stack>

      {news.question && (
        <List scrollEnabled={false}>
          <List.Item>
            <List.Leading>
              <Icon>
                <Papicons name="pie" />
              </Icon>
            </List.Leading>
            <Typography variant="title">
              Cette actualité contient un sondage
            </Typography>
            <Typography variant="body1" color="textSecondary">
              PRONOTE ne nous permet pas d'afficher les sondages pour le moment.
            </Typography>
          </List.Item>
        </List>
      )}

      <HTMLView
        value={cleanedContent}
        stylesheet={stylesheet}
        style={{
          gap: 12
        }}
        paragraphBreak=""
        bullet="  •  "
      />

      {news.attachments.length > 0 && (
        <ListLegacy>
          {news.attachments.map((attachment, index) => (
            <Item key={index} onPress={() => Linking.openURL(attachment.url)}>
              <Leading>
                <Icon size={28}>
                  <Papicons name={getAttachmentIcon(attachment)} />
                </Icon>
              </Leading>
              <TypographyLegacy variant="title">
                {attachment.name}
              </TypographyLegacy>
              <TypographyLegacy variant="body1" nowrap color="secondary">
                {attachment.url}
              </TypographyLegacy>
            </Item>
          ))}
        </ListLegacy>
      )}

      <Stack gap={0} style={{ opacity: 0.4 }}>
        <TypographyLegacy variant="caption">
          Si cette actualité ne s'affiche pas correctement,
        </TypographyLegacy>
        <TypographyLegacy variant="caption" style={{
          textDecorationLine: 'underline'
        }} onPress={() => setHTMLCleanupEnabled(!HTMLCleanupEnabled)}>
          {HTMLCleanupEnabled ? "désactiver" : "activer"} le formattage automatique
        </TypographyLegacy>
      </Stack>
    </ScrollView >
  );
};

export default NewsModal;