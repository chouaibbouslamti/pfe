
"use client";

// Removed QueryClient and QueryClientProvider as Firebase is removed
// and react-query was primarily used with it.
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import React from 'react';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { MockDataProvider } from '@/contexts/MockDataContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MockDataProvider>
          {children}
          <Toaster />
        </MockDataProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
