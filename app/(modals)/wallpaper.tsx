import { useAccountStore } from "@/stores/account"
import { useSettingsStore } from "@/stores/settings"
import { Wallpaper } from "@/stores/settings/types"
import AnimatedPressable from "@/ui/components/AnimatedPressable"
import Stack from "@/ui/components/Stack"
import Typography from "@/ui/components/Typography"
import { useTheme } from "@react-navigation/native"
import React, { useState } from "react"
import { FlatList, Image, Platform, View } from "react-native"
import { File, Directory, Paths } from 'expo-file-system';
import ActivityIndicator from "@/components/ActivityIndicator"
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader"
import Icon from "@/ui/components/Icon"
import { Papicons } from "@getpapillon/papicons"
import { MenuView } from "@react-native-menu/menu"

import * as ImagePicker from 'expo-image-picker';

interface Collection {
  name: string;
  images: Wallpaper[];
}

const collections: Collection[] = [
  {
    name: "Par défaut",
    images: [
      {
        id: "picsum:23",
        url: "https://picsum.photos/id/23/367/267"
      },
      {
        id: "picsum:17",
        url: "https://picsum.photos/id/17/2500/1667"
      },
      {
        id: "picsum:16",
        url: "https://picsum.photos/id/16/367/267"
      },
      {
        id: "picsum:5",
        url: "https://picsum.photos/id/5/367/267"
      }
    ]
  }
]

const WallpaperModal = () => {
  const { colors } = useTheme()

  const [currentlyDownloading, setCurrentlyDownloading] = useState<string[]>([]);

  const settingsStore = useSettingsStore(state => state.personalization);
  const mutateProperty = useSettingsStore(state => state.mutateProperty);

  const currentWallpaper = settingsStore.wallpaper;
  const selectedId = currentWallpaper?.id;
  const hasCustomWallpaper = selectedId?.startsWith("custom:") ?? false;

  const wallpaperDirectory = new Directory(Paths.document, "wallpapers");

  const downloadAndSelect = (wallpaper: Wallpaper) => {
    const fileName = `${wallpaper.id}.jpg`;

    const wallpaperFile = new File(wallpaperDirectory, fileName);
    if (wallpaperFile.exists) {
      mutateProperty("personalization", {
        wallpaper: {
          id: wallpaper.id,
          url: wallpaperFile.uri
        }
      })
      return;
    }

    setCurrentlyDownloading((prev) => [...prev, wallpaper.id]);


    if (!wallpaperDirectory.exists) {
      wallpaperDirectory.create();
    }
    File.downloadFileAsync(wallpaper.url, wallpaperFile).then((result) => {
      const newUrl = result.uri;
      mutateProperty("personalization", {
        wallpaper: {
          id: wallpaper.id,
          url: newUrl
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

        const file = result.assets[0];

        const importedFile = new File(file);
        importedFile.copy(wallpaperDirectory);
        importedFile.rename(`custom:${Date.now()}.jpg`);

        mutateProperty("personalization", {
          wallpaper: {
            id: `custom:${Date.now()}`,
            url: importedFile.uri
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
        contentInsetAdjustmentBehavior="automatic"
        data={collections}
        style={{
          height: 300
        }}
        renderItem={({ item }) => (
          <View>
            <Stack direction="horizontal" alignItems="center" padding={[16, 10]}>
              <Typography variant="body2" color="secondary">{item.name}</Typography>
            </Stack>

            <FlatList
              data={item.images}
              horizontal
              style={{
                width: "100%",
                paddingHorizontal: 12
              }}
              contentContainerStyle={{
                gap: 6
              }}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <AnimatedPressable
                  onPress={() => downloadAndSelect(item)}
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
                      currentlyDownloading.includes(item.id) &&
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
                      source={{ uri: item.url }}
                      style={{ width: "100%", height: "100%", borderRadius: 12 }}
                    />
                  </View>
                </AnimatedPressable>
              )}
            />
          </View>
        )}
      />

      <NativeHeaderSide side="Left" key={currentWallpaper?.id + ":" + "upload:" + hasCustomWallpaper ? "true" : "false"}>
        <NativeHeaderPressable onPress={() => uploadCustomWallpaper()}>
          <Icon size={28} fill={hasCustomWallpaper ? colors.primary : undefined}>
            <Papicons name="Gallery" />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderSide side="Right" key={currentWallpaper?.id + ":" + wallpaperDirectory.exists}>
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

export default WallpaperModal
