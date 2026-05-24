import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorComponent: React.FC<ErrorProps> = ({
  title = 'Erro',
  message,
  onRetry,
  showRetry = true,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.errorIcon]}>⚠️</Text>
      <Text
        style={[
          styles.title,
          { color: theme.colors.text, marginTop: theme.spacing.md },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.sm,
          },
        ]}
      >
        {message}
      </Text>

      {showRetry && onRetry && (
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary, marginTop: theme.spacing.lg },
          ]}
          onPress={onRetry}
        >
          <Text style={[styles.buttonText]}>
            Tentar Novamente
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <ErrorComponent
            title="Algo deu errado"
            message={
              this.state.error?.message ||
              'Ocorreu um erro inesperado. Por favor, tente novamente.'
            }
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        )
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorIcon: {
    fontSize: 48,
    textAlign: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '80%',
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
  },
});
