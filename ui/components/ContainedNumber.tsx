import React from 'react';
import { View } from 'react-native';
import Typography from './Typography';
import { useTheme } from '@react-navigation/native';

interface ContainedNumberProps {
  children?: React.ReactNode;
  denominator?: string;
  color?: string;
}

const ContainedNumber: React.FC<ContainedNumberProps> = ({ denominator, color, children, ...rest }) => {
  const theme = useTheme();
  const finalColor = color || theme.colors.tint;
  const hasChildren = children !== undefined && children !== null && children !== "";

  return (
    <View
      style={{
        backgroundColor: finalColor + '26',
        borderRadius: 80,
        borderCurve: 'continuous',
        paddingHorizontal: 10,
        paddingVertical: 1,
        gap: 2,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderColor: finalColor + '46',
        borderWidth: 0,
        minWidth: 50,
        justifyContent: "center"
      }}
    >
      {hasChildren && (
        <Typography variant='h5' color={finalColor} nowrap style={{ flexShrink: 0 }}>
          {children}
        </Typography>
      )}
      {denominator && (
        <Typography variant='body2' color={finalColor + "a6"} nowrap style={{ marginBottom: 3, flexShrink: 0 }}>
          {denominator}
        </Typography>
      )}
    </View>
  );
};

export default ContainedNumber;
