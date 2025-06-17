import { AlertCircle, Info, TriangleAlert } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { LogType } from '@/stores/logs/types';

const ICON_COLORS: Record<LogType, string> = {
  ERROR: '#BE0B00',
  WARN: '#CF6B0F',
  INFO: '#0E7CCB',
  LOG: '#AAA',
};

const ICON_COMPONENTS: Record<LogType, React.ComponentType<{ color: string; size: number }>> = {
  ERROR: AlertCircle,
  WARN: TriangleAlert,
  INFO: Info,
  LOG: Info,
};

const LogIcon: React.FC<{ type: LogType }> = ({ type }) => {
  const backgroundColor = ICON_COLORS[type] || ICON_COLORS.LOG;
  const Icon = ICON_COMPONENTS[type] || ICON_COMPONENTS.LOG;

  return (
    <View
      style={{
        width: 35,
        height: 35,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor,
      }}
    >
      <Icon color="#fff" size={24} />
    </View>
  );
};

export default LogIcon;
