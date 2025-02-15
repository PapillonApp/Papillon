import { useTheme } from "@react-navigation/native";
import { Newspaper, Clock8, Paperclip } from "lucide-react-native";
import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import { Text, View } from "react-native";
import {NativeText} from "@/components/Global/NativeComponents";
import { WidgetProps } from "@/components/Home/Widget";
import { useCurrentAccount } from "@/stores/account";
import {useNewsStore} from "@/stores/news";
import {updateNewsInCache} from "@/services/news";
import formatDate from "@/utils/format/format_date_complets";
import {error as log_error} from "@/utils/logger/logger";
import parse_news_resume from "@/utils/format/format_pronote_news";

const LastNewsWidget = forwardRef(({
  setLoading,
  setHidden,
  loading,
}: WidgetProps, ref) => {
  const theme = useTheme();
  const { colors } = theme;

  const account = useCurrentAccount((store) => store.account);
  const news = useNewsStore((store) => store.informations);

  useImperativeHandle(ref, () => ({
    handlePress: () => {
      if (account?.personalization.widgets?.deleteAfterRead) {
        setTimeout(() => setHidden(true), 3000);
      }
      return "News";
    }
  }));

  const lastNews = useMemo(() => {
    return news.length > 0 ? news.sort((a, b) => a.date > b.date ? -1 : 0)[0] : undefined;
  }, [news]);

  useEffect(() => {
    const fetchNews = async () => {
      if (!account?.instance) return;
      setLoading(true);
      try {
        await updateNewsInCache(account);
      } catch (error) {
        log_error(`Erreur lors de la mise à jour des actualités : ${error}`, "Widget:LastNews");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [account, setLoading]);


  useEffect(() => {
    const maxEventAge = account?.personalization.widgets?.maxEventAge || 5;
    let lastNewsDate = 0;
    if (lastNews?.date.getTime) {
      lastNewsDate = lastNews.date.getTime();
    }
    const eventAge = Math.round((new Date().getTime() - lastNewsDate) / (24 * 60 * 60 * 1000));
    const shouldHide = !lastNews || !account?.personalization.widgets?.lastNews || eventAge > maxEventAge;
    setHidden(shouldHide);
  }, [lastNews, setHidden]);

  return (
    <>
      <View
        style={{
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "row",
          width: "100%",
          gap: 7,
          opacity: 0.5,
        }}
      >
        <Newspaper size={20} color={colors.text} />
        <Text
          style={{
            color: colors.text,
            fontFamily: "semibold",
            fontSize: 16,
          }}
        >
          Actualité
        </Text>
      </View>

      <View
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          marginTop: "auto",
          gap: 0
        }}>
        <View
          style={{
            display: "flex",
            width: "100%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 0
          }}
        >
          <NativeText
            variant="title"
            style={{
              width: lastNews?.read ? "100%" : "90%",
            }}
            numberOfLines={1}
          >
            {lastNews?.title}
          </NativeText>
          {!lastNews?.read && <View style={{
            width: 8,
            height: 8,
            borderRadius: 5,
            backgroundColor: theme.colors.primary,
          }}/>}
        </View>
        <NativeText
          variant="subtitle"
          style={{
            width: "100%",
          }}
          numberOfLines={2}
        >
          {!lastNews?.content.includes("<img")
            ? parse_news_resume(lastNews?.content ?? "")
            : "Contient une image"}
        </NativeText>
      </View>

      <View
        style={{
          marginTop: "auto",
          display: "flex",
          width: "100%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        }}>

        <View
          style={{
            display: "flex",
            width: "50%",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5
          }}
        >
          <Clock8 opacity={0.7} size={17} color={colors.text}/>
          <NativeText
            numberOfLines={1}
            variant="subtitle"
          >
            {formatDate(lastNews?.date.toString() || "")}
          </NativeText>
        </View>
        {(lastNews?.attachments.length || 0) > 0 && <View
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5
          }}
        >
          <NativeText
            numberOfLines={1}
            variant="subtitle"
          >
            {lastNews?.attachments.length}
          </NativeText>
          <Paperclip opacity={0.7} size={17} color={colors.text}/>
        </View>}
      </View>
    </>
  );
});

export default LastNewsWidget;
