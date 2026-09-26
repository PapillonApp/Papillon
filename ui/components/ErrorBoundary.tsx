import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import Typography from './Typography';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode | ((props: { error: Error | null; reset: () => void }) => React.ReactNode);
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps: Props) {
    if (!this.state.hasError) {
      return;
    }

    if (this.props.resetKeys && prevProps.resetKeys && changedArray(this.props.resetKeys, prevProps.resetKeys)) {
      this.resetErrorBoundary();
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      if (typeof this.props.fallback === 'function') {
        return this.props.fallback({ error: this.state.error, reset: this.resetErrorBoundary });
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Typography variant='title'>Quelque chose s'est mal passé.</Typography>
          <Typography variant='body1' style={{ opacity: 0.5 }}>Veuillez réessayer plus tard.</Typography>
          <Pressable onPress={this.resetErrorBoundary} style={styles.retryButton}>
            <Typography variant='body1'>Réessayer</Typography>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}

function changedArray(a: unknown[], b: unknown[]) {
  if (a.length !== b.length) {
    return true;
  }

  for (let i = 0; i < a.length; i += 1) {
    if (!Object.is(a[i], b[i])) {
      return true;
    }
  }

  return false;
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF000011',
    borderRadius: 12,
    borderCurve: 'continuous',
  },
  retryButton: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#00000010',
  },
});
