import React from "react";
import type { Screen } from "@/router/helpers/types";

import {ScrollView} from "react-native-gesture-handler";
import {NativeItem, NativeList, NativeListHeader, NativeText} from "@/components/Global/NativeComponents";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import { INSTANCES } from "appscho";


export const AppschoUniversities: Screen<"AppschoUniversities"> = ({ navigation }) => {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingTop: 0 }}
    >
      <NativeListHeader label="Autres Universités" />
      <NativeList>
        {INSTANCES.map((university) => (
          <NativeItem
            key={university.id}
            onPress={() => navigation.navigate("Appscho_Login", {
              instanceID: university.id,
              title: university.name,
              image: require("@/../assets/images/service_appscho.png"),
            })}
          >
            <NativeText variant="title">{university.name}</NativeText>
          </NativeItem>
        ))}
      </NativeList>
      <InsetsBottomView />
    </ScrollView>
  );
};

export default AppschoUniversities;