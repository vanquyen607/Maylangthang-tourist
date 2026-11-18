import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught an error:', error, info);
  }

  private handleReload = () => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F1F7F6] dark:bg-[#06181E] text-[#0B2A33] dark:text-[#EDF4F3] flex items-center justify-center px-6 py-16">
          <div className="max-w-md w-full rounded-3xl bg-white dark:bg-[#0D313B] border border-[#0B2A33]/12 dark:border-white/15 p-8 shadow-xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1F8A70] dark:text-[#F2B84B] mb-3">
              Mây Lang Thang
            </p>
            <h1 className="font-serif-display text-2xl font-semibold mb-3">
              Đã có gián đoạn nhỏ xảy ra
            </h1>
            <p className="text-sm text-[#0B2A33]/75 dark:text-[#EDF4F3]/75 leading-relaxed mb-6">
              Không thể hoàn tất thao tác vừa rồi. Bạn có thể thử tải lại phần hiển thị này để tiếp tục hành trình.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#1F8A70] hover:bg-[#0B2A33] dark:bg-[#F2B84B] dark:text-[#06181E] dark:hover:bg-white text-white text-sm font-semibold transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại / Try again</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
