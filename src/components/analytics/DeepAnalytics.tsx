'use client';

import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { MOCK_COST_SAVINGS, MOCK_ESCALATION_REASONS, MOCK_RESOLUTION_TIMES } from '../../mock-data';
import { useAnalyticsCSAT, useAnalyticsTrends, useAnalyticsAiPerformance } from '../../hooks/useApi';

export default function DeepAnalytics() {
  const { data: csatData = [] } = useAnalyticsCSAT();
  const { data: trendsData = [] } = useAnalyticsTrends();
  const { data: aiPerf } = useAnalyticsAiPerformance();

  const [selectedRange, setSelectedRange] = useState('30d');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [exporting, setExporting] = useState<string | null>(null);

  // Pie chart colors
  const COLORS = ['#2563EB', '#FF9900', '#06B6D4', '#F43F5E'];

  // AI Accuracy trend fallback/mapping
  const accuracyTrend = aiPerf?.accuracy_trends && aiPerf.accuracy_trends.length > 0
    ? aiPerf.accuracy_trends
    : [
        { week: 'W1', accuracy: 96.2, latency: 450 },
        { week: 'W2', accuracy: 96.8, latency: 420 },
        { week: 'W3', accuracy: 97.4, latency: 410 },
        { week: 'W4', accuracy: 98.4, latency: 390 }
      ];

  const escalationBreakdown = aiPerf?.escalation_breakdown && aiPerf.escalation_breakdown.length > 0
    ? aiPerf.escalation_breakdown
    : MOCK_ESCALATION_REASONS;

  const resolutionTimes = aiPerf?.resolution_times && aiPerf.resolution_times.length > 0
    ? aiPerf.resolution_times
    : MOCK_RESOLUTION_TIMES;

  const costSavings = aiPerf?.cost_savings && aiPerf.cost_savings.length > 0
    ? aiPerf.cost_savings
    : MOCK_COST_SAVINGS;

  // Custom tooltips
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-brand-navy border border-slate-800 rounded-lg shadow-2xl backdrop-blur-md text-[11px] font-mono">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }} className="flex justify-between gap-4">
              <span>{p.name}:</span>
              <span className="font-bold">
                {p.name.includes('Cost') || p.name.includes('Savings') ? `$${p.value.toLocaleString()}` : p.value}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleExport = (type: string) => {
    setExporting(type);
    setTimeout(() => {
      setExporting(null);
      alert(`SaaS Demo: Deep BI Analytics successfully exported as ${type.toUpperCase()} package!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. BI Analytics Filters Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
        
        {/* Selection filters */}
        <div className="flex flex-wrap gap-3">
          
          {/* Timeframe */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">TIMEFRAME</span>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none pr-2 cursor-pointer"
            >
              <option value="7d">PAST 7 DAYS</option>
              <option value="30d">PAST 30 DAYS</option>
              <option value="90d">PAST 90 DAYS</option>
            </select>
          </div>

          {/* Channel */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">CHANNEL</span>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none pr-2 cursor-pointer"
            >
              <option value="all">ALL CHANNELS</option>
              <option value="web">WEB CHAT</option>
              <option value="phone">VOICE / CONNECT</option>
              <option value="sms">SMS PORTAL</option>
            </select>
          </div>

          {/* LLM Runtime */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">LLM RUNTIME</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none pr-2 cursor-pointer"
            >
              <option value="all">ALL MODELS</option>
              <option value="claude">CLAUDE 3.5 SONNET</option>
              <option value="llama">LLAMA 3.1 70B</option>
            </select>
          </div>

        </div>

        {/* Exports */}
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleExport('pdf')}
            disabled={!!exporting}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {exporting === 'pdf' ? (
              <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Icons.FileSpreadsheet className="w-3.5 h-3.5 text-brand-rose" />
            )}
            Export PDF Report
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={!!exporting}
            className="flex-1 sm:flex-initial py-1.5 px-3 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            {exporting === 'csv' ? (
              <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Icons.Download className="w-3.5 h-3.5 text-brand-cyan" />
            )}
            Export CSV Data
          </button>
        </div>

      </div>

      {/* 2. Primary BI analytical charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost Savings comparison */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Enterprise Financial Impact Savings</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Compares monthly human labor vs AI operations licensing expenditures</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costSavings} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip content={customTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', paddingTop: '10px' }} />
                <Bar dataKey="humanCost" name="Estimated Manual Cost" fill="#334155" radius={[0, 0, 0, 0]} />
                <Bar dataKey="savings" name="Calculated Net Savings" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Accuracy & Latency Trend */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Model Accuracy SLA & Latency Telemetry</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Week-on-week verification compliance checks vs processing speeds</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrend} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis yAxisId="left" stroke="#64748b" fontSize={10} tickLine={false} domain={[90, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={10} tickLine={false} domain={[300, 500]} />
                <Tooltip content={customTooltip} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8', paddingTop: '10px' }} />
                <Line yAxisId="left" type="monotone" name="Accuracy Rate (%)" dataKey="accuracy" stroke="#06B6D4" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" name="Average Speed (ms)" dataKey="latency" stroke="#FF9900" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Secondary Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Donut: Escalation categories */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 md:col-span-1">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Escalations Breakdown</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Top indicators routing sessions to humans</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={escalationBreakdown}
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {escalationBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-1.5 text-[9px] font-mono text-slate-400">
            {escalationBreakdown.map((entry: any, index: number) => (
              <div key={entry.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="truncate max-w-[130px]">{entry.name}</span>
                </div>
                <span className="font-bold text-white">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resolution Time comparison list */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4 md:col-span-2">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Average SLA Resolution Speeds</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Response metrics mapping human operator tiers vs serverless AI</p>
          </div>

          <div className="space-y-4 py-3">
            {resolutionTimes.map((item: any, index: number) => {
              const percentages = index === 0 ? 5 : (index === 1 ? 55 : 100);
              return (
                <div key={item.name} className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-200">{item.name}</span>
                    <span className="font-mono text-brand-cyan font-bold">
                      {item.avgSeconds < 60 
                        ? `${item.avgSeconds} Seconds` 
                        : item.avgSeconds < 3600 
                        ? `${(item.avgSeconds / 60).toFixed(1)} Mins` 
                        : `${(item.avgSeconds / 3600).toFixed(1)} Hours`}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-850">
                      <div 
                        className={cn(
                          "h-2 rounded-full",
                          index === 0 ? 'bg-brand-emerald' : (index === 1 ? 'bg-brand-blue' : 'bg-slate-700')
                        )}
                        style={{ width: `${percentages}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] font-mono text-slate-500 leading-relaxed bg-slate-950/20 p-2.5 rounded border border-slate-900">
            📊 **SLA Insight**: Automated workflows resolve standard MDM and order queries **99.9% faster** than manual L1/L3 engineer escalation paths, resulting in an estimated monthly productivity boost of **320 operational hours**.
          </p>
        </div>

      </div>

    </div>
  );
}
