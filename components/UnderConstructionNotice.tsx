import { AlertTriangle } from "lucide-react-native";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

function UnderConstructionNotice() {
  const { t } = useTranslation();

  return (
    <List disablePadding>
      <Stack
        gap={12}
        vAlign="center"
        hAlign="center"
        padding={20}
      >
        <Stack
          vAlign="center"
          hAlign="center"
          padding={10}
          inline
          backgroundColor="#EFA40035"
          radius={30}
        >
          <AlertTriangle strokeWidth={2} size={24} color="#c28500" />
        </Stack>
        <Stack gap={2} vAlign="center" hAlign="center">
          <Typography align="center" variant="h4">
            {t("TabUnderConstruction_Title")}
          </Typography>
          <Typography align="center" variant="body1" color="secondary">
            {t("TabUnderConstruction_Details")}
          </Typography>
        </Stack>
      </Stack>
    </List>
  );
}

export default UnderConstructionNotice;