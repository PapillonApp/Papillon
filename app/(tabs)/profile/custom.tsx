import { Avatar } from "@/app/(features)/(news)/news";
import { useAccountStore } from "@/stores/account";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import { NativeHeaderPressable, NativeHeaderSide } from "@/ui/components/NativeHeader";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { Bold, Font, Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { router } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Image, TextInput, View } from "react-native";

export default function CustomProfileScreen() {
  const { t } = useTranslation();
  const store = useAccountStore.getState()
  const accounts = store.accounts
  const lastUsedAccount = store.lastUsedAccount
  const account = accounts.find((a) => a.id === lastUsedAccount);

  const [firstName, setFirstName] = useState<string>(account?.firstName ?? "");
  const [lastName, setLastName] = useState<string>(account?.lastName ?? "");

  const { colors } = useTheme();

  return (
    <>
      {/* Profil */}
      <View style={{ paddingHorizontal: 50, alignItems: "center", gap: 15, paddingTop: 20 }}>
        {account && account.customisation?.profilePicture ? (
          <Image
            source={{ uri: account.customisation.profilePicture }}
            style={{ width: 117, height: 117, borderRadius: 500 }}
          />
        ) : (
          <Avatar size={117} variant="h1" author={`${account?.firstName} ${account?.lastName}`} />
        )}
        <Button
          inline
          variant="outline"
          size="small"
          icon={<Papicons name="Camera" />}
          title={t("Button_Change_ProfilePicture")}
        />
      </View>

      <View style={{ paddingHorizontal: 20, paddingTop: 30, gap: 15 }}>
        <View style={{ gap: 10 }}>
          <Stack direction="horizontal" style={{ borderRightWidth: 1, borderRightColor: colors.border }} gap={5}>
            <Icon papicon opacity={0.5}>
              <Font />
            </Icon>
            <Typography color="secondary">Prénom</Typography>
          </Stack>
          <View
            style={{
              backgroundColor: "#F2F2F2",
              width: "100%",
              borderRadius: 50,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 3.3,
              elevation: 4,
            }}
          >
            <TextInput
              placeholder="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              style={{
                padding: 23,
                fontSize: 18,
                fontWeight: "600",
                letterSpacing: 0.18,
              }}
            />
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <Stack direction="horizontal" style={{ borderRightWidth: 1, borderRightColor: colors.border }} gap={5}>
            <Icon papicon opacity={0.5}>
              <Bold />
            </Icon>
            <Typography color="secondary">Nom</Typography>
          </Stack>
          <View
            style={{
              backgroundColor: "#F2F2F2",
              width: "100%",
              borderRadius: 50,
              borderWidth: 1,
              borderColor: colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.15,
              shadowRadius: 3.3,
              elevation: 4,
            }}
          >
            <TextInput
              placeholder="Nom"
              value={lastName}
              onChangeText={setLastName}
              style={{
                padding: 23,
                fontSize: 18,
                fontWeight: "600",
                letterSpacing: 0.18,
              }}
            />
          </View>
        </View>
      </View>
      <NativeHeaderSide side="Left" key={`${firstName}-${lastName}`}>
        <NativeHeaderPressable
          onPress={() => {
            useAccountStore.getState().setAccountName(lastUsedAccount, firstName, lastName);
            router.back();
          }}
        >
          <Icon papicon opacity={0.5}>
            <Papicons name="ArrowLeft" />
          </Icon>
        </NativeHeaderPressable>

      </NativeHeaderSide>
    </>
  );
}
