import React, { useEffect, useState, useMemo } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "@react-navigation/native";

import { useNetworkStore } from "@/stores/logs";
import Button from "@/ui/components/Button";
import TabHeader from "@/ui/components/TabHeader";
import TabHeaderTitle from "@/ui/components/TabHeaderTitle";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";

export default function RequestDetails() {
  const { colors } = useTheme();
  const { host, uuid } = useLocalSearchParams<{ host: string; uuid: string }>();
  
  const [height, setHeight] = useState(0);
  const [responseBody, setResponseBody] = useState<any>(null);

  const requestData = useNetworkStore((state) =>
    state.hosts.get(host)?.requests.find((item) => uuid in item)?.[uuid]
  );

  const url = useMemo(() => (requestData ? new URL(requestData.url) : null), [requestData]);

  useEffect(() => {
    if (!requestData) return;
    
    const parse = async () => {
      try {
        const data = await requestData.clone().json();
        setResponseBody(data);
      } catch {
        const text = await requestData.clone().text().catch(() => "Erreur de lecture");
        setResponseBody(text);
      }
    };
    parse();
  }, [requestData]);

  if (!requestData) return null;

  const handleCopy = async () => {
    const content = `[${requestData.method}] ${requestData.url}\n\nBody:\n${JSON.stringify(responseBody, null, 2)}`;
    await Clipboard.setStringAsync(content);
  };

  const renderItem = (label: string, value: string | null) => (
    <List.Item>
      <Typography>{label}</Typography>
      <Typography variant="subtitle" color="textSecondary">{value || "—"}</Typography>
    </List.Item>
  );

  return (
    <View style={{ padding: 16, paddingTop: height, flex: 1 }}>
      <TabHeader
        modal
        onHeightChanged={setHeight}
        title={<TabHeaderTitle color={colors.primary} subtitle={url?.pathname} chevron={false} />}
      />

      <List
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 5, paddingBottom: 130 }}
        gap={20}
      >
        <Button onPress={handleCopy}>
          <Typography color="#FFFFFF">Copier les informations</Typography>
        </Button>

        <List.Section>
          <List.SectionTitle><Typography>Informations</Typography></List.SectionTitle>
          {renderItem("Méthode", requestData.method)}
          {renderItem("Credentials", requestData.credentials)}
          {renderItem("URL", requestData.url)}
        </List.Section>

        {requestData.headers && (
          <List.Section>
            <List.SectionTitle><Typography>En-têtes Requête</Typography></List.SectionTitle>
            {Array.from(requestData.headers.entries()).map(([key, val]) => renderItem(key, val))}
          </List.Section>
        )}

        {responseBody && (
          <List.Section>
            <List.SectionTitle><Typography>Corps de la réponse</Typography></List.SectionTitle>
            <List.Item>
              <Typography variant="subtitle" color="textSecondary" style={{ fontSize: 11 }}>
                {typeof responseBody === 'object' ? JSON.stringify(responseBody, null, 2) : responseBody}
              </Typography>
            </List.Item>
          </List.Section>
        )}
      </List>
    </View>
  );
}