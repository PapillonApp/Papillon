import { TipIds } from "@/constants/Tips"
import { useAccountStore } from "@/stores/account"
import { retireTip } from "@/stores/tips"
import { useSettingsStore } from "@/stores/settings"
import { Wallpaper } from "@/stores/settings/types"
import AnimatedPressable from "@/ui/components/AnimatedPressable"
import Stack from "@/ui/components/Stack"
import Typography from "@/ui/components/Typography"
import { useHeaderHeight, useTheme } from "expo-router/react-navigation"
import React, { useEffect, useState } from "react"
import { FlatList, Image, Platform, Pressable, RefreshControl, View } from "react-native"
import ActivityIndicator from "@/components/ActivityIndicator"
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader"
import Icon from "@/ui/components/Icon"
import { router } from "expo-router";
import { Papicons } from "@getpapillon/papicons"
import { t } from "i18next";

import * as ImagePicker from 'expo-image-picker';
import ActionMenu from "@/ui/components/ActionMenu"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  clearWallpaperStorage,
  downloadWallpaper,
  getWallpaperStorageSize,
  hasWallpaperStorage,
  saveCustomWallpaper,
} from "@/utils/wallpaperStorage";

const COLLECTIONS_SOURCE = "https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/wallpapers/index.json";

interface Collection {
  name: string;
  icon?: string;
  link?: string;
  images: Wallpaper[];
}

