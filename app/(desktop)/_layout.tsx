import { Stack, Link } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';

const Sidebar = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.sidebar, { backgroundColor: colors.card }]}>
      <Link href="/(desktop)/" style={[styles.link, { color: colors.text }]}>Home</Link>
      <Link href="/(desktop)/calendar" style={[styles.link, { color: colors.text }]}>Calendar</Link>
      <Link href="/(desktop)/tasks" style={[styles.link, { color: colors.text }]}>Tasks</Link>
      <Link href="/(desktop)/grades" style={[styles.link, { color: colors.text }]}>Grades</Link>
      <Link href="/(desktop)/profile" style={[styles.link, { color: colors.text }]}>Profile</Link>
    </View>
  );
};

export default function DesktopLayout() {
  return (
    <View style={styles.container}>
      <Sidebar />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 240,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
  },
  link: {
    fontSize: 18,
    fontFamily: 'medium',
    marginVertical: 12,
  },
});