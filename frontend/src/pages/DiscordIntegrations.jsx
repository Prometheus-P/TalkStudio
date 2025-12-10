// frontend/src/pages/DiscordIntegrations.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiscordIntegrationConfig from '../components/DiscordIntegrationConfig.jsx';
import CaptureStatusDisplay from '../components/CaptureStatusDisplay.jsx';

const DiscordIntegrations = () => {
  const [configs, setConfigs] = useState([]);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [selectedCaptureJobId, setSelectedCaptureJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming an API endpoint to list all configs
      const response = await axios.get('/api/v1/integrations/discord/configs'); 
      setConfigs(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || '설정 목록 불러오기 실패');
      console.error('Error fetching Discord configs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleConfigSave = (newConfigId) => {
    setMessage('Discord 설정이 성공적으로 저장되었습니다.');
    fetchConfigs(); // Refresh the list
    setSelectedConfigId(newConfigId); // Select the newly saved/updated config
  };

  const handleConfigDelete = (deletedConfigId) => {
    setMessage('Discord 설정이 성공적으로 삭제되었습니다.');
    fetchConfigs(); // Refresh the list
    if (selectedConfigId === deletedConfigId) {
      setSelectedConfigId(null);
    }
  };

  const handleStartCapture = async (configId) => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const response = await axios.post(`/api/v1/integrations/discord/config/${configId}/capture/start`);
      setSelectedCaptureJobId(response.data.data.captureJobId);
      setMessage('캡쳐 작업이 시작되었습니다.');
    } catch (err) {
      setError(err.response?.data?.message || '캡쳐 시작 실패');
      console.error('Error starting capture:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Discord 통합 관리</h1>

      {message && <p className="text-green-500 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Config List and Add New */}
        <div>
          <DiscordIntegrationConfig 
            onSaveSuccess={handleConfigSave} 
            onDeleteSuccess={handleConfigDelete} 
          />

          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-semibold mb-4">등록된 Discord 설정</h2>
            {loading && <p>설정을 불러오는 중...</p>}
            {configs.length === 0 && !loading && <p>등록된 Discord 설정이 없습니다.</p>}
            
            <ul className="space-y-2">
              {configs.map(config => (
                <li 
                  key={config.configId} 
                  className={`flex justify-between items-center p-3 rounded-md cursor-pointer ${selectedConfigId === config.configId ? 'bg-indigo-100' : 'bg-gray-50 hover:bg-gray-100'}`}
                  onClick={() => setSelectedConfigId(config.configId)}
                >
                  <span>{config.serverName || config.serverId}</span>
                  <div className="flex items-center space-x-2">
                    {config.isActive ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">활성</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">비활성</span>
                    )}
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleStartCapture(config.configId); }}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      캡쳐 시작
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Selected Config Details and Capture Status */}
        <div>
          {selectedConfigId && (
            <DiscordIntegrationConfig 
              configId={selectedConfigId} 
              onSaveSuccess={handleConfigSave} 
              onDeleteSuccess={handleConfigDelete} 
            />
          )}

          {selectedCaptureJobId && (
            <CaptureStatusDisplay captureJobId={selectedCaptureJobId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DiscordIntegrations;
