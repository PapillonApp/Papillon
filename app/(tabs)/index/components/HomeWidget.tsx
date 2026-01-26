import React from 'react';
import Stack from '@/ui/components/Stack';
import Icon from '@/ui/components/Icon';
import { t } from 'i18next';
import Typography from '@/ui/components/Typography';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import { Papicons } from '@getpapillon/papicons';
import { useRouter } from 'expo-router';

export interface HomeWidgetItem {
  icon: React.ReactNode;
  title: string;
  redirect?: string;
  onPress?: () => void;
  buttonLabel?: string;
  render?: () => React.ReactNode;
  dev?: boolean;
}

interface HomeWidgetProps {
  item: HomeWidgetItem;
}

const HomeWidget: React.FC<HomeWidgetProps> = React.memo(({ item }) => {
  const router = useRouter();

  if (!item || (item.dev && !__DEV__)) {
    return null;
  }

  return (
    <Stack card radius={25} gap={0} style={{ paddingBottom: 3 }}>
      <Stack direction="horizontal" vAlign="center" hAlign="center" padding={[10, 10]} gap={10} style={{ marginTop: -1 }}>
        <Icon papicon opacity={0.6} style={{ marginLeft: 4 }}>
          {item.icon}
        </Icon>
        <Typography nowrap style={{ flex: 1, opacity: 0.6 }} variant="title" color="text">
          {item.title}
        </Typography>
        {(item.redirect || item.onPress) && (
          <AnimatedPressable
            onPress={() => item.onPress ? item.onPress() : router.navigate(item.redirect as any)}
          >
            <Stack bordered direction="horizontal" hAlign="center" padding={[12, 6]} gap={6}>
              <Typography variant="body2" color="secondary" inline>
                {t('Home_Display_More',)}
              </Typography>
              <Icon size={20} papicon opacity={0.5}>
                <Papicons name={"ArrowRightUp"} />
              </Icon>
            </Stack>
          </AnimatedPressable>
        )}
      </Stack>
      {item.render && item.render()}
    </Stack>
  );
});

export default HomeWidget;
