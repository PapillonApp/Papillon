import { useNews } from '@/database/useNews'
import { getManager, subscribeManagerUpdate } from '@/services/shared'
import Avatar from '@/ui/components/Avatar'
import { Dynamic } from '@/ui/components/Dynamic'
import Icon from '@/ui/components/Icon'
import Search from '@/ui/components/Search'
import Stack from '@/ui/components/Stack'
import TabHeader from '@/ui/components/TabHeader'
import TabHeaderTitle from '@/ui/components/TabHeaderTitle'
import { useKeyboardHeight } from '@/ui/hooks/useKeyboardHeight'
import List from '@/ui/new/List'
import Typography from '@/ui/new/Typography'
import { PapillonAppearIn, PapillonAppearOut } from '@/ui/utils/Transition'
import { getProfileColorByName } from '@/utils/chats/colors'
import { getInitials } from '@/utils/chats/initials'
import { warn } from '@/utils/logger/logger'
import { Papicons } from '@getpapillon/papicons'
import { useTheme } from '@react-navigation/native'
import { router, useRouter } from 'expo-router'
import { t } from 'i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View } from 'react-native'
import { useBottomTabBarHeight } from 'react-native-bottom-tabs'
import { RefreshControl } from 'react-native-gesture-handler'
import Reanimated, { LayoutAnimationConfig, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const NewsView = () => {
  const theme = useTheme()
  const colors = theme.colors
  const insets = useSafeAreaInsets()

  const [headerHeight, setHeaderHeight] = useState(0)
  const bottomTabBarHeight = useBottomTabBarHeight()

  const [isLoading, setIsLoading] = useState(false)
  const [isManuallyLoading, setIsManuallyLoading] = useState(false)

  const keyboardHeight = useKeyboardHeight()

  const footerStyle = useAnimatedStyle(() => ({
    height: keyboardHeight.value - bottomTabBarHeight,
  }))

  const news = useNews()

  const sortedNews = useMemo(() => {
    return news.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }, [news])

  const fetchNews = useCallback(() => {
    try {
      setIsLoading(true)
      const manager = getManager()
      if (!manager) {
        warn('Manager is null, skipping news fetch')
        return
      }
      manager.getNews()
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
      setIsManuallyLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeManagerUpdate(() => {
      fetchNews()
    })

    return () => unsubscribe()
  }, [])

  const [searchText, setSearchText] = useState('')

  const filteredNews = useMemo(() => {
    return sortedNews.filter((item) => item.title.toLowerCase().includes(searchText.toLowerCase()))
  }, [sortedNews, searchText])

  return (
    <>
      <TabHeader
        onHeightChanged={setHeaderHeight}
        title={
          <TabHeaderTitle
            color={colors.primary}
            leading={t('Tab_News')}
            chevron={false}
            loading={isLoading}
          />
        }
        bottom={<Search placeholder={t('News_Search_Placeholder')} color='#2B7ED6' onTextChange={(text) => setSearchText(text)} />}
      />

      <LayoutAnimationConfig skipEntering>
        <List
          contentContainerStyle={{
            paddingBottom: Platform.OS === "android" ? 16 : bottomTabBarHeight + 16,
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
          ListFooterComponent={<Reanimated.View style={footerStyle} />}
          scrollIndicatorInsets={{ top: headerHeight - insets.top }}
          ListHeaderComponent={<View style={{ height: headerHeight }} />}
          ListEmptyComponent={
            <Dynamic animated key='empty-list:warn' entering={PapillonAppearIn} exiting={PapillonAppearOut}>
              <Stack
                hAlign='center'
                vAlign='center'
                flex
                style={{ width: '100%', marginTop: 16 }}
              >
                <Icon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
                  <Papicons name={searchText ? 'Search' : 'Newspaper'} />
                </Icon>
                <Typography variant='h4' color='textPrimary' align='center'>
                  {searchText ? t('News_Search_NoResults') : t('News_Empty_Title')}
                </Typography>
                <Typography variant='body2' color='textSecondary' align='center'>
                  {searchText ? t('News_Search_NoResults_Description') : t('News_Empty_Description')}
                </Typography>
              </Stack>
            </Dynamic>
          }
        >
          {filteredNews.map((item) => {
            const profileColor = getProfileColorByName(item.author)
            const profileInitials = getInitials(item.author)

            return (
              <List.Item
                key={item.id}
                id={item.id}
                onPress={() =>
                  router.push({
                    pathname: '/(modals)/news',
                    params: { news: JSON.stringify(item) },
                  })
                }
              >
                <List.Leading>
                  <Avatar
                    size={40}
                    color={profileColor}
                    initials={profileInitials}
                  />
                </List.Leading>

                <Typography variant='title' numberOfLines={2}>
                  {item.title}
                </Typography>
                <Typography variant='body1' color='textSecondary' numberOfLines={3}>
                  {item.content ? truncateString(cleanContent(item.content), 100) : ''}
                </Typography>

                <Stack
                  direction='horizontal'
                  gap={4}
                  style={{ marginTop: 4 }}
                  hAlign='center'
                >
                  <Typography nowrap weight='medium' style={{ flex: 1 }} variant='caption' color='textSecondary'>
                    {item.author}
                  </Typography>

                  <Typography nowrap weight='medium' variant='caption' color='textSecondary'>
                    {item.createdAt.toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                </Stack>

                {item.attachments.length > 0 && (
                  <List.Trailing>
                    <Icon size={18} opacity={0.4}>
                      <Papicons name='link' />
                    </Icon>
                  </List.Trailing>
                )}
              </List.Item>
            )
          })}
        </List>
      </LayoutAnimationConfig>
    </>
  )
}

function cleanContent(html: string): string {
  html = html.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  html = html.replace(/\n/g, ' ')
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str
  }
  return str.slice(0, maxLength) + '...'
}

export default NewsView
