import React, { ScrollView, StyleSheet } from "react-native";

import Typography from "@/ui/components/Typography";

export default function TabOneScreen() {
    return (
        <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.containerContent}
            style={styles.container}
        >
            <Typography variant="h1">
              Lorem ipsum
            </Typography>
            <Typography variant="h2">
              Lorem ipsum
            </Typography>
            <Typography variant="h3">
              Lorem ipsum
            </Typography>
            <Typography variant="h4">
              Lorem ipsum
            </Typography>
            <Typography variant="h5">
              Lorem ipsum
            </Typography>
            <Typography variant="h6">
              Lorem ipsum
            </Typography>
            <Typography variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet venenatis ipsum. Sed non luctus purus. Fusce vel mollis turpis, non eleifend leo. Praesent id libero tristique, condimentum elit at, condimentum nibh. Curabitur vehicula mauris in turpis mattis, eget posuere erat sagittis.
            </Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet venenatis ipsum. Sed non luctus purus. Fusce vel mollis turpis, non eleifend leo. Praesent id libero tristique, condimentum elit at, condimentum nibh. Curabitur vehicula mauris in turpis mattis, eget posuere erat sagittis.
            </Typography>
            <Typography variant="caption" color="secondary">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean sit amet venenatis ipsum. Sed non luctus purus. Fusce vel mollis turpis, non eleifend leo. Praesent id libero tristique, condimentum elit at, condimentum nibh.
            </Typography>
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
