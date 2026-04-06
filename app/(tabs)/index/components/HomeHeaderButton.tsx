import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import { Papicons } from '@getpapillon/papicons';
import Typography from '@/ui/new/Typography';
import { useTheme } from '@react-navigation/native';
import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Stack from '@/ui/components/Stack';
import { TouchableNativeFeedback } from 'react-native';

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
  const extendedColors = colors as typeof colors & { item?: string };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
    <TouchableNativeFeedback
      useForeground
      style={styles.headerBtn}
      onPress={item.onPress}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 10,
          paddingVertical: 13,
          borderRadius: 22,
          backgroundColor: extendedColors.item ?? colors.card,
          elevation: 4,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            borderRadius: 50,
            padding: 0,
            paddingLeft: 4,
          }}
        >
          <Papicons name={item.icon} color={item.color} size={32} />
        </View>
        <View style={{
          flex: 1,
          overflow: 'hidden'
        }}>
          <Typography nowrap inline variant="title">{item.title}</Typography>
          <Typography nowrap inline variant="body1" color='textSecondary'>{item.description}</Typography>
        </View>
      </View>
    </TouchableNativeFeedback>
    </View>
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
