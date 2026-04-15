import { useNetworkStore } from "@/stores/logs";
import ContainedNumber from "@/ui/components/ContainedNumber";
import Icon from "@/ui/components/Icon";
import { NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Search from "@/ui/components/Search";
import Stack from "@/ui/components/Stack";
import TabHeader from "@/ui/components/TabHeader";
import TabHeaderTitle from "@/ui/components/TabHeaderTitle";
import List from "@/ui/new/List";
import Typography from "@/ui/new/Typography";
import adjust from "@/utils/adjustColor";
import { Papicons } from "@getpapillon/papicons";
import { useTheme } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router"
import { useState } from "react";
import { View } from "react-native";

export default function Requests() {
  const theme = useTheme()
  const {colors} = theme
  const local: { host: string } = useLocalSearchParams();
  const requests = useNetworkStore(state => state.hosts.get(local.host)?.requests ?? [])
  const responses = useNetworkStore(state => state.hosts.get(local.host)?.responses ?? [])
  
  const [height, setHeight] = useState(0);

  function getMethodColor(method: string): string {
    switch (method) {
      case "POST":
        return "#E8901C"
      case "PUT":
        return "#009EC5"
      case "PATCH":
        return "#7600CA"
      case "DELETE":
        return "#C50017"
      default:
        return "#37BB12"
    }
  }

  return (
    <View
      style={{ padding: 16, gap: 20, flex: 1 }}
    >
      <TabHeader
        modal
        onHeightChanged={setHeight}
        backgroundColor="#37BB12"
        title={
          <TabHeaderTitle
            color={colors.primary}
            leading="Liste des requêtes"
            subtitle={local.host}
            chevron={false}
            loading={false}
          />
        }
      />
      <List
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="always"
        contentContainerStyle={{
          padding: 5,
          paddingTop: height,
          paddingBottom: 130
        }}
      >
        {requests.map((item) =>
          Object.entries(item).map(([key, request]) => (
            <List.Item key={key} onPress={() => {
              router.push({
                pathname: "/(dev)/request",
                params: {
                  host: local.host,
                  uuid: key
                }
              })
            }}>
              <List.Leading>
                  <Typography style={{ width: 45 }} color={getMethodColor(request.method)} weight="bold">{request.method}</Typography>
              </List.Leading>
              <Typography numberOfLines={2}>{request.url}</Typography>
              <List.Trailing>
                <Stack direction="horizontal" vAlign="center" hAlign="center">
                  <View style={{ paddingVertical: 3, paddingHorizontal: 7, borderWidth: 2, borderColor: "#37BB12", borderRadius: 100}}>
                    <Typography color="#37BB12" weight="bold">{responses.find(item => key in item)?.[key]?.status ?? "—"}</Typography>
                  </View>
                  <Papicons name="ChevronRight" opacity={0.8} color={colors.text} />
                </Stack>
              </List.Trailing>
            </List.Item>
          ))
        )}
      </List>
    </View>
  )
}