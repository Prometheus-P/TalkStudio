/**
 * ErrorBoundary - 에러 경계 컴포넌트
 * React 컴포넌트 트리에서 발생한 에러를 잡아서 폴백 UI를 표시
 */
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // 에러 로깅 (프로덕션에서는 에러 리포팅 서비스로 전송)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공되면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div
          className="flex flex-col items-center justify-center min-h-[400px] p-8"
          style={{
            background: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
            borderRadius: '24px',
            margin: '16px',
          }}
        >
          <div
            className="flex items-center justify-center w-16 h-16 mb-4"
            style={{
              background: 'linear-gradient(145deg, #EF4444 0%, #DC2626 100%)',
              borderRadius: '20px',
              boxShadow: '0px 4px 0px rgba(220, 38, 38, 0.4)',
            }}
          >
            <AlertTriangle size={32} color="#FFFFFF" />
          </div>

          <h2
            className="text-xl font-bold mb-2"
            style={{ color: '#991B1B' }}
          >
            문제가 발생했습니다
          </h2>

          <p
            className="text-center mb-6 max-w-md"
            style={{ color: '#B91C1C', fontSize: '14px' }}
          >
            {this.props.message || '예상치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 다시 시도해 주세요.'}
          </p>

          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 font-semibold"
              style={{
                background: 'linear-gradient(145deg, #FFFFFF 0%, #F9FAFB 100%)',
                borderRadius: '12px',
                boxShadow: '0px 3px 0px rgba(0, 0, 0, 0.1)',
                color: '#374151',
                fontSize: '14px',
              }}
            >
              다시 시도
            </button>

            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 px-4 py-2 font-semibold"
              style={{
                background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 100%)',
                borderRadius: '12px',
                boxShadow: '0px 3px 0px rgba(37, 99, 235, 0.4)',
                color: '#FFFFFF',
                fontSize: '14px',
              }}
            >
              <RefreshCw size={16} />
              새로고침
            </button>
          </div>

          {/* 개발 모드에서 에러 상세 표시 */}
          {import.meta.env.DEV && this.state.error && (
            <details
              className="mt-6 w-full max-w-lg"
              style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '12px',
                fontSize: '12px',
              }}
            >
              <summary
                className="cursor-pointer font-semibold"
                style={{ color: '#6B7280' }}
              >
                에러 상세 (개발 모드)
              </summary>
              <pre
                className="mt-2 overflow-auto p-2"
                style={{
                  background: '#F3F4F6',
                  borderRadius: '8px',
                  color: '#DC2626',
                  fontSize: '11px',
                  maxHeight: '200px',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
