import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export interface GeoResult {
  lat: number;
  lon: number;
  display_name: string;
  street: string;
  city: string;
  postcode: string;
}

interface LocationSearchState {
  query: string;
  manuallyClosed: boolean;
  results: GeoResult[];
  isFetching: boolean;
  setQuery: (query: string) => void;
  setManuallyClosed: (manuallyClosed: boolean) => void;
  setResults: (results: GeoResult[]) => void;
  setIsFetching: (isFetching: boolean) => void;
  resetSearch: () => void;
}

export const locationSearchStore = create<LocationSearchState>()((set) => ({
  query: "",
  manuallyClosed: false,
  results: [],
  isFetching: false,
  setQuery: (query) => set({ query }),
  setManuallyClosed: (manuallyClosed) => set({ manuallyClosed }),
  setResults: (results) => set({ results }),
  setIsFetching: (isFetching) => set({ isFetching }),
  resetSearch: () => set({ query: "", manuallyClosed: false, results: [], isFetching: false }),
}));

const selectQuery = (s: LocationSearchState) => s.query;
const selectManuallyClosed = (s: LocationSearchState) => s.manuallyClosed;
const selectResults = (s: LocationSearchState) => s.results;
const selectIsFetching = (s: LocationSearchState) => s.isFetching;

export function useLocationSearchInput() {
  return locationSearchStore(selectQuery);
}

export function useLocationSearchClosed() {
  return locationSearchStore(selectManuallyClosed);
}

export function useLocationSearchResults() {
  return locationSearchStore(selectResults);
}

export function useLocationSearchFetching() {
  return locationSearchStore(selectIsFetching);
}

export function useLocationSearchActions() {
  return locationSearchStore(
    useShallow((s) => ({
      setQuery: s.setQuery,
      setManuallyClosed: s.setManuallyClosed,
      setResults: s.setResults,
      setIsFetching: s.setIsFetching,
      resetSearch: s.resetSearch,
    }))
  );
}

/**
 * Debounced geocode search via TanStack Query, syncing the results and
 * fetching state into the store so the UI renders straight from zustand.
 */
export function useLocationSearchQuery(query: string) {
  const debouncedQuery = useDebouncedValue(query, 300);

  const result = useQuery<GeoResult[]>({
    queryKey: ["geocode-search", debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error("Search failed")
      return res.json()
    },
    enabled: debouncedQuery.length >= 1,
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  });

  useEffect(() => {
    locationSearchStore.getState().setIsFetching(result.isFetching);
  }, [result.isFetching]);

  useEffect(() => {
    if (result.data) {
      locationSearchStore.getState().setResults(result.data);
    }
  }, [result.data]);

  return result;
}
