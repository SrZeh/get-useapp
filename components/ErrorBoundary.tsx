/**
 * Error Boundary component for React error handling
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 */

import React, { Component, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { LiquidGlassView } from './liquid-glass';
import { Button } from './Button';
import { logger } from '@/utils/logger';
import { toAppError } from '@/types/errors';
import { getErrorUserMessage } from '@/constants/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to our logger
    const appError = toAppError(error);
    logger.error('ErrorBoundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  handleReload = (): void => {
    // In a web environment, reload the page
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
    // On native, reset the error state
    this.handleReset();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      const errorMessage = this.state.error 
        ? getErrorUserMessage(this.state.error)
        : 'Ocorreu um erro inesperado.';

      return (
        <ThemedView style={{ flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }}>
          <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 32, maxWidth: 500, width: '100%' }}>
            <ThemedText type="large-title" style={{ marginBottom: 16, textAlign: 'center' }}>
              Ops! 😅
            </ThemedText>
            
            <ThemedText type="title" style={{ marginBottom: 24, textAlign: 'center' }}>
              Algo deu errado
            </ThemedText>

            <ThemedText 
              type="body" 
              style={{ marginBottom: 32, textAlign: 'center' }}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              {errorMessage}
            </ThemedText>

            {__DEV__ && this.state.error && (
              <ScrollView 
                style={{ 
                  maxHeight: 200, 
                  backgroundColor: 'rgba(0,0,0,0.1)', 
                  borderRadius: 12, 
                  padding: 12,
                  marginBottom: 24 
                }}
              >
                <ThemedText 
                  type="caption" 
                  style={{ fontFamily: 'monospace' }}
                  className="text-light-text-tertiary dark:text-dark-text-tertiary"
                >
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.error.stack}
                </ThemedText>
              </ScrollView>
            )}

            <View style={{ gap: 12, width: '100%' }}>
              <Button variant="primary" onPress={this.handleReload} fullWidth>
                Tentar novamente
              </Button>
              
              {__DEV__ && (
                <Button variant="secondary" onPress={this.handleReset} fullWidth>
                  Continuar (dev)
                </Button>
              )}
            </View>
          </LiquidGlassView>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap a component with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

