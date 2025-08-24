import UnivRennes1 from '@/services/rennes1';
import React, { useEffect } from 'react';
import { Button, Text, View } from 'react-native';

const RootLayoutNav = () => {
    const iutlan = new UnivRennes1();

    const fetchData = async () => {
        try {
            const data = await iutlan.login('username', 'password');
            console.log(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <View>
            <Text>Je suis un caca</Text>
            <Button title="Refresh Data" onPress={() => fetchData()} />
        </View>
    );
}

export default RootLayoutNav;