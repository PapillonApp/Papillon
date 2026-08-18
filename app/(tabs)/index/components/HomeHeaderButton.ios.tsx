import { Papicons } from '@getpapillon/papicons';
import { useTheme } from "expo-router/react-navigation";
import { LiquidGlassView } from '@sbaiahmed1/react-native-blur';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import adjust from "@/utils/adjustColor";

import Typography from '@/ui/components/Typography';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
  const theme = useTheme();
  const { colors } = theme;

  return (
    <LiquidGlassView
      glassOpacity={0.4}
      glassTintColor={adjust(item.color, theme.dark ? -0.8 : 0.9)}
      glassType='regular'
      isInteractive={true}
      style={{
        flex: 1,
        borderRadius: 22
      }}
    >
      <LinearGradient
        colors={[colors.background + (theme.dark ? "00" : "99"), colors.background + (theme.dark ? "99" : "00")]}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 22
        }}
      />

    <Link asChild href={item.route ?? "/(features)/soon"}>
    <Link.AppleZoom>
      <Pressable
        style={styles.headerBtn}
      >
        {item.image ? (
          <Image
            source={item.image}
            style={{
              width: 32,
              height: 32
            }}
          />
        ) : (
          <View
            style={{
              backgroundColor: item.color + 30,
              borderRadius: 50,
              aspectRatio: 1,
              width: 42,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Papicons name={item.icon} color={item.color} size={25} />
          </View>
        )}
        <View style={{
          flex: 1,
          overflow: 'hidden'
        }}>
          <Typography nowrap variant="h6" color={colors.text + "e5"} style={{ lineHeight: 0 }}>{item.title}</Typography>
          <Typography nowrap variant="title" color={colors.text + "75"} style={{ lineHeight: 0 }}>{item.description}</Typography>
        </View>
      </Pressable>
      </Link.AppleZoom>
    </Link>
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
    gap: 8,
    alignItems: "center",
  }
});

export default HomeHeaderButton;
