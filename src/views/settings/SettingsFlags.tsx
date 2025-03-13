import React, { Fragment, useRef } from "react";
import { ScrollView, TextInput, KeyboardAvoidingView, StyleSheet } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { BadgeHelp, Code, Trash2, Undo2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useFlagsStore } from "@/stores/flags";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { useAlert } from "@/providers/AlertProvider";
import ResponsiveTextInput from "@/components/FirstInstallation/ResponsiveTextInput";

const SettingsFlags: Screen<"SettingsFlags"> = ({ navigation }) => {
  const { flags, remove, set } = useFlagsStore();
  const account = useCurrentAccount(store => store.account!);
  const externals = useCurrentAccount(store => store.linkedAccounts);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const textInputRef = useRef<TextInput>(null);

  const { showAlert } = useAlert();

  const isBase64Image = (str: string) => {
    return typeof str === "string" && str.startsWith("data:image/jpeg");
  };

  const renderAccountSection = (sectionName: string, sectionData: any) => {
    const renderItem = (key: string, value: any) => {
      let displayValue = value;
      if (isBase64Image(value)) {
        displayValue = "[Image Base64]";
      } else if (typeof value === "object" && value !== null) {
        displayValue = JSON.stringify(value).substring(0, 50) + "...";
      } else {
        displayValue = String(value);
      }

      return (
        <NativeItem
          key={key}
          onPress={() => navigation.navigate("SettingsFlagsInfos", { title: key, value: value })}
        >
          <NativeText
            variant="subtitle"
          >{key}</NativeText>
          <NativeText
            variant="default"
            style={{
              fontFamily: "Menlo",
            }}
          >{displayValue}</NativeText>
        </NativeItem>
      );
    };

    return (
      <>
        <NativeListHeader label={sectionName} />
        <NativeList>
          {Object.entries(sectionData).map(([key, value]) => renderItem(key, value))}
        </NativeList>
      </>
    );
  };

  const addFlag = (flag: string) => {
    set(flag);
    textInputRef.current?.clear();
  };

  const confirmRemoveFlag = (flag: string) => {
    showAlert({
      title: "Supprimer le flag",
      message: `Veux-tu vraiment supprimer le flag "${flag}" ?`,
      icon: <BadgeHelp />,
      actions: [
        {
          title: "Annuler",
          icon: <Undo2 />,
          primary: false,
        },
        {
          title: "Supprimer",
          icon: <Trash2 />,
          onPress: () => remove(flag),
          danger: true,
          delayDisable: 3,
        }
      ]
    });
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NativeListHeader label="Ajouter un flag" />
        <NativeList>
          <NativeItem>
            <ResponsiveTextInput
              style={[styles.input, { color: colors.text,
                fontFamily: "Menlo", }]}
              placeholder="Nouveau flag"
              placeholderTextColor={colors.text + "80"}
              ref={textInputRef}
              onSubmitEditing={(e) => addFlag(e.nativeEvent.text)}
            />
          </NativeItem>
        </NativeList>

        {flags.length > 0 && (
          <>
            <NativeListHeader label="Flags activés" />
            <NativeList>
              {flags.map((flag) => (
                <NativeItem
                  key={flag}
                  icon={<Code color={colors.text} />}
                  onPress={() => confirmRemoveFlag(flag)}
                >
                  <NativeText>{flag}</NativeText>
                </NativeItem>
              ))}
            </NativeList>
          </>
        )}

        {renderAccountSection("Informations générales", {
          name: account.name,
          schoolName: account.schoolName,
          className: account.className
        })}

        {renderAccountSection("Détails de l'authentification", account.authentication)}

        {renderAccountSection("Personnalisation", account.personalization)}

        {renderAccountSection("Informations de l'instance", account?.instance)}

        {externals.length > 0 && externals.map((external, index) => (
          <Fragment key={index}>
            {renderAccountSection(`Compte externe #${index + 1}: ${AccountService[external.service]}`, {
              username: external.username,
              instance: external.instance,
              authentication: external.authentication,
            })}
          </Fragment>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "medium",
  },
  itemKey: {
    fontWeight: "bold",
  },
});

export default SettingsFlags;