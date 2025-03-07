import React, { useEffect, useState } from "react";
import type { Screen } from "@/router/helpers/types";
import { TextInput, TouchableOpacity, View, StyleSheet, ActivityIndicator, Keyboard, KeyboardEvent, SafeAreaView } from "react-native";
import Reanimated, { LinearTransition, FlipInXDown, FadeInUp, FadeOutUp, ZoomIn, ZoomOut, Easing, ZoomInEasyDown } from "react-native-reanimated";
import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@react-navigation/native";

import { Search, X, GraduationCap, } from "lucide-react-native";
import { useAlert } from "@/providers/AlertProvider";
import type { School } from "scolengo-api/types/models/School";
import { Skolengo } from "scolengo-api";
import { useDebounce } from "@/hooks/debounce";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const SkolengoInstanceSelector: Screen<"SkolengoInstanceSelector"> = ({
  route: { params },
  navigation,
}) => {
  // `null` when loading, `[]` when no instances found.
  const [instances, setInstances] = useState<School[]>([]);
  const [geoInstances, setGeoInstances] = useState<School[]|null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const {colors} = useTheme();
  const insets = useSafeAreaInsets();

  const { showAlert } = useAlert();

  const [search, setSearch] = useState("");
  const searchInputRef = React.createRef<TextInput>();
  const debouncedSearch = useDebounce(search, 1000);

  const [hasSearched, setHasSearched] = useState(false);

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const keyboardDidShow = (event: KeyboardEvent) => {
    setKeyboardOpen(true);
    setKeyboardHeight(event.endCoordinates.height);
  };

  const keyboardDidHide = () => {
    setKeyboardOpen(false);
    setKeyboardHeight(0);
  };

  useEffect(() => {
    Keyboard.addListener("keyboardDidShow", keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", keyboardDidHide);

    return () => {
      Keyboard.removeAllListeners("keyboardDidShow");
      Keyboard.removeAllListeners("keyboardDidHide");
    };
  }, []);

  useEffect(() => {
    if (params && params.pos && params.pos !== null) {
      void async function () {
        setIsSearchLoading(true);
        const instances = await Skolengo.searchSchool({ lon: params.pos!.longitude, lat: params.pos!.latitude }, 20);
        // On limite à 20 instances.
        instances.splice(20);

        setInstances(instances);
        setGeoInstances(instances);
        setIsSearchLoading(false);
      }();
    } else {
      setInstances([]);
      setGeoInstances(null);
    }
  }, [params]);

  useEffect(() => {
    const _debSearch = debouncedSearch+""; // make a copy of the debounced search string.
    void async function () {
      if (geoInstances !== null) {
        const newInstances = geoInstances.filter((instance) =>
          instance.name?.toLowerCase().includes(search.toLowerCase())
        );
        setInstances(newInstances);
        setHasSearched(true);
      } else {
        setIsSearchLoading(true);
        const newInstances = await Skolengo.searchSchool({ text: search }, 20);
        // On limite à 20 instances.
        newInstances.splice(20);
        setIsSearchLoading(false);
        if(_debSearch !== debouncedSearch) return; // if the search has changed, we don't update the instances.
        setInstances(newInstances);
        setHasSearched(true);
      }
    }();
  }, [search, geoInstances]);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }} />

      {!keyboardOpen &&
        <Reanimated.View
          entering={FadeInUp.duration(250).delay(200)}
          exiting={FadeOutUp.duration(150)}
          style={{ zIndex: 9999 }}
          layout={LinearTransition}
        >
          <PapillonShineBubble
            message={"Voici les établissements que j'ai trouvé !"}
            numberOfLines={2}
            width={250}
            noFlex
            style={{ marginTop: 0, zIndex: 9999 }}
          />
        </Reanimated.View>
      }

      <Reanimated.View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.text + "15",
            // @ts-expect-error
            color: colors.text,
            borderColor: colors.border,
          }
        ]}
        layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
      >
        <Search size={24} color={colors.text + "55"} />

        <ResponsiveTextInput
          ref={searchInputRef}
          placeholder={params.pos ? "Recherche parmis ceux-là" : "Une ville, un établissement..."}
          placeholderTextColor={colors.text + "55"}
          value={search}
          onChangeText={setSearch}
          style={[
            styles.searchInput,
            {
              color: colors.text,
            }
          ]}
        />

        {search.length > 0 && (
          <Reanimated.View
            layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
            entering={ZoomIn.springify()}
            exiting={ZoomOut.springify()}
          >
            <TouchableOpacity onPress={() => {
              setSearch("");
            }}>
              <X size={24} color={colors.text + "55"} />
            </TouchableOpacity>
          </Reanimated.View>
        )}
      </Reanimated.View>

      {instances.length === 0 && (debouncedSearch.length > 0 || params.pos) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <Reanimated.View
          style={styles.overScrollContainer}
          layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
        >

          <LinearGradient
            pointerEvents="none"
            colors={[
              colors.background + "00",
              colors.background,
            ]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
              zIndex: 999,
            }}
          />

          <Reanimated.ScrollView
            style={styles.overScroll}
            layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
          >
            {instances.length === 0 && params.pos && (
              <Reanimated.Text
                style={{
                  color: colors.text + "88",
                  textAlign: "center",
                  marginTop: 20,
                  fontFamily: "medium",
                  fontSize: 16,
                }}
                entering={FadeInUp.springify()}
                exiting={FadeOutUp.springify()}
              >
                Aucun établissement trouvé.
              </Reanimated.Text>
            )}

            {instances.length === 0 && !params.pos && (
              <Reanimated.Text
                style={{
                  color: colors.text + "88",
                  textAlign: "center",
                  marginTop: 20,
                  fontFamily: "medium",
                  fontSize: 16,
                }}
                entering={FadeInUp.springify()}
                exiting={FadeOutUp.springify()}
              >
                {hasSearched ? "Aucun établissement trouvé, modifie ta recherche." : "Recherche un établissement."}
              </Reanimated.Text>
            )}

            <Reanimated.View
              style={[styles.list,
                {
                  paddingBottom: keyboardHeight + insets.bottom + (keyboardHeight > 0 ? 0 : 20),
                }
              ]}
              layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
            >
              {instances.map((instance, index) => (
                <Reanimated.View
                  style={{ width: "100%" }}
                  layout={LinearTransition.springify().mass(1).stiffness(150).damping(20)}
                  entering={
                    index < 10 &&
                    !hasSearched && geoInstances !== null ?
                      FlipInXDown.springify().delay(100 * index)
                      // @ts-expect-error
                      : ZoomInEasyDown.duration(400).easing(Easing.bezier(0.25, 0.1, 0.25, 1)).delay(30 * index)
                  }
                  exiting={index < 10 ? FadeOutUp : void 0}
                  key={instance.id}
                >
                  <DuoListPressable
                    leading={
                      <GraduationCap
                        size={24}
                        color={colors.text + "88"}
                      />
                    }
                    text={instance.name}
                    onPress={async () => {
                      navigation.navigate("SkolengoWebview", {
                        school: instance,
                      });
                    }}
                  />
                </Reanimated.View>
              ))}
            </Reanimated.View>
          </Reanimated.ScrollView>
        </Reanimated.View>

      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    gap: 20,
  },

  overScrollContainer: {
    flex: 1,
    width: "100%",
  },

  overScroll: {
    width: "100%",
    marginTop: -20,
  },

  list: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 10,
    paddingBottom: 60,
    paddingTop: 20,
  },

  buttons: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 9,
    marginBottom: 16,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },

  searchContainer: {
    marginHorizontal: 16,

    flexDirection: "row",

    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 300,
    gap: 12,

    zIndex: 9999,
    marginTop: -10,
  },

  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "medium",
  }
});

export default SkolengoInstanceSelector;
