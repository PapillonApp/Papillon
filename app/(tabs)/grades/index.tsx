import React from "react";
import TabFlatList from "@/ui/components/TabFlatList";
import { NativeHeaderTitle } from "@/ui/components/NativeHeader";
import Typography from "@/ui/components/Typography";
import { View } from "react-native";
import { useTheme } from "@react-navigation/native";

export default function TabOneScreen() {
  const theme = useTheme();

  return (
    <>
      <NativeHeaderTitle>
        <Typography inline variant="navigation">
          Notes
        </Typography>
      </NativeHeaderTitle>
      <TabFlatList
        backgroundColor={theme.dark ? "#092f45" : "#e8f2f7"}
        foregroundColor="#00689cff"
        data={["Item 1", "Item 2", "Item 3"]}
        header={(
          <View style={{ flex: 1 }}>
            <Typography inline variant="body1">
              Header
            </Typography>
          </View>
        )}
        renderItem={({ item }) => (
          <Typography inline variant="body1">
            {item}
          </Typography>
        )}
        keyExtractor={(item) => item}
      />
    </>
  );
}