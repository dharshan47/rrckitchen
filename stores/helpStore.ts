import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

export interface HelpTopic {
  id: string;
  title: string;
  subtitle: string;
}

interface HelpState {
  activeCategory: string;
  activeTab: string;
  setActiveCategory: (category: string) => void;
  setActiveTab: (tab: string) => void;
}

export const helpStore = create<HelpState>()((set) => ({
  activeCategory: "orders",
  activeTab: "placing",
  setActiveCategory: (activeCategory) => set({ activeCategory }),
  setActiveTab: (activeTab) => set({ activeTab }),
}));

const selectActiveCategory = (s: HelpState) => s.activeCategory;
const selectActiveTab = (s: HelpState) => s.activeTab;

export function useHelpActiveCategory() {
  return helpStore(selectActiveCategory);
}

export function useHelpActiveTab() {
  return helpStore(selectActiveTab);
}

export function useHelpActions() {
  return helpStore(
    useShallow((s) => ({
      setActiveCategory: s.setActiveCategory,
      setActiveTab: s.setActiveTab,
    }))
  );
}
