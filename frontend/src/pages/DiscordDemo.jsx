/**
 * Discord Demo Page
 * Demonstrates the Discord chat preview with export functionality
 */

import { useState, useRef, useCallback } from 'react';
import DiscordChatPreview from '../components/theme/DiscordChatPreview';
import { exportAsPng, DEVICE_SIZES } from '../utils/imageExport';

// Sample messages matching the screenshot
const DEMO_MESSAGES = [
  {
    id: '1',
    speaker: 'kyle',
    speaker_name: 'kyle',
    text: '저게임머닉매할게여',
    type: 'text',
    timestamp: new Date('2024-11-10T12:17:25.123'),
    avatar: null, // Will show first letter
  },
  {
    id: '2',
    speaker: 'bigvict',
    speaker_name: 'Bigvict',
    text: '우와진짜못갈네요',
    type: 'text',
    timestamp: new Date('2024-11-10T12:17:25.123'),
    avatar: null,
  },
  {
    id: '3',
    speaker: 'participant2',
    speaker_name: '참여자2',
    text: '반갑습',
    type: 'text',
    timestamp: new Date('2024-11-10T12:17:25.135'),
    avatar: null,
  },
];

const DEMO_PROFILES = {
  kyle: {
    name: 'kyle',
    avatar: null,
  },
  bigvict: {
    name: 'Bigvict',
    avatar: null,
  },
  participant2: {
    name: '참여자2',
    avatar: null,
  },
};

export default function DiscordDemo() {
  const [messages, setMessages] = useState(DEMO_MESSAGES);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const previewRef = useRef(null);

  // Export handler
  const handleExport = useCallback(async () => {
    if (!previewRef.current) return;

    setIsExporting(true);
    setExportStatus(null);

    try {
      const result = await exportAsPng(previewRef.current, {
        scale: 2,
        filename: `discord-chat-${Date.now()}.png`,
        backgroundColor: '#313338',
      });

      setExportStatus({
        type: 'success',
        message: `저장 완료: ${result.width}x${result.height}`,
      });
    } catch (error) {
      setExportStatus({
        type: 'error',
        message: `저장 실패: ${error.message}`,
      });
    } finally {
      setIsExporting(false);
    }
  }, []);

  // Add message handler
  const [newSpeaker, setNewSpeaker] = useState('');
  const [newText, setNewText] = useState('');

  const handleAddMessage = () => {
    if (!newSpeaker.trim() || !newText.trim()) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      speaker: newSpeaker.toLowerCase().replace(/\s+/g, ''),
      speaker_name: newSpeaker,
      text: newText,
      type: 'text',
      timestamp: new Date(),
      avatar: null,
    };

    setMessages([...messages, newMsg]);
    setNewSpeaker('');
    setNewText('');
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Discord Chat Generator
          </h1>
          <p className="text-gray-400">
            실제 디스코드 모바일 UI와 동일한 스크린샷 생성
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold text-white mb-4">미리보기</h2>

            {/* Phone Frame */}
            <div className="relative w-[320px]">
              {/* Phone frame */}
              <div className="bg-black rounded-[40px] p-3 shadow-2xl">
                {/* Screen - Fixed height for mobile aspect ratio */}
                <div
                  ref={previewRef}
                  className="w-full rounded-[32px] overflow-hidden"
                  style={{ height: '640px' }}
                >
                  <DiscordChatPreview
                    messages={messages}
                    profiles={DEMO_PROFILES}
                    header={{ title: '상대방', memberCount: 19 }}
                    statusBar={{ time: '10:30' }}
                    className="h-full"
                  />
                </div>
              </div>

              {/* Reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[40px] pointer-events-none" />
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={isExporting}
              className={`
                mt-6 px-8 py-3 rounded-xl font-semibold text-white
                transition-all duration-200
                ${isExporting
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#5865f2] hover:bg-[#4752c4] active:scale-95'
                }
              `}
            >
              {isExporting ? (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  내보내는 중...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PNG로 저장
                </span>
              )}
            </button>

            {/* Export Status */}
            {exportStatus && (
              <div className={`
                mt-3 px-4 py-2 rounded-lg text-sm
                ${exportStatus.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
              `}>
                {exportStatus.message}
              </div>
            )}
          </div>

          {/* Editor Section */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white">메시지 편집</h2>

            {/* Message List */}
            <div className="bg-[#2b2d31] rounded-xl p-4 max-h-[400px] overflow-y-auto">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#36373d] group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {(msg.speaker_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{msg.speaker_name}</span>
                      <span className="text-gray-500 text-xs">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm mt-0.5">{msg.text}</p>
                  </div>
                  <button
                    onClick={() => setMessages(messages.filter((m) => m.id !== msg.id))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add Message Form */}
            <div className="bg-[#2b2d31] rounded-xl p-4 space-y-3">
              <h3 className="text-white font-medium">새 메시지 추가</h3>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newSpeaker}
                  onChange={(e) => setNewSpeaker(e.target.value)}
                  placeholder="이름 (예: kyle)"
                  className="px-4 py-2 bg-[#1e1f22] text-white rounded-lg border border-[#3f4147] focus:border-[#5865f2] outline-none text-sm"
                />
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder="메시지 내용"
                  className="px-4 py-2 bg-[#1e1f22] text-white rounded-lg border border-[#3f4147] focus:border-[#5865f2] outline-none text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
                />
              </div>

              <button
                onClick={handleAddMessage}
                className="w-full px-4 py-2 bg-[#5865f2] text-white rounded-lg font-medium hover:bg-[#4752c4] transition-colors"
              >
                메시지 추가
              </button>
            </div>

            {/* Tips */}
            <div className="bg-[#2b2d31] rounded-xl p-4">
              <h3 className="text-white font-medium mb-2">Tips</h3>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• 이미지는 실제 모바일 캡처와 동일한 비율로 저장됩니다</li>
                <li>• 프로필 이미지가 없으면 이름의 첫 글자가 표시됩니다</li>
                <li>• 이름에 따라 자동으로 색상이 지정됩니다</li>
                <li>• 같은 사람의 연속 메시지는 아바타 없이 그룹화됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
