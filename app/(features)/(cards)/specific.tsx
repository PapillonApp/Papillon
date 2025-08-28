import { Services } from "@/stores/account/types";
import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import adjust from "@/utils/adjustColor";
import { getServiceColor } from "@/utils/services/helper";
import { Clock, Papicons, QrCode } from "@getpapillon/papicons";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, View } from "react-native";
import { Card } from "./cards";
import AnimatedPressable from "@/ui/components/AnimatedPressable";
import List from "@/ui/components/List";
import Item, { Trailing } from "@/ui/components/Item";
import { Balance } from "@/services/shared/balance";
import { useEffect, useState } from "react";
import { getManager } from "@/services/shared";
import { warn } from "@/utils/logger/logger";
import { CanteenHistoryItem } from "@/services/shared/canteen";
export { getServiceName } from "@/utils/services/helper"

export default function QRCodeAndCardsPage() {
  const search = useLocalSearchParams();
  const serviceName = String(search.serviceName)
  const service = Number(search.service) as Services
  const wallet = JSON.parse(String(search.wallet)) as Balance

  const theme = useTheme();
  const { colors } = theme;

  const header = useHeaderHeight();
  const [history, setHistory] = useState<CanteenHistoryItem[]>([]);
  const [qrcode, setQR] = useState<string>("");

  async function fetchQRCode() {
    const manager = getManager()
    try {
      const qrcode = await manager.getCanteenQRCodes(wallet.createdByAccount)
      setQR(qrcode.data)
    } catch (error) {
      warn(String(error))
    }
  }

  async function fetchHistory() {
    const manager = getManager()
    const history = await manager.getCanteenTransactionsHistory(wallet.createdByAccount)
    setHistory(history)
  }

  useEffect(() => {
    fetchQRCode();
    fetchHistory();
  }, [])

  return (
    <>
      <LinearGradient
        colors={[getServiceColor(service) + 40, colors.background, colors.background, colors.background]}
        locations={[0, 0.87]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <ScrollView>
        <View style={{ padding: 15, paddingTop: header, flex: 1, gap: 20 }}>
          <Card index={0} service={service} wallet={wallet} disabled inSpecificView />
          <AnimatedPressable
            onPress={() => {
              if (qrcode.trim() !== "") {
                router.push({
                  pathname: "/(features)/(cards)/qrcode",
                  params: {
                    qrcode
                  }
                })
              }
            }}
            style={{
              width: "100%",
              backgroundColor: colors.background,
              padding: 33,
              borderRadius: 25,
              borderWidth: 1,
              borderColor: colors.border
            }}>
            <Stack direction="horizontal" hAlign="center" vAlign="center" gap={5}>
              <QrCode />
              <Typography variant="h6">Afficher le QR-Code</Typography>
            </Stack>
          </AnimatedPressable>
          <Stack
            card
            direction="horizontal"
            width={"100%"}
          >
            <Stack
              width={"50%"}
              vAlign="center"
              hAlign="center"
              style={{ borderRightWidth: 1, borderRightColor: colors.border }}
              padding={12}
            >
              <Icon papicon opacity={0.5}>
                <Papicons name={"PiggyBank"} />
              </Icon>
              <Typography color="secondary">
                Solde
              </Typography>
              <ContainedNumber color={adjust(getServiceColor(service), -0.1)}>
                {wallet.amount / 100} {wallet.currency}
              </ContainedNumber>
            </Stack>
            <Stack
              width={"50%"}
              vAlign="center"
              hAlign="center"
              padding={12}
            >
              <Icon papicon opacity={0.5}>
                <Papicons name={"Cutlery"} />
              </Icon>
              <Typography color="secondary">
                Repas restants
              </Typography>
              <ContainedNumber color={adjust(getServiceColor(service), -0.1)}>
                {wallet.lunchRemaining}
              </ContainedNumber>
            </Stack>
          </Stack>
          <View style={{ display: "flex", gap: 13.5 }}>
            <Stack
              direction="horizontal"
              style={{ flex: 1, borderRightWidth: 1, borderRightColor: colors.border }}
              gap={5}
            >
              <Icon papicon opacity={0.5}>
                <Clock />
              </Icon>
              <Typography color="secondary">
                Historique
              </Typography>
            </Stack>
            <List>
              {history.map((c, i) => (
                <HistoryEntry key={c.date.toISOString()} amount={c.amount} currency={c.currency} label={c.label} />
              ))}
            </List>
          </View>
        </View>
      </ScrollView>
      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => { router.back() }}>
          <Icon papicon opacity={0.5}>
            <Papicons name={"Cross"} />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>
      <NativeHeaderTitle>
        <Typography>{serviceName}</Typography>
      </NativeHeaderTitle>
    </>
  )
}

function HistoryEntry({ amount, currency, label }: { amount: number, currency: string, label: string }) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Item>
      <Trailing>
        <ContainedNumber color={adjust(amount < 0 ? "#C50000" : "#42C500", -0.1)}>
          {amount > 0 ? "+" : ""}{amount} {currency}
        </ContainedNumber>
      </Trailing>
      <Typography>{label}</Typography>
      <Stack direction="horizontal" hAlign="center">
        <Typography color="secondary">12/05/2025</Typography>
        <View
          style={{
            height: 4,
            width: 4,
            borderRadius: 2,
            backgroundColor: colors.text + 80
          }}
        />
        <Typography color="secondary">21:47</Typography>
      </Stack>
    </Item>
  )
}