import { useAccountStore } from "@/stores/account"
import { useSettingsStore } from "@/stores/settings"
import { Wallpaper } from "@/stores/settings/types"
import AnimatedPressable from "@/ui/components/AnimatedPressable"
import Stack from "@/ui/components/Stack"
import Typography from "@/ui/components/Typography"
import { useTheme } from "@react-navigation/native"
import React, { useEffect, useState } from "react"
import { FlatList, Image, Platform, RefreshControl, View } from "react-native"
import { File, Directory, Paths } from 'expo-file-system';
import ActivityIndicator from "@/components/ActivityIndicator"
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader"
import Icon from "@/ui/components/Icon"
import { router } from "expo-router";
import { Papicons } from "@getpapillon/papicons"
import { MenuView } from "@react-native-menu/menu"

import * as ImagePicker from 'expo-image-picker';

const COLLECTIONS_SOURCE = "https://raw.githubusercontent.com/PapillonApp/datasets/refs/heads/main/wallpapers/index.json";

interface Collection {
  name: string;
  icon?: string;
  link?: string;
  images: Wallpaper[];
}

const WallpaperModal = () => {
  const { colors } = useTheme()

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch(COLLECTIONS_SOURCE);
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      setError(error as string);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCollections();
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
          flatListRef.current?.scrollToIndex({ index: collectionIndex, animated: true });
        }, 500);
      }
    }
  }, [collections, currentWallpaper]);

  const wallpaperDirectory = new Directory(Paths.document, "wallpapers");

  const downloadAndSelect = (wallpaper: Wallpaper) => {
    const fileName = `${wallpaper.id}.jpg`;

    const wallpaperFile = new File(wallpaperDirectory, fileName);
    if (wallpaperFile.exists) {
      mutateProperty("personalization", {
        wallpaper: {
          id: wallpaper.id,
          path: {
            directory: wallpaperDirectory.name,
            name: wallpaperFile.name
          }
        }
      })
      return;
    }

    setCurrentlyDownloading((prev) => [...prev, wallpaper.id]);

    if (!wallpaperDirectory.exists) {
      wallpaperDirectory.create();
    }
    File.downloadFileAsync(wallpaper.url!, wallpaperFile).then((result) => {
      mutateProperty("personalization", {
        wallpaper: {
          id: wallpaper.id,
          path: {
            directory: wallpaperDirectory.name,
            name: result.name
          }
        }
      })
    }).finally(() => {
      setCurrentlyDownloading((prev) => prev.filter((id) => id !== wallpaper.id));
    })
  }

  const uploadCustomWallpaper = () => {
    try {
      ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      }).then((result) => {
        if (result.canceled) return;

        const asset = result.assets[0];
        const sourceFile = new File(asset.uri);

        if (!wallpaperDirectory.exists) {
          wallpaperDirectory.create();
        }

        const newFileName = `custom:${Date.now()}.jpg`;
        const destFile = new File(wallpaperDirectory, newFileName);

        sourceFile.copy(destFile);

        mutateProperty("personalization", {
          wallpaper: {
            id: `custom:${Date.now()}`,
            path: {
              directory: wallpaperDirectory.name,
              name: destFile.name
            }
          }
        })
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
          paddingTop: Platform.OS === 'android' ? 20 : 72
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
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchCollections}
            progressViewOffset={72}
          />
        }
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

      <NativeHeaderSide side="Right" key={currentWallpaper?.id + ":" + wallpaperDirectory.exists}>
        {Platform.OS === 'android' && (
          <NativeHeaderPressable onPress={() => uploadCustomWallpaper()}>
            <Icon size={28} fill={hasCustomWallpaper ? colors.primary : undefined}>
              <Papicons name="Gallery" />
            </Icon>
          </NativeHeaderPressable>
        )}
        <MenuView
          actions={[
            {
              id: "background:clear",
              title: "Supprimer le fond d'écran personnalisé",
              imageColor: "#FF0000",
              image: Platform.select({
                ios: "trash.fill"
              }),
              attributes: { "destructive": true, "disabled": !currentWallpaper }
            },
            {
              id: "background:downloads",
              title: "Téléchargements",
              imageColor: colors.text,
              image: Platform.select({
                ios: "square.and.arrow.down"
              }),
              displayInline: false,
              subactions: [
                {
                  title: "Taille des téléchargements",
                  subtitle: (wallpaperDirectory.info().size / (1024 * 1024)).toFixed(2) + " MB"
                },
                {
                  id: "downloads:clear",
                  title: "Vider les téléchargements",
                  imageColor: "#FF0000",
                  image: Platform.select({
                    ios: "trash.fill"
                  }),
                  attributes: { "destructive": true, "disabled": !wallpaperDirectory.exists }
                }
              ]
            },
          ]}
          onPressAction={({ nativeEvent }) => {
            const action = nativeEvent.event;
            if (action === "downloads:clear") {
              wallpaperDirectory.delete();
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
        </MenuView>
      </NativeHeaderSide>
    </>
  )
}

const WallpaperImage = ({ item, onPress, selectedId, isDownloading }: { item: WallpaperCollection, onPress: () => void, selectedId: string, isDownloading: boolean }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { colors } = useTheme();

  return (

    <AnimatedPressable
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
    </AnimatedPressable>
  );
};

export default WallpaperModal
