'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import DashboardShell from '../../components/layout/DashboardShell';

export default function TicketsPage() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  useEffect(() => {
    setActiveTab('tickets');
  }, [setActiveTab]);

  return <DashboardShell />;
}
