'use client';

import React, { useState } from 'react';
import { useTickets, useUpdateTicket } from '../../hooks/useApi';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { Ticket } from '../../types';

export default function TicketsTable() {
  const { data: tickets = [], isLoading } = useTickets();
  const updateTicketMutation = useUpdateTicket();
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Counters
  const countTotal = tickets.length;
  const countOpen = tickets.filter(t => t.status === 'open').length;
  const countPending = tickets.filter(t => t.status === 'pending').length;
  const countEscalated = tickets.filter(t => t.status === 'escalated').length;

  // Filter logic
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = (id: string, status: Ticket['status']) => {
    updateTicketMutation.mutate({
      id,
      payload: { status }
    }, {
      onSuccess: () => {
        // Keeps modal/drawer details updated if open
        if (selectedTicketId === id) {
          setSelectedTicketId(id);
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing Live Support Tickets Queue...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Ticket State Analytics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">ALL SUPPORT ITEMS</span>
          <h4 className="text-xl font-bold text-white mt-1">{countTotal}</h4>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">ACTIVE QUEUE</span>
          <h4 className="text-xl font-bold text-brand-blue mt-1">{countOpen}</h4>
        </div>
        <div className="glass-card p-4 rounded-xl">
          <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">PENDING CLIENT</span>
          <h4 className="text-xl font-bold text-brand-orange mt-1">{countPending}</h4>
        </div>
        <div className="glass-card p-4 rounded-xl border-brand-rose/25">
          <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">CRITICAL ESCALATIONS</span>
          <h4 className="text-xl font-bold text-brand-rose mt-1">{countEscalated}</h4>
        </div>
      </div>

      {/* 2. Filters & Searches */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoice, title, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
          />
        </div>

        {/* Filters Selectors */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          
          {/* Status */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">STATUS</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none pr-2 cursor-pointer"
            >
              <option value="all">ALL STATES</option>
              <option value="open">OPEN</option>
              <option value="pending">PENDING</option>
              <option value="escalated">ESCALATED</option>
              <option value="resolved">RESOLVED</option>
            </select>
          </div>

          {/* Priority */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
            <span className="text-[9px] font-mono text-slate-500 uppercase">PRIORITY</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none pr-2 cursor-pointer"
            >
              <option value="all">ALL LEVELS</option>
              <option value="critical">CRITICAL</option>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>
          </div>

        </div>

      </div>

      {/* 3. Main Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/70 border-b border-slate-800 text-[10px] text-slate-400 font-mono tracking-wider">
                <th className="p-4">TICKET ID</th>
                <th className="p-4">SUBJECT DETAILS</th>
                <th className="p-4">CLIENT NAME</th>
                <th className="p-4">PRIORITY</th>
                <th className="p-4">STATE</th>
                <th className="p-4">OWNER</th>
                <th className="p-4 text-right">LAST UPDATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/65">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Icons.Inbox className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                    No support tickets found matching specifications.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-slate-900/30 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 font-mono font-bold text-slate-300 group-hover:text-brand-blue transition-colors">
                      {t.id.slice(0, 8)}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-slate-200">{t.title}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-sm">{t.description}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-300">
                      {t.customerName}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                        t.priority === 'critical' 
                          ? 'bg-brand-rose/25 text-brand-rose border border-brand-rose/30 animate-pulse' 
                          : t.priority === 'high' 
                          ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30' 
                          : t.priority === 'medium'
                          ? 'bg-brand-cyan/10 text-brand-cyan'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        t.status === 'escalated' 
                          ? 'bg-brand-rose/15 text-brand-rose' 
                          : t.status === 'open' 
                          ? 'bg-brand-blue/15 text-brand-blue' 
                          : t.status === 'pending'
                          ? 'bg-brand-orange/15 text-brand-orange'
                          : 'bg-brand-emerald/15 text-brand-emerald'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-medium">
                      {t.assignedTo || 'Unassigned (AI Queue)'}
                    </td>
                    <td className="p-4 text-right font-mono text-slate-500">
                      {new Date(t.updatedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Ticket Detail Drawer Overlay Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-brand-dark/75 backdrop-blur-sm flex items-center justify-end animate-fade-in">
          <div className="w-full max-w-2xl h-full bg-brand-navy border-l border-slate-850 p-6 flex flex-col justify-between overflow-y-auto animate-slide-in shadow-2xl">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-brand-blue px-2.5 py-1 rounded bg-brand-blue/15">
                    {selectedTicket.id.slice(0, 8)}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    selectedTicket.status === 'escalated' ? 'bg-brand-rose/15 text-brand-rose' : 'bg-brand-emerald/15 text-brand-emerald'
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedTicketId(null)}
                  className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <Icons.X className="w-5 h-5" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-base font-bold text-white leading-tight">{selectedTicket.title}</h3>
                <p className="text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-900 text-xs">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Attributes Details Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-xs font-mono bg-slate-900/30 p-3 rounded-xl border border-slate-850/50">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">CLIENT NAME</span>
                  <span className="text-slate-300 font-semibold">{selectedTicket.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">PRIORITY LEVEL</span>
                  <span className="text-brand-orange font-bold uppercase">{selectedTicket.priority}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">ASSIGNEE OWNER</span>
                  <span className="text-slate-300 font-semibold">{selectedTicket.assignedTo || 'AI Router System'}</span>
                </div>
              </div>

              {/* Dynamic Operations Flow Timeline */}
              <div className="mt-6 space-y-4">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-800/80 pb-2">
                  System Audit Logs Timeline
                </span>
                
                <div className="relative pl-6 space-y-5 border-l border-slate-800 ml-3">
                  {selectedTicket.timeline.map((event) => (
                    <div key={event.id} className="relative text-xs">
                      {/* Bullet circle */}
                      <span className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-brand-blue border-2 border-brand-dark" />
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span className="font-bold text-brand-cyan">{event.user}</span>
                        <span>{new Date(event.timestamp).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span>
                      </div>
                      <h5 className="font-semibold text-slate-200 mt-0.5">{event.action}</h5>
                      {event.details && (
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed bg-slate-950/20 p-2 rounded border border-slate-900/60 font-mono">
                          {event.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="border-t border-slate-800/80 pt-4 mt-6 space-y-3">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                EXECUTIVE SUPPORT ACTIONS
              </span>
              
              <div className="grid grid-cols-3 gap-3">
                {selectedTicket.status !== 'resolved' && (
                  <button
                    disabled={updateTicketMutation.isPending}
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'resolved')}
                    className="py-2.5 px-3 rounded-lg bg-brand-emerald hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-emerald/10 cursor-pointer"
                  >
                    <Icons.CheckCircle2 className="w-4 h-4" />
                    Close & Resolve
                  </button>
                )}

                {selectedTicket.status !== 'escalated' && (
                  <button
                    disabled={updateTicketMutation.isPending}
                    onClick={() => handleUpdateStatus(selectedTicket.id, 'escalated')}
                    className="py-2.5 px-3 rounded-lg bg-brand-orange hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/10 cursor-pointer"
                  >
                    <Icons.TrendingUp className="w-4 h-4" />
                    Escalate Priority
                  </button>
                )}

                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="py-2.5 px-3 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-300 font-bold text-xs transition-all flex items-center justify-center cursor-pointer"
                >
                  Close Drawer
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
