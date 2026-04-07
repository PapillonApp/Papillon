import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";
import { PapillonAppearIn, PapillonAppearOut } from "@/ui/utils/Transition";
import { Papicons } from "@getpapillon/papicons";
import { t } from "i18next";
import React, { memo } from "react";

interface EmptyStateProps {
  isSearching: boolean;
}

const EmptyState = memo(({ isSearching }: EmptyStateProps) => (
  <Dynamic
    animated
    key="empty-list:warn"
    entering={PapillonAppearIn}
    exiting={PapillonAppearOut}
  >
    <Stack hAlign="center" vAlign="start" style={{ width: "100%", marginTop: 16 }}>
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={isSearching ? "Search" : "tasks"} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {isSearching ? t("Tasks_Search_NoResults") : t("Tasks_NoTasks_Title")}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {isSearching
          ? "Essaie avec un autre mot clé."
          : t("Tasks_NoTasks_Description")}
      </Typography>
    </Stack>
  </Dynamic>
));
EmptyState.displayName = "EmptyState";

export default EmptyState;
