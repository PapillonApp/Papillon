import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import React from 'react';
import { Linking, StyleSheet, View, Text } from 'react-native';
import Typography from './Typography';
import Button from '../new/Button';
import Icon from './Icon';
import { Papicons } from '@getpapillon/papicons';

type MainTabErrorBoundaryProps = {
  children: React.ReactNode;
};

const MainTabErrorFallback = () => {
  return (
    <View style={styles.container}>
      <Icon size={52} fill='white'>
        <Papicons name='alertCircle' />
      </Icon>

      <Typography color='white' variant='h4' align='center'>Mince ! Quelque chose s'est vraiment très mal passé.</Typography>
      <Typography color='#FFFFFF99' variant='body1' align='center'>Veuillez relancer l'application. Si cela continue, contactez-nous via le support.</Typography>

      <Button
        color='#FFFFFF'
        variant='secondary'
        fullWidth
        onPress={() => {
          Linking.openURL('https://docs.papillon.bzh/support')
        }}
        style={{ marginTop: 16 }}
        label={`Centre d'aide`}
      />
    </View>
  );
};

export default function MainTabErrorBoundary({ children }: MainTabErrorBoundaryProps) {``
  return (
    <ErrorBoundary fallback={<MainTabErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: '#29947A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 16,
    gap: 6,
  },
});
