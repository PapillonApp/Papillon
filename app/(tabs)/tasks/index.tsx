import { AlertCircle, ArrowUpSquare, EyeIcon, SparkleIcon } from "lucide-react-native";
import { useState } from "react";
import React, { Image, ScrollView, StyleSheet, Switch } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { useAlert } from "@/ui/components/AlertProvider";
import Button from "@/ui/components/Button";
import Icon from "@/ui/components/Icon";
import Item, { Leading, Trailing } from "@/ui/components/Item";
import List from "@/ui/components/List";
import Typography from "@/ui/components/Typography";
import { log } from "@/utils/logger/logger";

export default function TabOneScreen() {
    const [showFranck, setShowFranck] = useState(false);
    const { showAlert } = useAlert();
    
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
                            style={{ marginRight: 10 }}
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
                            onPress={() => showAlert({
                            title: "Votre établissement ne répond plus",
                            message: "Les données ne seront plus mises à jour",
                            expandedView: null,
                            buttons: [
                                {
                                    label: "Réessayer de se connecter",
                                    onPress: () => {console.log("Réessayer de se connecter")},
                                    principal: true
                                },
                                {
                                    label: "Annuler",
                                    onPress: () => {console.log("Réessayer de se connecter")}
                                }
                            ]
                            })}
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
