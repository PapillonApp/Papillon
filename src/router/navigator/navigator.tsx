import React from "react";
import { BottomTabView } from "@react-navigation/bottom-tabs";
import { createNavigatorFactory, TabRouter, useNavigationBuilder } from "@react-navigation/native";
import PapillonNavigatorTabs from "./tabs";
import { View } from "react-native";
import PapillonNavigatorMenu from "./menu";
import useScreenDimensions from "@/hooks/useScreenDimensions";

const BottomTabNavigator: React.ComponentType<any> = ({
  initialRouteName,
  backBehavior,
  children,
  screenOptions,
  ...rest
}) => {
  const { isTablet } = useScreenDimensions();

  const { state, descriptors, navigation, NavigationContent } = useNavigationBuilder(TabRouter, {
    initialRouteName,
    backBehavior,
    children,
    screenOptions,
  });

  return (
    <NavigationContent>
      <View style={[{ flex: 1 }, isTablet && { flexDirection: "row" }]}>
        {isTablet && (
          <PapillonNavigatorMenu
            state={state}
            descriptors={descriptors}
            navigation={navigation}
          />
        )}
        <BottomTabView
          {...rest}
          state={state}
          navigation={navigation}
          descriptors={descriptors}
        />
        {!isTablet && (
          <PapillonNavigatorTabs
            state={state}
            descriptors={descriptors}
            navigation={navigation}
          />
        )}
      </View>
    </NavigationContent>
  );
};

export default createNavigatorFactory(BottomTabNavigator);
