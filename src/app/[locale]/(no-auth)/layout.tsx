"use client";

import { NoAuthHeader } from "@/components/layout/NoAuthHeader";

const NoAuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <NoAuthHeader />
      {children}
    </div>
  );
};


export default NoAuthLayout;