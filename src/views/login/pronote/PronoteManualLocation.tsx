import React, { createRef, useEffect, useState } from "react";
import { Keyboard, Text, TextInput, StyleSheet, KeyboardEvent, ActivityIndicator, TouchableOpacity, View } from "react-native";
import { type GeographicMunicipality, getGeographicMunicipalities } from "@/utils/external/geo-gouv-api";
import { useDebounce } from "@/hooks/debounce";
import type { Screen } from "@/router/helpers/types";

import Reanimated, { LinearTransition, FlipInXDown, ZoomIn, ZoomOut, FadeInDown, FadeOutUp, FadeInUp, FadeOutDown } from "react-native-reanimated";

import MaskStars from "@/components/FirstInstallation/MaskStars";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@react-navigation/native";
import { Search, X } from "lucide-react-native";
import DuoListPressable from "@/components/FirstInstallation/DuoListPressable";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

/**
 * Allows the get the location of the user manually.
 *
 * Instead of using the device location, we ask the user to input
 * a city name and using the French government API, we retrieve the
 * location (longitude and latitude) of the city.
 */
const PronoteManualLocation: Screen<"PronoteManualLocation"> = ({ navigation }) => {
  const searchInputRef = createRef<TextInput>();
  const [search, setSearch] = useState("");
  // Prevent to make a request on every key press.
  const debouncedSearch = useDebounce(search, 250);

  const [municipalities, setMunicipalities] = useState<{
    loading: boolean
    results: GeographicMunicipality[]
  }>({
    loading: true,
    results: []
  });

  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

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
    (async () => {
      // Limitations from the API.
      if (debouncedSearch.length < 3 || debouncedSearch.length > 200) {
        setMunicipalities({
          loading: false,
          results: []
        });

        return;
      }

      // We set the loading state to true.
      setMunicipalities(prev => ({
        loading: true,
        results: prev.results // Keep the previous results while it's loading.
      }));

      try { // to make a request to the API.
        const data = await getGeographicMunicipalities(debouncedSearch, 15);

        setMunicipalities({
          loading: false,
          results: data
        });
      }
      catch { // on any error, we reset states.
        setMunicipalities({
          loading: false,
          results: []
        });
      }
    })();
  }, [debouncedSearch]);

  return (
    <SafeAreaView style={styles.container}>
      <MaskStars />

      <View style={{ height: insets.top, marginTop: "10%" }} />

      {!keyboardOpen && municipalities.results.length === 0 && (
        <Reanimated.View
          entering={FadeInUp.duration(250).delay(200)}
          exiting={FadeOutUp.duration(150)}
          style={{ zIndex: 9999 }}
          layout={LinearTransition}
        >
          <PapillonShineBubble
            message={"Dans quelle ville se trouve ton établissement ?"}
            numberOfLines={2}
            width={250}
            noFlex
            style={{ marginTop: 0, zIndex: 9999 }}
          />
        </Reanimated.View>
      )}

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
          autoFocus={true}
          placeholder="Nom d'une ville, municipalité, etc."
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
            layout={LinearTransition}
            entering={ZoomIn.springify()}
            exiting={ZoomOut.springify()}
          >
            <TouchableOpacity onPress={() => {
              setSearch("");
              searchInputRef.current?.focus();
            }}>
              <X size={24} color={colors.text + "55"} />
            </TouchableOpacity>
          </Reanimated.View>
        )}
      </Reanimated.View>

      <Reanimated.ScrollView
        style={styles.overScroll}
        layout={LinearTransition.springify().mass(1).stiffness(100).damping(40)}
      >
        <Reanimated.View
          style={[styles.list, {
            paddingBottom: keyboardHeight + insets.bottom,
          }]}
          layout={LinearTransition}
        >
          {municipalities.loading ? (
            <Reanimated.View
              style={styles.loadingContainer}
              layout={LinearTransition}
              entering={FadeInDown.springify()}
              exiting={FadeOutDown.springify()}
            >
              <ActivityIndicator />
              <Text
                style={{
                  color: colors.text + "88",
                  marginTop: 10,
                  fontSize: 16,
                }}
              >
                Chargement...
              </Text>
            </Reanimated.View>
          ) : (
            municipalities.results.map((municipality, index) => (
              <Reanimated.View
                style={{ width: "100%" }}
                entering={FlipInXDown.springify().delay(100 * index)}
                exiting={FadeOutDown.duration(150).delay(100 * index)}
                layout={LinearTransition}
                key={index}
              >
                <DuoListPressable
                  text={`${municipality.properties.name} (${municipality.properties.postcode})`}
                  onPress={() => void navigation.navigate("PronoteInstanceSelector", {
                    longitude: municipality.geometry.coordinates[0],
                    latitude: municipality.geometry.coordinates[1],
                    hideDistance: true
                  })}
                />
              </Reanimated.View>
            ))
          )}
        </Reanimated.View>
      </Reanimated.ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
    gap: 20,
    // paddingTop: -40,
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
    marginTop: -10,

    flexDirection: "row",

    paddingHorizontal: 16,
    paddingVertical: 12,

    borderRadius: 300,
    gap: 12,
    zIndex: 9999,
  },

  searchInput: {
    flex: 1,
    fontSize: 17,
    fontFamily: "medium",
  }
});

export default PronoteManualLocation;
