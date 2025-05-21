import { StyleSheet, Text, ScrollView } from 'react-native';

export default function TabOneScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentInsetAdjustmentBehavior='automatic'
    >
      <Text>Onglet en construction</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
