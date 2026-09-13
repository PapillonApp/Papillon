import React, { memo } from 'react';
import { t } from "i18next";
import { Papicons } from '@getpapillon/papicons';
import { Dynamic } from "@/ui/components/Dynamic";
import Stack from "@/ui/components/Stack";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";

interface EmptyCalendarProps {
  /** The day is empty because the timetable could not be loaded, not because there is no class. */
  hasError?: boolean;
}

export const EmptyCalendar = memo(({ hasError = false }: EmptyCalendarProps) => (
  <Dynamic key={'empty-list:warn'}>
    <Stack
      hAlign="center"
      vAlign="center"
      margin={16}
    >
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={hasError ? "GlobeCross" : "Calendar"} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {hasError ? "Emploi du temps indisponible" : t('Tab_Calendar_Empty')}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {hasError
          ? "Nous n'avons pas réussi à récupérer tes cours. Tire la page vers le bas pour réessayer."
          : t('Tab_Calendar_Empty_Description')}
      </Typography>
    </Stack>
  </Dynamic>
));
