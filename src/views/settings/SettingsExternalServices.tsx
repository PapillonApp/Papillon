import React from "react";
import { ScrollView, View } from "react-native";
import type { Screen } from "@/router/helpers/types";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { GraduationCap, Check, Trash2, BadgeInfo } from "lucide-react-native";
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
  [AccountService.Local]: { icon: GraduationCap, name: "Local" }
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
          onPress: () => removeAccount(account.localID),
          danger: true,
          delayDisable: 3,
        },
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
          <NativeText variant="title" style={{ textAlign: "center", margin: 20, opacity: 0.5 }}>
            Services externes non disponibles dans cette version
          </NativeText>
        </NativeList>
      </View>
    </ScrollView>
  );
};

export default SettingsExternalServices;
