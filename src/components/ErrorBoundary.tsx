import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Uncaught runtime exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6 bg-slate-50 rounded-3xl border border-slate-200/60 mt-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-slate-100 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display font-black text-slate-800 text-lg">Admin View Interrupted</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                A rendering crash occurred inside the panel dashboard. Don't worry, your database changes were likely saved.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
                <span className="block text-[9px] uppercase font-black tracking-wider text-red-500 mb-1">
                  Error Signature
                </span>
                <code className="text-[10px] font-mono text-slate-700 block break-all whitespace-pre-wrap max-h-32 overflow-y-auto">
                  {this.state.error.toString()}
                </code>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Retry Render
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 bg-[#1B4D3E] hover:bg-[#2E7D5A] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
