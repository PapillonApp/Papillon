import React from "react";
import { View } from "react-native";
import { NativeItem, NativeList, NativeText } from "../Global/NativeComponents";
import { MessageCircleQuestion } from "lucide-react-native";
var SupportContainerCard = function (_a) {
    var theme = _a.theme;
    var colors = theme.colors;
    return (<NativeList>
      <View style={{
            height: 120,
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            backgroundColor: colors.primary + "22",
        }}>
        <MessageCircleQuestion color={colors.primary} size={80}/>
      </View>
      <NativeItem>
        <NativeText variant="title">
          Un problème, une question ?
        </NativeText>
        <NativeText variant="subtitle">
          Laisse-nous un message depuis cette page et nous te répondrons par e-mail dans les plus brefs délais !
        </NativeText>
      </NativeItem>
    </NativeList>);
};
export default SupportContainerCard;
