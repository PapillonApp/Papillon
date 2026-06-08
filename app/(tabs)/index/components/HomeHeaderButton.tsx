import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Papicons } from '@getpapillon/papicons';
import Typography from '@/ui/new/Typography';
import { useTheme } from '@react-navigation/native';
import { TouchableNativeFeedback } from 'react-native';

export interface HomeHeaderButtonItem {
  title: string;
  icon: string;
  color: string;
  description: string;
  onPress?: () => void;
  disabled?: boolean;
}

interface HomeHeaderButtonProps {
  item: HomeHeaderButtonItem;
}

const HomeHeaderButton: React.FC<HomeHeaderButtonProps> = ({ item }) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        minHeight: 61,
      }}
    >
      <TouchableNativeFeedback
        useForeground
        style={styles.headerBtn}
        onPress={item.onPress}
        disabled={item.disabled}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingHorizontal: 10,
            paddingVertical: 13,
            borderRadius: 22,
            backgroundColor: colors.item,
            elevation: item.disabled ? 0 : 4,
            overflow: "hidden",
            opacity: item.disabled ? 0.5 : 1,
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
          <View
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            <Typography nowrap inline variant="title">
              {item.title}
            </Typography>
            <Typography nowrap inline variant="body1" color="textSecondary">
              {item.description}
            </Typography>
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
