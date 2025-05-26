
"use client";

// Removed QueryClient and QueryClientProvider as Firebase is removed
// and react-query was primarily used with it.
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
  );
}
