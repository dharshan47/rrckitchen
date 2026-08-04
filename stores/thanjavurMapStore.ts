import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface ThanjavurMapState {
  loadedMaps: Record<string, boolean>;
  setMapLoaded: (id: string, loaded: boolean) => void;
  clearMap: (id: string) => void;
}

export const thanjavurMapStore = create<ThanjavurMapState>()((set) => ({
  loadedMaps: {},
  setMapLoaded: (id, loaded) =>
    set((state) => ({ loadedMaps: { ...state.loadedMaps, [id]: loaded } })),
  clearMap: (id) =>
    set((state) => {
      const loadedMaps = { ...state.loadedMaps };
      delete loadedMaps[id];
      return { loadedMaps };
    }),
}));

export function useThanjavurMapLoaded(id: string) {
  return thanjavurMapStore((s) => !!s.loadedMaps[id]);
}

export function useThanjavurMapActions() {
  return thanjavurMapStore(
    useShallow((s) => ({
      setMapLoaded: s.setMapLoaded,
      clearMap: s.clearMap,
    }))
  );
}
