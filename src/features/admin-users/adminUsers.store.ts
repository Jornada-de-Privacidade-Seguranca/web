import { create } from "zustand";
import type { AdminUsersStore } from "./adminUsers.types";

export const useAdminUsersStore = create<AdminUsersStore>((set) => ({
  invitedEmail: null,
  setInvitedEmail: (email: string | null) => set({ invitedEmail: email }),
  clearInvitedEmail: () => set({ invitedEmail: null }),
}));
