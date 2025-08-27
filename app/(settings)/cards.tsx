/* eslint-disable @typescript-eslint/no-require-imports */
import { Papicons } from "@getpapillon/papicons"
import { useTheme } from "@react-navigation/native"
import { useRouter } from "expo-router";
import { Image, ScrollView, View } from "react-native"

import { useAccountStore } from "@/stores/account"
import { Services } from "@/stores/account/types"
import Button from "@/ui/components/Button"
import Icon from "@/ui/components/Icon"
import Item, { Leading, Trailing } from "@/ui/components/Item"
import List from "@/ui/components/List"
import Stack from "@/ui/components/Stack"
import Typography from "@/ui/components/Typography"

export default function CardView() {
  const router = useRouter();
  const store = useAccountStore.getState()
  const account = store.accounts.find(account => account.id === store.lastUsedAccount);
  const selfCompatible = account?.services.filter(
    service => [Services.TURBOSELF, Services.ARD].includes(service.serviceId)
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20, gap: 15
      }}
    >
      <SettingsHeader color="#D9E6FA" />
      {(selfCompatible ?? []).length > 0 ? (
        <>
          <Typography style={{ opacity: 0.5 }}>Mes cartes</Typography>
          <View style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 3.3,
            elevation: 4
          }}>
            <ScrollView scrollEnabled={false}>
              <List>
                {selfCompatible?.map(service => (
                  <Item key={service.id}>
                    <Leading>
                      <Image source={require("@/assets/images/turboself_card.png")} style={{
                        width: 60,
                        height: 40,
                        borderRadius: 4
                      }} />
                    </Leading>
                    <Trailing>
                      <Papicons name={"ChevronRight"} />
                    </Trailing>
                    <Typography>{Services[service.serviceId].charAt(0).toUpperCase() + Services[service.serviceId].slice(1).toLowerCase()}</Typography>
                    <Typography style={{ opacity: 0.5 }}>Ajoutée le {new Date(service.createdAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })}</Typography>
                  </Item>
                ))}
              </List>
              <Button color="blue" title="Ajouter" icon={<Papicons.Plus />} onPress={() => {
                router.push({
                  pathname: "/(onboarding)/restaurants/method",
                  params: {
                    action: "addService"
                  }
                })
              }} />
            </ScrollView>
          </View>
          <Typography variant="caption" style={{ opacity: 0.5 }}>Ajoute une nouvelle carte depuis l’onglet Profil accessible dans la barre de navigation</Typography>
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
          <Button color="blue" title="Ajouter" icon={<Papicons name={"Plus"} />} onPress={() => {
            router.push({
              pathname: "/(onboarding)/restaurants/method",
              params: {
                action: "addService"
              }
            })
          }} />
        </Stack>
      )
      }
    </ScrollView >
  );
}

function SettingsHeader({ color }: { color: string }) {
  const theme = useTheme()
  const { colors } = theme
  return (
    <Stack direction="vertical" style={{ padding: 13, backgroundColor: color, borderRadius: 25, height: 280, justifyContent: "flex-end", borderWidth: 1, borderColor: colors.border }} hAlign="center">
      <View>
        <Image source={require("@/assets/images/cards.png")}></Image>
      </View>
      <Stack flex direction="horizontal" hAlign="center" style={{ backgroundColor: colors.card, gap: 10, padding: 18, borderRadius: 15 }}>
        <View style={{ width: 24, height: 24 }}>
          <Papicons name={"Card"} opacity={0.6} />
        </View>
        <Stack flex direction="vertical" style={{ flex: 1 }}>
          <Typography>Cartes</Typography>
          <Typography style={{ opacity: 0.6 }} variant="caption" >Ajoute tes cartes de cantine et de transport pour y accéder n’importe-où depuis ton téléphone sur Papillon</Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}