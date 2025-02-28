import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o estado para renderizar o fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Atualiza o estado com informações adicionais do erro
    this.setState({ errorInfo });

    // Log de erro para o console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);

    // Enviar o erro para um serviço de monitoramento (opcional)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // Simula o envio para um serviço externo (Sentry, Bugsnag, etc.)
    // Aqui você pode substituir por uma integração real.
    console.log('Logging error to service:', { error, errorInfo });
  };

  handleReset = () => {
    // Restaura o estado para tentar novamente
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Oops! Something went wrong</h4>
            <p>We're working to fix this issue. Please try again later.</p>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary>Technical Details</summary>
                <pre className="mt-2">
                  {this.state.error?.toString()}
                  {'\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <hr />
            <button className="btn btn-outline-danger" onClick={this.handleReset}>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
