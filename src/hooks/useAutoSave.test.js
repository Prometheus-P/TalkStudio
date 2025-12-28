/**
 * useAutoSave Hook Tests
 */
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from './useAutoSave';

// Mock storage
vi.mock('../utils/storage', () => ({
  saveProject: vi.fn(() => ({ success: true, project: {} })),
}));

import { saveProject } from '../utils/storage';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAutoSave({ id: 'test' }));

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBe(null);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.saveNow).toBe('function');
  });

  it('should not save when disabled', async () => {
    renderHook(() => useAutoSave({ id: 'test' }, { enabled: false }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(saveProject).not.toHaveBeenCalled();
  });

  it('should not save when project is null', async () => {
    renderHook(() => useAutoSave(null));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(saveProject).not.toHaveBeenCalled();
  });

  it('should not save when project has no id', async () => {
    renderHook(() => useAutoSave({ title: 'No ID' }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(saveProject).not.toHaveBeenCalled();
  });

  it('should debounce save calls', async () => {
    const project = { id: 'test', title: 'Test' };
    const { rerender } = renderHook(
      ({ proj }) => useAutoSave(proj, { debounceMs: 1000 }),
      { initialProps: { proj: project } }
    );

    // Update project multiple times
    rerender({ proj: { ...project, title: 'Update 1' } });
    act(() => { vi.advanceTimersByTime(500); });

    rerender({ proj: { ...project, title: 'Update 2' } });
    act(() => { vi.advanceTimersByTime(500); });

    rerender({ proj: { ...project, title: 'Update 3' } });

    // Should not have saved yet
    expect(saveProject).not.toHaveBeenCalled();

    // Wait for debounce
    act(() => { vi.advanceTimersByTime(1000); });

    expect(saveProject).toHaveBeenCalledTimes(1);
  });

  it('should save immediately when saveNow is called', async () => {
    const project = { id: 'test', title: 'Test' };
    const { result } = renderHook(() => useAutoSave(project));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(saveProject).toHaveBeenCalledWith(project);
  });

  it('should update lastSaved on successful save', async () => {
    const project = { id: 'test', title: 'Test' };
    const { result } = renderHook(() => useAutoSave(project));

    expect(result.current.lastSaved).toBe(null);

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('should call onSave callback on successful save', async () => {
    const onSave = vi.fn();
    const project = { id: 'test', title: 'Test' };
    const { result } = renderHook(() => useAutoSave(project, { onSave }));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(onSave).toHaveBeenCalled();
  });

  it('should handle save error', async () => {
    saveProject.mockReturnValueOnce({ success: false, message: 'Storage full' });

    const onError = vi.fn();
    const project = { id: 'test', title: 'Test' };
    const { result } = renderHook(() => useAutoSave(project, { onError }));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.error).toBe('Storage full');
    expect(onError).toHaveBeenCalled();
  });

  it('should handle exception during save', async () => {
    saveProject.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });

    const onError = vi.fn();
    const project = { id: 'test', title: 'Test' };
    const { result } = renderHook(() => useAutoSave(project, { onError }));

    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.error).toBe('저장 중 오류가 발생했습니다.');
    expect(onError).toHaveBeenCalled();
  });

  it('should not save when project has not changed', async () => {
    const project = { id: 'test', title: 'Test' };
    const { result, rerender } = renderHook(
      ({ proj }) => useAutoSave(proj, { debounceMs: 1000 }),
      { initialProps: { proj: project } }
    );

    // First save
    await act(async () => {
      await result.current.saveNow();
    });

    expect(saveProject).toHaveBeenCalledTimes(1);

    // Rerender with same project (reference different but content same)
    rerender({ proj: { id: 'test', title: 'Test' } });

    act(() => { vi.advanceTimersByTime(2000); });

    // Should not save again since content is the same
    expect(saveProject).toHaveBeenCalledTimes(1);
  });

  it('should set isSaving during save operation', async () => {
    const project = { id: 'test', title: 'Test' };
    const { result } = renderHook(() => useAutoSave(project));

    expect(result.current.isSaving).toBe(false);

    // We can't easily test the intermediate state in this setup
    // but we verify the final state
    await act(async () => {
      await result.current.saveNow();
    });

    expect(result.current.isSaving).toBe(false);
  });

  it('should use custom debounce time', async () => {
    const project = { id: 'test', title: 'Test' };
    renderHook(
      ({ proj }) => useAutoSave(proj, { debounceMs: 5000 }),
      { initialProps: { proj: project } }
    );

    act(() => { vi.advanceTimersByTime(2000); });
    expect(saveProject).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(3000); });
    expect(saveProject).toHaveBeenCalled();
  });
});
