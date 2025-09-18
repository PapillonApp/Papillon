import { getManager } from "@/services/shared";
import { Balance } from "@/services/shared/balance";
import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide, NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import { getServiceBackground, getServiceLogo, getServiceName } from "@/utils/services/helper";
import { Papicons, Plus } from "@getpapillon/papicons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

export default function QRCodeAndCardsPage() {
  const [wallets, setWallets] = useState<Balance[]>([]);
  const accounts = useAccountStore((state) => state.accounts);
  const lastUsedAccount = useAccountStore((state) => state.lastUsedAccount);

  const account = accounts.find((a) => a.id === lastUsedAccount);

  async function fetchWallets() {
    const manager = getManager()
    const balances = await manager.getCanteenBalances()
    const result: Balance[] = []
    for (const balance of balances) {
      result.push(balance)
    }
    setWallets(result);
  }

  useFocusEffect(
    useCallback(() => {
      fetchWallets();
    }, [])
  );

  const { t } = useTranslation();

  return (
    <>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {wallets && wallets?.length > 0 ? (
          <>
            <View style={{ flexDirection: "column", position: "relative" }}>
              {wallets.map((c, i) => {
                return (
                  <Dynamic
                    animated
                    key={c.createdByAccount + c.label}
                    entering={PapillonAppearIn}
                    exiting={PapillonAppearOut}
                  >
                    <Card
                      key={c.createdByAccount + c.label}
                      index={i}
                      wallet={c}
                      service={account?.services.find(service => service.id === c.createdByAccount)?.serviceId ?? Services.TURBOSELF}
                      totalCards={wallets.length}
                    />
                  </Dynamic>
                );
              })}
            </View>

            <View style={{ width: "100%", flex: 1, alignItems: "center", marginTop: 60 }}>
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
                {t("Settings_Cards_None_Title")}
              </Typography>
              <Typography variant="body2" color="secondary" align="center">
                {t("Settings_Cards_None_Description")}
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
      </ScrollView>

      <NativeHeaderSide side="Left">
        <NativeHeaderPressable onPress={() => router.back()}>
          <Icon papicon opacity={0.5}>
            <Papicons name="Cross" />
          </Icon>
        </NativeHeaderPressable>
      </NativeHeaderSide>

      <NativeHeaderTitle>
        <Typography>{t("Profile_QRCards")}</Typography>
      </NativeHeaderTitle>
    </>
  );
}

export function Card({
  index = 0,
  wallet,
  service,
  disabled,
}: {
  index: number;
  wallet: Balance;
  service: Services;
  disabled?: boolean;
  inSpecificView?: boolean;
  totalCards?: number;
}) {
  const [pressed, setPressed] = useState(false);

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
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        width: "100%",
        minHeight: 210,
        borderRadius: 25,
        overflow: "hidden",
        marginTop: index === 0 ? 0 : -140,
        zIndex: 100 + index,
        top: 0,
        left: 0,
        right: 0,
      }}
      disabled={disabled}
    >
      <Image
        source={getServiceBackground(service)}
        style={{
          position: "absolute",
          top: -5,
          bottom: 0,
          right: 0,
          left: 0,
          width: "104%",
          height: 215,
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

      {pressed && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.2)",
        }} />
      )}

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
