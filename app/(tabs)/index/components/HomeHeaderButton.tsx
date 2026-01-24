import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { Papicons } from '@getpapillon/papicons';
import Typography from '@/ui/components/Typography';
import { useTheme } from '@react-navigation/native';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Stack from '@/ui/components/Stack';

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
    <AnimatedPressable
      style={styles.headerBtn}
      onPress={item.onPress}
    >
      <Stack
        direction='horizontal'
        card
        inline flex
        padding={[10, 10]}
        hAlign='center'
        vAlign='center'
        gap={10}
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
          <Typography nowrap inline variant="title">{item.title}</Typography>
          <Typography nowrap inline variant="body2" color='secondary'>{item.description}</Typography>
        </View>
      </Stack>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    flex: 1,
    width: "100%",
    flexDirection: "row",
  }
});

export default HomeHeaderButton;
