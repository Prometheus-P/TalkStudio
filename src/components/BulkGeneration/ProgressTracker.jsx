/**
 * ProgressTracker - 대량 생성 진행 상태 표시 컴포넌트
 * T041: 실시간 진행 상태와 결과 다운로드 기능
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { getBulkJobStatus, downloadBulkResults } from '../../services/conversationApi';

const ProgressTracker = ({ jobId, onComplete, onError }) => {
  const [job, setJob] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch job status
  const fetchStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const status = await getBulkJobStatus(jobId);
      setJob(status);

      // Check if completed
      if (status.status === 'completed' || status.status === 'failed') {
        setIsPolling(false);
        if (status.status === 'completed' && onComplete) {
          onComplete(status);
        }
        if (status.status === 'failed' && onError) {
          onError(new Error('대량 생성에 실패했습니다.'));
        }
      }
    } catch (err) {
      setError(err.message || '상태 조회에 실패했습니다.');
      setIsPolling(false);
      if (onError) onError(err);
    }
  }, [jobId, onComplete, onError]);

  // Poll for status updates
  useEffect(() => {
    if (!jobId) return;

    fetchStatus();

    let intervalId;
    if (isPolling) {
      intervalId = setInterval(fetchStatus, 2000); // Poll every 2 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [jobId, isPolling, fetchStatus]);

  // Download results
  const handleDownload = async () => {
    if (!jobId || isDownloading) return;

    setIsDownloading(true);
    try {
      await downloadBulkResults(jobId);
    } catch (err) {
      setError(err.message || '다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Retry polling
  const handleRetry = () => {
    setError(null);
    setIsPolling(true);
  };

  if (!job) {
    return (
      <div
        style={{
          padding: '32px',
          textAlign: 'center',
          color: '#9CA3AF',
        }}
      >
        <Loader2 size={32} className="animate-spin mx-auto mb-3" />
        <p className="text-sm">작업 정보 불러오는 중...</p>
      </div>
    );
  }

  const progress = job.progress || 0;
  const isProcessing = job.status === 'processing' || job.status === 'pending';
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div
        style={{
          padding: '16px',
          borderRadius: '12px',
          background: isCompleted
            ? '#F0FDF4'
            : isFailed
            ? '#FEF2F2'
            : '#F3E8FF',
          border: isCompleted
            ? '1px solid #BBF7D0'
            : isFailed
            ? '1px solid #FECACA'
            : '1px solid #E9D5FF',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {isProcessing && (
          <Loader2 size={24} className="text-purple-500 animate-spin" />
        )}
        {isCompleted && <CheckCircle size={24} className="text-green-500" />}
        {isFailed && <XCircle size={24} className="text-red-500" />}

        <div className="flex-1">
          <p
            className="font-semibold"
            style={{
              color: isCompleted ? '#16A34A' : isFailed ? '#DC2626' : '#7C3AED',
            }}
          >
            {isProcessing && '대화 생성 중...'}
            {isCompleted && '생성 완료!'}
            {isFailed && '생성 실패'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {job.completedScenarios + job.failedScenarios} / {job.totalScenarios} 시나리오 처리됨
          </p>
        </div>

        {/* Elapsed Time */}
        {job.startedAt && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {getElapsedTime(job.startedAt, job.completedAt)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div
          style={{
            height: '12px',
            borderRadius: '6px',
            background: '#E5E7EB',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: '6px',
              background: isCompleted
                ? 'linear-gradient(90deg, #10B981 0%, #059669 100%)'
                : isFailed
                ? 'linear-gradient(90deg, #EF4444 0%, #DC2626 100%)'
                : 'linear-gradient(90deg, #A855F7 0%, #7C3AED 100%)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>
            성공: <span className="text-green-600 font-medium">{job.completedScenarios}</span>
          </span>
          <span className="font-semibold text-purple-600">{progress}%</span>
          <span>
            실패: <span className="text-red-600 font-medium">{job.failedScenarios}</span>
          </span>
        </div>
      </div>

      {/* Error Details */}
      {job.errors && job.errors.length > 0 && (
        <div
          style={{
            padding: '12px',
            borderRadius: '10px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-sm font-medium text-red-700">
              {job.errors.length}개 시나리오 실패
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {job.errors.slice(0, 5).map((err, idx) => (
              <p key={idx} className="text-xs text-red-600">
                • 시나리오 #{err.scenarioIndex + 1}: {err.error}
              </p>
            ))}
            {job.errors.length > 5 && (
              <p className="text-xs text-red-500 font-medium">
                ...외 {job.errors.length - 5}개
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <span className="text-sm text-red-600">{error}</span>
          <button
            onClick={handleRetry}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #FECACA',
              background: '#FFFFFF',
              color: '#DC2626',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={12} />
            다시 시도
          </button>
        </div>
      )}

      {/* Actions */}
      {(isCompleted || isFailed) && (
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: 'none',
            background: isDownloading
              ? '#E5E7EB'
              : 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
            color: isDownloading ? '#9CA3AF' : '#FFFFFF',
            fontSize: '15px',
            fontWeight: 700,
            cursor: isDownloading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: isDownloading
              ? 'none'
              : '0 4px 12px rgba(16, 185, 129, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          {isDownloading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              다운로드 중...
            </>
          ) : (
            <>
              <Download size={18} />
              결과 다운로드 (ZIP)
            </>
          )}
        </button>
      )}
    </div>
  );
};

// Helper function to calculate elapsed time
const getElapsedTime = (startedAt, completedAt) => {
  const start = new Date(startedAt);
  const end = completedAt ? new Date(completedAt) : new Date();
  const seconds = Math.floor((end - start) / 1000);

  if (seconds < 60) {
    return `${seconds}초`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}분 ${remainingSeconds}초`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}시간 ${remainingMinutes}분`;
};

export default ProgressTracker;
