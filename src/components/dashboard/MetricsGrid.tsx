'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, Tooltip, Legend,
  CartesianGrid, XAxis, YAxis 
} from 'recharts';
import { MOCK_MONTHLY_CONVS, MOCK_TICKET_TRENDS } from '../../mock-data';
import { useDashboardSummary, useDashboardCharts, useTickets, useCustomers } from '../../hooks/useApi';

export default function MetricsGrid() {
  const { data: summary, isLoading: isSummaryLoading } = useDashboardSummary();
  const { data: charts, isLoading: isChartsLoading } = useDashboardCharts();
  const { data: tickets = [], isLoading: isTicketsLoading } = useTickets();
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomers();

  if (isSummaryLoading || isChartsLoading || isTicketsLoading || isCustomersLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing Live Dashboard SLA Metrics...</span>
      </div>
    );
  }

  // Map values with API data or fallback mock benchmarks
  const totalConvs = summary?.conversations_count || 2980;
  const openTickets = summary?.open_tickets_count || tickets.filter(t => t.status === 'open' || t.status === 'pending').length;
  const activeEscalations = summary?.escalated_tickets_count || tickets.filter(t => t.status === 'escalated').length;
  const resolutionRate = summary?.resolution_rate || 94.2;
  const csatScore = summary?.csat_score || 4.85;
  const aiAutomationRate = summary?.ai_automation_rate || 81.0;

  const monthlyVolumeData = charts?.monthly_volume && charts.monthly_volume.length > 0 
    ? charts.monthly_volume 
    : MOCK_MONTHLY_CONVS;

  const ticketTrendsData = charts?.ticket_trends && charts.ticket_trends.length > 0
    ? charts.ticket_trends
    : MOCK_TICKET_TRENDS;

  // Custom Recharts styling configurations
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-brand-navy border border-slate-800 rounded-lg shadow-2xl backdrop-blur-md text-[11px] font-mono">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
              <span>{p.name}:</span>
              <span className="font-bold">{p.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Metric Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Conversations */}
        <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tracking-wider">CONVERSATIONS</span>
            <div className="p-1.5 rounded-lg bg-brand-blue/10 border border-brand-blue/20">
              <Icons.MessageSquare className="w-4 h-4 text-brand-blue" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">{totalConvs}</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] text-brand-emerald">
              <Icons.TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% this week</span>
            </div>
          </div>
        </div>

        {/* Open Tickets */}
        <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tracking-wider">OPEN TICKETS</span>
            <div className="p-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20">
              <Icons.Ticket className="w-4 h-4 text-brand-orange" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">{openTickets}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[10px]">
              <span className="px-1.5 py-0.5 rounded bg-brand-rose/25 text-brand-rose font-mono font-bold">
                {activeEscalations} ESCALATED
              </span>
            </div>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tracking-wider">RESOLUTION RATE</span>
            <div className="p-1.5 rounded-lg bg-brand-emerald/10 border border-brand-emerald/20">
              <Icons.CheckSquare className="w-4 h-4 text-brand-emerald" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">{resolutionRate}%</h3>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
              <div className="bg-brand-emerald h-1.5 rounded-full" style={{ width: `${resolutionRate}%` }} />
            </div>
          </div>
        </div>

        {/* Customer Satisfaction */}
        <div className="glass-card p-4 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tracking-wider">CUSTOMER CSAT</span>
            <div className="p-1.5 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20">
              <Icons.Smile className="w-4 h-4 text-brand-cyan" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">{csatScore.toFixed(2)} / 5.0</h3>
            <div className="flex gap-0.5 mt-1.5">
              {[...Array(5)].map((_, i) => (
                <Icons.Star key={i} className="w-3.5 h-3.5 fill-brand-cyan text-brand-cyan" />
              ))}
            </div>
          </div>
        </div>

        {/* AI Automation Rate */}
        <div className="glass-card p-4 rounded-xl flex flex-col justify-between border-brand-blue/30 shadow-lg shadow-brand-blue/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono tracking-wider">AI AUTOMATION</span>
            <div className="p-1.5 rounded-lg bg-brand-blue/20 border border-brand-blue/30 animate-pulse-glow">
              <Icons.Cpu className="w-4 h-4 text-brand-cyan" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-white tracking-tight">{aiAutomationRate}%</h3>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden border border-slate-800">
              <div className="bg-brand-cyan h-1.5 rounded-full animate-pulse-glow" style={{ width: `${aiAutomationRate}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Analytical Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Conversations Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Monthly Operations Volume</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Automated queries vs escalated sessions</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-blue" />
                <span>Automated</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-brand-orange" />
                <span>Escalated</span>
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEsc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF9900" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF9900" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Area type="monotone" name="Automated" dataKey="automated" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorAuto)" />
                <Area type="monotone" name="Escalated" dataKey="escalated" stroke="#FF9900" strokeWidth={2} fillOpacity={1} fill="url(#colorEsc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ticket Trends Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Weekly Ticket Priority Distribution</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Categorization of escalated support items</p>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', paddingTop: '10px' }} />
                <Bar dataKey="low" name="Low" fill="#64748b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="medium" name="Medium" fill="#06B6D4" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="high" name="High" fill="#FF9900" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="critical" name="Critical" fill="#F43F5E" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Live Monitoring System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Support Tickets */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Live High-Priority Tickets</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">SLA-monitored customer escalations</p>
            </div>
            <Icons.Activity className="w-4 h-4 text-brand-rose animate-pulse" />
          </div>

          <div className="space-y-3 overflow-y-auto max-h-60 pr-1">
            {tickets.slice(0, 5).map((t) => (
              <div 
                key={t.id} 
                className="p-3 bg-slate-950/40 rounded-xl border border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-300">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase ${
                      t.priority === 'critical' 
                        ? 'bg-brand-rose/20 text-brand-rose border border-brand-rose/30' 
                        : t.priority === 'high' 
                        ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30' 
                        : 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                    }`}>
                      {t.priority}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{t.customerName}</span>
                  </div>
                  <p className="text-slate-300 truncate max-w-md font-medium">{t.title}</p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-[10px] font-mono text-slate-500">
                    Updated {formatTime(t.updatedAt)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    t.status === 'escalated' 
                      ? 'bg-brand-rose/15 text-brand-rose' 
                      : t.status === 'open' 
                      ? 'bg-brand-blue/15 text-brand-blue' 
                      : 'bg-brand-emerald/15 text-brand-emerald'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Client Sentiments */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Active CRM Sentiments</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Real-time tone checks</p>
            </div>
            <Icons.Heart className="w-4 h-4 text-brand-rose" />
          </div>

          <div className="space-y-4">
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full border border-slate-700" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center font-bold">
                        {c.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-slate-200">{c.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase ${
                    c.sentiment === 'happy' 
                      ? 'bg-brand-emerald/15 text-brand-emerald' 
                      : c.sentiment === 'frustrated' 
                      ? 'bg-brand-rose/15 text-brand-rose animate-pulse' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {c.sentiment}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-900">
                    <div 
                      className={`h-1.5 rounded-full ${
                        c.sentimentScore < 40 
                          ? 'bg-brand-rose' 
                          : c.sentimentScore < 70 
                          ? 'bg-brand-orange' 
                          : 'bg-brand-emerald'
                      }`}
                      style={{ width: `${c.sentimentScore}%` }} 
                    />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{c.sentimentScore} / 100</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

// Helpers
const formatTime = (isoString: string): string => {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'Pending';
  }
};
