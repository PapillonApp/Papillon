import {
  NativeItem,
  NativeList,
  NativeText,
} from "@/components/Global/NativeComponents";
import React, { useCallback, useEffect, useState } from "react";
import Reanimated, {
  FadeInUp,
  FadeOutDown,
  LinearTransition,
} from "react-native-reanimated";
import { Sparkles } from "lucide-react-native";
import { useTheme } from "@react-navigation/native";
import PackageJSON from "../../../../package.json";
import { Dimensions, View } from "react-native";

import { Elements, type Element } from "./ElementIndex";
import { animPapillon } from "@/utils/ui/animations";
import { useFlagsStore } from "@/stores/flags";
import { useCurrentAccount } from "@/stores/account";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {defaultTabs} from "@/consts/DefaultTabs";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteParameters} from "@/router/helpers/types";
import detectOnline from "@/hooks/detectOnline";

interface ModalContentProps {
  navigation: NativeStackNavigationProp<RouteParameters, "HomeScreen", undefined>
  refresh: boolean
  endRefresh: () => unknown
}

const ModalContent: React.FC<ModalContentProps> = ({ navigation, refresh, endRefresh }) => {
  const { colors } = useTheme();

  const account = useCurrentAccount((store) => store.account!);
  const mutateProperty = useCurrentAccount((store) => store.mutateProperty);

  const [updatedRecently, setUpdatedRecently] = useState(false);
  const defined = useFlagsStore((state) => state.defined);

  const { isOnline, UNEerreur } = detectOnline(true);

  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    setElements([]);
    Elements.forEach((Element) => {
      setElements((prevElements) => [
        ...prevElements,
        {
          id: Element.id,
          component: Element.component,
          importance: undefined,
        }
      ]);
    });
  }, []);

  function sortElementsByImportance () {
    setElements((prevElements) => {
      const sortedElements = [...prevElements];
      sortedElements.sort((a, b) => {
        let aImportance = a.importance === undefined ? -1 : a.importance;
        let bImportance = b.importance === undefined ? -1 : b.importance;
        return bImportance - aImportance;
      });
      return sortedElements;
    });
  }

  const updateImportance = (id: string, value: number) => {
    setElements((prevElements) => {
      const updatedElements = [...prevElements];
      const index = updatedElements.findIndex((element) => element.id === id);
      updatedElements[index].importance = value;
      return updatedElements;
    });
  };

  const handleImportanceChange = (id: string, value: number) => {
    updateImportance(id, value);
    sortElementsByImportance();
  };

  function checkForUpdateRecently () {
    AsyncStorage.getItem("changelog.lastUpdate").then((value) => {
      const currentVersion = PackageJSON.version;
      if (value == null || value !== currentVersion) setUpdatedRecently(true);
    });
  }

  const checkForNewTabs = useCallback(() => {
    const storedTabs = account.personalization.tabs || [];
    const newTabs = defaultTabs.filter(
      (defaultTab) =>
        !storedTabs.some((storedTab) => storedTab.name === defaultTab.tab)
    );

    if (newTabs.length > 0) {
      const updatedTabs = [
        ...storedTabs,
        ...newTabs.map((tab) => ({
          name: tab.tab,
          enabled: false,
          installed: true,
        })),
      ];

      mutateProperty("personalization", {
        ...account.personalization,
        tabs: updatedTabs,
      });
    }
  }, [account.personalization.tabs, mutateProperty]);

  async function RefreshData () {
    checkForUpdateRecently();
    checkForNewTabs();
    sortElementsByImportance();
    endRefresh();
  }

  useEffect(() => {
    if (refresh) RefreshData();
  }, [refresh]);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      RefreshData();
    });
  }, []);

  return (
    <View
      style={{
        minHeight: Dimensions.get("window").height - 131,
      }}
    >
      {!isOnline && UNEerreur}

      {(defined("force_changelog") || updatedRecently) && isOnline && (
        <NativeList
          animated
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutDown)}
        >
          <NativeItem
            leading={
              <Sparkles
                color={colors.primary}
                size={28}
                strokeWidth={2}
              />
            }
            onPress={() => navigation.navigate("ChangelogScreen")}
            style={{
              backgroundColor: colors.primary + "30",
            }}
            androidStyle={{
              backgroundColor: colors.primary + "20",
            }}
          >
            <NativeText variant="title">
              Découvrez les nouveautés de Papillon {PackageJSON.version}
            </NativeText>
            <NativeText variant="subtitle">
              Ouvrir les notes de mise à jour de cette version de Papillon
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      <Reanimated.View layout={animPapillon(LinearTransition)}>
        {elements.map(
          (Element, index) =>
            Element && (
              <Reanimated.View
                key={index}
                layout={animPapillon(LinearTransition)}
                entering={animPapillon(FadeInUp)}
                exiting={animPapillon(FadeOutDown)}
              >
                <Element.component
                  navigation={navigation}
                  onImportance={
                    Element.importance === undefined
                      ? (value: number) => handleImportanceChange(Element.id, value)
                      : () => {}
                  }
                />
              </Reanimated.View>
            )
        )}
      </Reanimated.View>
    </View>
  );
};

export default ModalContent;
