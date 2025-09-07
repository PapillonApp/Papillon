import { useTheme } from "@react-navigation/native";
import { Code } from "lucide-react-native";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";

import List from "@/ui/components/List";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

function DevModeNotice() {
  const { t } = useTranslation();
  const { colors } = useTheme();

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
          backgroundColor={colors.primary + "25"}
          radius={15}
        >
          <Code strokeWidth={2} size={27} color={colors.primary} />
        </Stack>
        <Stack gap={2} vAlign="center" hAlign="center">
          <Typography align="center" variant="h4">
            {t("TabDevModeNotice_Title")}
          </Typography>
          <Typography align="center" variant="body1" color="secondary">
            {t("TabDevModeNotice_Details")}
          </Typography>
        </Stack>
      </Stack>
    </List>
  );
}

export default DevModeNotice;