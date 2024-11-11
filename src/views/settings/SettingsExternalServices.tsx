import React from "react";
import { ScrollView, View, Alert } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { useTheme } from "@react-navigation/native";
import { GraduationCap, Utensils, BookOpen, Building, School, BookmarkMinus, Compass } from "lucide-react-native";
import ExternalServicesContainerCard from "@/components/Settings/ExternalServicesContainerCard";
import {
  NativeList,
  NativeIcon,
  NativeItem,
  NativeListHeader,
  NativeText,
} from "@/components/Global/NativeComponents";
import { AccountService } from "@/stores/account/types";
import { useAccounts, useCurrentAccount } from "@/stores/account";

const serviceConfig = {
  [AccountService.Pronote]: { icon: GraduationCap, name: "Pronote" },
  [AccountService.EcoleDirecte]: { icon: BookOpen, name: "École Directe" },
  [AccountService.Skolengo]: { icon: School, name: "Skolengo" },
  [AccountService.WebResto]: { icon: Utensils, name: "Web Resto" },
  [AccountService.Turboself]: { icon: Utensils, name: "Turboself" },
  [AccountService.ARD]: { icon: Utensils, name: "ARD" },
  [AccountService.Izly]: { icon: Utensils, name: "Izly" },
  [AccountService.Parcoursup]: { icon: BookmarkMinus, name: "Parcoursup" },
  [AccountService.Onisep]: { icon: Compass, name: "Onisep" },
  [AccountService.Local]: { icon: GraduationCap, name: "Local" },
  [AccountService.Multi]: { icon: GraduationCap, name: "Polytechnique Hauts-de-France" }
};

const SettingsExternalServices: Screen<"SettingsExternalServices"> = ({
  navigation,
}) => {
  const theme = useTheme();
  const accounts = useAccounts((state) => state.accounts);
  const removeAccount = useAccounts((state) => state.remove);

  const getServiceIcon = (service: AccountService) => {
    const IconComponent = serviceConfig[service]?.icon || GraduationCap;
    return <IconComponent />;
  };

  const getServiceName = (service: AccountService) => {
    return serviceConfig[service]?.name || "Unknown Service";
  };

  const showAccountInfo = (account: any) => {
    let info = `Service: ${getServiceName(account.service)}\n`;
    info += `ID: ${account.username || "N. not"}\n`;
    info += `School ID: ${account.authentication.schoolID || "N. not"}\n`;



    Alert.alert(
      "Informations du compte",
      info,
      [
        { text: "OK", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => confirmDeleteAccount(account)
        }
      ]
    );
  };

  const confirmDeleteAccount = (account: any) => {
    Alert.alert(
      "Supprimer le compte",
      "Êtes-vous sûr de vouloir supprimer ce compte ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => deleteAccount(account.localID)
        }
      ]
    );
  };

  const deleteAccount = (localID: string) => {
    removeAccount(localID);
  };

  const filteredAccounts = accounts.filter((acc, index) => !(index === 0 && acc.service === AccountService.Pronote));

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
