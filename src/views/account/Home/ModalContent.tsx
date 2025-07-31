import React, { useCallback, useEffect, useState, useMemo, memo } from "react";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import Reanimated, { FadeInUp, FadeOutDown, LinearTransition } from "react-native-reanimated";
import { Bug, Sparkles, X } from "lucide-react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import PackageJSON from "../../../../package.json";
import { Dimensions, View} from "react-native";
import { Elements, type Element } from "./ElementIndex";
import { animPapillon } from "@/utils/ui/animations";
import { useFlagsStore } from "@/stores/flags";
import { useCurrentAccount } from "@/stores/account";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaultTabs } from "@/consts/DefaultTabs";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteParameters } from "@/router/helpers/types";
import { TouchableOpacity } from "react-native-gesture-handler";
import { OfflineWarning, useOnlineStatus } from "@/hooks/useOnlineStatus";


interface ModalContentProps {
  navigation: NativeStackNavigationProp<RouteParameters, "HomeScreen", undefined>;
  refresh: boolean;
  endRefresh: () => unknown;
}

const ModalContent: React.FC<ModalContentProps> = ({ navigation, refresh, endRefresh }) => {
  const { colors } = useTheme();
  const { isOnline } = useOnlineStatus();
  const account = useCurrentAccount((store) => store.account!);
  const mutateProperty = useCurrentAccount((store) => store.mutateProperty);
  const defined = useFlagsStore((state) => state.defined);

  const [updatedRecently, setUpdatedRecently] = useState(false);
  const [elements, setElements] = useState<Element[]>([]);

  useEffect(() => {
    setElements(Elements.map((Element) => ({
      id: Element.id,
      component: Element.component,
      importance: undefined,
    })));
  }, []);

  const sortElementsByImportance = useCallback(() => {
    setElements((prevElements) =>
      [...prevElements].sort((a, b) => {
        const aImportance = a.importance ?? -1;
        const bImportance = b.importance ?? -1;
        return bImportance - aImportance;
      })
    );
  }, []);

  const updateImportance = useCallback((id: string, value: number) => {
    setElements((prevElements) =>
      prevElements.map((element) =>
        element.id === id ? { ...element, importance: value } : element
      )
    );
  }, []);

  const handleImportanceChange = useCallback((id: string, value: number) => {
    updateImportance(id, value);
    sortElementsByImportance();
  }, [sortElementsByImportance, updateImportance]);

  const checkForUpdateRecently = useCallback(async () => {
    const value = await AsyncStorage.getItem("changelog.lastUpdate");
    if (value == null || value !== PackageJSON.version) {
      setUpdatedRecently(true);
    }
  }, []);

  const checkForNewTabs = useCallback(() => {
    const storedTabs = account.personalization.tabs || [];
    const newTabs = defaultTabs.filter(
      (defaultTab) => !storedTabs.some((storedTab) => storedTab.name === defaultTab.tab)
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

  const refreshData = useCallback(async () => {
    await checkForUpdateRecently();
    checkForNewTabs();
    sortElementsByImportance();
    endRefresh();
  }, [checkForUpdateRecently, checkForNewTabs, sortElementsByImportance, endRefresh]);

  useEffect(() => {
    if (refresh) {
      refreshData();
    }
  }, [refresh, refreshData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", refreshData);
    return unsubscribe;
  }, [navigation, refreshData]);

  const memoizedElements = useMemo(() => elements.map((Element, index) => (
    <Reanimated.View
      key={index}
      layout={animPapillon(LinearTransition)}
      entering={animPapillon(FadeInUp)}
      exiting={animPapillon(FadeOutDown)}
    >
      <Element.component
        navigation={navigation}
        onImportance={Element.importance === undefined ? (value: number) => handleImportanceChange(Element.id, value) : () => {}}
      />
    </Reanimated.View>
  )), [elements, handleImportanceChange, navigation]);

  return (
    <View style={{ minHeight: Dimensions.get("window").height - 131 }}>
      {(defined("force_debugmode") || __DEV__) && (
        <NativeList animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)}>
          <View
            style={{
              flex: 1,
              flexDirection: "column",
              paddingHorizontal: 0,
              paddingVertical: 0,
              gap: 8,
              backgroundColor: colors.primary + "20",
            }}
          >
            <NativeItem
              onPress={() => navigation.navigate("DevMenu")}
              chevron={true}
              leading={<Bug size={22} strokeWidth={2} color={colors.text} />}
              style={{
                paddingHorizontal: 0,
              }}
            >
              <NativeText variant="title" style={{ flex: 1, paddingVertical: 4 }}>
                Mode debug
              </NativeText>
            </NativeItem>
          </View>
        </NativeList>
      )}

      {(defined("force_changelog") || updatedRecently) && (
        <NativeList animated entering={animPapillon(FadeInUp)} exiting={animPapillon(FadeOutDown)}>
          <TouchableOpacity
            onPress={() => navigation.navigate("ChangelogScreen")}
            style={{
              flex: 1,
              flexDirection: "column",
              paddingHorizontal: 14,
              paddingVertical: 12,
              gap: 8,
              backgroundColor: colors.primary + "20",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Sparkles size={22} strokeWidth={2} color={colors.text} />
              <NativeText variant="title" style={{ flex: 1 }}>
                Papillon vient d'être mis à jour à la version {PackageJSON.version} !
              </NativeText>
              <TouchableOpacity
                onPress={() => {
                  AsyncStorage.setItem("changelog.lastUpdate", PackageJSON.version);
                  setUpdatedRecently(false);
                }}
                style={{ padding: 4, borderRadius: 100, backgroundColor: colors.text + "20" }}
              >
                <X size={18} strokeWidth={3} color={colors.text} />
              </TouchableOpacity>
            </View>
            <NativeText variant="subtitle">
              Clique ici pour voir tous les changements et les dernières nouveautés.
            </NativeText>
          </TouchableOpacity>
        </NativeList>
      )}
      {!isOnline && <OfflineWarning paddingTop={16} cache={true} />}
      <Reanimated.View layout={animPapillon(LinearTransition)}>
        {memoizedElements}
      </Reanimated.View>
    </View>
  );
};

export default memo(ModalContent);
