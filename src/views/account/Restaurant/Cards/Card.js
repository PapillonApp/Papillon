import { View, Text, StyleSheet, Image } from "react-native";
import { formatCardIdentifier } from "@/utils/external/restaurant";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { PressableScale } from "react-native-pressable-scale";
var MenuCard = function (_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var card = _a.card, onPress = _a.onPress;
    var theme = useTheme();
    return (<PressableScale weight="light" activeScale={0.95} onPress={onPress}>
      <View style={[
            styles.card,
            {
                borderColor: theme.colors.text + "33",
                borderWidth: 1,
                backgroundColor: (_c = (_b = card === null || card === void 0 ? void 0 : card.theme) === null || _b === void 0 ? void 0 : _b.colors) === null || _c === void 0 ? void 0 : _c.background,
                shadowColor: (_e = (_d = card === null || card === void 0 ? void 0 : card.theme) === null || _d === void 0 ? void 0 : _d.colors) === null || _e === void 0 ? void 0 : _e.background
            }
        ]}>
        <View style={[
            styles.cardHeader,
        ]}>
          <Image source={defaultProfilePicture(card.service)} style={[styles.cardHeaderIcon]}/>
          <Text style={[styles.cardHeaderName, { color: (_g = (_f = card === null || card === void 0 ? void 0 : card.theme) === null || _f === void 0 ? void 0 : _f.colors) === null || _g === void 0 ? void 0 : _g.text }]}>
            {(_h = card === null || card === void 0 ? void 0 : card.theme) === null || _h === void 0 ? void 0 : _h.name}
          </Text>
          <View style={[styles.cardBalances]}>
            {(_j = card.balance) === null || _j === void 0 ? void 0 : _j.filter(function (balance) { return !!balance.amount; }).map(function (balance, index) {
            var _a, _b, _c, _d;
            return (<View key={index} style={[styles.cardBalance]}>
                  <Text style={[styles.cardBalanceTitle, { color: (_b = (_a = card === null || card === void 0 ? void 0 : card.theme) === null || _a === void 0 ? void 0 : _a.colors) === null || _b === void 0 ? void 0 : _b.accent }]}>
                    {balance.label}
                  </Text>
                  <Text style={[styles.cardBalanceValue, { color: (_d = (_c = card === null || card === void 0 ? void 0 : card.theme) === null || _c === void 0 ? void 0 : _c.colors) === null || _d === void 0 ? void 0 : _d.text }]}>
                    {balance.amount.toFixed(2) + " €"}
                  </Text>
                </View>);
        })}
          </View>
        </View>

        {card.identifier && (<Text style={[
                styles.cardFloatingIdentifier,
                { color: (_l = (_k = card === null || card === void 0 ? void 0 : card.theme) === null || _k === void 0 ? void 0 : _k.colors) === null || _l === void 0 ? void 0 : _l.text }
            ]}>
            {formatCardIdentifier((_m = card.account) === null || _m === void 0 ? void 0 : _m.localID)}
          </Text>)}

        {((_o = card === null || card === void 0 ? void 0 : card.theme) === null || _o === void 0 ? void 0 : _o.background) && (<Image source={(_p = card === null || card === void 0 ? void 0 : card.theme) === null || _p === void 0 ? void 0 : _p.background} style={styles.image}/>)}
      </View>
    </PressableScale>);
};
var styles = StyleSheet.create({
    card: {
        width: "100%",
        aspectRatio: 36 / 21,
        borderRadius: 12,
        borderCurve: "continuous",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 6,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },
    image: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        borderRadius: 12,
        borderCurve: "continuous",
    },
    cardHeader: {
        width: "100%",
        padding: 10,
        flexDirection: "row",
        gap: 10,
    },
    cardBalances: {
        gap: 5
    },
    cardHeaderName: {
        fontSize: 16,
        fontFamily: "semibold",
        flex: 1,
        marginTop: 9,
    },
    cardHeaderIcon: {
        width: 36,
        height: 36,
        borderRadius: 6,
        borderCurve: "continuous",
        overflow: "hidden",
    },
    cardBalance: {
        alignItems: "flex-end",
        gap: 2,
    },
    cardBalanceTitle: {
        fontSize: 12,
        fontFamily: "semibold",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    cardBalanceValue: {
        fontSize: 18,
        fontFamily: "semibold",
        letterSpacing: 0.5,
    },
    cardFloatingIdentifier: {
        position: "absolute",
        bottom: 16,
        left: 16,
        fontSize: 15,
        letterSpacing: 1.5,
        fontFamily: "medium",
        opacity: 0.5,
    },
});
export default MenuCard;
