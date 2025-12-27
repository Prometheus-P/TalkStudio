/**
 * BatchResultsViewer - 배치 처리 결과 표시 컴포넌트
 * 동기식 배치 API 결과를 표시
 */
import React, { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Download,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

/**
 * BatchResultsViewer displays the results of a batch processing operation.
 *
 * @param {Object} props
 * @param {Object} props.batchResult - BatchResponse from the API
 * @param {boolean} props.batchResult.success - Overall success status
 * @param {number} props.batchResult.total - Total prompts processed
 * @param {number} props.batchResult.processed - Successfully processed count
 * @param {number} props.batchResult.failed - Failed count
 * @param {Array} props.batchResult.results - Array of BatchResultItem
 * @param {number} props.batchResult.remaining_quota - Remaining daily quota
 * @param {Function} [props.onSelectResult] - Callback when a result is selected
 */
const BatchResultsViewer = ({ batchResult, onSelectResult }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  if (!batchResult) {
    return null;
  }

  const { success, total, processed, failed, results, remaining_quota } = batchResult;
  const successRate = total > 0 ? Math.round((processed / total) * 100) : 0;

  // Toggle expanded row
  const toggleRow = (rowNumber) => {
    setExpandedRow(expandedRow === rowNumber ? null : rowNumber);
  };

  // Handle result selection (load into editor)
  const handleSelectResult = (result) => {
    if (onSelectResult && result.status === 'success' && result.messages) {
      onSelectResult(result);
    }
  };

  // Export results as JSON
  const handleExportJson = () => {
    const exportData = results.filter(r => r.status === 'success').map(r => ({
      prompt: r.prompt,
      messages: r.messages,
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch_results_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: success ? '#F0FDF4' : '#FEF2F2',
          border: success ? '1px solid #BBF7D0' : '1px solid #FECACA',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {success ? (
          <CheckCircle size={24} className="text-green-500" />
        ) : (
          <XCircle size={24} className="text-red-500" />
        )}

        <div className="flex-1">
          <p
            className="font-semibold"
            style={{ color: success ? '#16A34A' : '#DC2626' }}
          >
            {success ? '배치 처리 완료!' : '일부 처리 실패'}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {processed} / {total} 프롬프트 성공 ({successRate}%)
          </p>
        </div>

        {/* Remaining Quota */}
        <div className="text-right">
          <p className="text-xs text-gray-600">남은 할당량</p>
          <p className="text-sm font-semibold text-purple-600">{remaining_quota}회</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4">
        <div
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            background: '#F0FDF4',
            textAlign: 'center',
          }}
        >
          <p className="text-lg font-bold text-green-600">{processed}</p>
          <p className="text-xs text-green-700">성공</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            background: failed > 0 ? '#FEF2F2' : '#F9FAFB',
            textAlign: 'center',
          }}
        >
          <p className={`text-lg font-bold ${failed > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {failed}
          </p>
          <p className={`text-xs ${failed > 0 ? 'text-red-700' : 'text-gray-600'}`}>실패</p>
        </div>
        <div
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            background: '#F3E8FF',
            textAlign: 'center',
          }}
        >
          <p className="text-lg font-bold text-purple-600">{total}</p>
          <p className="text-xs text-purple-700">전체</p>
        </div>
      </div>

      {/* Results List */}
      <div
        style={{
          maxHeight: '300px',
          overflowY: 'auto',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
        }}
      >
        {results.map((result) => (
          <div
            key={result.row_number}
            style={{
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            {/* Row Header */}
            <div
              onClick={() => toggleRow(result.row_number)}
              style={{
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                background: expandedRow === result.row_number ? '#F9FAFB' : '#FFFFFF',
                transition: 'background 0.2s',
              }}
            >
              {result.status === 'success' ? (
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
              ) : result.status === 'failed' ? (
                <XCircle size={16} className="text-red-500 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-yellow-500 flex-shrink-0" />
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  #{result.row_number}. {result.prompt}
                </p>
                {result.error && (
                  <p className="text-xs text-red-500 truncate">{result.error}</p>
                )}
                {result.status === 'success' && result.messages && (
                  <p className="text-xs text-gray-600">
                    {result.messages.length}개 메시지 • {result.tokens_used} 토큰
                  </p>
                )}
              </div>

              {expandedRow === result.row_number ? (
                <ChevronUp size={16} className="text-gray-600" />
              ) : (
                <ChevronDown size={16} className="text-gray-600" />
              )}
            </div>

            {/* Expanded Content */}
            {expandedRow === result.row_number && result.status === 'success' && result.messages && (
              <div
                style={{
                  padding: '12px 16px',
                  background: '#F9FAFB',
                  borderTop: '1px solid #E5E7EB',
                }}
              >
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.messages.slice(0, 5).map((msg, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: msg.speaker === 'me' ? '#E0E7FF' : '#FFFFFF',
                        border: '1px solid #E5E7EB',
                      }}
                    >
                      <span className="text-xs font-medium text-gray-600">
                        {msg.speaker === 'me' ? '나' : '상대방'}
                      </span>
                      <p className="text-sm text-gray-800">{msg.text}</p>
                    </div>
                  ))}
                  {result.messages.length > 5 && (
                    <p className="text-xs text-gray-600 text-center">
                      ...외 {result.messages.length - 5}개 메시지
                    </p>
                  )}
                </div>

                {/* Load to Editor Button */}
                {onSelectResult && (
                  <button
                    onClick={() => handleSelectResult(result)}
                    style={{
                      marginTop: '12px',
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(145deg, #A855F7 0%, #7C3AED 100%)',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <FileText size={14} />
                    에디터로 불러오기
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Export Button */}
      {processed > 0 && (
        <button
          onClick={handleExportJson}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          <Download size={18} />
          결과 내보내기 (JSON)
        </button>
      )}
    </div>
  );
};

// Legacy export name for backward compatibility
export default BatchResultsViewer;
