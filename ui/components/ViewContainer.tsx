import React from 'react';
import { View } from 'react-native';
import getCorners from '../utils/Corners';
import { useTheme } from '@react-navigation/native';

export default function ViewContainer({ children }) {
    const corners = getCorners();
    const { colors } = useTheme();

    return (
        <View
            style={{
                flex: 1,
                borderRadius: corners,
                overflow: 'hidden',
                backgroundColor: colors.background
            }}
        >
            {children}
        </View>
    )
}