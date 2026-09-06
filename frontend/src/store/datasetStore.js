import { create } from 'zustand'

export const useDatasetStore = create((set) => ({
  datasets: [],
  currentDataset: null,
  currentResults: null,
  isLoading: false,
  error: null,

  setDatasets: (datasets) => set({ datasets }),
  setCurrentDataset: (dataset) => set({ currentDataset: dataset }),
  setCurrentResults: (results) => set({ currentResults: results }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  addDataset: (dataset) => set((state) => ({
    datasets: [dataset, ...state.datasets]
  })),

  removeDataset: (id) => set((state) => ({
    datasets: state.datasets.filter((d) => d._id !== id)
  })),

  updateDatasetStatus: (id, status) => set((state) => ({
    datasets: state.datasets.map((d) =>
      d._id === id ? { ...d, status } : d
    )
  })),

  reset: () => set({
    currentDataset: null,
    currentResults: null,
    isLoading: false,
    error: null,
  }),
}))
