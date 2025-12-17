'use client';

import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for handling React errors gracefully
 * Displays fallback UI without crashing the entire app
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-red-900 dark:text-red-100">
                  {this.props.sectionName ? `Erro em ${this.props.sectionName}` : 'Algo deu errado'}
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {this.state.error?.message || 'Um erro inesperado ocorreu. Tente novamente.'}
                </p>
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  size="sm"
                  className="gap-2 mt-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            </div>
          </Card>
        )
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper hook para usar Error Boundary em componentes
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  sectionName?: string
) {
  return function WithErrorBoundaryComponent(props: P) {
    return (
      <ErrorBoundary sectionName={sectionName}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
