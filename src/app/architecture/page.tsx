'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import DashboardShell from '../../components/layout/DashboardShell';

export default function ArchitecturePage() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  useEffect(() => {
    setActiveTab('architecture');
  }, [setActiveTab]);

  return <DashboardShell />;
}
