import { Papicons } from '@getpapillon/papicons';
import React, { memo } from 'react';

import { Dynamic } from "@/ui/components/Dynamic";
import Icon from "@/ui/components/Icon";
import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

export const EmptyItem = memo(({ icon, title, description, margin = 16 }: { icon: string; title: string; description: string; margin?: number }) => (
  <Dynamic key={'empty-list:warn'}>
    <Stack
      hAlign="center"
      vAlign="center"
      margin={margin}
    >
      <Icon papicon opacity={0.5} size={32} style={{ marginBottom: 3 }}>
        <Papicons name={icon} />
      </Icon>
      <Typography variant="h4" color="text" align="center">
        {title}
      </Typography>
      <Typography variant="body2" color="secondary" align="center">
        {description}
      </Typography>
    </Stack>
  </Dynamic>
));
