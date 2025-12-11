import { useNews } from '@/database/useNews'
import { getManager, subscribeManagerUpdate } from '@/services/shared'
import Item, { Leading } from '@/ui/components/Item'
import List from '@/ui/components/List'
import Search from '@/ui/components/Search'
import TabHeader from '@/ui/components/TabHeader'
import TabHeaderTitle from '@/ui/components/TabHeaderTitle'
import TableFlatList from '@/ui/components/TableFlatList'
import Typography from '@/ui/components/Typography'
import { warn } from '@/utils/logger/logger'
import { LegendList } from '@legendapp/list'
import { useTheme } from '@react-navigation/native'
import { t } from 'i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, FlatList, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Reanimated, { LayoutAnimationConfig, LinearTransition, useAnimatedStyle } from 'react-native-reanimated'
import { Dynamic } from '@/ui/components/Dynamic'
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition'
import { useKeyboardHeight } from '@/ui/hooks/useKeyboardHeight'
import { useBottomTabBarHeight } from 'react-native-bottom-tabs'
import Stack from '@/ui/components/Stack'
import Avatar from '@/ui/components/Avatar'
import { getInitials } from '@/utils/chats/initials'
import { getProfileColorByName } from '@/utils/chats/colors'
import { useRouter } from 'expo-router'
import AnimatedPressable from '@/ui/components/AnimatedPressable'
import News from '@/database/models/News'
import { Papicons } from '@getpapillon/papicons'
import Icon from '@/ui/components/Icon'
import { RefreshControl } from 'react-native-gesture-handler'
import { FlashList } from '@shopify/flash-list'

const NewsView = () => {
  const theme = useTheme()
  const colors = theme.colors
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const [headerHeight, setHeaderHeight] = useState(0)
  const bottomTabBarHeight = useBottomTabBarHeight();

  const [isLoading, setIsLoading] = useState(false)
  const [isManuallyLoading, setIsManuallyLoading] = useState(false)

  const keyboardHeight = useKeyboardHeight();

  const footerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value - bottomTabBarHeight,
  }));

  const news = useNews();

  const sortedNews = useMemo(() => {
    return news.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [news]);

  const fetchNews = useCallback(() => {
    try {
      setIsLoading(true)
      const manager = getManager();
      if (!manager) {
        warn("Manager is null, skipping news fetch");
        return;
      }
      manager.getNews();
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false)
      setIsManuallyLoading(false)
    }
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate((_) => {
      fetchNews();
    });

    return () => unsubscribe();
  }, []);

  const [searchText, setSearchText] = useState('');

  const filteredNews = useMemo(() => {
    return sortedNews.filter((news) => news.title.toLowerCase().includes(searchText.toLowerCase()));
  }, [sortedNews, searchText]);

  return (
    <>
      <TabHeader
        onHeightChanged={setHeaderHeight}
        title={
          <TabHeaderTitle
            color={colors.primary}
            leading={t("Tab_News")}
            chevron={false}
            loading={isLoading}
          />
        }
        bottom={<Search placeholder={t('News_Search_Placeholder')} color='#2B7ED6' onTextChange={(text) => setSearchText(text)} />}
      />

      <LayoutAnimationConfig skipEntering>
        <FlatList
          contentContainerStyle={{
            paddingBottom: insets.bottom + bottomTabBarHeight,
            paddingHorizontal: 16,
            gap: 9,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isManuallyLoading}
              onRefresh={() => {
                setIsManuallyLoading(true)
                fetchNews()
              }}
              progressViewOffset={headerHeight}
            />
          }
          data={filteredNews}
          keyExtractor={(item: any) => item.id}
          ListFooterComponent={<Reanimated.View style={footerStyle} />}
          renderItem={({ item }) => <NewsItem item={item} />}
          scrollIndicatorInsets={{ top: headerHeight - insets.top }}
          ListHeaderComponent={<View style={{ height: headerHeight }} />}
          ListEmptyComponent={
            <Dynamic animated key={'empty-list:warn'} entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <Stack
                hAlign="center"
                vAlign="center"
                flex
                style={{ width: "100%", marginTop: 16 }}
              >
                <Icon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
                  <Papicons name={searchText ? "Search" : "Newspaper"} />
                </Icon>
                <Typography variant="h4" color="text" align="center">
                  {searchText ? t('News_Search_NoResults') : t('News_Empty_Title')}
                </Typography>
                <Typography variant="body2" color="secondary" align="center">
                  {searchText ? t('News_Search_NoResults_Description') : t('News_Empty_Description')}
                </Typography>
              </Stack>
            </Dynamic>
          }
        />
      </LayoutAnimationConfig>
    </>
  )
}

const NewsItem = ({ item }: { item: News }) => {
  const router = useRouter()

  const profileColor = useMemo(() => getProfileColorByName(item.author), [item.author]);
  const profileInitials = useMemo(() => getInitials(item.author), [item.author]);

  return (
    <AnimatedPressable
      onPress={() => router.push({
        pathname: "/(modals)/news",
        params: { news: JSON.stringify(item) },
      })}
    >
      <Stack card>
        <Item isLast>
          <Leading>
            <Avatar
              size={40}
              color={profileColor}
              initials={profileInitials}
            />
          </Leading>

          <Typography variant='title' numberOfLines={2}>
            {item.title}
          </Typography>
          <Typography variant='body1' color='secondary' numberOfLines={3}>
            {item.content ? truncateString(cleanContent(item.content), 100) : ""}
          </Typography>


          <Stack
            direction='horizontal'
            gap={4}
            style={{ marginTop: 4 }}
            hAlign='center'
          >
            <Typography nowrap weight='medium' style={{ flex: 1 }} variant='caption' color='secondary'>
              {item.author}
            </Typography>

            <Typography nowrap weight='medium' variant='caption' color='secondary'>
              {item.createdAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Typography>

            {item.attachments.length > 0 && (
              <Icon size={18} opacity={0.4}>
                <Papicons name={"link"} />
              </Icon>
            )}
          </Stack>
        </Item>
      </Stack>
    </AnimatedPressable>
  )
}

function cleanContent(html: string): string {
  html = html.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  html = html.replace(/\n/g, " ");
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + "...";
}

export default NewsView