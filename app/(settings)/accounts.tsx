import React from "react";
import { ScrollView } from "react-native";

import Typography from "@/ui/components/Typography";

export default function AccountsView() {
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <Typography>Accounts</Typography>
    </ScrollView>
  );
}