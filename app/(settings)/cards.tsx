/* eslint-disable @typescript-eslint/no-require-imports */
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Alert, Image, ScrollView, View } from "react-native";

import { useAccountStore } from "@/stores/account";
import { Services } from "@/stores/account/types";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import SettingsHeader from "@/components/SettingsHeader";
import { getServiceBackground, getServiceName, isSelfModuleEnabledED } from "@/utils/services/helper";
import { useTranslation } from "react-i18next";

export default function CardView() {
  const router = useRouter();
  const store = useAccountStore.getState();
  const account = store.accounts.find(account => account.id === store.lastUsedAccount);
  const selfCompatible = account?.services.filter(
    service => {
      if (service.serviceId === Services.ECOLEDIRECTE) {
        return isSelfModuleEnabledED(service.additionals);
      }
      return [Services.TURBOSELF, Services.ARD, Services.IZLY].includes(service.serviceId);
    },
  );

  const theme = useTheme();
  const { colors } = theme;
  const { t } = useTranslation();

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20, gap: 15,
      }}
    >
      <SettingsHeader
        color={theme.dark ? "#001533" + "80" : "#D9E6FA"}
        title={t("Settings_Cards_Banner_Title")}
        description={t("Settings_Cards_Banner_Description")}
        iconName="Card"
        imageSource={require("@/assets/images/cards.png")}
      />
      {(selfCompatible ?? []).length > 0 ? (
        <>
          <Typography style={{ opacity: 0.5 }}>Mes cartes</Typography>
          <View style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 3.3,
            elevation: 4,
          }}
          >
            <ScrollView scrollEnabled={false}>
              <List>
                {selfCompatible?.map(service => {
                  return (
                    <Item
                      key={service.id}
                      onPress={() => {
                        if (service.serviceId === Services.ECOLEDIRECTE) {
                          Alert.alert("Tu ne peux pas supprimer cette carte", "Cette carte est liée à ton service scolaire.");
                          return;
                        }
                        Alert.alert(getServiceName(service.serviceId), "Que souhaitez-vous faire ?", [
                          {
                            text: "Supprimer",
                            style: "destructive",
                            onPress: () => {
                              useAccountStore.getState().removeAccount(service);
                            },
                          },
                          {
                            text: "Annuler",
                            style: "cancel",
                          },
                        ]);
                      }}
                    >
                      <Leading>
                        <Image source={getServiceBackground(service.serviceId)}
                               style={{
                                 width: 60,
                                 height: 40,
                                 borderRadius: 4,
                               }}
                        />
                      </Leading>
                      <Trailing>
                        <Papicons name={"ChevronRight"}
                                  fill={colors.text}
                                  opacity={0.5}
                        />
                      </Trailing>
                      <Typography>{getServiceName(service.serviceId)}</Typography>
                      <Typography style={{ opacity: 0.5 }}>Ajoutée
                        le {new Date(service.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}</Typography>
                    </Item>
                  );
                })}
              </List>
              <Button color="blue"
                      title="Ajouter"
                      icon={<Papicons name="Plus" />}
                      onPress={() => {
                        router.push({
                          pathname: "/(onboarding)/restaurants/method",
                          params: {
                            action: "addService",
                          },
                        });
                      }}
              />
            </ScrollView>
          </View>
          <Typography variant="caption"
                      style={{ opacity: 0.5 }}
          >{t("Feature_Add_Card")}</Typography>
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
              alignItems: "center",
            }}
          >
            <Icon papicon
                  opacity={0.5}
                  size={32}
                  style={{ marginBottom: 3 }}
            >
              <Papicons name={"Card"} />
            </Icon>
            <Typography variant="h4"
                        color="text"
                        align="center"
            >
              {t("Settings_Cards_None_Title")}
            </Typography>
            <Typography variant="body2"
                        color="secondary"
                        align="center"
            >
              {t("Settings_Cards_None_Description")}
            </Typography>
          </View>
          <Button color="blue"
                  title={t("Settings_Cards_Add_Button")}
                  icon={<Papicons name={"Plus"} />}
                  onPress={() => {
                    console.log("Current services:");
                    account.services.forEach(service => {
                      console.log(service.additionals);
                    });
                    router.push({
                      pathname: "/(onboarding)/restaurants/method",
                      params: {
                        action: "addService",
                      },
                    });
                  }}
          />
        </Stack>
      )
      }
    </ScrollView>
  );
}