const WallpaperModal = () => {
  const { colors } = useTheme()
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await fetch(COLLECTIONS_SOURCE);
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      setError(error as string);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchCollections();
  }, []);

  // Getting here is the whole point of the home tip pointing at the palette
  // button, however the user got here. Retire it rather than leave it waiting
  // to be closed by hand.
  useEffect(() => {
    retireTip(TipIds.homeWallpaper);
  }, []);



  const [currentlyDownloading, setCurrentlyDownloading] = useState<string[]>([]);

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const currentWallpaper = settingsStore.wallpaper;
  const selectedId = currentWallpaper?.id;
  const hasCustomWallpaper = selectedId?.startsWith("custom:") ?? false;

  const flatListRef = React.useRef<FlatList>(null);

  useEffect(() => {
    if (collections.length > 0 && currentWallpaper) {
      const collectionIndex = collections.findIndex((collection) => collection.images.find((image) => image.id === currentWallpaper.id));
      if (collectionIndex !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: collectionIndex,
            animated: true,
            viewOffset: Platform.OS === "ios" ? headerHeight : 0,
          });
        }, 10);
      }
    }
  }, [collections, currentWallpaper, headerHeight]);

  const wallpaperDirectoryExists = hasWallpaperStorage();

  const downloadAndSelect = async (wallpaper: Wallpaper) => {
    setCurrentlyDownloading((prev) => [...prev, wallpaper.id]);
    try {
      const savedWallpaper = await downloadWallpaper(wallpaper);
      mutateProperty("personalization", { wallpaper: savedWallpaper });
    } catch (downloadError) {
      setError(String(downloadError));
    } finally {
      setCurrentlyDownloading((prev) => prev.filter((id) => id !== wallpaper.id));
    }
  }

  const uploadCustomWallpaper = () => {
    try {
      ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: Platform.OS === "web",
      }).then((result) => {
        if (result.canceled) return;

        const asset = result.assets[0];
        void saveCustomWallpaper(asset).then(wallpaper => {
          mutateProperty("personalization", { wallpaper });
        }).catch((uploadError) => setError(String(uploadError)));
      })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={collections}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          gap: 16,
          paddingTop: Platform.OS === 'android' ? 20 : 0,
          paddingBottom: insets.bottom
        }}
        renderItem={({ item, index }) => (
          <View>
            <Stack direction="horizontal" alignItems="center" gap={8} padding={[16, 10]}>
              {item.icon &&
                <Image
                  source={{ uri: item.icon }}
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6
                  }}
                />
              }

              <Typography style={{ flex: 1 }} variant="body1" color="text">{item.name}</Typography>

              {item.images.find((image) => image.id === currentWallpaper?.id) && item.images.find((image) => image.id === currentWallpaper?.id)?.credit &&
                <Typography variant="caption" color="secondary">{item.images.find((image) => image.id === currentWallpaper?.id)?.credit}</Typography>
              }
            </Stack>

            <FlatList
              data={item.images}
              horizontal
              style={{
                width: "100%",
                paddingHorizontal: 12
              }}
              contentContainerStyle={{
                gap: 6,
                paddingRight: 12
              }}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <WallpaperImage item={item} onPress={() => downloadAndSelect(item)} selectedId={currentWallpaper?.id} isDownloading={currentlyDownloading.includes(item.id)} />}
              getItemLayout={(data, index) => (
                { length: 160 + 6, offset: (160 + 6) * index, index }
              )}
              initialScrollIndex={item.images.findIndex((image) => image.id === currentWallpaper?.id) !== -1 ? item.images.findIndex((image) => image.id === currentWallpaper?.id) : undefined}
            />
          </View>
        )}
        contentInsetAdjustmentBehavior="automatic"
      />

      <NativeHeaderSide side="Left" key={currentWallpaper?.id + ":" + "upload:" + (hasCustomWallpaper ? "true" : "false")}>
        {Platform.OS === 'android' ? (
          <NativeHeaderPressable onPress={() => router.back()}>
            <Icon size={28}>
              <Papicons name="Cross" />
            </Icon>
          </NativeHeaderPressable>
        ) : (
          <NativeHeaderPressable onPress={() => uploadCustomWallpaper()}>
            <Icon size={28} fill={hasCustomWallpaper ? colors.primary : undefined}>
              <Papicons name="Gallery" />
            </Icon>
          </NativeHeaderPressable>
        )}
      </NativeHeaderSide>

      <NativeHeaderSide side="Right" key={currentWallpaper?.id + ":" + wallpaperDirectoryExists}>
        {Platform.OS === 'android' && (
          <NativeHeaderPressable onPress={() => uploadCustomWallpaper()}>
            <Icon size={28} fill={hasCustomWallpaper ? colors.primary : undefined}>
              <Papicons name="Gallery" />
            </Icon>
          </NativeHeaderPressable>
        )}
        <ActionMenu
          actions={[
            {
              id: "background:clear",
              title: t("Modal_Wallpaper_Clear"),
              imageColor: "#FF0000",
              image: Platform.select({
                ios: "trash.fill"
              }),
              attributes: { "destructive": true, "disabled": !currentWallpaper }
            },
            {
              id: "background:downloads",
              title: t("Modal_Wallpaper_Downloads"),
              imageColor: colors.text,
              image: Platform.select({
                ios: "square.and.arrow.down"
              }),
              displayInline: false,
              subactions: [
                {
                  title: t("Modal_Wallpaper_Downloads_Size"),
                  subtitle: (getWallpaperStorageSize() / (1024 * 1024)).toFixed(2) + " MB"
                },
                {
                  id: "downloads:clear",
                  title: t("Modal_Wallpaper_ClearDownloads"),
                  imageColor: "#FF0000",
                  image: Platform.select({
                    ios: "trash.fill"
                  }),
                  attributes: { "destructive": true, "disabled": !wallpaperDirectoryExists }
                }
              ]
            },
          ]}
          placement="below"
          onPressAction={({ nativeEvent }) => {
            const action = nativeEvent.event;
            if (action === "downloads:clear") {
              clearWallpaperStorage();
              mutateProperty("personalization", {
                wallpaper: undefined
              })
            }
            if (action === "background:clear") {
              mutateProperty("personalization", {
                wallpaper: undefined
              })
            }
          }}
        >
          <NativeHeaderPressable>
            <Icon size={28}>
              <Papicons name="Gears" />
            </Icon>
          </NativeHeaderPressable>
        </ActionMenu>
      </NativeHeaderSide>
    </>
  )
}

const WallpaperImage = ({ item, onPress, selectedId, isDownloading }: { item: Wallpaper, onPress: () => void, selectedId?: string, isDownloading: boolean }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { colors } = useTheme();

  return (

    <Pressable
      onPress={onPress}
    >
      <View
        style={{
          width: 160,
          height: 100,
          padding: 2,
          borderRadius: 16,
          borderCurve: "continuous",
          borderWidth: selectedId === item.id ? 2 : 0,
          borderColor: selectedId === item.id ? colors.primary : "transparent"
        }}
        key={item.id}
      >
        {
          (!imageLoaded || isDownloading) &&
          <View
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: "100%",
              height: "100%",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1,
              borderRadius: 12,
              backgroundColor: "rgba(0, 0, 0, 0.5)"
            }}
          >
            <ActivityIndicator color="#ffffff" />
          </View>
        }

        <Image
          source={{ uri: item.thumbnail || item.url }}
          style={{ width: "100%", height: "100%", borderRadius: 12 }}
          onLoad={() => setImageLoaded(true)}
        />
      </View>
    </Pressable>
  );
};

export default WallpaperModal
