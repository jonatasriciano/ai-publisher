import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo
    });
    
    // Log error to service
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Here you could send to error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4 className="alert-heading">Oops! Something went wrong</h4>
            <p>We're sorry, but there was an error loading this page.</p>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary>Error Details</summary>
                <pre className="mt-2">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <hr />
            <button
              className="btn btn-outline-danger"
              onClick={this.handleReset}
            >
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