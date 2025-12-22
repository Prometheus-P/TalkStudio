/**
 * TalkStudio - UI Store
 * 로딩 상태, 토스트, 모달 등 UI 상태 관리
 */
import { create } from 'zustand';

const useUIStore = create((set, get) => ({
  // ============================================
  // Loading States
  // ============================================
  loading: {
    isExporting: false,
    isSaving: false,
    isLoading: false,
  },

  setLoading: (key, value) => set((state) => ({
    loading: { ...state.loading, [key]: value },
  })),

  // ============================================
  // Toast Notifications
  // ============================================
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    const newToast = {
      id,
      type: 'info', // info, success, error, warning
      message: '',
      duration: 3000,
      ...toast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // Auto-remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  clearToasts: () => set({ toasts: [] }),

  // ============================================
  // Modal States
  // ============================================
  modals: {
    projectList: false,
    deleteConfirm: false,
    exportOptions: false,
  },

  openModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: true },
  })),

  closeModal: (modalName) => set((state) => ({
    modals: { ...state.modals, [modalName]: false },
  })),

  closeAllModals: () => set({
    modals: {
      projectList: false,
      deleteConfirm: false,
      exportOptions: false,
    },
  }),

  // ============================================
  // Error State
  // ============================================
  error: null,

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  // ============================================
  // Helper Actions
  // ============================================

  /** 성공 토스트 표시 */
  showSuccess: (message) => get().addToast({ type: 'success', message }),

  /** 에러 토스트 표시 */
  showError: (message) => get().addToast({ type: 'error', message, duration: 5000 }),

  /** 경고 토스트 표시 */
  showWarning: (message) => get().addToast({ type: 'warning', message }),

  /** 정보 토스트 표시 */
  showInfo: (message) => get().addToast({ type: 'info', message }),
}));

export default useUIStore;
