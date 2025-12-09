// frontend/src/components/IntentAnalysisResultView.jsx
import React from 'react';

const IntentAnalysisResultView = ({ analysisResult }) => {
  if (!analysisResult) {
    return <div className="text-gray-500">의도 분석 결과가 없습니다.</div>;
  }

  const { discordMessageId, extractedIntents, keywords, sentiment, analysisTimestamp } = analysisResult;

  const sentimentColor = (s) => {
    if (s === 'positive') return 'text-green-600';
    if (s === 'negative') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3">의도 분석 결과</h3>
      <div className="space-y-2">
        <p><strong>메시지 ID:</strong> {discordMessageId}</p>
        <p><strong>의도:</strong> {extractedIntents && extractedIntents.length > 0 ? extractedIntents.join(', ') : 'N/A'}</p>
        <p><strong>키워드:</strong> {keywords && keywords.length > 0 ? keywords.join(', ') : 'N/A'}</p>
        <p>
          <strong>감정:</strong> <span className={sentimentColor(sentiment)}>{sentiment}</span>
        </p>
        <p><strong>분석 시간:</strong> {new Date(analysisTimestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default IntentAnalysisResultView;
