// frontend/src/components/CaptureStatusDisplay.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CaptureStatusDisplay = ({ captureJobId }) => {
  const [status, setStatus] = useState('pending');
  const [messagesCaptured, setMessagesCaptured] = useState(0);
  const [totalMessagesExpected, setTotalMessagesExpected] = useState(0);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!captureJobId) return;

    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`/api/v1/integrations/discord/capture/${captureJobId}/status`);
        const data = response.data.data;
        setStatus(data.status);
        setMessagesCaptured(data.messagesCaptured);
        setTotalMessagesExpected(data.totalMessagesExpected);
        setProgress(data.progress);
        setStartTime(data.startTime);
        setEndTime(data.endTime);
        setErrorMessage(data.errorMessage);
      } catch (err) {
        setError(err.response?.data?.message || '캡쳐 상태 불러오기 실패');
        console.error('Error fetching capture status:', err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch status initially
    fetchStatus();

    // Poll for status updates
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [captureJobId]);

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'completed': return 'text-green-600';
      case 'running': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">캡쳐 작업 상태: <span className={getStatusColor(status)}>{status}</span></h2>
      {loading && <p className="text-gray-600">불러오는 중...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">캡쳐 작업 ID:</p>
          <p className="text-gray-900">{captureJobId}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">진행률:</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-gray-900">{progress}% ({messagesCaptured}/{totalMessagesExpected || 'N/A'} 메시지)</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">시작 시간:</p>
          <p className="text-gray-900">{startTime ? new Date(startTime).toLocaleString() : 'N/A'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">종료 시간:</p>
          <p className="text-gray-900">{endTime ? new Date(endTime).toLocaleString() : 'N/A'}</p>
        </div>
        {errorMessage && (
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-red-700">에러 메시지:</p>
            <p className="text-red-500">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptureStatusDisplay;
