import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GradesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Grades Screen</Text>
      <Text>This is the main content area for the grades screen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});