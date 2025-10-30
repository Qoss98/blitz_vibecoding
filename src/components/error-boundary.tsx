import React from 'react';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error): State {
    return { error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Render error:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', background: 'black', color: 'white', padding: 24 }}>
          <h1 style={{ fontWeight: 800, marginBottom: 12 }}>Er is iets misgegaan</h1>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error.message || this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}


