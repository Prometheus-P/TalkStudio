/**
 * TalkStudio - useAutoSave Hook
 * 자동 저장 기능 with debounce
 */
import { useEffect, useRef, useCallback, useState } from 'react';
import { saveProject } from '../utils/storage';

const DEFAULT_DEBOUNCE_MS = 2000; // 2초

/**
 * 자동 저장 훅
 * @param {Object} project - 저장할 프로젝트 데이터
 * @param {Object} options - 옵션 { enabled, debounceMs, onSave, onError }
 */
export const useAutoSave = (project, options = {}) => {
  const {
    enabled = true,
    debounceMs = DEFAULT_DEBOUNCE_MS,
    onSave,
    onError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [error, setError] = useState(null);
  const timeoutRef = useRef(null);
  const lastProjectRef = useRef(null);

  // 즉시 저장
  const saveNow = useCallback(async () => {
    if (!project || !project.id) return;

    setIsSaving(true);
    setError(null);

    try {
      const result = saveProject(project);

      if (result.success) {
        setLastSaved(new Date());
        lastProjectRef.current = JSON.stringify(project);
        onSave?.(result.project);
      } else {
        setError(result.message);
        onError?.(result);
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다.');
      onError?.({ error: 'UNKNOWN', message: err.message });
    } finally {
      setIsSaving(false);
    }
  }, [project, onSave, onError]);

  // 디바운스된 자동 저장
  useEffect(() => {
    if (!enabled || !project || !project.id) return;

    // 변경 사항 체크 (불필요한 저장 방지)
    const currentJSON = JSON.stringify(project);
    if (currentJSON === lastProjectRef.current) return;

    // 기존 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      saveNow();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [project, enabled, debounceMs, saveNow]);

  // 컴포넌트 언마운트 시 즉시 저장
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 변경 사항이 있으면 저장
      const currentJSON = JSON.stringify(project);
      if (currentJSON !== lastProjectRef.current && project?.id) {
        saveProject(project);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    error,
    saveNow, // 수동 저장 트리거
  };
};

export default useAutoSave;
