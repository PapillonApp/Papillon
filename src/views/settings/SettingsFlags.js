import React, { Fragment, useRef } from "react";
import { ScrollView, TextInput, KeyboardAvoidingView, StyleSheet } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { BadgeHelp, Code, Trash2, Undo2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useFlagsStore } from "@/stores/flags";
import { useCurrentAccount } from "@/stores/account";
import { AccountService } from "@/stores/account/types";
import { useAlert } from "@/providers/AlertProvider";
var SettingsFlags = function (_a) {
    var navigation = _a.navigation;
    var _b = useFlagsStore() || {}, _c = _b.flags, flags = _c === void 0 ? [] : _c, remove = _b.remove, set = _b.set;
    var account = useCurrentAccount(function (store) { return store.account; });
    var externals = useCurrentAccount(function (store) { return store.linkedAccounts; }) || [];
    var colors = useTheme().colors;
    var insets = useSafeAreaInsets();
    var textInputRef = useRef(null);
    var showAlert = useAlert().showAlert;
    var isBase64Image = function (str) {
        return typeof str === "string" && str.startsWith("data:image/jpeg");
    };
    var renderAccountSection = function (sectionName, sectionData) {
        if (!sectionData || typeof sectionData !== "object")
            return null; // Vérification des données
        var renderItem = function (key, value) {
            var displayValue = value;
            if (isBase64Image(value)) {
                displayValue = "[Image Base64]";
            }
            else if (typeof value === "object" && value !== null) {
                displayValue = JSON.stringify(value).substring(0, 50) + "...";
            }
            else {
                displayValue = String(value);
            }
            return (<NativeItem key={key} onPress={function () { return navigation.navigate("SettingsFlagsInfos", { title: key, value: value }); }}>
          <NativeText variant="subtitle">{key}</NativeText>
          <NativeText variant="default" style={{
                    fontFamily: "Menlo",
                }}>
            {displayValue}
          </NativeText>
        </NativeItem>);
        };
        return (<>
        <NativeListHeader label={sectionName}/>
        <NativeList>
          {Object.entries(sectionData).map(function (_a) {
            var key = _a[0], value = _a[1];
            return renderItem(key, value);
        })}
        </NativeList>
      </>);
    };
    var addFlag = function (flag) {
        var _a;
        if (!flag.trim())
            return;
        try {
            console.log("Flag ajouté :", flag);
            set(flag);
            (_a = textInputRef.current) === null || _a === void 0 ? void 0 : _a.clear();
        }
        catch (error) {
            console.error("Erreur lors de l'ajout du flag :", error);
        }
    };
    var confirmRemoveFlag = function (flag) {
        try {
            showAlert({
                title: "Supprimer le flag",
                message: "Veux-tu vraiment supprimer le flag \"".concat(flag, "\" ?"),
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
                        onPress: function () { return remove(flag); },
                        danger: true,
                        delayDisable: 3,
                    },
                ],
            });
        }
        catch (error) {
            console.error("Erreur lors de la suppression du flag :", error);
        }
    };
    return (<KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <NativeListHeader label="Ajouter un flag"/>
        <NativeList>
          <NativeItem>
            <TextInput style={[styles.input, { color: colors.text, fontFamily: "Menlo" }]} placeholder="Nouveau flag" placeholderTextColor={colors.text + "80"} ref={textInputRef} onSubmitEditing={function (e) { return addFlag(e.nativeEvent.text); }} onBlur={function (e) { return addFlag(e.nativeEvent.text); }}/>
          </NativeItem>
        </NativeList>

        {flags.length > 0 && (<>
            <NativeListHeader label="Flags activés"/>
            <NativeList>
              {flags.map(function (flag) { return (<NativeItem key={flag} icon={<Code color={colors.text}/>} onPress={function () { return confirmRemoveFlag(flag); }}>
                  <NativeText>{flag}</NativeText>
                </NativeItem>); })}
            </NativeList>
          </>)}

        {renderAccountSection("Informations générales", {
            name: account.name || "Inconnu",
            schoolName: account.schoolName || "Inconnu",
            className: account.className || "Inconnu",
            localID: account.localID || "Inconnu",
        })}

        {renderAccountSection("Détails de l'authentification", account.authentication)}

        {renderAccountSection("Personnalisation", account.personalization)}

        {renderAccountSection("Informations de l'instance", account === null || account === void 0 ? void 0 : account.instance)}

        {externals.length > 0 &&
            externals.map(function (external, index) { return (<Fragment key={index}>
              {renderAccountSection("Compte externe #".concat(index + 1, ": ").concat(AccountService[external.service] || "Inconnu"), {
                    username: external.username || "Inconnu",
                    instance: external.instance || "Inconnu",
                    authentication: external.authentication || "Inconnu",
                })}
            </Fragment>); })}
      </ScrollView>
    </KeyboardAvoidingView>);
};
var styles = StyleSheet.create({
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
