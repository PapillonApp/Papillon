var _a;
import React from "react";
import { ScrollView, View } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { GraduationCap, Utensils, BookOpen, School, BookmarkMinus, Compass, Check, Trash2, BadgeInfo } from "lucide-react-native";
import ExternalServicesContainerCard from "@/components/Settings/ExternalServicesContainerCard";
import { NativeList, NativeIcon, NativeItem, NativeListHeader, NativeText, } from "@/components/Global/NativeComponents";
import { AccountService } from "@/stores/account/types";
import { useAccounts } from "@/stores/account";
import { useAlert } from "@/providers/AlertProvider";
var serviceConfig = (_a = {},
    _a[AccountService.Pronote] = { icon: GraduationCap, name: "Pronote" },
    _a[AccountService.EcoleDirecte] = { icon: BookOpen, name: "École Directe" },
    _a[AccountService.Skolengo] = { icon: School, name: "Skolengo" },
    _a[AccountService.WebResto] = { icon: Utensils, name: "Web Resto" },
    _a[AccountService.Turboself] = { icon: Utensils, name: "Turboself" },
    _a[AccountService.ARD] = { icon: Utensils, name: "ARD" },
    _a[AccountService.Izly] = { icon: Utensils, name: "Izly" },
    _a[AccountService.Alise] = { icon: Utensils, name: "Alise" },
    _a[AccountService.Parcoursup] = { icon: BookmarkMinus, name: "Parcoursup" },
    _a[AccountService.Onisep] = { icon: Compass, name: "Onisep" },
    _a[AccountService.Local] = { icon: GraduationCap, name: "Local" },
    _a[AccountService.Multi] = { icon: GraduationCap, name: "Polytechnique Hauts-de-France" },
    _a[AccountService.PapillonMultiService] = { icon: GraduationCap, name: "Environnement virtuel Papillon" },
    _a);
var SettingsExternalServices = function (_a) {
    var navigation = _a.navigation;
    var theme = useTheme();
    var accounts = useAccounts(function (state) { return state.accounts; });
    var removeAccount = useAccounts(function (state) { return state.remove; });
    var showAlert = useAlert().showAlert;
    var getServiceIcon = function (service) {
        var _a;
        var IconComponent = ((_a = serviceConfig[service]) === null || _a === void 0 ? void 0 : _a.icon) || GraduationCap;
        return <IconComponent />;
    };
    var getServiceName = function (service) {
        var _a;
        return ((_a = serviceConfig[service]) === null || _a === void 0 ? void 0 : _a.name) || "Unknown Service";
    };
    var showAccountInfo = function (account) {
        var info = "Service : ".concat(getServiceName(account.service), "\n");
        info += "Identifiant : ".concat(account.username || "N. not", "\n");
        info += "\u00C9tablissement : ".concat(account.authentication.schoolID || "N. not", "\n");
        showAlert({
            title: "Informations du compte",
            message: info,
            icon: <BadgeInfo />,
            actions: [
                {
                    title: "OK",
                    icon: <Check />,
                    primary: false,
                },
                {
                    title: "Supprimer",
                    icon: <Trash2 />,
                    onPress: function () { return removeAccount(account.localID); },
                    danger: true,
                    delayDisable: 3,
                },
            ]
        });
    };
    var filteredAccounts = accounts.filter(function (acc, index) {
        if (acc.isExternal) {
            return true;
        }
        return false;
    });
    return (<ScrollView contentContainerStyle={{
            paddingHorizontal: 16,
        }}>
      <ExternalServicesContainerCard theme={theme}/>

      <View>
        <NativeList>
          <NativeItem onPress={function () {
            navigation.navigate("ExternalAccountSelector");
        }} leading={<NativeIcon icon={<Utensils />} color={"#006B6B"}/>}>
            <NativeText variant="title">Ajouter une cantine</NativeText>
          </NativeItem>
        </NativeList>
      </View>

      {filteredAccounts.length > 0 && (<View>
          <NativeListHeader label="Comptes externes"/>
          <NativeList>
            {filteredAccounts.map(function (account) {
                var _a, _b;
                return (<NativeItem key={account.localID} onPress={function () { return showAccountInfo(account); }} leading={<NativeIcon icon={getServiceIcon(account.service)} color={"#006B6B"}/>}>
                <View>
                  <NativeText variant="title">{getServiceName(account.service)}</NativeText>
                  <NativeText variant="subtitle">
                    {account.isExternal ? account.username : "".concat((_a = account.studentName) === null || _a === void 0 ? void 0 : _a.first, " ").concat((_b = account.studentName) === null || _b === void 0 ? void 0 : _b.last)}
                  </NativeText>
                </View>
              </NativeItem>);
            })}
          </NativeList>
        </View>)}
    </ScrollView>);
};
export default SettingsExternalServices;
