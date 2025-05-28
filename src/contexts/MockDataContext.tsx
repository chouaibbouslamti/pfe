"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type MockDataContextType = {
  useMockData: boolean;
  toggleMockData: () => void;
};

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [useMockData, setUseMockData] = useState(false);

  const toggleMockData = () => {
    setUseMockData(prev => !prev);
  };

  return (
    <MockDataContext.Provider value={{ useMockData, toggleMockData }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockDataContext() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockDataContext must be used within a MockDataProvider');
  }
  return context;
}
