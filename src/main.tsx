import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { Component, type ReactNode, type ErrorInfo } from "react";
import App from "./App.tsx";
import "./index.css";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crash:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif', maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ color: '#b8860b' }}>Something went wrong</h1>
          <p>Please try refreshing the page (Ctrl+Shift+R).</p>
          <details style={{ marginTop: 16, color: '#666' }}>
            <summary>Error details</summary>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error.message}</pre>
          </details>
          <button
            onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}
            style={{ marginTop: 16, padding: '10px 24px', background: '#b8860b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
          >
            Clear cache &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
