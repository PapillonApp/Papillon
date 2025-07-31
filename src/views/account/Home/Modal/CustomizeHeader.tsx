import React, { useEffect, useLayoutEffect } from "react";

import { Screen } from "@/router/helpers/types";

import { FlatList, Image, Pressable, ScrollView, Switch, TouchableOpacity, View } from "react-native";
import { useCurrentAccount } from "@/stores/account";
import { NativeList, NativeListHeader } from "@/components/Global/NativeComponents";
import { COLORS_LIST } from "@/services/shared/Subject";
import { PersonalizationHeaderGradient } from "@/stores/account/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Dice5, Moon, Palette, PictureInPicture } from "lucide-react-native";
import InsetsBottomView from "@/components/Global/InsetsBottomView";

export const HEADERS_IMAGE = [
  {
    label: "stars",
    source: require("@/../assets/headers/stars.png"),
  },
  {
    label: "topography",
    source: require("@/../assets/headers/topography.png"),
  },
  {
    label: "boxes",
    source: require("@/../assets/headers/boxes.png"),
  },
  {
    label: "texture",
    source: require("@/../assets/headers/texture.png"),
  },
  {
    label: "hlr",
    source: require("@/../assets/headers/hlr.png"),
  },
  {
    label: "v7",
    source: require("@/../assets/headers/v7.png"),
  },
  {
    label: "ailes",
    source: require("@/../assets/headers/ailes.png"),
  },
  {
    label: "spark",
    source: require("@/../assets/headers/spark.png"),
  },
  {
    label: "tictactoe",
    source: require("@/../assets/headers/tictactoe.png"),
  },
  {
    label: "star",
    source: require("@/../assets/headers/star.png"),
  }
];

const CustomizeHeader: Screen<"CustomizeHeader"> = ({ route, navigation }) => {
  const account = useCurrentAccount(store => store.account);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const defaultGradient = {
    startColor: COLORS_LIST[0],
    endColor: COLORS_LIST[1],
    angle: 0,
  };

  const [image, setImage] = React.useState<string | undefined>(account?.personalization?.header?.image);
  const [gradient, setGradient] = React.useState<PersonalizationHeaderGradient>(account?.personalization?.header?.gradient || defaultGradient);
  const [darken, setDarken] = React.useState<boolean>(account?.personalization?.header?.darken || false);
  const [centerReset, setCenterReset] = React.useState<any>(undefined);

  useEffect(() => {
    mutateProperty("personalization", {
      header: {
        gradient,
        image,
        darken,
      },
    });
  }, [gradient, image]);

  const { colors } = useTheme();

  const randomizeGradient = () => {
    const startColor = COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)];
    const endColor = COLORS_LIST[Math.floor(Math.random() * COLORS_LIST.length)];
    setGradient({
      startColor,
      endColor,
      angle: 0,
    });
    setCenterReset(Math.random());
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            randomizeGradient();
          }}
          style={{
            padding: 8,
            borderRadius: 100,
          }}
        >
          <Dice5
            color={account?.personalization?.header?.gradient?.startColor || colors.primary}
            size={24}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors.primary, account?.personalization?.header?.gradient?.startColor]);

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
    >
      <NativeListHeader
        style={{
          marginTop: 16,
        }}
        icon={<Palette/>}
        label="Dégradé de couleur"
        trailing={
          <Switch
            value={account?.personalization?.header?.gradient !== undefined}
            onValueChange={(value) => {
              const gradValue = value ? gradient || defaultGradient : undefined;
              mutateProperty("personalization", {
                header: {
                  image,
                  darken,
                  gradient: gradValue || defaultGradient,
                },
              });
              setGradient(gradValue || defaultGradient);
            }}
          />
        }
      />
      <NativeList>
        <HorizontalColorSelector
          centerReset={centerReset}
          selected={gradient?.startColor || undefined}
          onColorSelect={(color) => {
            if(!gradient) {
              setGradient(defaultGradient);
            }
            setGradient((prev) => ({
              ...prev,
              startColor: color,
            }));
          }}
        />
      </NativeList>
      <NativeList inline>
        <HorizontalColorSelector
          centerReset={centerReset}
          selected={gradient?.endColor || undefined}
          onColorSelect={(color) => {
            if(!gradient) {
              setGradient(defaultGradient);
            }
            setGradient((prev) => ({
              ...prev,
              endColor: color,
            }));
          }}
        />
      </NativeList>



      <NativeListHeader
        style={{
          marginTop: 18,
          marginBottom: 8,
        }}
        icon={<Moon/>}
        label="Assombrir le fond"
        trailing={
          <Switch
            value={account?.personalization?.header?.darken || false}
            onValueChange={(value) => {
              mutateProperty("personalization", {
                header: {
                  gradient,
                  image,
                  darken: value,
                },
              });
              setDarken(value);
            }}
          />
        }
      />

      <NativeListHeader
        style={{
          marginTop: 16,
        }}
        icon={<PictureInPicture/>}
        label="Image"
        trailing={
          <Switch
            value={account?.personalization?.header?.image !== undefined}
            onValueChange={(value) => {
              mutateProperty("personalization", {
                header: {
                  gradient: gradient,
                  image: value ? image || HEADERS_IMAGE[0].label : undefined,
                  darken,
                },
              });
              setImage(value ? image || HEADERS_IMAGE[0].label : undefined);
            }}
          />
        }
      />
      <NativeList>
        <FlatList
          data={HEADERS_IMAGE}
          horizontal
          keyExtractor={(item) => item.label}
          renderItem={({ item }) => (
            <Pressable
              style={{
                backgroundColor: (gradient?.startColor || colors.primary) + "20",
                borderWidth: 2,
                borderColor: image === item.label ? gradient?.startColor || colors.primary : "transparent",
                borderRadius: 12,
                borderCurve: "continuous",
                width: 120,
                height: 80,
                overflow: "hidden",
              }}
              onPress={() => {
                setImage(item.label);
              }}
            >
              <Image
                source={item.source}
                tintColor={gradient?.startColor || colors.primary}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Pressable>
          )}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 8,
            paddingHorizontal: 8,
            gap: 8,
          }}
        />
      </NativeList>

      <InsetsBottomView />
    </ScrollView>
  );
};

