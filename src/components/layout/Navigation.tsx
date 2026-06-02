'use client';

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SIDEBAR_LINKS } from '../../constants';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { useSettings, useProfile, useLogout } from '../../hooks/useApi';

// Helper to render Lucide Icons dynamically by name
const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
  const IconComponent = (Icons as any)[name];
  if (!IconComponent) return <Icons.HelpCircle className={className} />;
  return <IconComponent className={className} />;
};

export default function Navigation() {
  const { data: settings } = useSettings();
  const { data: profile } = useProfile();
  const logoutMutation = useLogout();

  const { 
    activeTab, 
    setActiveTab, 
    isSidebarCollapsed, 
    toggleSidebar, 
    notifications 
  } = useAppStore();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <aside 
      className={cn(
        "fixed md:sticky top-0 left-0 h-screen z-40 transition-all duration-300 glass-panel border-r border-slate-800 flex flex-col justify-between text-slate-300",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-blue shadow-lg shadow-brand-blue/30 text-white flex-shrink-0 animate-pulse-glow">
            <Icons.Cpu className="w-5 h-5" />
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-white tracking-wider text-sm">LAUKI CARE</span>
              <span className="text-[10px] text-brand-cyan font-mono tracking-widest font-semibold uppercase">Enterprise AI</span>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button 
            onClick={toggleSidebar} 
            className="hidden md:flex p-1.5 rounded-md hover:bg-slate-800/60 hover:text-white transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <Icons.ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {SIDEBAR_LINKS.map((link) => {
          const isActive = activeTab === link.path.replace('/', '');
          const isConversations = link.label === 'Conversations';

          return (
            <button
              key={link.label}
              onClick={() => setActiveTab(link.path.replace('/', ''))}
              className={cn(
                "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group duration-200 relative cursor-pointer",
                isActive 
                  ? "bg-brand-blue/15 text-white border-l-2 border-brand-blue shadow-inner" 
                  : "hover:bg-slate-800/40 hover:text-slate-100"
              )}
            >
              <DynamicIcon 
                name={link.iconName} 
                className={cn(
                  "w-5 h-5 flex-shrink-0",
                  isActive ? "text-brand-blue" : "text-slate-400 group-hover:text-slate-200"
                )} 
              />
              
              {!isSidebarCollapsed && (
                <span className="truncate">{link.label}</span>
              )}

              {/* Unread Indicator for Conversations */}
              {isConversations && unreadCount > 0 && (
                <span className={cn(
                  "absolute flex items-center justify-center text-[10px] font-bold rounded-full bg-brand-rose text-white animate-pulse",
                  isSidebarCollapsed ? "top-1 right-2 w-4 h-4" : "right-3 w-5 h-5"
                )}>
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Panel */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/20">
        {isSidebarCollapsed ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full flex items-center justify-center py-2.5 rounded-lg hover:bg-brand-rose/10 text-slate-400 hover:text-brand-rose transition-all cursor-pointer"
              title="Log Out Session"
            >
              <Icons.LogOut className="w-5 h-5" />
            </button>
            
            <button 
              onClick={toggleSidebar} 
              className="w-full flex items-center justify-center py-2 rounded-lg hover:bg-slate-800/40 cursor-pointer"
              title="Expand Sidebar"
            >
              <Icons.ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Active Model Indicator */}
            <div className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-800/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping" />
                <span className="text-[10px] text-slate-400 font-medium">AWS BEDROCK ACTIVE</span>
              </div>
              <p className="text-[11px] font-mono text-brand-orange truncate animate-pulse" title={settings?.bedrockModel || 'anthropic.claude-3-5-sonnet'}>
                {(settings?.bedrockModel || 'anthropic.claude-3-5-sonnet').replace('anthropic.', '').replace('meta.', '').replace('amazon.', '')}
              </p>
            </div>

            {/* Profile Summary & Logout */}
            <div className="flex items-center justify-between gap-2.5">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 shadow-inner">
                    {profile?.full_name?.charAt(0) || 'AD'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-brand-emerald border-2 border-brand-dark" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate">{profile?.full_name || 'Admin Operator'}</p>
                  <p className="text-[10px] text-slate-400 truncate">{profile?.role?.toUpperCase() || 'SLA Group A'}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="p-2 rounded-lg bg-slate-950/40 border border-slate-850 hover:bg-brand-rose/10 hover:border-brand-rose/30 hover:text-brand-rose transition-all flex-shrink-0 cursor-pointer"
                title="Log Out Session"
              >
                <Icons.LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
