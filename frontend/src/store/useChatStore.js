/**
 * TalkStudio Chat Store
 * Zustand store for managing chat state, themes, and Excel import
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Unique ID generator
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

// Default profiles
const DEFAULT_PROFILES = {
  me: {
    id: 'me',
    name: '나',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me&backgroundColor=ffdfbf',
  },
  other: {
    id: 'other',
    name: '상대방',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=other&backgroundColor=b6e3f4',
  },
};

// Default status bar
const DEFAULT_STATUS_BAR = {
  time: '10:30',
  battery: 85,
  isWifi: true,
};

// Initial state
const initialState = {
  // Theme configuration
  config: {
    theme: 'kakao',
    capturedImage: null,
  },

  // Status bar settings
  statusBar: { ...DEFAULT_STATUS_BAR },

  // Profiles for me and other
  profiles: { ...DEFAULT_PROFILES },

  // Messages array
  messages: [],

  // Excel import state
  excelImport: {
    isLoading: false,
    error: null,
    lastImport: null,
    stats: null,
  },

  // UI state
  ui: {
    selectedMessageId: null,
    isEditing: false,
  },
};

/**
 * Main chat store
 */
const useChatStore = create(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // ============================================================
        // Theme Actions
        // ============================================================

        /**
         * Set the current theme
         */
        setTheme: (theme) => {
          set((state) => {
            state.config.theme = theme;
          });
          // Also update the document attribute for CSS
          document.documentElement.setAttribute('data-theme', theme);
        },

        /**
         * Get current theme
         */
        getTheme: () => get().config.theme,

        // ============================================================
        // Message Actions
        // ============================================================

        /**
         * Add a single message
         */
        addMessage: (msg) => {
          set((state) => {
            const newMessage = {
              id: msg.id || generateId(),
              speaker: msg.speaker || 'other',
              speaker_name: msg.speaker_name || null,
              text: msg.text || '',
              type: msg.type || 'text',
              timestamp: msg.timestamp || new Date().toISOString(),
              read: msg.read ?? true,
            };
            state.messages.push(newMessage);
          });
        },

        /**
         * Add multiple messages at once
         */
        addMessages: (messages) => {
          set((state) => {
            const newMessages = messages.map((msg) => ({
              id: msg.id || generateId(),
              speaker: msg.speaker || 'other',
              speaker_name: msg.speaker_name || null,
              text: msg.text || '',
              type: msg.type || 'text',
              timestamp: msg.timestamp || new Date().toISOString(),
              read: msg.read ?? true,
            }));
            state.messages.push(...newMessages);
          });
        },

        /**
         * Update a specific message
         */
        updateMessage: (id, updates) => {
          set((state) => {
            const index = state.messages.findIndex((m) => m.id === id);
            if (index !== -1) {
              state.messages[index] = { ...state.messages[index], ...updates };
            }
          });
        },

        /**
         * Remove a message by ID
         */
        removeMessage: (id) => {
          set((state) => {
            state.messages = state.messages.filter((m) => m.id !== id);
          });
        },

        /**
         * Clear all messages
         */
        clearMessages: () => {
          set((state) => {
            state.messages = [];
          });
        },

        /**
         * Replace all messages (useful for Excel import)
         */
        setMessages: (messages) => {
          set((state) => {
            state.messages = messages.map((msg) => ({
              id: msg.id || generateId(),
              speaker: msg.speaker || 'other',
              speaker_name: msg.speaker_name || null,
              text: msg.text || '',
              type: msg.type || 'text',
              timestamp: msg.timestamp || new Date().toISOString(),
              read: msg.read ?? true,
            }));
          });
        },

        /**
         * Reorder messages (drag and drop)
         */
        reorderMessages: (fromIndex, toIndex) => {
          set((state) => {
            const [removed] = state.messages.splice(fromIndex, 1);
            state.messages.splice(toIndex, 0, removed);
          });
        },

        // ============================================================
        // Profile Actions
        // ============================================================

        /**
         * Update a profile (me or other)
         */
        updateProfile: (profileId, updates) => {
          set((state) => {
            if (state.profiles[profileId]) {
              state.profiles[profileId] = { ...state.profiles[profileId], ...updates };
            }
          });
        },

        /**
         * Reset profiles to default
         */
        resetProfiles: () => {
          set((state) => {
            state.profiles = { ...DEFAULT_PROFILES };
          });
        },

        // ============================================================
        // Status Bar Actions
        // ============================================================

        /**
         * Update status bar settings
         */
        updateStatusBar: (updates) => {
          set((state) => {
            state.statusBar = { ...state.statusBar, ...updates };
          });
        },

        /**
         * Reset status bar to default
         */
        resetStatusBar: () => {
          set((state) => {
            state.statusBar = { ...DEFAULT_STATUS_BAR };
          });
        },

        // ============================================================
        // Excel Import Actions
        // ============================================================

        /**
         * Set Excel import loading state
         */
        setExcelLoading: (isLoading) => {
          set((state) => {
            state.excelImport.isLoading = isLoading;
            if (isLoading) {
              state.excelImport.error = null;
            }
          });
        },

        /**
         * Set Excel import error
         */
        setExcelError: (error) => {
          set((state) => {
            state.excelImport.error = error;
            state.excelImport.isLoading = false;
          });
        },

        /**
         * Import messages from Excel parse result
         */
        importFromExcel: (messages, stats) => {
          set((state) => {
            // Add all messages
            state.messages = messages.map((msg) => ({
              id: msg.id || generateId(),
              speaker: msg.speaker || 'other',
              speaker_name: msg.speaker_name || null,
              text: msg.text || '',
              type: msg.type || 'text',
              timestamp: msg.timestamp || new Date().toISOString(),
              read: msg.read ?? true,
            }));

            // Update import state
            state.excelImport.isLoading = false;
            state.excelImport.error = null;
            state.excelImport.lastImport = new Date().toISOString();
            state.excelImport.stats = stats;
          });
        },

        /**
         * Append messages from Excel (don't replace existing)
         */
        appendFromExcel: (messages, stats) => {
          set((state) => {
            const newMessages = messages.map((msg) => ({
              id: msg.id || generateId(),
              speaker: msg.speaker || 'other',
              speaker_name: msg.speaker_name || null,
              text: msg.text || '',
              type: msg.type || 'text',
              timestamp: msg.timestamp || new Date().toISOString(),
              read: msg.read ?? true,
            }));

            state.messages.push(...newMessages);
            state.excelImport.isLoading = false;
            state.excelImport.error = null;
            state.excelImport.lastImport = new Date().toISOString();
            state.excelImport.stats = stats;
          });
        },

        // ============================================================
        // UI Actions
        // ============================================================

        /**
         * Select a message for editing
         */
        selectMessage: (id) => {
          set((state) => {
            state.ui.selectedMessageId = id;
          });
        },

        /**
         * Clear message selection
         */
        clearSelection: () => {
          set((state) => {
            state.ui.selectedMessageId = null;
          });
        },

        /**
         * Toggle editing mode
         */
        setEditing: (isEditing) => {
          set((state) => {
            state.ui.isEditing = isEditing;
          });
        },

        // ============================================================
        // Persistence Actions
        // ============================================================

        /**
         * Reset entire store to initial state
         */
        resetStore: () => {
          set(() => ({ ...initialState }));
          document.documentElement.setAttribute('data-theme', 'kakao');
        },

        /**
         * Export current state as JSON
         */
        exportState: () => {
          const state = get();
          return {
            config: state.config,
            statusBar: state.statusBar,
            profiles: state.profiles,
            messages: state.messages,
            exportedAt: new Date().toISOString(),
            version: '2.0.0',
          };
        },

        /**
         * Import state from JSON
         */
        importState: (data) => {
          set((state) => {
            if (data.config) state.config = data.config;
            if (data.statusBar) state.statusBar = data.statusBar;
            if (data.profiles) state.profiles = data.profiles;
            if (data.messages) {
              state.messages = data.messages.map((msg) => ({
                ...msg,
                id: msg.id || generateId(),
              }));
            }
          });

          // Apply theme
          const theme = get().config.theme;
          document.documentElement.setAttribute('data-theme', theme);
        },
      })),
      {
        name: 'talkstudio-chat',
        version: 2,
        partialize: (state) => ({
          config: state.config,
          statusBar: state.statusBar,
          profiles: state.profiles,
          messages: state.messages,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);

export default useChatStore;

// Selector hooks for better performance
export const useTheme = () => useChatStore((s) => s.config.theme);
export const useMessages = () => useChatStore((s) => s.messages);
export const useProfiles = () => useChatStore((s) => s.profiles);
export const useStatusBar = () => useChatStore((s) => s.statusBar);
export const useExcelImport = () => useChatStore((s) => s.excelImport);
