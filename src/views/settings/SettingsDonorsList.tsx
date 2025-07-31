import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { NativeItem, NativeList, NativeText } from "@/components/Global/NativeComponents";

import Reanimated, { FadeIn, FadeOut } from "react-native-reanimated";

import datasets from "@/consts/datasets.json";
import InsetsBottomView from "@/components/Global/InsetsBottomView";
import PapillonSpinner from "@/components/Global/PapillonSpinner";

const SettingsDonorsList = () => {
  const [loading, setLoading] = React.useState(true);
  const [donors, setDonors] = React.useState<Array<{
    Total: string
    Name: string
    DiscordUsername: string
  }>>([]);
  const [totalDonations, setTotalDonations] = React.useState(0);

  useEffect(() => {
    fetch(datasets["kofi-supporters"])
      .then((response) => response.json())
      .then((data) => {
        setDonors(data.sort((a: any, b: any) => parseInt(b.Total) - parseInt(a.Total)));
        const total = data.reduce((acc: number, donor: any) => acc + parseFloat(donor.Total), 0);
        setTotalDonations(total);
        setLoading(false);
      });
  }, []);

  return (
    <Reanimated.ScrollView
      style={{
        padding: 16,
        paddingTop: 0,
      }}
    >
      <NativeList inline animated>
        <View
          style={{
            backgroundColor: "#f1c40f15",
            height: 120,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 56,
            }}
          >
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



      {loading && (
        <NativeList inline animated
          entering={FadeIn}
          exiting={FadeOut}
        >
          <NativeItem
            leading={
              <PapillonSpinner size={20} strokeWidth={3} />
            }
          >
            <NativeText>
              Chargement des donateurs...
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {!loading && (
        <NativeList inline animated
          entering={FadeIn}
          exiting={FadeOut}
        >
          <NativeItem
            endPadding={16}
            leading={
              <Text
                style={{
                  fontSize: 24,
                }}
              >
                💰
              </Text>
            }
            trailing={
              <NativeText
                variant="body"
                style={{
                  color: "#2ecc71",
                  fontFamily: "semibold",
                  fontSize: 22,
                  lineHeight: 28,
                }}
              >
                {totalDonations.toFixed(2)} €
              </NativeText>
            }
          >
            <NativeText variant="title">
              Total des dons
            </NativeText>
            <NativeText variant="subtitle">
              Votre soutien fait la différence !
            </NativeText>
          </NativeItem>
        </NativeList>
      )}

      {!loading && donors.length > 0 && (
        <NativeList inline animated
          entering={FadeIn}
          exiting={FadeOut}
        >
          {donors.map((donor, index) => (
            <NativeItem
              key={index}
              endPadding={16}

              leading={
                <Text
                  style={{
                    fontSize: 20,
                  }}
                >
                  🫶
                </Text>
              }
              trailing={
                <NativeText
                  variant="body"
                  style={[
                    parseFloat(donor.Total) > 15 ? {
                      color: "#2ecc71",
                      fontFamily: "semibold",
                      fontSize: 18,
                    } : {},
                  ]}
                >
                  {parseFloat(donor.Total).toFixed(2)} €
                </NativeText>
              }
            >
              <NativeText variant="title">
                {donor.Name}
              </NativeText>
              {donor.DiscordUsername && (
                <NativeText variant="subtitle">
                  @{donor.DiscordUsername.split("#")[0]}
                </NativeText>
              )}
            </NativeItem>
          ))}
        </NativeList>
      )}

      <InsetsBottomView />

    </Reanimated.ScrollView>
  );
};

export default SettingsDonorsList;
