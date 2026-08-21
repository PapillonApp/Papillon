import React, { memo } from 'react';
import { t } from "i18next";
import { Papicons } from '@getpapillon/papicons';
import { Dynamic } from "@/ui/components/Dynamic";
import Stack from "@/ui/components/Stack";
import Icon from "@/ui/components/Icon";
import Typography from "@/ui/components/Typography";

export const EmptyCalendar = memo(() => (
  <Dynamic key={'empty-list:warn'}>
    <Stack
      hAlign="center"
      vAlign="center"
      margin={16}
    >
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={"Calendar"} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {t('Tab_Calendar_Empty')}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {t('Tab_Calendar_Empty_Description')}
      </Typography>
    </Stack>
  </Dynamic>
));