const HorizontalColorSelector = ({
  onColorSelect,
  selected,
  centerReset,
}: {
  onColorSelect?: (color: string) => void;
  selected?: string;
  centerReset?: any;
}) => {
  const { colors } = useTheme();

  const SelectorRef = React.useRef<FlatList>(null);

  const ITEM_WIDTH = 72; // Largeur de l'élément + marges
  const ITEM_HEIGHT = 40; // Hauteur de l'élément + marges

  const scrollToIndex = (index: number, animated:boolean) => {
    if (SelectorRef.current) {
      SelectorRef.current.scrollToIndex({
        index,
        animated: animated,
        viewPosition: 0,
      });
    }
  };

  const resetScroll = (animated: boolean) => {
    const index = COLORS_LIST.findIndex((color) => color === selected);
    if (index !== -1) {
      scrollToIndex(index, animated);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      resetScroll(centerReset !== undefined);
    }, 100);
  }, [centerReset]);

  return (
    <FlatList
      ref={SelectorRef}
      data={COLORS_LIST}
      horizontal
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <Pressable
          style={{
            backgroundColor: selected === item ? item : "transparent",
            borderRadius: 14,
            borderCurve: "continuous",
            width: ITEM_WIDTH,
            height: ITEM_HEIGHT,
          }}
          onPress={() => {
            if (onColorSelect) {
              onColorSelect(item);
            }
          }}
        >
          <View
            style={{
              backgroundColor: item,
              width: ITEM_WIDTH - 6,
              height: ITEM_HEIGHT - 6,
              borderRadius: 11,
              borderCurve: "continuous",
              margin: 3,
              borderWidth: !(selected === item) ? 1 : 2,
              borderColor: !(selected === item) ? colors.text + "44" : colors.background,
            }}
          />
        </Pressable>
      )}
      getItemLayout={(_, index) => ({
        length: ITEM_WIDTH,
        offset: ITEM_WIDTH * index,
        index,
      })}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingVertical: 8,
        paddingHorizontal: 8,
      }}
    />
  );
};

export default CustomizeHeader;