import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@react-navigation/native";
import { error as logError } from "@/utils/logger/logger";

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError (error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch (error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    logError(`Error caught by boundary: ${error.message}`, "ErrorBoundary");
    logError(`Error stack: ${error.stack}`, "ErrorBoundary");
    logError(`Component stack: ${errorInfo.componentStack}`, "ErrorBoundary");
  }

  render () {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        const Fallback = this.props.fallback;
        return <Fallback error={this.state.error!} />;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Une erreur s'est produite
      </Text>
      <Text style={[styles.message, { color: theme.colors.text }]}>
        Nous nous excusons pour ce problème. L'application a rencontré une erreur inattendue.
      </Text>
      {__DEV__ && error && (
        <Text style={[styles.error, { color: theme.colors.text }]}>
          {error.message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  error: {
    fontSize: 12,
    fontFamily: "monospace",
    textAlign: "center",
    opacity: 0.7,
  },
});

export default ErrorBoundary;