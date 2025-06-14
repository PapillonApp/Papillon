import React, { Alert, Image, ScrollView, StyleSheet, Switch, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import { ArrowUpSquare, EyeIcon, SparkleIcon } from "lucide-react-native";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import { useState } from "react";

export default function TabOneScreen() {
    const [showFranck, setShowFranck] = useState(false);

    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <UnderConstructionNotice />

            <List>
                <Item>
                    <Typography>
                        Afficher Franck Leboeuf
                    </Typography>
                    <Trailing>
                        <Switch
                            style={{ marginRight: 0 }}
                            value={showFranck}
                            onValueChange={setShowFranck}
                        />
                    </Trailing>
                </Item>
            </List>

            <List>
                {showFranck && (
                    <Item animate>
                        <Leading>
                            <Image
                                source={{ uri: "https://tinyurl.com/47n7hh4x" }}
                                style={{ width: 40, height: 40, borderRadius: 8 }}
                            />
                        </Leading>
                        <Typography variant="title">
                            Franck Leboeuf
                        </Typography>
                    </Item>
                )}
                <Item>
                    <Icon>
                        <EyeIcon />
                    </Icon>
                    <Typography variant="title">
                        Item 1
                    </Typography>
                    <Typography variant="caption" color="secondary">
                        Item 1 Text
                    </Typography>
                    <Trailing>
                        <Button
                            title="Action"
                            variant="outline"
                            inline
                            size="small"
                            icon={<SparkleIcon />}
                            onPress={() => Alert.alert("Action", "Action pressed for Item 1")}
                        />
                    </Trailing>
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
        justifyContent: "center",
        alignItems: "center",
    }
});
