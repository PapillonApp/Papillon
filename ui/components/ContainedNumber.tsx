import React from 'react';
import { View } from 'react-native';
import Typography from './Typography';

interface ContainedNumberProps {
  children?: React.ReactNode;
  denominator?: string;
  color?: string;
}

const ContainedNumber: React.FC<ContainedNumberProps> = ({ denominator, color, children, ...rest }) => {
  return (
    <View
      style={{
        backgroundColor: color + '26',
        borderRadius: 80,
        borderCurve: 'continuous',
        paddingHorizontal: 8,
        paddingVertical: 2,
        gap: 2,
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderColor: color + '46',
        borderWidth: 1,
      }}
    >
      {children && (
        <Typography variant='h4' color={color}>
          {children}
        </Typography>
      )}
      {denominator && (
        <Typography variant='body2' color={color + "a6"}>
          {denominator}
        </Typography>
      )}
    </View>
  );
};

export default ContainedNumber;
