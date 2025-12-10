// frontend/src/components/GeneratedContentView.jsx
import React from 'react';

const GeneratedContentView = ({ generatedContent }) => {
  if (!generatedContent) {
    return <div className="text-gray-500">생성된 콘텐츠가 없습니다.</div>;
  }

  const { generatedContentId, contentType, generatedText, upstageModelUsed, generatedAt } = generatedContent;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-3">생성된 콘텐츠</h3>
      <div className="space-y-2">
        <p><strong>콘텐츠 ID:</strong> {generatedContentId}</p>
        <p><strong>콘텐츠 유형:</strong> {contentType}</p>
        <p><strong>생성 모델:</strong> {upstageModelUsed}</p>
        <p><strong>생성 시간:</strong> {new Date(generatedAt).toLocaleString()}</p>
        <div className="border border-gray-200 p-4 rounded-md bg-gray-50">
          <h4 className="font-medium mb-2">콘텐츠 본문:</h4>
          <p className="whitespace-pre-wrap">{generatedText}</p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedContentView;
