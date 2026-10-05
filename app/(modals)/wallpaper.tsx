import { TipIds } from "@/constants/Tips"
import { useAccountStore } from "@/stores/account"
import { retireTip } from "@/stores/tips"
import { useSettingsStore } from "@/stores/settings"
import { Wallpaper } from "@/stores/settings/types"
import AnimatedPressable from "@/ui/components/AnimatedPressable"
import Stack from "@/ui/components/Stack"
import { Stack as ExpoStack } from 'expo-router';
import Typography from "@/ui/components/Typography"
import { useHeaderHeight, useTheme } from "expo-router/react-navigation"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { Dimensions, FlatList, Image, Platform, Pressable, RefreshControl, View } from "react-native"
import { File, Directory, Paths } from 'expo-file-system';
import ActivityIndicator from "@/components/ActivityIndicator"
import { router } from "expo-router";
import { AndroidHeaderButton, AndroidHeaderMenu } from "@/components/AndroidHeaderItems"
import { Dices, EllipsisVertical, Image as ImageIcon, RefreshCw, X } from "lucide-react-native"
import { t } from "i18next";

import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from "react-native-safe-area-context"
import NativeSegmentedControl from "@/ui/native/NativeSegmentedControl"
import { generateMeshGradient } from "@/utils/generative"
import { applyGradientWallpaper, setAccountWallpaper, useAccountWallpaper, Gradient, GRADIENT_HEIGHT, GRADIENT_PALETTE, GRADIENT_WIDTH, isGradient, randomGradient, randomSeed } from "@/utils/gradientWallpaper"

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

  const mutateProperty = useSettingsStore(state => state.mutateProperty);
  const accountWallpaper = useAccountWallpaper();

  const currentWallpaper = accountWallpaper.wallpaper;
  const selectedId = currentWallpaper?.id;
  const hasCustomWallpaper = selectedId?.startsWith("custom:") ?? false;

  const flatListRef = React.useRef<FlatList>(null);

  const [tab, setTab] = useState<"gradient" | "images">(currentWallpaper && !isGradient(currentWallpaper) ? "images" : "gradient");
  const [listHeight, setListHeight] = useState(0);
  // Automatic insets break when toggling scrolling between tabs: clear the transparent iOS header ourselves
  const listTopPadding = Platform.OS === "ios" ? headerHeight : 20;

  // Bring the selected collection into view when the list appears, not on every selection:
  // a tapped row is already visible, and the first row never needs scrolling
  useEffect(() => {
    if (tab === "images" && collections.length > 0 && currentWallpaper) {
      const collectionIndex = collections.findIndex((collection) => collection.images.find((image) => image.id === currentWallpaper.id));
      if (collectionIndex > 0) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: collectionIndex,
            animated: true,
            viewOffset: Platform.OS === "ios" ? headerHeight : 0,
          });
        }, 10);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, collections]);

  const wallpaperDirectory = new Directory(Paths.document, "wallpapers");

  const downloadAndSelect = (wallpaper: Wallpaper) => {
    const fileName = `${wallpaper.id}.jpg`;

    const wallpaperFile = new File(wallpaperDirectory, fileName);
    if (wallpaperFile.exists) {
      setAccountWallpaper({
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
      setAccountWallpaper({
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

        setAccountWallpaper({
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

  const [gradient, setGradient] = useState<Gradient>(() => accountWallpaper.wallpaperGradient ?? randomGradient());
  const applyTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pendingGradient = useRef<Gradient | null>(null);

  const flushGradient = () => {
    clearTimeout(applyTimeout.current);
    if (pendingGradient.current) applyGradientWallpaper(pendingGradient.current);
    pendingGradient.current = null;
  };

  // Closing the modal mid-debounce must still apply what the preview shows
  useEffect(() => () => flushGradient(), []);

  const updateGradient = (next: Gradient) => {
    setGradient(next);
    // Home renders gradients from these params: update them now, the PNG on disk can follow
    setAccountWallpaper({ wallpaperGradient: next });
    pendingGradient.current = next;
    clearTimeout(applyTimeout.current);
    applyTimeout.current = setTimeout(flushGradient, 250);
  };

  const randomizeGradient = () => updateGradient(randomGradient());

  const shuffleGradient = () => updateGradient({ ...gradient, seed: randomSeed() });

  const changeTab = (next: "gradient" | "images") => {
    setTab(next);
    if (next === "gradient" && !isGradient(currentWallpaper)) {
      applyGradientWallpaper(gradient);
    }
    if (next === "images" && isGradient(currentWallpaper)) {
      clearTimeout(applyTimeout.current);
      pendingGradient.current = null;
      if (accountWallpaper.lastImageWallpaper) {
        setAccountWallpaper({ wallpaper: accountWallpaper.lastImageWallpaper });
        const gradientFile = currentWallpaper?.path?.name && new File(wallpaperDirectory, currentWallpaper.path.name);
        if (gradientFile && gradientFile.exists) gradientFile.delete();
      }
    }
  };

  const downloadsSize = (wallpaperDirectory.info().size / (1024 * 1024)).toFixed(2) + " MB";

  const clearWallpaper = () => {
    setAccountWallpaper({ wallpaper: undefined })
  };

  const clearDownloads = () => {
    wallpaperDirectory.delete();
    // Downloads are shared by every account: drop all references to them
    mutateProperty("personalization", {
      wallpaper: undefined,
      lastImageWallpaper: undefined,
      wallpapersByAccount: {}
    })
  };

  return (
    <>
      <ExpoStack.Title asChild>
        <View style={{ width: Dimensions.get("window").width - (Platform.OS === "android" ? 200 : 140) }}>
          <NativeSegmentedControl
            options={[t("Modal_Wallpaper_Tab_Gradient"), t("Modal_Wallpaper_Tab_Images")]}
            selectedIndex={tab === "gradient" ? 0 : 1}
            onChange={(index) => changeTab(index === 0 ? "gradient" : "images")}
          />
        </View>
      </ExpoStack.Title>

      <FlatList
        ref={flatListRef}
        data={tab === "images" ? collections : []}
        onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
        // The gradient editor fills the visible sheet (the preview stretches), so there's nothing to scroll
        scrollEnabled={tab === "images"}
        ListHeaderComponent={tab === "gradient" ? (
          <View
            style={{
              paddingHorizontal: 16,
              height: listHeight > 0 ? listHeight - listTopPadding - insets.bottom : undefined,
            }}
          >
            <GradientEditor value={gradient} onChange={updateGradient} />
          </View>
        ) : null}
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          gap: 16,
          paddingTop: listTopPadding,
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
        contentInsetAdjustmentBehavior="never"
      />

      {Platform.OS === "android" ? (
        <>
          <ExpoStack.Toolbar placement="left" asChild>
            <AndroidHeaderButton icon={<X size={24} color={colors.text} />} accessibilityLabel={t("CANCEL_BTN")} onPress={() => router.back()} />
          </ExpoStack.Toolbar>
          <ExpoStack.Toolbar placement="right" asChild>
            <View style={{ flexDirection: "row" }}>
              {tab === "gradient" ? (
                <AndroidHeaderButton icon={<Dices size={24} color={colors.text} />} onPress={randomizeGradient} />
              ) : (
                <AndroidHeaderButton icon={<ImageIcon size={24} color={hasCustomWallpaper ? colors.primary : colors.text} />} onPress={uploadCustomWallpaper} />
              )}
              {tab === "gradient" ? (
                <AndroidHeaderButton
                  icon={<RefreshCw size={24} color={colors.text} />}
                  accessibilityLabel={t("Modal_Wallpaper_Gradient_Shuffle")}
                  onPress={shuffleGradient}
                />
              ) : (
                <AndroidHeaderMenu
                  icon={<EllipsisVertical size={24} color={colors.text} />}
                  actions={[
                    {
                      id: "background:clear",
                      title: t("Modal_Wallpaper_Clear"),
                      imageColor: "#FF0000",
                      attributes: { "destructive": true, "disabled": !currentWallpaper }
                    },
                    {
                      id: "background:downloads",
                      title: t("Modal_Wallpaper_Downloads"),
                      imageColor: colors.text,
                      displayInline: false,
                      subactions: [
                        {
                          title: t("Modal_Wallpaper_Downloads_Size"),
                          subtitle: downloadsSize
                        },
                        {
                          id: "downloads:clear",
                          title: t("Modal_Wallpaper_ClearDownloads"),
                          imageColor: "#FF0000",
                          attributes: { "destructive": true, "disabled": !wallpaperDirectory.exists }
                        }
                      ]
                    },
                  ]}
                  onPressAction={({ nativeEvent }) => {
                    if (nativeEvent.event === "downloads:clear") clearDownloads();
                    if (nativeEvent.event === "background:clear") clearWallpaper();
                  }}
                />
              )}
            </View>
          </ExpoStack.Toolbar>
        </>
      ) : (
        <>
          <ExpoStack.Toolbar placement="left">
            {tab === "gradient" ? (
              <ExpoStack.Toolbar.Button icon="dice" onPress={randomizeGradient} />
            ) : (
              <ExpoStack.Toolbar.Button
                icon="photo"
                tintColor={hasCustomWallpaper ? colors.primary : undefined}
                onPress={uploadCustomWallpaper}
              />
            )}
          </ExpoStack.Toolbar>
          <ExpoStack.Toolbar placement="right">
            {tab === "gradient" ? (
              <ExpoStack.Toolbar.Button icon="arrow.triangle.2.circlepath" onPress={shuffleGradient}>
                {t("Modal_Wallpaper_Gradient_Shuffle")}
              </ExpoStack.Toolbar.Button>
            ) : (
              <ExpoStack.Toolbar.Menu>
                <ExpoStack.Toolbar.Icon sf="ellipsis" />
                <ExpoStack.Toolbar.MenuAction
                  icon="trash.fill"
                  destructive
                  disabled={!currentWallpaper}
                  onPress={clearWallpaper}
                >
                  {t("Modal_Wallpaper_Clear")}
                </ExpoStack.Toolbar.MenuAction>
                <ExpoStack.Toolbar.Menu title={t("Modal_Wallpaper_Downloads")} icon="square.and.arrow.down">
                  <ExpoStack.Toolbar.MenuAction disabled subtitle={downloadsSize}>
                    {t("Modal_Wallpaper_Downloads_Size")}
                  </ExpoStack.Toolbar.MenuAction>
                  <ExpoStack.Toolbar.MenuAction
                    icon="trash.fill"
                    destructive
                    disabled={!wallpaperDirectory.exists}
                    onPress={clearDownloads}
                  >
                    {t("Modal_Wallpaper_ClearDownloads")}
                  </ExpoStack.Toolbar.MenuAction>
                </ExpoStack.Toolbar.Menu>
              </ExpoStack.Toolbar.Menu>
            )}
          </ExpoStack.Toolbar>
        </>
      )}
    </>
  )
}

const GradientEditor = ({ value, onChange }: { value: Gradient, onChange: (gradient: Gradient) => void }) => {
  const { colors } = useTheme();

  // Same seed and aspect ratio as the full-size render, so the preview matches the result
  const preview = useMemo(() => {
    const image = generateMeshGradient(value.colors, value.seed, Math.round(GRADIENT_WIDTH / 4), GRADIENT_HEIGHT / 4);
    return image ? `data:image/png;base64,${image.encodeToBase64()}` : undefined;
  }, [value]);

  const toggleColor = (color: string) => {
    const current = value.colors;
    if (current.includes(color)) {
      if (current.length > 1) onChange({ ...value, colors: current.filter((c) => c !== color) });
    } else if (current.length < 4) {
      onChange({ ...value, colors: [...current, color] });
    }
  };

  return (
    <View style={{ flex: 1, gap: 16 }}>
      <Image
        source={{ uri: preview }}
        resizeMode="cover"
        style={{ width: "100%", flex: 1, minHeight: 120, borderRadius: 16, borderCurve: "continuous" }}
      />

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {GRADIENT_PALETTE.map((color) => {
          const selected = value.colors.includes(color);
          return (
            <Pressable
              key={color}
              onPress={() => toggleColor(color)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={color}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                padding: 3,
                borderWidth: 2,
                borderColor: selected ? colors.primary : "transparent",
              }}
            >
              <View style={{ flex: 1, borderRadius: 20, backgroundColor: color, borderWidth: 1, borderColor: colors.border }} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const WallpaperImage = ({ item, onPress, selectedId, isDownloading }: { item: WallpaperCollection, onPress: () => void, selectedId: string, isDownloading: boolean }) => {
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
