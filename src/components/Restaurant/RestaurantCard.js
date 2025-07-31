import { View } from "react-native";
import { NativeText } from "../Global/NativeComponents";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import AnimatedNumber from "../Global/AnimatedNumber";
import { Utensils } from "lucide-react-native";
var RestaurantCard = function (_a) {
    var solde = _a.solde, repas = _a.repas;
    var theme = useTheme();
    var colors = theme.colors;
    return (<View style={{
            gap: 3,
            paddingVertical: 16,
            paddingBottom: 14,
            borderRadius: 12,
            borderCurve: "continuous",
            backgroundColor: colors.primary + "16",
        }}>
      <NativeText style={{
            fontSize: 14,
            fontFamily: "medium",
            color: colors.text,
            letterSpacing: 1,
            textTransform: "uppercase",
            textAlign: "center",
            opacity: 0.5,
        }}>
        Solde
      </NativeText>
      <View style={{
            flexDirection: "row",
            gap: 6,
            justifyContent: "center"
        }}>
        <AnimatedNumber value={solde.toFixed(2).split(".")[0]} style={{
            fontSize: 36,
            lineHeight: 36,
            color: colors.primary,
            fontFamily: "medium",
        }}/>
        <AnimatedNumber value={"." + solde.toFixed(2).split(".")[1] + " €"} style={{
            fontSize: 28,
            lineHeight: 28,
            color: colors.primary,
            fontFamily: "medium",
        }} contentContainerStyle={{
            marginBottom: 0,
        }}/>
      </View>

      {repas !== null && repas !== Infinity && (<View style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: 8,
                borderCurve: "continuous",
                borderColor: colors.primary,
                borderWidth: 1,
                alignSelf: "center",
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 300,
                alignItems: "center",
                gap: 8,
            }}>
          <Utensils size={16} strokeWidth={2.5} color={colors.primary}/>

          <NativeText style={{
                fontSize: 14,
                fontFamily: "medium",
                color: colors.primary,
            }}>
            {repas} repas restants
          </NativeText>
        </View>)}
    </View>);
};
export default RestaurantCard;
