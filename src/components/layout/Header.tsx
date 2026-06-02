'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import * as Icons from 'lucide-react';

export default function Header() {
  const { activeTab, notifications, dismissNotification, markNotificationsAsRead } = useAppStore();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'conversations': return 'AI Care Conversational Terminal';
      case 'tickets': return 'Enterprise Support Center';
      case 'knowledge-base': return 'RAG Vector Index Manager';
      case 'ai-agents': return 'Multi-Agent Mesh Board';
      case 'architecture': return 'AWS Cloud Infrastructure';
      case 'analytics': return 'Deep BI Analytics & SLA';
      case 'customers': return 'CRM Operations Hub';
      case 'settings': return 'Core Settings & AWS Keys';
      default: return 'Lauki Platform';
    }
  };

  return (
    <header className="sticky top-0 right-0 z-30 w-full glass-panel border-b border-slate-800 bg-brand-dark/45 px-6 py-4 flex items-center justify-between text-slate-200">
      
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono tracking-wider">
          <span>LAUKI PLATFORM</span>
          <Icons.ChevronRight className="w-3 h-3" />
          <span className="uppercase text-brand-blue">{activeTab}</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-wide mt-0.5">
          {getBreadcrumb()}
        </h1>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-6">
        
        {/* AWS System Health Indicator */}
        <div className="hidden lg:flex items-center gap-4 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] font-mono text-slate-400 tracking-wider">AWS CLOUD STATUS</span>
          <div className="h-4 w-[1px] bg-slate-850" />
          
          <div className="flex items-center gap-1.5" title="Cognito Integration Health">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
            <span className="text-[10px] text-slate-300 font-mono">Cognito</span>
          </div>
          <div className="flex items-center gap-1.5" title="OpenSearch Vector Sync Health">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
            <span className="text-[10px] text-slate-300 font-mono">OpenSearch</span>
          </div>
          <div className="flex items-center gap-1.5" title="Bedrock LLM Pipeline Health">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
            <span className="text-[10px] text-slate-300 font-mono">Bedrock</span>
          </div>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (unreadCount > 0) markNotificationsAsRead();
            }}
            className="p-2 rounded-lg bg-slate-900/60 border border-slate-850 hover:bg-slate-800 hover:text-white transition-all relative"
            title="System Alerts"
          >
            <Icons.Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-rose animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-xl bg-brand-navy/95 border border-slate-850 shadow-2xl p-4 z-50 backdrop-blur-xl animate-fade-in">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white tracking-wide">SYSTEM ALERTS</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-brand-rose/25 text-brand-rose font-mono">
                    {unreadCount} NEW
                  </span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-xs">
                  <Icons.CheckCircle2 className="w-8 h-8 text-brand-emerald/40 mb-2" />
                  No critical alerts active.
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-850 flex items-start justify-between gap-3 text-[11px] group"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              notif.type === 'error'
                                ? 'bg-brand-rose'
                                : notif.type === 'warning'
                                ? 'bg-brand-orange'
                                : notif.type === 'success'
                                ? 'bg-brand-emerald'
                                : 'bg-brand-cyan'
                            }`}
                          />
                          <span className="font-mono text-[9px] text-slate-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-slate-200 leading-relaxed">{notif.message}</p>
                      </div>
                      <button
                        onClick={() => dismissNotification(notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                        title="Dismiss Alert"
                      >
                        <Icons.X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global SLA Counter */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
            <Icons.Timer className="w-4 h-4 text-brand-orange" />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] font-mono text-slate-400 leading-none">AVG ACCURACY SLA</span>
            <span className="text-xs font-bold text-white mt-0.5">98.4%</span>
          </div>
        </div>

      </div>
    </header>
  );
}
