import { create } from "zustand";
import { persist } from "zustand/middleware";
import { dictionary } from "../utils/dictionary";

export const useStore = create(
  persist(
    (set, get) => ({
      // UI & Settings
      lang: "id",
      theme: "dark",
      showTooltips: true,
      geminiApiKey: "", // <-- Fitur API Key AI ditambahkan
      t: () => dictionary[get().lang],
      setSetting: (key, value) => set({ [key]: value }),

      // Editor State
      currentTool: "box",
      currentColor: "#10B981",
      activeView: "iso",
      showGrid: true,
      gridSize: 16,
      voxelCount: 0,
      selectedCount: 0,
      symX: false,
      symZ: false,
      axisLock: "y",

      // Status Bar
      statusMsgKey: "msgReady",
      coordDisplay: "X: 0 | Y: 0 | Z: 0",
      isExtrudingUI: false,
      isOrbiting: false,

      // Modals & Panels State
      modals: {
        newProj: false,
        saveProj: false,
        loadProj: false,
        clearConfirm: false,
        export: false,
        settings: false,
      },
      openModal: (modalName) =>
        set((state) => ({ modals: { ...state.modals, [modalName]: true } })),
      closeModal: (modalName) =>
        set((state) => ({ modals: { ...state.modals, [modalName]: false } })),

      showAiPanel: false,
      setShowAiPanel: (val) => set({ showAiPanel: val }),

      setStore: (updates) => set(updates),

      // Engine Actions
      engineActions: null,
      setEngineActions: (actions) => set({ engineActions: actions }),
    }),
    {
      name: "vPro_Settings",
      partialize: (state) => ({
        lang: state.lang,
        theme: state.theme,
        showTooltips: state.showTooltips,
        geminiApiKey: state.geminiApiKey, // <-- Menyimpan API Key di LocalStorage
      }),
    },
  ),
);
