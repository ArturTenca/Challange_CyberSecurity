import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VehicleData {
  model: string;
  tagline: string;
  price: string;
  year: number;
  engineSpecs?: Record<string, any>;
  hotspots?: any[];
}

interface VehicleStore {
  // State
  vehicles: VehicleData[];
  selectedVehicle: VehicleData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;

  // Actions
  setVehicles: (vehicles: VehicleData[]) => void;
  setSelectedVehicle: (vehicle: VehicleData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (timestamp: number) => void;
  clearError: () => void;
  resetStore: () => void;
}

export const useVehicleStore = create<VehicleStore>()(
  persist(
    (set) => ({
      // Initial state
      vehicles: [],
      selectedVehicle: null,
      loading: false,
      error: null,
      lastUpdated: null,

      // Actions
      setVehicles: (vehicles) => set({ vehicles }),
      setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
      clearError: () => set({ error: null }),
      resetStore: () =>
        set({
          vehicles: [],
          selectedVehicle: null,
          loading: false,
          error: null,
          lastUpdated: null,
        }),
    }),
    {
      name: 'vehicle-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        vehicles: state.vehicles,
        selectedVehicle: state.selectedVehicle,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

/**
 * Custom hook to use vehicle store with offline support
 * Note: Data staleness check is delegated to components to avoid impure function calls in hooks
 */
export const useVehicleData = () => {
  const store = useVehicleStore();
  
  return {
    ...store,
    hasOfflineData: store.vehicles.length > 0,
    // Components should check staleness separately to avoid impure Date.now() calls
  };
};
