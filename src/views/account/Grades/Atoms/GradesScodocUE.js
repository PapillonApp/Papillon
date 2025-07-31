var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import AnimatedNumber from "@/components/Global/AnimatedNumber";
import { NativeItem, NativeList, NativeListHeader, NativeText } from "@/components/Global/NativeComponents";
import { useAlert } from "@/providers/AlertProvider";
import { anim2Papillon } from "@/utils/ui/animations";
import { adjustColor } from "@/utils/ui/colors";
import { defaultProfilePicture } from "@/utils/ui/default-profile-picture";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";
import { ChevronDown, ChevronUp, Info } from "lucide-react-native";
import { memo, useState, useMemo, useCallback } from "react";
import { Image, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import Reanimated, { FadeIn, FadeInDown, FadeOut, FadeOutUp, LinearTransition } from "react-native-reanimated";
var GradesScodocUE = memo(function (_a) {
    var _b, _c;
    var account = _a.account, navigation = _a.navigation, selectedPeriod = _a.selectedPeriod;
    var theme = useTheme();
    var colors = theme.colors;
    var showAlert = useAlert().showAlert;
    var data = account.serviceData.semestres;
    // @ts-expect-error
    var grades = data[selectedPeriod];
    var ues = grades["relevé"]["ues"];
    var uekeys = Object.keys(ues);
    if (uekeys.length === 0)
        return null;
    var ressources = grades["relevé"]["ressources"];
    var saes = grades["relevé"]["saes"];
    var finalUes = useMemo(function () { return uekeys.map(function (ue) { return (__assign({ name: ue }, ues[ue])); }); }, [uekeys, ues]);
    var handleAlert = useCallback(function () {
        var _a;
        return showAlert({
            title: "Unités d'enseignement",
            message: "Les donn\u00E9es, rangs et notes sont fournies par les services de ".concat((_a = account.identityProvider) === null || _a === void 0 ? void 0 : _a.name, "."),
            icon: <Info />,
        });
    }, [(_b = account.identityProvider) === null || _b === void 0 ? void 0 : _b.name, showAlert]);
    return (<Reanimated.View layout={anim2Papillon(LinearTransition)} entering={anim2Papillon(FadeInDown).duration(300)} exiting={anim2Papillon(FadeOutUp).duration(100)}>
      <NativeListHeader animated label="Unités d'enseignement" style={{
            marginTop: 16,
            marginBottom: -14,
        }} trailing={<TouchableOpacity style={{
                width: 24,
                height: 24,
            }} onPress={handleAlert}>
            <Image style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                borderColor: colors.text + "32",
                borderWidth: 1,
            }} source={defaultProfilePicture(account.service, ((_c = account.identityProvider) === null || _c === void 0 ? void 0 : _c.name) || "")}/>
          </TouchableOpacity>}/>

      <NativeList animated layout={anim2Papillon(LinearTransition)}>
        {finalUes.map(function (ue, i) {
            var _a;
            var _b = useState(false), opened = _b[0], setOpened = _b[1];
            var grades = useMemo(function () {
                var result = [];
                Object.keys(ue.ressources).forEach(function (res) { return result.push({ key: res, type: "ressources" }); });
                Object.keys(ue.saes).forEach(function (sae) { return result.push({ key: sae, type: "saes" }); });
                return result;
            }, [ue.ressources, ue.saes]);
            var navigateToSubject = useCallback(function () {
                navigation.navigate("GradeSubject", { subject: {
                        average: {
                            subjectName: ue.name + " > " + ue.titre,
                            average: { value: parseFloat(ue.moyenne.value) },
                            classAverage: { value: parseFloat(ue.moyenne.moy) },
                            min: { value: parseFloat(ue.moyenne.min) },
                            max: { value: parseFloat(ue.moyenne.max) },
                            outOf: { value: 20 },
                        },
                        rank: {
                            value: ue.moyenne.rang,
                            outOf: ue.moyenne.total,
                        }
                    } });
            }, [navigation, ue]);
            var ueColor = adjustColor(ue.color, theme.dark ? 180 : -100);
            var backgroundColor = (ue.color || colors.primary) + "26";
            var borderColor = ueColor + "32";
            return (<View key={"".concat((_a = ue.name) !== null && _a !== void 0 ? _a : ue.moyenne.value, "-ue:").concat(i)}>
              <NativeItem chevron={false} style={{ backgroundColor: backgroundColor }} leading={<TouchableOpacity style={{
                        width: 48,
                        height: 30,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        borderColor: borderColor,
                        borderWidth: 1,
                    }} onPress={navigateToSubject}>
                    <NativeText variant="subtitle" style={{ color: ueColor }}>
                      {ue.name}
                    </NativeText>
                  </TouchableOpacity>} trailing={<View style={{ flexDirection: "row", alignItems: "center", gap: 0, marginLeft: 6 }}>
                    <TouchableOpacity onPress={navigateToSubject}>
                      <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
                        <AnimatedNumber value={ue.moyenne.value} style={{
                        fontSize: 18,
                        lineHeight: 20,
                        fontFamily: "semibold",
                    }} contentContainerStyle={null}/>
                        <NativeText style={{ fontSize: 15, lineHeight: 15, opacity: 0.6 }}>
                          /20
                        </NativeText>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={function () { return setOpened(!opened); }} style={{ zIndex: 1000, padding: 8 }}>
                      <Reanimated.View key={"openUE-".concat(opened)} entering={FadeIn.duration(100)} exiting={FadeOut.duration(100)}>
                        {opened ? <ChevronUp opacity={0.7} size={24} color={colors.text}/> : <ChevronDown opacity={0.7} size={24} color={colors.text}/>}
                      </Reanimated.View>
                    </TouchableOpacity>
                  </View>}>
                <TouchableOpacity onPress={function () { return setOpened(!opened); }}>
                  <NativeText variant="body" numberOfLines={2} style={{ color: ueColor }}>
                    {ue.titre}
                  </NativeText>
                </TouchableOpacity>
              </NativeItem>

              {opened && grades.map(function (gra, i) {
                    var _a;
                    return (<NativeItem key={"".concat(gra.key, "-grade:").concat(i, "-ue:").concat((_a = ue.name) !== null && _a !== void 0 ? _a : ue.moyenne.value)} separator={i !== grades.length - 1} entering={i < 16 ? anim2Papillon(FadeInDown).delay(40 * i) : FadeIn.duration(100)} exiting={FadeOut.duration(100)} leading={<NativeText variant="subtitle" style={{ width: 48 }} numberOfLines={2}>
                      {gra.key}
                    </NativeText>} trailing={<View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginHorizontal: 6 }}>
                      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "flex-end", gap: 2, marginHorizontal: 6 }}>
                        <NativeText variant="title">
                          {ue[gra.type][gra.key].moyenne}
                        </NativeText>
                        <NativeText variant="subtitle">
                          /20
                        </NativeText>
                      </View>

                      <View style={{ width: 50, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                        <NativeText variant="body" style={{
                                alignSelf: "flex-end",
                                fontSize: 14,
                                fontFamily: "semibold",
                                color: colors.primary,
                                paddingVertical: 2,
                                paddingHorizontal: 6,
                                borderRadius: 7,
                                overflow: "hidden",
                                backgroundColor: colors.primary + "26",
                            }} numberOfLines={1}>
                          x{ue[gra.type][gra.key].coef}
                        </NativeText>
                      </View>
                    </View>}>
                  <NativeText numberOfLines={2} variant="body">
                    {gra.type === "ressources" ? ressources[gra.key].titre : saes[gra.key].titre}
                  </NativeText>
                </NativeItem>);
                })}
            </View>);
        })}
      </NativeList>
    </Reanimated.View>);
});
export default GradesScodocUE;
