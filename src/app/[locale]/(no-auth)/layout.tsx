"use client";

import { NoAuthHeader } from "@/components/layout/NoAuthHeader";
import { useRequireGuest } from "@/hooks/useAuthGuard";
import { GUEST_GUARD_EXEMPT_PATHS } from "@/shared/constants/publicRoutes";
import { usePathname } from "@/shared/i18n/navigation";

const NoAuthLayout = ({ children }: { children: React.ReactNode }) => {
  const isGuestOnly = !GUEST_GUARD_EXEMPT_PATHS.includes(usePathname());
  const { isLoading, isAuthenticated } = useRequireGuest({ enabled: isGuestOnly });

  if (isGuestOnly && (isLoading || isAuthenticated)) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <NoAuthHeader />
      {children}
    </div>
  );
};


export default NoAuthLayout;