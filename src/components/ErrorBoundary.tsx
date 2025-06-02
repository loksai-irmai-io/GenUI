import React from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ error, errorInfo });
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 p-4">
          <div className="enterprise-card max-w-lg w-full text-center animate-fade-in">
            <div className="enterprise-card-header bg-gradient-to-r from-red-100 to-blue-100">
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                Something went wrong.
              </h2>
            </div>
            <div className="enterprise-card-content">
              <pre className="text-xs overflow-x-auto mb-2 text-red-800 bg-red-50 p-2 rounded-lg border border-red-100">
                {this.state.error?.toString()}
              </pre>
              {this.state.errorInfo && (
                <details className="text-xs whitespace-pre-wrap text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {this.state.errorInfo.componentStack}
                </details>
              )}
              <a href="/" className="lovable-button-primary inline-block mt-6">
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
