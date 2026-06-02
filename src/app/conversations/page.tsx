'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import DashboardShell from '../../components/layout/DashboardShell';

export default function ConversationsPage() {
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  useEffect(() => {
    setActiveTab('conversations');
  }, [setActiveTab]);

  return <DashboardShell />;
}
