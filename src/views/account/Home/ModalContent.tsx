import {NativeItem, NativeList, NativeText} from "@/components/Global/NativeComponents";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import Reanimated, {
  FadeInUp,
  FadeOutDown,
  FadeOutUp,
  FlipInXDown,
  LinearTransition,
} from "react-native-reanimated";
import {Gift, WifiOff} from "lucide-react-native";
import {useTheme} from "@react-navigation/native";
import PackageJSON from "../../../../package.json";
import {Dimensions, View} from "react-native";
import NetInfo from "@react-native-community/netinfo";

import {getErrorTitle} from "@/utils/format/get_papillon_error_title";
import {Elements, type Element} from "./ElementIndex";
import {animPapillon} from "@/utils/ui/animations";
import {useFlagsStore} from "@/stores/flags";
import {useCurrentAccount} from "@/stores/account";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {defaultTabs} from "@/consts/DefaultTabs";
import {NativeStackNavigationProp} from "@react-navigation/native-stack";
import {RouteParameters} from "@/router/helpers/types";

interface ModalContentProps {
  navigation: NativeStackNavigationProp<RouteParameters, "HomeScreen", undefined>
  refresh: boolean
  endRefresh: () => unknown
}

const ModalContent: React.FC<ModalContentProps> = ({ navigation, refresh, endRefresh }) => {
  const { colors } = useTheme();

  const account = useCurrentAccount(store => store.account!);
  const mutateProperty = useCurrentAccount(store => store.mutateProperty);

  const [updatedRecently, setUpdatedRecently] = useState(false);
  const defined = useFlagsStore(state => state.defined);

  const [isOnline, setIsOnline] = useState(false);
  const errorTitle = useMemo(() => getErrorTitle(), []);

  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    setElements([]);
    Elements.forEach((Element) => {
      setElements(prevElements => [
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
    setElements(prevElements => {
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
    setElements(prevElements => {
      const updatedElements = [...prevElements];
      const index = updatedElements.findIndex(element => element.id === id);
      updatedElements[index].importance = value;
      return updatedElements;
    });
  };

  const handleImportanceChange = (id: string, value: number) => {
    updateImportance(id, value);
    sortElementsByImportance();
  };

  function checkForUpdateRecently () {
    AsyncStorage.getItem("changelog.lastUpdate")
      .then((value) => {
        const currentVersion = PackageJSON.version;
        if (value == null || value !== currentVersion)
          setUpdatedRecently(true);
      });
  }

  const checkForNewTabs = useCallback(() => {
    const storedTabs = account.personalization.tabs || [];
    const newTabs = defaultTabs.filter(defaultTab =>
      !storedTabs.some(storedTab => storedTab.name === defaultTab.tab)
    );

    if (newTabs.length > 0) {
      const updatedTabs = [
        ...storedTabs,
        ...newTabs.map(tab => ({
          name: tab.tab,
          enabled: false,
          installed: true
        }))
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
    if (refresh)
      RefreshData();
  }, [refresh]);

  useEffect(() => {
    return navigation.addListener("focus", () => {
      RefreshData();
    });
  }, []);

  useEffect(() => {
    return NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
  }, []);

  return (
    <View
      style={{
        minHeight: Dimensions.get("window").height - 131,
      }}
    >
      {(defined("force_changelog") || updatedRecently) && (
        <NativeList
          animated
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutDown)}
        >
          <NativeItem
            leading={
              <Gift
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
              Papillon {PackageJSON.version} est arrivé !
            </NativeText>
            <NativeText variant="subtitle">
              Découvrez les nouveautés de cette nouvelle version en appuyant ici.
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {!isOnline &&
  <Reanimated.View
    entering={FlipInXDown.springify().mass(1).damping(20).stiffness(300)}
    exiting={FadeOutUp.springify().mass(1).damping(20).stiffness(300)}
    layout={animPapillon(LinearTransition)}
  >
    <NativeList inline>
      <NativeItem
        icon={<WifiOff />}
      >
        <NativeText variant="title" style={{ paddingVertical: 2, marginBottom: -4 }}>
          {errorTitle.label} {errorTitle.emoji}
        </NativeText>
        <NativeText variant="subtitle">
          Vous êtes hors ligne. Les données affichées peuvent être obsolètes.
        </NativeText>
      </NativeItem>
    </NativeList>
  </Reanimated.View>
      }

      <Reanimated.View
        layout={animPapillon(LinearTransition)}
      >
        {elements.map((Element, index) => (Element &&
        <Reanimated.View
          key={index}
          layout={animPapillon(LinearTransition)}
          entering={animPapillon(FadeInUp)}
          exiting={animPapillon(FadeOutDown)}
        >
          <Element.component
            navigation={navigation}
            onImportance={
              Element.importance === undefined ?
                (value: number) => handleImportanceChange(Element.id, value):
                () => {}
            }
          />
        </Reanimated.View>
        ))}
      </Reanimated.View>
    </View>
  );
};

export default ModalContent;
