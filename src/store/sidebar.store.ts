import { create } from "zustand";

interface SidebarState {
  isExpanded: boolean;
  toggle: () => void;
  setExpanded: (isExpanded: boolean) => void;
  SIDEBAR_WIDTH: string;
  SIDEBAR_WIDTH_MOBILE: string; 
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,
  toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (isExpanded) => set({ isExpanded }),
  SIDEBAR_WIDTH: '16rem',
  SIDEBAR_WIDTH_MOBILE: '18rem',
}));



