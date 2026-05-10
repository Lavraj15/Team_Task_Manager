import { Component } from 'react';

export class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main className="centered">
          <section className="auth-panel">
            <p className="eyebrow">Team Task Manager</p>
            <h1>Something went wrong</h1>
            <p className="error">{this.state.error.message}</p>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
