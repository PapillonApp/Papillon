import React from "react";
import { ScrollView, } from "react-native";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PapillonShineBubble from "@/components/FirstInstallation/PapillonShineBubble";
import { NativeItem, NativeList, NativeText, } from "@/components/Global/NativeComponents";
import { AccountService } from "@/stores/account/types";
import { useCurrentAccount } from "@/stores/account";
var ExternalAccountSelectMethod = function (_a) {
    var navigation = _a.navigation, route = _a.route;
    var theme = useTheme();
    var colors = theme.colors;
    var insets = useSafeAreaInsets();
    var account = useCurrentAccount(function (store) { return store.account; });
    return (<ScrollView contentContainerStyle={{
            padding: 16,
        }}>
      <PapillonShineBubble message={"S\u00E9lectionne ta m\u00E9thode de connexion au service ".concat(route.params.service === "Other" ? "(autre)" : AccountService[route.params.service])} width={300} numberOfLines={2} offsetTop={"15%"}/>

      <NativeList>
        {/*
          PRONOTE can be already linked to that account and
          we may have a way to connect using that link directly.
          */}
        {account.service === AccountService.Pronote && (<NativeItem trailing={<Star color={colors.primary} style={{ marginRight: 5 }}/>} disabled>
            <NativeText>
              Connexion automatique via PRONOTE
            </NativeText>
            <NativeText variant="subtitle">
              Disponible prochainement
            </NativeText>
          </NativeItem>)}

        <NativeItem onPress={function () {
            switch (route.params.service) {
                case AccountService.Turboself:
                    navigation.navigate("ExternalTurboselfLogin");
                    break;
                case AccountService.ARD:
                    navigation.navigate("ExternalArdLogin");
                    break;
                case AccountService.Izly:
                    navigation.navigate("ExternalIzlyLogin");
                    break;
                case AccountService.Alise:
                    navigation.navigate("ExternalAliseLogin");
                    break;
            }
        }}>
          <NativeText>
            Connexion manuelle
          </NativeText>
          <NativeText variant="subtitle">
            Entre tes identifiants manuellement
          </NativeText>
        </NativeItem>
      </NativeList>
    </ScrollView>);
};
export default ExternalAccountSelectMethod;
