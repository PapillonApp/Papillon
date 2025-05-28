import React, { createRef, useState } from "react";
import { TextInput, StyleSheet, TouchableOpacity } from "react-native";
import type { Screen } from "@/router/helpers/types";

import { ScrollView } from "react-native-gesture-handler";
import Reanimated, { LinearTransition, ZoomIn, ZoomOut } from "react-native-reanimated";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { INSTANCES } from "appscho";
import { Search, X } from "lucide-react-native";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

export const AppschoUniversities: Screen<"AppschoUniversities"> = ({ navigation }) => {
  const searchInputRef = createRef<TextInput>();
  const [search, setSearch] = useState("");
  const { colors } = useTheme();

  const filteredUniversities = INSTANCES.filter((university) => {
    const searchLower = search.toLowerCase();
    return university.name.toLowerCase().includes(searchLower);
  });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingTop: 0 }}>
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
          placeholder="Nom de ton université"
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

      <NativeListHeader label="Autres Universités" />

      <NativeList>
        {filteredUniversities.map((university) => (
          <NativeItem
            key={university.id}
            onPress={() =>
              navigation.navigate("Appscho_Login", {
                instanceID: university.id,
                title: university.name,
                image: require("@/../assets/images/service_appscho.png"),
              })
            }
          >
            <NativeText variant="title">{university.name}</NativeText>
          </NativeItem>
        ))}
      </NativeList>
      <InsetsBottomView />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    marginTop: 24,
    marginHorizontal: 16,

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
  },
});

export default AppschoUniversities;
