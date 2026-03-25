import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "expo-router";
import React, { memo } from "react";
import { KeyboardAvoidingView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Search from "@/ui/components/Search";
import Stack from "@/ui/components/Stack";
import Button from "@/ui/new/Button";
import Divider from "@/ui/new/Divider";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

const PronoteSearchHeader = memo(({
}: {
}) => {
  const navigation = useNavigation();
  const [url, setUrl] = React.useState("");

  const submitURL = () => {
    if (url.trim().length === 0) {return;}
    navigation.navigate("browser", { url });
  };

  const urlValid = url.trim().length > 0 && (url.startsWith("http://") || url.startsWith("https://"));

  return (
    <Stack padding={[4, 0]}>
      <Typography variant="h2">Indiquez l'URL de l'établissement</Typography>
      <Typography variant="action" color="textSecondary">Pour vous connecter, nous avons besoin de l&apos;emplacement de ton établissement.</Typography>
      <Divider height={6} ghost />
      <Search icon="link" placeholder="URL de l'établissement" style={{ width: "100%" }} value={url} setValue={setUrl} onTextChange={setUrl} autoFocus={url.trim().length === 0} />

      <Divider height={3} ghost />
      <Button label="Valider" fullWidth height={44} onPress={() => submitURL()} disabled={!urlValid} />

      <Divider height={18} ghost />
    </Stack>
  )
});

export default function PronoteLoginURL() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={20}>
      <List
        ListHeaderComponent={<PronoteSearchHeader />}
        contentContainerStyle={{
          padding: 16,
          flexGrow: 1,
          gap: 10,
          paddingTop: headerHeight + 20,
          paddingBottom: insets.bottom + 20,
        }}
        style={{ flex: 1 }}
        animated
      >
      </List>
    </KeyboardAvoidingView>
  )
}
