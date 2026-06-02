'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import Navigation from './Navigation';
import Header from './Header';
import * as Icons from 'lucide-react';

// Lazy load / direct import of our views
import DashboardView from '../dashboard/MetricsGrid';
import ChatView from '../chat/ChatSidebar';
import TicketsView from '../tickets/TicketsTable';
import KBView from '../knowledge-base/KBView';
import AgentsView from '../ai-agents/AgentGrid';
import ArchitectureView from '../architecture/AWSArchFlow';
import AnalyticsView from '../analytics/DeepAnalytics';
import CustomersView from '../customers/SentimentTimeline';
import SettingsView from '../settings/SettingsView';
import AuthGateway from '../common/AuthGateway';

export default function DashboardShell() {
  const { activeTab, setActiveTab } = useAppStore();
  const [mounted, setMounted] = useState(false);

  // Avoid Hydration errors in Next.js
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    // If URL contains route hash, we sync
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.replace('/', '');
      if (path && ['dashboard', 'conversations', 'tickets', 'knowledge-base', 'ai-agents', 'architecture', 'analytics', 'customers', 'settings'].includes(path)) {
        setActiveTab(path);
      }
    }
  }, [setActiveTab]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Icons.Cpu className="w-10 h-10 text-brand-blue animate-spin" />
          <span className="font-mono text-xs tracking-widest text-slate-500 uppercase">Connecting MDM Gateway...</span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'conversations':
        return <ChatView />;
      case 'tickets':
        return <TicketsView />;
      case 'knowledge-base':
        return <KBView />;
      case 'ai-agents':
        return <AgentsView />;
      case 'architecture':
        return <ArchitectureView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'customers':
        return <CustomersView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <AuthGateway>
      <div className="min-h-screen bg-brand-dark flex flex-col md:flex-row">
        {/* Sidebar Navigation */}
        <Navigation />

        {/* Main Screen Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Global Nav Header */}
          <Header />

          {/* Viewport Frame */}
          <main className="flex-1 p-6 overflow-y-auto bg-brand-dark/30">
            <div className="max-w-7xl mx-auto space-y-6">
              {renderActiveView()}
            </div>
          </main>

          {/* Technical Footer */}
          <footer className="py-4 px-6 border-t border-slate-900 bg-slate-950/20 text-center text-[10px] text-slate-500 font-mono tracking-wider flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>LAUKI AI CUSTOMER CARE HUB • PRODUCTION-READY ACTIVE ENDPOINTS</span>
            <span>AWS BEDROCK ENCRYPTION SYSTEM V2 • REACT 19 / TS 5</span>
          </footer>
        </div>
      </div>
    </AuthGateway>
  );
}
