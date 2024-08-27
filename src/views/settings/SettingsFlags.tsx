import React from "react";
import { Text, ScrollView, View, TouchableOpacity, StyleSheet, Image, Switch, TextInput, Alert, KeyboardAvoidingView } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { ChevronLeft, Code, MegaphoneOff } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useFlagsStore } from "@/stores/flags";

const SettingsFlags: Screen<"SettingsFlags"> = () => {
  const flags = useFlagsStore(state => state.flags);
  const remove = useFlagsStore(state => state.remove);
  const set = useFlagsStore(state => state.set);

  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const textInputRef = React.useRef<TextInput>(null);

  return (
    <KeyboardAvoidingView
      behavior="padding"
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingTop: 0,
          paddingBottom: insets.bottom + 16,
        }}
      >
        <NativeListHeader label="Ajouter un flag" />

        <NativeList>
          <NativeItem>
            <TextInput
              style={{ flex: 1, fontSize: 16, fontFamily: "medium", color: colors.text }}
              placeholder="Ajouter un flag"
              ref={textInputRef}
              onSubmitEditing={(e) => {
                set(e.nativeEvent.text);
                textInputRef.current?.clear();
              }}
            />
          </NativeItem>
        </NativeList>

        {flags.length > 0 && (
          <View>
            <NativeListHeader label="Flags activés" />

            <NativeList>
              {flags.map((flag) => (
                <NativeItem
                  key={flag}
                  icon={<Code />}
                  onPress={() => {
                    Alert.alert(
                      "Flag",
                      flag,
                      [
                        {
                          text: "OK"
                        },
                        {
                          text: "Supprimer",
                          onPress: () => remove(flag),
                          style: "destructive"
                        }
                      ]
                    );
                  }}
                >
                  <NativeText>
                    {flag}
                  </NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SettingsFlags;
