import { create } from "zustand";

/**
 * Zustand store for Excel file mapping state
 */
const useMappingStore = create((set) => ({
  // File and sheet state
  excelFile: null,
  sheets: {},
  currentSheet: null,

  // Column mapping
  columnMapping: {},
  mappingValidation: {},

  // UI state
  isLoading: false,
  error: null,
  success: null,

  // Actions
  setExcelFile: (file, sheets, sheetNames) =>
    set({
      excelFile: file,
      sheets,
      currentSheet: sheetNames?.[0],
      error: null,
    }),

  setCurrentSheet: (sheetName) => set({ currentSheet: sheetName }),

  setColumnMapping: (mapping) => set({ columnMapping: mapping }),

  updateColumnMapping: (entity, fieldMapping) =>
    set((state) => ({
      columnMapping: {
        ...state.columnMapping,
        [entity]: {
          ...state.columnMapping[entity],
          ...fieldMapping,
        },
      },
    })),

  setMappingValidation: (validation) => set({ mappingValidation: validation }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, success: null }),

  setSuccess: (success) => set({ success, error: null }),

  reset: () =>
    set({
      excelFile: null,
      sheets: {},
      currentSheet: null,
      columnMapping: {},
      mappingValidation: {},
      isLoading: false,
      error: null,
      success: null,
    }),
}));

export default useMappingStore;
