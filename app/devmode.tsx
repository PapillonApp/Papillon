import { useTheme } from "@react-navigation/native";
import { Plus } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch } from "react-native";

import DevModeNotice from "@/components/DevModeNotice";
import LogIcon from "@/components/Log/LogIcon";
import { useAccountStore } from '@/stores/account';
import { useLogStore } from '@/stores/logs';
import Item, { Leading, Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Typography from "@/ui/components/Typography";

export default function Devmode() {
  const accountStore = useAccountStore();
  const logsStore = useLogStore();

  const { colors } = useTheme();

  const [showAccountStore, setShowAccountStore] = useState(false);
  const [showLogsStore, setShowLogsStore] = useState(false);

  const [visibleLogsCount, setVisibleLogsCount] = useState(20);

  const loadMoreLogs = () => {
    setVisibleLogsCount((prev) => prev + 20);
  };

  useEffect(() => {
  if (!showLogsStore) {
    setVisibleLogsCount(20);
  }


}, [showLogsStore]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.containerContent}
      style={styles.container}
    >
      <DevModeNotice />

      <List>
        <Item>
          <Trailing>
            <Switch
              style={{ marginRight: 10 }}
              value={showAccountStore}
              onValueChange={setShowAccountStore}
            />
          </Trailing>
          <Typography variant="title">Account Store</Typography>
        </Item>
        {showAccountStore && (
          <Item>
            <Typography variant="body2">
              {JSON.stringify(accountStore, null, 2)}
            </Typography>
          </Item>
        )}
      </List>

      <List>
        <Item>
          <Trailing>
            <Switch
              style={{ marginRight: 10 }}
              value={showLogsStore}
              onValueChange={setShowLogsStore}
            />
          </Trailing>
          <Typography variant="title">Logs Store</Typography>
        </Item>

        {showLogsStore &&
          logsStore.logs
            .slice()
            .reverse()
            .slice(0, visibleLogsCount)
            .map((logEntry, index) => (
              <Item key={index}>
          <Leading>
            <LogIcon type={logEntry.type} />
          </Leading>
          <Typography variant="body2">{logEntry.message}</Typography>
          <Typography variant="caption">
            {new Date(logEntry.date).toLocaleString()} - {logEntry.from ?? "UNKNOW"}
          </Typography>
              </Item>
            ))}

        {showLogsStore && visibleLogsCount < logsStore.logs.length && (
          <Item onPress={loadMoreLogs}>
            <Leading>
                <Plus color={colors.text} size={24} />
            </Leading>
            <Typography variant="title">Charger plus</Typography>
          </Item>
        )}
      </List>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  containerContent: {},
});
