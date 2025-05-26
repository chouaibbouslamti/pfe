// src/components/providers/AppProviders.tsx
"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import React, { useState } from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  // Ensure QueryClient is only created once per client and during client-side rendering
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
