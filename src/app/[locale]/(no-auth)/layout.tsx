"use client";

import { NoAuthHeader } from "@/components/layout/NoAuthHeader";
import { useRequireGuest } from "@/hooks/useAuthGuard";

const NoAuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated } = useRequireGuest();

  if (isLoading || isAuthenticated) {
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