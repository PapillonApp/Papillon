import { Directory, File, Paths } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { router, Stack as ExpoStack } from "expo-router";
import { useHeaderHeight, useTheme } from "expo-router/react-navigation";
import { t } from "i18next";
import { Dices, EllipsisVertical, Image as ImageIcon, RefreshCw, X } from "lucide-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, Image, Platform, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActivityIndicator from "@/components/ActivityIndicator";
import { AndroidHeaderButton, AndroidHeaderMenu } from "@/components/AndroidHeaderItems";
import { TipIds } from "@/constants/Tips";
import { useSettingsStore } from "@/stores/settings";
import { Wallpaper } from "@/stores/settings/types";
import { retireTip } from "@/stores/tips";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import NativeSegmentedControl from "@/ui/native/NativeSegmentedControl";
import { generateMeshGradient } from "@/utils/generative";
import {
  applyGradientWallpaper,
  Gradient,
  GRADIENT_HEIGHT,
  GRADIENT_PALETTE,
  GRADIENT_WIDTH,
  isGradient,
  randomGradient,
  randomSeed,
  setAccountWallpaper,
  useAccountWallpaper,
} from "@/utils/gradientWallpaper";
import { error as logError } from "@/utils/logger/logger";

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
      const collectionIndex = collections.findIndex((collection) =>
        collection.images.find((image) => image.id === currentWallpaper.id)
      );
      if (collectionIndex > 0) {
        const timer = setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: collectionIndex,
            animated: true,
            viewOffset: Platform.OS === "ios" ? headerHeight : 0,
          });
        }, 10);
        return () => clearTimeout(timer);
      }
    }
  }, [tab, collections]);

  const wallpaperDirectory = new Directory(Paths.document, "wallpapers");

  const selectImageWallpaper = (nextWallpaper: Wallpaper) => {
    clearTimeout(applyTimeout.current);
    pendingGradient.current = null;
    setAccountWallpaper({
      wallpaper: nextWallpaper,
      lastImageWallpaper: nextWallpaper,
    });
  };

  const downloadAndSelect = (wallpaper: Wallpaper) => {
    const fileName = `${wallpaper.id}.jpg`;

    const wallpaperFile = new File(wallpaperDirectory, fileName);
    if (wallpaperFile.exists) {
      selectImageWallpaper({
        id: wallpaper.id,
        path: {
          directory: wallpaperDirectory.name,
          name: wallpaperFile.name,
        },
      });
      return;
    }

    setCurrentlyDownloading((prev) => [...prev, wallpaper.id]);

    if (!wallpaperDirectory.exists) {
      wallpaperDirectory.create();
    }
    File.downloadFileAsync(wallpaper.url!, wallpaperFile).then((result) => {
      selectImageWallpaper({
        id: wallpaper.id,
        path: {
          directory: wallpaperDirectory.name,
          name: result.name,
        },
      });
    }).finally(() => {
      setCurrentlyDownloading((prev) => prev.filter((id) => id !== wallpaper.id));
    });
  };

  const uploadCustomWallpaper = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const sourceFile = new File(asset.uri);

      if (!wallpaperDirectory.exists) {
        wallpaperDirectory.create();
      }

      const now = Date.now();
      const newFileName = `custom-${now}.jpg`;
      const destFile = new File(wallpaperDirectory, newFileName);

      sourceFile.copy(destFile);

      if (isGradient(currentWallpaper) && currentWallpaper?.path?.name) {
        const gradientFile = new File(wallpaperDirectory, currentWallpaper.path.name);
        if (gradientFile.exists) {
          gradientFile.delete();
        }
      }

      selectImageWallpaper({
        id: `custom:${now}`,
        path: {
          directory: wallpaperDirectory.name,
          name: destFile.name,
        },
      });

      if (tab !== "images") {
        setTab("images");
      }
    } catch (err) {
      logError(`Failed to upload custom wallpaper: ${String(err)}`);
    }
  };

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

  const directorySize = wallpaperDirectory.exists ? (wallpaperDirectory.info().size ?? 0) : 0;
  const downloadsSize = (directorySize / (1024 * 1024)).toFixed(2) + " MB";

  const clearWallpaper = () => {
    clearTimeout(applyTimeout.current);
    pendingGradient.current = null;
    setAccountWallpaper({
      wallpaper: null,
      lastImageWallpaper: undefined,
      wallpaperGradient: undefined,
    });
  };

  const clearDownloads = () => {
    clearTimeout(applyTimeout.current);
    pendingGradient.current = null;
    if (wallpaperDirectory.exists) {
      wallpaperDirectory.delete();
    }
    // Downloads are shared by every account: drop all references to them
    mutateProperty("personalization", {
      wallpaper: null,
      lastImageWallpaper: undefined,
      wallpaperGradient: undefined,
      wallpapersByAccount: {},
    });
  };

  return (
    <>
      <ExpoStack.Title asChild>
        <View style={{ width: Math.min(Dimensions.get("window").width - (Platform.OS === "android" ? (tab === "gradient" ? 240 : 200) : (tab === "gradient" ? 180 : 140)), 280) }}>
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
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          flatListRef.current?.scrollToOffset({
            offset: index * averageItemLength,
            animated: true,
          });
        }}
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
              {tab === "gradient" && (
                <>
                  <AndroidHeaderButton icon={<Dices size={24} color={colors.text} />} onPress={randomizeGradient} />
                  <AndroidHeaderButton
                    icon={<RefreshCw size={24} color={colors.text} />}
                    accessibilityLabel={t("Modal_Wallpaper_Gradient_Shuffle")}
                    onPress={shuffleGradient}
                  />
                </>
              )}
              <AndroidHeaderButton icon={<ImageIcon size={24} color={hasCustomWallpaper ? colors.primary : colors.text} />} onPress={uploadCustomWallpaper} />
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
                  if (nativeEvent.event === "downloads:clear") {
                    clearDownloads();
                  }
                  if (nativeEvent.event === "background:clear") {
                    clearWallpaper();
                  }
                }}
              />
            </View>
          </ExpoStack.Toolbar>
        </>
      ) : (
        <>
          <ExpoStack.Toolbar placement="left">
            <ExpoStack.Toolbar.Button
              icon="photo"
              tintColor={hasCustomWallpaper ? colors.primary : undefined}
              onPress={uploadCustomWallpaper}
            />
            {tab === "gradient" && (
              <ExpoStack.Toolbar.Button icon="dice" onPress={randomizeGradient} />
            )}
          </ExpoStack.Toolbar>
          <ExpoStack.Toolbar placement="right">
            {tab === "gradient" && (
              <ExpoStack.Toolbar.Button icon="arrow.triangle.2.circlepath" onPress={shuffleGradient}>
                {t("Modal_Wallpaper_Gradient_Shuffle")}
              </ExpoStack.Toolbar.Button>
            )}
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
