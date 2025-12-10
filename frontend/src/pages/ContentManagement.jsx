// frontend/src/pages/ContentManagement.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import GeneratedContentView from '../components/GeneratedContentView.jsx';

const ContentManagement = () => {
  const [generatedContents, setGeneratedContents] = useState([]);
  const [selectedContentId, setSelectedContentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(''); // e.g., 'summary', 'faq_answer'

  const fetchGeneratedContents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming an API endpoint to list all generated contents with optional filters
      const response = await axios.get('/api/v1/content/generated', {
        params: { contentType: filterType }
      }); 
      setGeneratedContents(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || '생성된 콘텐츠 목록 불러오기 실패');
      console.error('Error fetching generated contents:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType]); // filterType is a dependency of this memoized function

  useEffect(() => {
    fetchGeneratedContents();
  }, [fetchGeneratedContents]); // Now fetchGeneratedContents is stable or changes only when its dependencies change

  const selectedContent = generatedContents.find(
    (content) => content.generatedContentId === selectedContentId
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">생성된 콘텐츠 관리</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <label htmlFor="filterType" className="block text-sm font-medium text-gray-700">콘텐츠 유형 필터:</label>
        <select
          id="filterType"
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">전체</option>
          <option value="summary">요약</option>
          <option value="faq_answer">FAQ 답변</option>
          <option value="idea_list">아이디어 목록</option>
          {/* Add more content types as needed */}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: List of Generated Contents */}
        <div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">생성된 콘텐츠 목록</h2>
            {loading && <p>콘텐츠를 불러오는 중...</p>}
            {generatedContents.length === 0 && !loading && <p>생성된 콘텐츠가 없습니다.</p>}
            
            <ul className="space-y-2">
              {generatedContents.map(content => (
                <li 
                  key={content.generatedContentId} 
                  className={`flex justify-between items-center p-3 rounded-md cursor-pointer ${selectedContentId === content.generatedContentId ? 'bg-indigo-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                  onClick={() => setSelectedContentId(content.generatedContentId)}
                >
                  <span className="truncate">{content.generatedText.substring(0, 50)}... ({content.contentType})</span>
                  <span className="text-sm text-gray-500">{new Date(content.generatedAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Selected Content Details */}
        <div>
          {selectedContentId ? (
            <GeneratedContentView generatedContent={selectedContent} />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-md text-gray-500">
              콘텐츠를 선택하여 상세 내용을 확인하세요.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
