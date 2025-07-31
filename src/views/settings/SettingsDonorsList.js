import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";
import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";
import datasets from "@/consts/datasets.json";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import PapillonSpinner from "@/components/Global/PapillonSpinner";
var SettingsDonorsList = function () {
    var _a = React.useState(true), loading = _a[0], setLoading = _a[1];
    var _b = React.useState([]), donors = _b[0], setDonors = _b[1];
    var _c = React.useState(0), totalDonations = _c[0], setTotalDonations = _c[1];
    useEffect(function () {
        fetch(datasets["kofi-supporters"])
            .then(function (response) { return response.json(); })
            .then(function (data) {
            setDonors(data.sort(function (a, b) { return parseInt(b.Total) - parseInt(a.Total); }));
            var total = data.reduce(function (acc, donor) { return acc + parseFloat(donor.Total); }, 0);
            setTotalDonations(total);
            setLoading(false);
        });
    }, []);
    return (<Reanimated.ScrollView style={{
            padding: 16,
            paddingTop: 0,
        }}>
      <NativeList inline animated>
        <View style={{
            backgroundColor: "#f1c40f15",
            height: 120,
            alignItems: "center",
            justifyContent: "center",
        }}>
          <Text style={{
            fontSize: 56,
        }}>
            💸❤️
          </Text>
        </View>
        <NativeItem animated>
          <NativeText variant="title">
            Merci à tous les donateurs qui soutiennent l'application !
          </NativeText>
          <NativeText variant="subtitle">
            Grâce à eux, l'application peut survivre et bénéficier de meilleures conditions pour évoluer jour après jour.
          </NativeText>
        </NativeItem>
      </NativeList>



      {loading && (<NativeList inline animated entering={FadeIn} exiting={FadeOut}>
          <NativeItem leading={<PapillonSpinner size={20} strokeWidth={3}/>}>
            <NativeText>
              Chargement des donateurs...
            </NativeText>
          </NativeItem>
        </NativeList>)}

      {!loading && (<NativeList inline animated entering={FadeIn} exiting={FadeOut}>
          <NativeItem endPadding={16} leading={<Text style={{
                    fontSize: 24,
                }}>
                💰
              </Text>} trailing={<NativeText variant="body" style={{
                    color: "#2ecc71",
                    fontFamily: "semibold",
                    fontSize: 22,
                    lineHeight: 28,
                }}>
                {totalDonations.toFixed(2)} €
              </NativeText>}>
            <NativeText variant="title">
              Total des dons
            </NativeText>
            <NativeText variant="subtitle">
              Votre soutien fait la différence !
            </NativeText>
          </NativeItem>
        </NativeList>)}

      {!loading && donors.length > 0 && (<NativeList inline animated entering={FadeIn} exiting={FadeOut}>
          {donors.map(function (donor, index) { return (<NativeItem key={index} endPadding={16} leading={<Text style={{
                        fontSize: 20,
                    }}>
                  🫶
                </Text>} trailing={<NativeText variant="body" style={[
                        parseFloat(donor.Total) > 15 ? {
                            color: "#2ecc71",
                            fontFamily: "semibold",
                            fontSize: 18,
                        } : {},
                    ]}>
                  {parseFloat(donor.Total).toFixed(2)} €
                </NativeText>}>
              <NativeText variant="title">
                {donor.Name}
              </NativeText>
              {donor.DiscordUsername && (<NativeText variant="subtitle">
                  @{donor.DiscordUsername.split("#")[0]}
                </NativeText>)}
            </NativeItem>); })}
        </NativeList>)}

      <InsetsBottomView />

    </Reanimated.ScrollView>);
};
export default SettingsDonorsList;
