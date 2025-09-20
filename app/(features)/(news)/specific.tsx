import { getManager } from "@/services/shared";
import { News } from "@/services/shared/news";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { useLocalSearchParams, useNavigation } from "expo-router"
import { useEffect, useState } from "react";
import { Linking, Platform, ScrollView, StyleSheet, View } from "react-native";
import { Attachment, News as SkolengoNews } from "skolengojs"
import * as Papicons from '@getpapillon/papicons';

import { VARIANTS } from "@/ui/components/Typography";

import HTMLView from 'react-native-htmlview';
import * as WebBrowser from 'expo-web-browser';
import { useTheme } from "@react-navigation/native";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import { MenuView } from "@react-native-menu/menu";
import Icon from "@/ui/components/Icon";
import { t } from "i18next";
import List from "@/ui/components/List";
import Item from "@/ui/components/Item";

export default function NewsPage() {
  const search = useLocalSearchParams();
  const news = JSON.parse(String(search.news)) as News

  const navigation = useNavigation()

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

  const styles = {
    "papillon": {
      background: colors.background,
      foreground: colors.text,
      html: StyleSheet.create({
        ...VARIANTS,
        p: {
          ...VARIANTS.body1,
        },
        div: {
          ...VARIANTS.body1,
        },
        a: {
          color: colors.primary,
          textDecorationLine: 'underline',
        },
      })
    },
    "reading": {
      background: "#ffe1a9ff",
      foreground: "#634000ff",
      html: StyleSheet.create({
        ...VARIANTS,
        p: {
          fontFamily: "serif_medium"
        },
        div: {
          fontFamily: "serif_medium"
        },
        h1: {
          fontFamily: "serif_bold"
        },
        a: {
          color: "#a26900ff",
          textDecorationLine: 'underline',
          fontFamily: "serif_medium"
        },
      })
    }
  };

  const [style, setStyle] = useState("papillon");

  useEffect(() => {
    navigation.setOptions({
      headerTitle: news.title ?? "News",
      headerTitleStyle: {
        color: styles[style].foreground,
        fontFamily: styles[style].html.p.fontFamily
      },
      headerLargeTitleStyle: {
        color: styles[style].foreground,
        fontFamily: styles[style].html.h1.fontFamily
      }
    })
  }, [styles, style])

  // Replace all color properties in currentHTMLStyle with foreground
  const foreground = styles[style].foreground;
  const currentHTMLStyle = (() => {
    const htmlStyle = { ...styles[style].html };
    Object.keys(htmlStyle).forEach(key => {
      htmlStyle[key] = { ...htmlStyle[key], color: foreground };
    });
    return htmlStyle;
  })();

  const themes = [
    {
      title: t("News_Theme_Papillon_Title"),
      description: t("News_Theme_Papillon_Description"),
      value: "papillon"
    },
    {
      title: t("News_Theme_Reading_Title"),
      description: t("News_Theme_Reading_Description"),
      value: "reading"
    }
  ]

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1, backgroundColor: styles[style].background }}
      >
        {news.attachments.length > 0 && (
          <View style={{ padding: 16, width: "100%" }}>
            <List>
              {news.attachments.map((attachment, i) => (
                <Item key={i}
                  onPress={() => {
                    WebBrowser.openBrowserAsync(
                      attachment.url,
                      {
                        controlsColor: colors.primary,
                        dismissButtonStyle: 'done'
                      }
                    )
                  }}
                >
                  <Icon papicon>
                    {attachment.type === 0 ? (
                      <Papicons.Link />
                    ) : (
                      <Papicons.Paper />
                    )}
                  </Icon>
                  <Typography nowrap variant="title">{attachment.name}</Typography>
                  <Typography nowrap variant="caption">{attachment.url}</Typography>
                </Item>
              ))}
            </List>
          </View>
        )}

        <HTMLView
          value={news.content}
          stylesheet={currentHTMLStyle}
          style={{
            padding: 16,
            paddingTop: 0
          }}
        />
      </ScrollView>

      <NativeHeaderSide side="Right">
        <MenuView
          actions={
            themes.map(theme => ({
              id: theme.value,
              title: theme.title,
              subtitle: theme.description,
              state: theme.value === style ? 'on' : 'off'
            }))
          }
          onPressAction={({ nativeEvent }) => {
            const selectedTheme = themes.find(theme => theme.value === nativeEvent.event);
            if (selectedTheme) {
              setStyle(selectedTheme.value);
            }
          }}
        >
          <NativeHeaderPressable>
            <Icon papicon>
              <Papicons.Palette />
            </Icon>
          </NativeHeaderPressable>
        </MenuView>
      </NativeHeaderSide>
    </>
  )
}