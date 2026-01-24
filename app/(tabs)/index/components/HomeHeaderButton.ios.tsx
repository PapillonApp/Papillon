import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Typography from '@/ui/components/Typography';

export interface HomeHeaderButtonItem {
  title: string;
  icon: string;
  color: string;
  description: string;
  onPress?: () => void;
}

interface HomeHeaderButtonProps {
  item: HomeHeaderButtonItem;
}

const HomeHeaderButton: React.FC<HomeHeaderButtonProps> = ({ item }) => {
  const { colors } = useTheme();

  return (
    <LiquidGlassView
      glassOpacity={0.9}
      glassTintColor={colors.card}
      glassType='regular'
      isInteractive={true}
      style={{
        flex: 1,
        borderRadius: 22
      }}
    >
      <Pressable
        style={styles.headerBtn}
        onPress={item.onPress}
      >
        <View
          style={{
            backgroundColor: item.color + 30,
            borderRadius: 50,
            padding: 7
          }}
        >
          <Papicons name={item.icon} color={item.color} size={25} />
        </View>
        <View style={{
          flex: 1,
          overflow: 'hidden'
        }}>
          <Typography nowrap variant="h6" color={colors.text + 95} style={{ lineHeight: 0 }}>{item.title}</Typography>
          <Typography nowrap variant="title" color={colors.text + 60} style={{ lineHeight: 0 }}>{item.description}</Typography>
        </View>
      </Pressable>
    </LiquidGlassView >
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
    borderCurve: "circular",
    borderRadius: 20,
    padding: 10,
    gap: 8
  }
});

export default HomeHeaderButton;
