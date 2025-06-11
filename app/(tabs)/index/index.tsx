import React, { ScrollView, StyleSheet, Text, View } from "react-native";

import UnderConstructionNotice from "@/components/UnderConstructionNotice";
import { Link } from "expo-router";

export default function TabOneScreen() {
    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <UnderConstructionNotice />

             <Link href="/page" style={{ marginTop: 20 }}>
                            <View style={{ width: "100%", padding: 14, backgroundColor: "#29947A", borderRadius: 300 }}>
                                <Text
                                    style={{
                                        color: "#FFFFFF",
                                        fontSize: 16,
                                        textAlign: "center",
                                        fontFamily: "bold"
                                    }}
                                >Page au dessus de la nav</Text>
                            </View>
                        </Link>
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
