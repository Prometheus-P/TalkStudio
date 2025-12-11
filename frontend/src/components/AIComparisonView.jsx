// frontend/src/components/AIComparisonView.jsx
// US5: AI Comparison View - Compare responses from Upstage and OpenAI
import { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export default function AIComparisonView() {
  const [prompt, setPrompt] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleCompare = async () => {
    if (!prompt.trim()) {
      setError('프롬프트를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/content/compare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), temperature, maxTokens })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setResult(data.data);
      } else {
        setError(data.message || 'AI 비교에 실패했습니다.');
      }
    } catch (err) {
      setError(`네트워크 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getWinnerBadge = (winner) => {
    if (winner === 'upstage') return { text: 'Upstage 승리', color: 'bg-purple-500' };
    if (winner === 'openai') return { text: 'OpenAI 승리', color: 'bg-green-500' };
    if (winner === 'tie') return { text: '무승부', color: 'bg-gray-500' };
    return { text: '비교 실패', color: 'bg-red-500' };
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">AI 응답 비교 (US5)</h2>
      <p className="text-gray-600 mb-4">
        동일한 프롬프트로 Upstage와 OpenAI의 응답을 비교합니다.
      </p>

      {/* Input Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            프롬프트
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="비교할 프롬프트를 입력하세요..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens: {maxTokens}
            </label>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !prompt.trim()}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            loading || !prompt.trim()
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? '비교 중...' : 'AI 응답 비교하기'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Winner Banner */}
          <div className={`${getWinnerBadge(result.winner).color} rounded-lg p-4 text-white text-center`}>
            <span className="text-xl font-bold">{getWinnerBadge(result.winner).text}</span>
            {result.comparison_summary?.winner_reason && (
              <p className="text-sm mt-1 opacity-90">{result.comparison_summary.winner_reason}</p>
            )}
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upstage Response */}
            <div className={`bg-white rounded-lg shadow overflow-hidden ${
              result.winner === 'upstage' ? 'ring-2 ring-purple-500' : ''
            }`}>
              <div className="bg-purple-600 text-white px-4 py-3 flex justify-between items-center">
                <span className="font-medium">Upstage</span>
                <span className="text-sm opacity-80">
                  {result.upstage_response?.model || 'N/A'}
                </span>
              </div>
              <div className="p-4">
                {result.upstage_response?.success ? (
                  <>
                    <p className="text-gray-800 whitespace-pre-wrap mb-4">
                      {result.upstage_response.text}
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>응답 시간: {result.upstage_response.metrics?.latency_ms?.toFixed(1)}ms</p>
                      <p>단어 수: {result.upstage_response.metrics?.word_count}</p>
                      <p>토큰 (추정): {result.upstage_response.metrics?.estimated_tokens}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500">
                    오류: {result.upstage_response?.error || '응답 실패'}
                  </p>
                )}
              </div>
            </div>

            {/* OpenAI Response */}
            <div className={`bg-white rounded-lg shadow overflow-hidden ${
              result.winner === 'openai' ? 'ring-2 ring-green-500' : ''
            }`}>
              <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
                <span className="font-medium">OpenAI</span>
                <span className="text-sm opacity-80">
                  {result.openai_response?.model || 'N/A'}
                </span>
              </div>
              <div className="p-4">
                {result.openai_response?.success ? (
                  <>
                    <p className="text-gray-800 whitespace-pre-wrap mb-4">
                      {result.openai_response.text}
                    </p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>응답 시간: {result.openai_response.metrics?.latency_ms?.toFixed(1)}ms</p>
                      <p>단어 수: {result.openai_response.metrics?.word_count}</p>
                      <p>토큰 (추정): {result.openai_response.metrics?.estimated_tokens}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-red-500">
                    오류: {result.openai_response?.error || '응답 실패'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Comparison Summary */}
          {result.comparison_summary && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-700 mb-2">비교 요약</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">응답 시간 차이:</span>
                  <span className="ml-2 font-medium">
                    {result.comparison_summary.latency_difference_ms?.toFixed(1)}ms
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">길이 차이:</span>
                  <span className="ml-2 font-medium">
                    {result.comparison_summary.length_difference} 글자
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">양쪽 성공:</span>
                  <span className="ml-2 font-medium">
                    {result.comparison_summary.both_succeeded ? '예' : '아니오'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Timestamp */}
          <p className="text-sm text-gray-400 text-center">
            비교 시간: {new Date(result.timestamp).toLocaleString('ko-KR')}
          </p>
        </div>
      )}
    </div>
  );
}
