import React, { useState } from "react";
import { ScrollView, StyleSheet, Switch } from "react-native";

import LogIcon from "@/components/Log/LogIcon";
import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { useAccountStore } from '@/stores/account';
import { useLogStore } from '@/stores/logs';
import Item, { Leading, Trailing } from '@/ui/components/Item';
import List from '@/ui/components/List';
import Typography from "@/ui/components/Typography";
import { error, log, warn } from '@/utils/logger/logger';

export default function Devmode() {
  const accountStore = useAccountStore();
  const logsStore = useLogStore();

  const [showAccountStore, setShowAccountStore] = useState(false);
  const [showLogsStore, setShowLogsStore] = useState(false);

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <UnderConstructionNotice />

            <List>
                <Item>
                    <Trailing>
                        <Switch
                            style={{ marginRight: 10 }}
                            value={showAccountStore}
                            onValueChange={setShowAccountStore}
                        />
                    </Trailing>
                    <Typography variant="title">
                        Account Store
                    </Typography>
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
                    <Typography variant="title">
                        Logs Store
                    </Typography>
                </Item>

                {showLogsStore && (
                    logsStore.logs.map((logEntry, index) => (
                        <Item key={index}>
                            <Leading>
                                <LogIcon type={logEntry.type} />
                            </Leading>
                            <Typography variant="body2">
                                {logEntry.message}
                            </Typography>
                            <Typography variant="caption">
                                {logEntry.from} - {logEntry.type} - {new Date(logEntry.date).toLocaleString()}
                            </Typography>
                        </Item>
                    ))
                )}
                <Item
                onPress={() => {
                    log("Log entry added from DevMode", "dfgf");
                }}
                >
                    <Typography variant="title">
                        Ajouter un LOG
                    </Typography>
                </Item>
                <Item
                onPress={() => {
                    warn("Log entry added from DevMode", "dfgf");
                }}
                >
                    <Typography variant="title">
                        Ajouter un WARN
                    </Typography>
                </Item>
                <Item
                onPress={() => {
                    error("Log entry added from DevMode", "dfgf");
                }}
                >
                    <Typography variant="title">
                        Ajouter une ERROR
                    </Typography>
                </Item>
                
            </List>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    containerContent: {
    }
});
