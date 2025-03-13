import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, FlatList, ListRenderItem, View } from "react-native";
import { Screen } from "@/router/helpers/types";
import { updateNewsInCache } from "@/services/news";
import { useNewsStore } from "@/stores/news";
import { useCurrentAccount } from "@/stores/account";
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { RefreshControl } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import BetaIndicator from "@/components/News/Beta";
import NewsListItem from "./Atoms/Item";
import Reanimated, { FadeInUp, FadeOut, LinearTransition } from "react-native-reanimated";
import { useTheme } from "@react-navigation/native";
import { animPapillon } from "@/utils/ui/animations";
import { categorizeMessages } from "@/utils/magic/categorizeMessages";
import { protectScreenComponent } from "@/router/helpers/protected-screen";
import MissingItem from "@/components/Global/MissingItem";
import {Information} from "@/services/shared/Information";
import {AccountService} from "@/stores/account/types";
import {hasFeatureAccountSetup} from "@/utils/multiservice";
import {MultiServiceFeature} from "@/stores/multiService/types";
import PapillonHeader, { PapillonHeaderInsetHeight } from "@/components/Global/PapillonHeader";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";

type NewsItem = Omit<Information, "date"> & { date: string, important: boolean };

const NewsScreen: Screen<"News"> = ({ route, navigation }) => {
  const theme = useTheme();
  const account = useCurrentAccount((store) => store.account!);
  const hasServiceSetup = account.service === AccountService.PapillonMultiService ? hasFeatureAccountSetup(MultiServiceFeature.News, account.localID) : true;
  const informations = useNewsStore((store) => store.informations);

  const [isLoading, setIsLoading] = useState(false);
  const [importantMessages, setImportantMessages] = useState<NewsItem[]>([]);
  const [sortedMessages, setSortedMessages] = useState<NewsItem[]>([]);
  const [isED, setIsED] = useState(false);
  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    if (!isOnline && isLoading) {
      setIsLoading(false);
    }
  }, [isOnline, isLoading]);

  const fetchData = useCallback(async (hidden: boolean = false) => {
    if (!hidden) setIsLoading(true);
    await updateNewsInCache(account);
    setIsLoading(false);
  }, [account]);

  useEffect(() => {
    if (account.service === AccountService.EcoleDirecte) setIsED(true);
    if (sortedMessages.length === 0) {
      navigation.addListener("focus", () => fetchData(true));
      fetchData();
    }
  }, [account.instance]);

  useEffect(() => {
    if (informations) {
      if (account.personalization.MagicNews) {
        const { importantMessages, normalMessages } =
          categorizeMessages(informations);
        setImportantMessages(
          importantMessages.map((message) => ({
            ...message,
            date: message.date.toString(),
          }))
        );
        setSortedMessages(
          normalMessages
            .map((message) => ({
              ...message,
              date: message.date.toString(),
              important: false,
            }))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        );
      } else {
        setImportantMessages([]);
        setSortedMessages(
          informations
            .map((info) => ({
              ...info,
              date: info.date.toString(),
              title: info.title || "",
              important: false,
            }))
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        );
      }
    }
  }, [informations, account.personalization.MagicNews]);

  const renderItem: ListRenderItem<NewsItem> = useCallback(({ item, index }) => (
    <NewsListItem
      key={index}
      index={index}
      message={item}
      navigation={navigation}
      parentMessages={sortedMessages}
      isED={account.service == AccountService.EcoleDirecte}
    />
  ), [navigation, sortedMessages]);

  const NoNewsMessage = () => (
    <View
      style={{
        marginTop: 20,
      }}
    >
      <MissingItem
        emoji={"🥱"}
        title={"Aucune actualité disponible"}
        description={"Malheureusement, il n'y a aucune actualité à afficher pour le moment."}
      />
    </View>
  );

  const hasNews = importantMessages.length > 0 || sortedMessages.length > 0;

  return (
    <>
      <PapillonHeader route={route} navigation={navigation} />
      <Reanimated.ScrollView
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchData}
            progressViewOffset={100} />
        }
        scrollIndicatorInsets={{ top: 42 }}
      >
        <PapillonHeaderInsetHeight route={route} />

        {!isOnline && <OfflineWarning cache={true} />}

        {importantMessages.length > 0 && (
          <Reanimated.View
            entering={animPapillon(FadeInUp)}
            exiting={animPapillon(FadeOut)}
            layout={animPapillon(LinearTransition)}
          >
            <NativeListHeader
              label="Peut-être Important"
              animated
              leading={
                <Image
                  source={require("@/../assets/images/magic/icon_magic.png")}
                  style={styles.magicIcon}
                  resizeMode="contain"
                />
              }
              trailing={<BetaIndicator />}
            />

            <NativeList animated>
              <LinearGradient
                colors={!theme.dark ? [theme.colors.card, "#BFF6EF"] : [theme.colors.card, "#2C2C2C"]}
                start={[0, 0]}
                end={[2, 0]}
              >
                <FlatList
                  data={importantMessages}
                  renderItem={renderItem}
                  keyExtractor={(_, index) => `important-${index}`}
                  scrollEnabled={false}
                />
              </LinearGradient>
            </NativeList>
          </Reanimated.View>
        )}

        {sortedMessages.length > 0 && (
          <Reanimated.View
            entering={animPapillon(FadeInUp)}
            exiting={animPapillon(FadeOut)}
            layout={animPapillon(LinearTransition)}
          >
            <NativeList animated inline>
              <FlatList
                data={sortedMessages}
                renderItem={renderItem}
                keyExtractor={(_, index) => `sorted-${index}`}
                scrollEnabled={false}
                initialNumToRender={6}
              />
            </NativeList>
          </Reanimated.View>
        )}

        {hasServiceSetup ?
          !isLoading && !hasNews && <NoNewsMessage />
          :
          <MissingItem
            title="Aucun service connecté"
            description="Tu n'as pas encore paramétré de service pour cette fonctionnalité."
            emoji="🤷"
          />
        }
      </Reanimated.ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    padding: 16,
  },
  magicIcon: {
    width: 26,
    height: 26,
    marginRight: 4
  },
  noNewsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
});

export default protectScreenComponent(NewsScreen);
