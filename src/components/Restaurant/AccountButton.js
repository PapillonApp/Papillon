import { Coffee, Utensils } from "lucide-react-native";
import React from "react";
import { View, TouchableOpacity } from "react-native";
import Reanimated from "react-native-reanimated";
var AnimatedTouchableOpacity = Reanimated.createAnimatedComponent(TouchableOpacity);
var AnimatedView = Reanimated.createAnimatedComponent(View);
var AccountButton = function (_a) {
    var account = _a.account, isSelected = _a.isSelected, onPress = _a.onPress, colors = _a.colors;
    return (<>
      <AnimatedTouchableOpacity onPress={onPress} style={[
            {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isSelected ? colors.primary + "20" : colors.card,
                paddingVertical: 8,
                borderRadius: 10,
                paddingHorizontal: 10,
                gap: 8,
                overflow: "hidden",
            }
        ]}>
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
        }}>
          <Reanimated.View>
            {(account.label).match(/\b(CAFETARIA|SNACK)\b/i) ? (<Coffee color={isSelected ? colors.primary : colors.text} size={20}/>) : (<Utensils color={isSelected ? colors.primary : colors.text} size={20}/>)}
          </Reanimated.View>
          {(<AnimatedView style={[
                {
                    overflow: "hidden",
                }
            ]}>
              <Reanimated.Text numberOfLines={1} style={[
                {
                    fontFamily: "semibold",
                    fontSize: 15.5,
                    color: isSelected ? colors.primary : colors.text,
                }
            ]}>
                {account.label}
              </Reanimated.Text>
            </AnimatedView>)}
        </View>
      </AnimatedTouchableOpacity>
    </>);
};
export default AccountButton;
