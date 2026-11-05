import { create } from "zustand";

interface SidebarState {
  /** Barra expandida ou recolhida, a partir do breakpoint `md` */
  isExpanded: boolean;
  toggle: () => void;
  setExpanded: (isExpanded: boolean) => void;
  /** Drawer aberto ou fechado, abaixo do breakpoint `md` */
  isMobileOpen: boolean;
  toggleMobile: () => void;
  setMobileOpen: (isMobileOpen: boolean) => void;
  SIDEBAR_WIDTH: string;
  SIDEBAR_WIDTH_MOBILE: string;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isExpanded: true,
  toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (isExpanded) => set({ isExpanded }),
  isMobileOpen: false,
  toggleMobile: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setMobileOpen: (isMobileOpen) => set({ isMobileOpen }),
  SIDEBAR_WIDTH: '16rem',
  SIDEBAR_WIDTH_MOBILE: '18rem',
}));
