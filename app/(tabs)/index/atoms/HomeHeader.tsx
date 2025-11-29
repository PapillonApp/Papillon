import { Papicons } from '@getpapillon/papicons';
import { useTheme } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import AnimatedPressable from '@/ui/components/AnimatedPressable';
import Stack from '@/ui/components/Stack';
import Typography from '@/ui/components/Typography';

const HomeHeaderButtons = [
  {
    title: "Mes cartes",
    icon: "card",
    color: "#EE9F00",
    description: "QR-Code"
  },
  {
    title: "Menu",
    icon: "cutlery",
    color: "#7ED62B",
    description: "Menu du jour"
  },
  {
    title: "Assiduité",
    icon: "chair",
    color: "#D62B94",
    description: "2 absences"
  },
  {
    title: "Messages",
    icon: "textbubble",
    color: "#2B7ED6",
    description: "2 non lues"
  }
]

const HomeHeader = () => {
  const { colors } = useTheme();

  const renderHeaderButton = useCallback(({ item }: { item: typeof HomeHeaderButtons[0] }) => (
    <AnimatedPressable
      style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
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
      <Stack gap={0}>
        <Typography variant="h6" color={colors.text + 95} style={{ lineHeight: 0 }}>{item.title}</Typography>
        <Typography variant="title" color={colors.text + 60} style={{ lineHeight: 0 }}>{item.description}</Typography>
      </Stack>
    </AnimatedPressable>
  ), [])

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 12,
      }}
    >
      <Stack>
        <Typography variant="h4" color='white'>HomeHeader</Typography>
        <FlatList
          scrollEnabled={false}
          data={HomeHeaderButtons}
          numColumns={2}
          renderItem={renderHeaderButton}
          keyExtractor={(item) => item.title}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            justifyContent: "center",
            alignItems: "center",
          }}
          columnWrapperStyle={{
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10
          }}
          style={{
            width: "100%",
            overflow: "hidden",
            gap: 10
          }}
          removeClippedSubviews
          maxToRenderPerBatch={6}
          windowSize={1}
        />

      </Stack>
    </View>
  );
};

const styles = StyleSheet.create({
  headerBtn: {
    flex: 1,
    flexDirection: "row",
    width: "48.5%",
    borderCurve: "circular",
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    padding: 10,
    gap: 8
  }
})

export default HomeHeader;