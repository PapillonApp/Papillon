import type { RouteParameters, Screen } from "@/router/helpers/types";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import screens from ".";
import { navigatorScreenOptions } from "@/router/helpers/create-screen";

export const SettingsStack = createNativeStackNavigator<RouteParameters>();
export const SettingsScreen: Screen<"SettingStack"> = ({ route }) => {
  return (
    <SettingsStack.Navigator screenOptions={navigatorScreenOptions}>
      {screens.map((screen) => (
        // @ts-expect-error : type not compatible, but it works fine.
        <SettingsStack.Screen
          key={screen.name+"_tabrt5"}
          {...screen}
          initialParams={{ ...route.params }}
        />
      ))}
    </SettingsStack.Navigator>
  );
};
