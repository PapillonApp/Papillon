import { useTheme } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertTriangle, Globe, KeyRound } from "lucide-react-native";
import React, { useState } from "react";
import { View } from "react-native";

import Button from "@/ui/components/Button";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Icon from "@/ui/components/Icon";
import { Papicons } from "@getpapillon/papicons";
import { runsIOS26 } from "@/ui/utils/IsLiquidGlass";
import adjust from "@/utils/adjustColor";

// Chemins pour WebView (connexion via navigateur)
const SERVICE_WEBVIEW_PATHS: Record<string, string> = {
  "0": "/(onboarding)/pronote/qrcode", // PRONOTE - QR Code
  "1": "/(onboarding)/skolengo/schoolPicker", // Skolengo
};

// Chemins pour Credentials (connexion manuelle)
const SERVICE_CREDENTIALS_PATHS: Record<string, string> = {
  "0": "/(onboarding)/pronote/credentials", // PRONOTE
  "2": "/(onboarding)/ecoledirecte/credentials", // EcoleDirecte
  "3": "/(onboarding)/turboself/credentials", // TurboSelf
  "4": "/(onboarding)/ard/credentials", // ARD
  "5": "/(onboarding)/izly/credentials", // Izly
  "6": "/(onboarding)/university/multi/credentials", // Multi
  "7": "/(onboarding)/alise/credentials", // Alise
  "8": "/(onboarding)/university/appscho/credentials", // AppScho
};

const SERVICE_ICONS: Record<string, string> = {
  "0": "Book",
  "1": "GraduationCap",
  "2": "School",
  "3": "Utensils",
  "4": "Sandwich",
  "5": "Wallet",
  "6": "Users",
  "7": "Coffee",
  "8": "Backpack",
};

export default function ReconnectServiceModal() {
  const { colors, dark } = useTheme();
  const params = useLocalSearchParams();
  const router = useRouter();

  const serviceName = params.serviceName as string;
  const serviceId = params.serviceId as string;
  const serviceAccountId = params.serviceAccountId as string;
  const errorMessage = params.errorMessage as string;

  const iconName = SERVICE_ICONS[serviceId] || "Star";

  const hasWebView = SERVICE_WEBVIEW_PATHS[serviceId] !== undefined;
  const hasCredentials = SERVICE_CREDENTIALS_PATHS[serviceId] !== undefined;

  const handleReconnect = (method: "webview" | "credentials") => {
    const path = method === "webview"
      ? SERVICE_WEBVIEW_PATHS[serviceId]
      : SERVICE_CREDENTIALS_PATHS[serviceId];

    if (path) {
      router.back();
      setTimeout(() => {
        router.push({
          pathname: path as any,
          params: {
            reconnect: "true",
            serviceAccountId: serviceAccountId,
          }
        });
      }, 100);
    } else {
      router.back();
      setTimeout(() => {
        alert("Cette méthode de reconnexion n'est pas disponible pour ce service.");
      }, 100);
    }
  };

  return (
    <View
      style={{
        padding: 18,
        paddingTop: 20,
        gap: 22,
        marginBottom: runsIOS26 ? -32 : 0,
        alignSelf: "center",
      }}
    >
      {/* En-tête avec icône du service */}
      <Stack
        card
        padding={20}
        radius={24}
        vAlign="center"
        hAlign="center"
        backgroundColor={adjust("#F44336", dark ? -0.85 : 0.85)}
      >
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: adjust("#F44336", dark ? -0.7 : 0.7),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Papicons name={iconName} size={32} color="#F44336" />
        </View>
      </Stack>

      {/* Titre et description */}
      <Stack gap={8} padding={[0, 6]}>
        <Typography variant="h3">
          Reconnexion requise
        </Typography>
        <Typography variant="body1" color="secondary">
          Le service <Typography variant="body1" style={{ fontWeight: "600" }}>{serviceName}</Typography> ne peut pas être renouvelé automatiquement.
        </Typography>
        {errorMessage && (
          <Stack
            card
            padding={12}
            radius={12}
            backgroundColor={adjust("#F44336", dark ? -0.9 : 0.9)}
            style={{ marginTop: 8 }}
          >
            <Typography variant="caption" color={adjust("#F44336", dark ? 0.3 : -0.3)}>
              Erreur : {errorMessage}
            </Typography>
          </Stack>
        )}
      </Stack>

      {/* Choix de la méthode de reconnexion */}
      <Stack gap={8}>
        <Typography variant="h6" style={{ paddingHorizontal: 6 }}>
          Choisissez votre méthode
        </Typography>

        <List>
          {hasWebView && (
            <Item onPress={() => handleReconnect("webview")}>
              <Leading>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: adjust(colors.primary, dark ? -0.8 : 0.8),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Globe size={20} color={colors.primary} strokeWidth={2.5} />
                </View>
              </Leading>
              <Typography variant="title">Via le navigateur</Typography>
              <Typography variant="caption" color="secondary">
                Connexion rapide et sécurisée
              </Typography>
            </Item>
          )}

          {hasCredentials && (
            <Item onPress={() => handleReconnect("credentials")}>
              <Leading>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: adjust(colors.primary, dark ? -0.8 : 0.8),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <KeyRound size={20} color={colors.primary} strokeWidth={2.5} />
                </View>
              </Leading>
              <Typography variant="title">Avec identifiants</Typography>
              <Typography variant="caption" color="secondary">
                Saisir manuellement vos identifiants
              </Typography>
            </Item>
          )}

          {!hasWebView && !hasCredentials && (
            <Item>
              <Leading>
                <AlertTriangle size={24} color={colors.text} />
              </Leading>
              <Typography variant="body2" color="secondary">
                Aucune méthode de reconnexion disponible pour ce service
              </Typography>
            </Item>
          )}
        </List>
      </Stack>

      {/* Conseils */}
      <Stack
        card
        padding={16}
        radius={16}
        gap={8}
      >
        <Typography variant="h6">
          💡 Conseils
        </Typography>
        <Typography variant="body2" color="secondary">
          • Vérifiez vos identifiants avant de vous reconnecter
        </Typography>
        <Typography variant="body2" color="secondary">
          • Assurez-vous que votre compte est toujours actif
        </Typography>
        <Typography variant="body2" color="secondary">
          • La reconnexion mettra à jour vos informations
        </Typography>
      </Stack>

      {/* Bouton annuler */}
      <Stack padding={[0, 6]} style={{ marginBottom: 4 }}>
        <Button
          title="Plus tard"
          onPress={() => router.back()}
        />
      </Stack>
    </View>
  );
}
