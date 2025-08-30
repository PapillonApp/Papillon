import { getManager } from "@/services/shared";
import { Balance } from "@/services/shared/balance";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { getServiceBackground, getServiceLogo, getServiceName } from "@/utils/services/helper";
import { Papicons, Plus } from "@getpapillon/papicons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
export { getServiceName } from "@/utils/services/helper"

export default function QRCodeAndCardsPage() {
  const [wallets, setWallets] = useState<Balance[]>([]);
  const store = useAccountStore.getState()
  const account = store.accounts.find(account => account.id === store.lastUsedAccount)
  const selfCompatible = account?.services.filter(
    service => [Services.TURBOSELF, Services.ARD, Services.IZLY].includes(service.serviceId)
  );

  async function fetchWallets() {
    const manager = getManager()
    const balances = await manager.getCanteenBalances()
    const result: Balance[] = []
    for (const balance of balances) {
      result.push(balance)
    }
    setWallets(result);
  }

  useEffect(() => {
    fetchWallets();
  }, [])

  const cardOffset = 60;
  const cardHeight = 210;

  const pileHeight = cardHeight + (wallets.length - 1) * cardOffset;

  return (
    <>
      <View style={{ padding: 20, flex: 1 }}>
        {selfCompatible && selfCompatible?.length > 0 ? (
          <>
            <View style={{ position: "relative", height: pileHeight }}>
              {wallets.map((c, i) => (
                <Card
                  key={c.createdByAccount + c.label}
                  index={i}
                  wallet={c}
                  service={account?.services.find(service => service.id === c.createdByAccount)?.serviceId ?? Services.TURBOSELF}
                />
              ))}
            </View>

            <View style={{ width: "100%", flex: 1, alignItems: "center", marginTop: 40 }}>
              <Button
                inline
                title="Ajouter"
                icon={<Plus />}
                onPress={() => {
                  router.dismiss();
                  router.push({
                    pathname: "/(onboarding)/restaurants/method",
                    params: { action: "addService" }
                  });
                }}
              />
            </View>
          </>
        ) : (
          <Stack
            hAlign="center"
            vAlign="center"
            margin={16}
            gap={16}
          >
            <View
              style={{
                alignItems: "center"
              }}
            >
              <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
                <Papicons name={"Card"} />
              </Icon>
              <Typography variant="h4" color="text" align="center">
                Aucune carte
              </Typography>
              <Typography variant="body2" color="secondary" align="center">
                Ajoute en-une pour accéder à ton solde de cantine, scanner ton QR-Code et plus encore
              </Typography>
            </View>
            <Button title="Ajouter" icon={<Papicons name={"Plus"} />} onPress={() => {
              router.dismiss();
              router.push({
                pathname: "/(onboarding)/restaurants/method",
                params: { action: "addService" }
              });
            }} />
          </Stack>
        )}
      </View>

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => router.back()}>
          <Icon papicon opacity={0.5}>
            <Papicons name="Cross" />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderTitle>
        <Typography>QR-Code et cartes</Typography>
      </NativeHeaderTitle>
    </>
  );
}

export function Card({
  index = 0,
  wallet,
  service,
  disabled,
  inSpecificView = false
}: {
  index: number;
  wallet: Balance;
  service: Services;
  disabled?: boolean;
  inSpecificView?: boolean;
}) {
  const offset = index * 60;

  return (
    <Pressable
      onPress={() => {
        if (!disabled) {
          router.push({
            pathname: "/(features)/(cards)/specific",
            params: { serviceName: getServiceName(service), service: service, wallet: JSON.stringify(wallet) }
          });
        }
      }}
      style={{
        width: "100%",
        minHeight: 235,
        borderRadius: 25,
        backgroundColor: "green",
        overflow: "hidden",
        transform: [{ translateY: offset }],
        zIndex: 100 + index,
        position: inSpecificView ? undefined : "absolute",
        top: 0,
        left: 0,
        right: 0,
      }}
    >
      <Image
        source={getServiceBackground(service)}
        style={{
          position: "absolute",
          top: -5,
          bottom: 0,
          right: 0,
          left: 0,
          width: "100%",
          height: 245,
        }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["#00000080", "transparent"]}
        locations={[0, 0.87]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <View style={{ padding: 15, flex: 1 }}>
        <Stack
          direction="horizontal"
          style={{ justifyContent: "space-between" }}
        >
          <Stack direction="horizontal" hAlign="center">
            <Image
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#0000001F",
              }}
              source={getServiceLogo(service)}
              resizeMode="cover"
            />
            <Typography color={"#FFFFFF"}>{getServiceName(service)}</Typography>
          </Stack>

          <Stack gap={0} direction="vertical">
            <Typography align="right" color={"#FFFFFF" + 90} style={{ width: "100%", lineHeight: 0 }}>
              {wallet.label}
            </Typography>
            <Typography align="right" color={"#FFFFFF"} style={{ width: "100%", lineHeight: 0 }}>
              {(wallet.amount / 100).toFixed(2)} {wallet.currency}
            </Typography>
          </Stack>
        </Stack>
      </View>
    </Pressable>
  )
}
