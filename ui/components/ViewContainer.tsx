import { useTheme } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';

import getCorners from '../utils/Corners';

export default function ViewContainer({ children }: Readonly<{ children: React.ReactNode }>) {
    const corners = getCorners();
    const { colors } = useTheme();

    return (
        <View
            style={{
                flex: 1,
                borderRadius: corners,
                backgroundColor: colors.background
            }}
        >
            {children}
        </View>
    )
}