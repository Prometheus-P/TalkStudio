// frontend/src/components/DiscordIntegrationConfig.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Assuming axios for API calls

const DiscordIntegrationConfig = ({ configId, onSaveSuccess, onDeleteSuccess }) => {
  const [serverId, setServerId] = useState('');
  const [serverName, setServerName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [enabledChannels, setEnabledChannels] = useState(''); // Comma-separated
  const [captureStartDate, setCaptureStartDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch config if configId is provided (for editing existing config)
  useEffect(() => {
    if (configId) {
      setLoading(true);
      axios.get(`/api/v1/integrations/discord/config/${configId}`)
        .then(response => {
          const configData = response.data.data;
          setServerId(configData.serverId);
          setServerName(configData.serverName || '');
          // botToken is not returned for security reasons, so won't pre-fill
          setEnabledChannels(configData.enabledChannels ? configData.enabledChannels.join(',') : '');
          setCaptureStartDate(configData.captureStartDate ? new Date(configData.captureStartDate).toISOString().split('T')[0] : '');
          setIsActive(configData.isActive);
        })
        .catch(err => {
          setError(err.response?.data?.message || '설정 불러오기 실패');
          console.error('Error fetching Discord config:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [configId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const payload = {
        serverId,
        serverName,
        botToken, // Only send if it's being set/updated
        enabledChannels: enabledChannels.split(',').map(ch => ch.trim()).filter(ch => ch),
        captureStartDate: captureStartDate ? new Date(captureStartDate).toISOString() : undefined,
        isActive,
      };

      const response = await axios.post('/api/v1/integrations/discord/config', payload);
      setMessage(response.data.message);
      if (onSaveSuccess) onSaveSuccess(response.data.data.configId);
    } catch (err) {
      setError(err.response?.data?.message || '설정 저장/업데이트 실패');
      console.error('Error saving Discord config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!configId || !window.confirm('정말로 이 Discord 통합 설정을 삭제하시겠습니까?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessage('');

    try {
      const response = await axios.delete(`/api/v1/integrations/discord/config/${configId}`);
      setMessage(response.data.message);
      if (onDeleteSuccess) onDeleteSuccess(configId);
      // Clear form after deletion if it was editing the deleted config
      setServerId('');
      setServerName('');
      setBotToken('');
      setEnabledChannels('');
      setCaptureStartDate('');
      setIsActive(true);
    } catch (err) {
      setError(err.response?.data?.message || '설정 삭제 실패');
      console.error('Error deleting Discord config:', err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">{configId ? 'Discord 설정 편집' : '새 Discord 설정 추가'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="serverId" className="block text-sm font-medium text-gray-700">서버 ID (필수)</label>
          <input
            type="text"
            id="serverId"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={serverId}
            onChange={(e) => setServerId(e.target.value)}
            required
            readOnly={!!configId} // Prevent editing serverId for existing configs
          />
        </div>
        <div>
          <label htmlFor="serverName" className="block text-sm font-medium text-gray-700">서버 이름</label>
          <input
            type="text"
            id="serverName"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="botToken" className="block text-sm font-medium text-gray-700">봇 토큰 (필수, 업데이트 시)</label>
          <input
            type="password"
            id="botToken"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={botToken}
            onChange={(e) => setBotToken(e.target.value)}
            placeholder={configId ? '업데이트 시에만 입력하세요' : ''}
            required={!configId} // Required only for new configs
          />
        </div>
        <div>
          <label htmlFor="enabledChannels" className="block text-sm font-medium text-gray-700">활성화된 채널 ID (쉼표로 구분)</label>
          <input
            type="text"
            id="enabledChannels"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={enabledChannels}
            onChange={(e) => setEnabledChannels(e.target.value)}
            placeholder="채널ID1, 채널ID2"
          />
        </div>
        <div>
          <label htmlFor="captureStartDate" className="block text-sm font-medium text-gray-700">캡쳐 시작일</label>
          <input
            type="date"
            id="captureStartDate"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            value={captureStartDate}
            onChange={(e) => setCaptureStartDate(e.target.value)}
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">활성화</label>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '처리 중...' : (configId ? '설정 업데이트' : '설정 추가')}
          </button>
          {configId && (
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md shadow-sm hover:bg-red-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '삭제 중...' : '설정 삭제'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DiscordIntegrationConfig;
