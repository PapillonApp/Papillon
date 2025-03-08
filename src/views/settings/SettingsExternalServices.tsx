import React from "react";
import { ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { GraduationCap, Utensils, BookOpen, School, BookmarkMinus, Compass, Check, Trash2, Undo2, BadgeInfo, BadgeHelp } from "lucide-react-native";
import ExternalServicesContainerCard from "@/components/Settings/ExternalServicesContainerCard";
import {
  NativeList,
  NativeIcon,
  NativeItem,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { AccountService } from "@/stores/account/types";
import { useAccounts } from "@/stores/account";
import { useAlert } from "@/providers/AlertProvider";

const serviceConfig = {
  [AccountService.Pronote]: { icon: GraduationCap, name: "Pronote" },
  [AccountService.EcoleDirecte]: { icon: BookOpen, name: "École Directe" },
  [AccountService.Skolengo]: { icon: School, name: "Skolengo" },
  [AccountService.WebResto]: { icon: Utensils, name: "Web Resto" },
  [AccountService.Turboself]: { icon: Utensils, name: "Turboself" },
  [AccountService.ARD]: { icon: Utensils, name: "ARD" },
  [AccountService.Izly]: { icon: Utensils, name: "Izly" },
  [AccountService.Alise]: { icon: Utensils, name: "Alise" },
  [AccountService.Parcoursup]: { icon: BookmarkMinus, name: "Parcoursup" },
  [AccountService.Onisep]: { icon: Compass, name: "Onisep" },
  [AccountService.Local]: { icon: GraduationCap, name: "Local" },
  [AccountService.Multi]: { icon: GraduationCap, name: "Polytechnique Hauts-de-France" },
  [AccountService.PapillonMultiService]: { icon: GraduationCap, name: "Environnement virtuel Papillon" }
};

const SettingsExternalServices: Screen<"SettingsExternalServices"> = ({
  navigation,
}) => {
  const theme = useTheme();
  const accounts = useAccounts((state) => state.accounts);
  const removeAccount = useAccounts((state) => state.remove);
  const { showAlert } = useAlert();

  const getServiceIcon = (service: AccountService) => {
    const IconComponent = serviceConfig[service]?.icon || GraduationCap;
    return <IconComponent />;
  };

  const getServiceName = (service: AccountService) => {
    return serviceConfig[service]?.name || "Unknown Service";
  };

  const showAccountInfo = (account: any) => {
    let info = `Service : ${getServiceName(account.service)}\n`;
    info += `Identifiant : ${account.username || "N. not"}\n`;
    info += `Établissement : ${account.authentication.schoolID || "N. not"}\n`;


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
          onPress: () => confirmDeleteAccount(account),
          danger: true,
        },
      ]
    });
  };

  const confirmDeleteAccount = (account: any) => {
    showAlert({
      title: "Supprimer le compte",
      message: "Es-tu sûr de vouloir supprimer ce compte ?",
      icon: <BadgeHelp />,
      actions: [
        {
          title: "Annuler",
          icon: <Undo2 />,
          primary: false,
        },
        {
          title: "Confirmer",
          icon: <Trash2 />,
          onPress: () => removeAccount(account.localID),
          danger: true,
          delayDisable: 5,
        }
      ]
    });
  };

  const filteredAccounts = accounts.filter((acc, index) => {
    if (acc.isExternal) {
      return true;
    }
    return false;
  });

  return (
    <ScrollView
      contentContainerStyle={{
        paddingHorizontal: 16,
      }}
    >
      <ExternalServicesContainerCard theme={theme} />

      <View>
        <NativeList>
          <NativeItem
            onPress={() => {
              navigation.navigate("ExternalAccountSelector");
            }}
            leading={
              <NativeIcon
                icon={<Utensils />}
                color={"#006B6B"}
              />}
          >
            <NativeText variant="title">Ajouter une cantine</NativeText>
          </NativeItem>
        </NativeList>
      </View>

      {filteredAccounts.length > 0 && (
        <View>
          <NativeListHeader
            label="Comptes externes"
          />
          <NativeList>
            {filteredAccounts.map((account) => (
              <NativeItem
                key={account.localID}
                onPress={() => showAccountInfo(account)}
                leading={
                  <NativeIcon
                    icon={getServiceIcon(account.service)}
                    color={"#006B6B"}
                  />
                }
              >
                <View>
                  <NativeText variant="title">{getServiceName(account.service)}</NativeText>
                  <NativeText variant="subtitle">
                    {account.isExternal ? account.username : `${account.studentName?.first} ${account.studentName?.last}`}
                  </NativeText>
                </View>
              </NativeItem>
            ))}
          </NativeList>
        </View>
      )}
    </ScrollView>
  );
};

export default SettingsExternalServices;
