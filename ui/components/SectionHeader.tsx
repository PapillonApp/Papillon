import React from "react";

import Stack from "@/ui/components/Stack";
import Typography from "@/ui/components/Typography";

interface SectionHeaderProps {
  title: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

export default function SectionHeader({ title, leading, trailing }: SectionHeaderProps) {
  return (
    <Stack
      direction="horizontal"
      gap={10}
      vAlign="center"
      hAlign="start"
      style={{
        paddingHorizontal: 6,
        paddingVertical: 0,
        marginBottom: 14,
        opacity: 0.5,
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <Stack direction="horizontal" gap={10} vAlign="center" hAlign="start" style={{ alignItems: 'center' }}>
        {leading}
        <Typography>
          {title}
        </Typography>
      </Stack>

      {trailing && (
        <Stack>
          {trailing}
        </Stack>
      )}
    </Stack>
  );
}