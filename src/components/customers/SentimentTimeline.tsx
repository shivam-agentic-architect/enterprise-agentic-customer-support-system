'use client';

import React, { useState } from 'react';
import { useCustomers, useCustomerProfile, useTickets } from '../../hooks/useApi';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

export default function SentimentTimeline() {
  const { data: customers = [], isLoading: isCustomersLoading } = useCustomers();
  const { data: tickets = [], isLoading: isTicketsLoading } = useTickets();
  const [selectedCustId, setSelectedCustId] = useState<string | null>(null);

  const activeCustId = selectedCustId || (customers.length > 0 ? customers[0].id : null);
  const { data: customerProfile, isLoading: isProfileLoading } = useCustomerProfile(activeCustId);

  const customer = customerProfile || (customers.length > 0 ? customers[0] : null);
  const customerTickets = tickets.filter(t => t.customerId === activeCustId);

  // Mapped sentiment descriptions
  const getSentimentPill = (sentiment: string) => {
    switch (sentiment) {
      case 'happy':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-brand-emerald/15 text-brand-emerald border border-brand-emerald/20">SATISFIED</span>;
      case 'frustrated':
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-brand-rose/25 text-brand-rose border border-brand-rose/30 animate-pulse">SLA WARN</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-800 text-slate-400">NEUTRAL</span>;
    }
  };

  if (isCustomersLoading || isTicketsLoading || (activeCustId && isProfileLoading)) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing Live CRM Registry...</span>
      </div>
    );
  }

  if (customers.length === 0 || !customer) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl border border-slate-800">
        <Icons.Users className="w-10 h-10 mx-auto mb-2 text-slate-600 animate-pulse" />
        <h4 className="font-bold text-white text-sm">CRM Registry Empty</h4>
        <p className="text-xs text-slate-400 mt-1">No customer profiles are currently loaded in the database.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* 1. Client List Selector (3 cols) */}
      <div className="lg:col-span-3 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-full">
        <div className="p-4 border-b border-slate-800 bg-slate-900/10">
          <span className="text-xs font-bold text-white tracking-wide block uppercase">CRM CLIENTS REGISTRY</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {customers.map((c) => {
            const isActive = c.id === activeCustId;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCustId(c.id)}
                className={cn(
                  "w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between gap-3 cursor-pointer",
                  isActive 
                    ? "bg-slate-900/70 border-brand-blue/30 shadow-inner" 
                    : "bg-transparent border-transparent hover:bg-slate-900/20 hover:border-slate-850"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                      {c.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-white truncate block">{c.name}</span>
                    <span className="text-[9px] font-mono text-slate-500">{c.id.slice(0, 8)} • {c.plan.toUpperCase()}</span>
                  </div>
                </div>
                {getSentimentPill(c.sentiment)}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Customer Profile Details & Timeline (9 cols) */}
      <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-6 h-full overflow-y-auto pr-1">
        
        {/* Left pane details (5 cols) */}
        <div className="md:col-span-5 flex flex-col gap-4">
          
          {/* Summary and CRM details */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              {customer.avatar ? (
                <img src={customer.avatar} alt={customer.name} className="w-12 h-12 rounded-full object-cover border border-slate-700" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                  {customer.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="font-bold text-white text-base">{customer.name}</h3>
                <span className="text-[10px] font-mono text-brand-orange uppercase">{customer.plan} subscription</span>
              </div>
            </div>

            <div className="space-y-2 font-mono text-[10px] bg-slate-950/40 p-3 rounded-lg border border-slate-900">
              <div className="flex justify-between">
                <span className="text-slate-500">EMAIL:</span>
                <span className="text-slate-300 truncate max-w-[150px]">{customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">PHONE:</span>
                <span className="text-slate-300">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CRM ID:</span>
                <span className="text-slate-300">{customer.id.slice(0, 8)}...</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Account Executive Summary:</span>
              <p className="text-slate-300 leading-relaxed bg-slate-900/30 p-2.5 rounded border border-slate-850/50">
                {customer.summary || 'No account summary logged for this corporate contact.'}
              </p>
            </div>
          </div>

          {/* AI recommendations */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Icons.Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
              <h4 className="text-sm font-bold text-white tracking-wide">Enterprise AI Copilot Recommendations</h4>
            </div>

            <div className="space-y-2">
              {(customer.aiRecommendations || []).length === 0 ? (
                <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 text-center text-slate-500 font-mono text-[10px]">
                  No dynamic recommendations compiled yet.
                </div>
              ) : (
                customer.aiRecommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex gap-2 items-start text-xs font-mono text-slate-200">
                    <span className="text-brand-cyan font-bold">•</span>
                    <p className="leading-relaxed font-semibold">{rec}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right pane logs & timeline (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-4">
          
          {/* Sentiment Timeline logs */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-wide">Historical Touchpoints Sentiment Timeline</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Chronological CRM touchpoints logging satisfaction score metrics</p>
            </div>

            <div className="relative pl-6 space-y-5 border-l border-slate-800 ml-3 py-2">
              {customerTickets.length === 0 && (
                <div className="relative text-xs font-mono text-slate-500 py-4">
                  <span className="absolute -left-[30px] top-4 w-2.5 h-2.5 rounded-full bg-slate-800 border-2 border-brand-dark" />
                  No historical touchpoints compiled in Support Core.
                </div>
              )}
              
              {customerTickets.map((t) => (
                <div key={t.id} className="relative text-xs">
                  {/* Bullet */}
                  <span className={`absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full border-2 border-brand-dark ${
                    t.priority === 'critical' ? 'bg-brand-rose animate-pulse' : 'bg-brand-blue'
                  }`} />
                  
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="font-bold text-brand-blue">{t.id.slice(0, 8)} • {t.priority.toUpperCase()} PRIORITY</span>
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <h5 className="font-semibold text-slate-200 mt-0.5">{t.title}</h5>
                  <p className="text-slate-400 mt-1 text-[11px] leading-relaxed bg-slate-950/20 p-2 rounded border border-slate-900/60 font-mono">
                    SLA Status: {t.status.toUpperCase()}
                  </p>
                </div>
              ))}

              {/* Standard purchase event logs */}
              {(customer.orders || []).slice(0, 1).map((ord: any) => (
                <div key={ord.id} className="relative text-xs">
                  <span className="absolute -left-[30px] top-1 w-2.5 h-2.5 rounded-full bg-brand-emerald border-2 border-brand-dark" />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span className="font-bold text-brand-emerald">COMMERCE EVENT</span>
                    <span>{ord.date}</span>
                  </div>
                  <h5 className="font-semibold text-slate-200 mt-0.5">Order {ord.id} Dispatch & Settlement</h5>
                  <p className="text-[10px] text-slate-400 mt-0.5">{ord.item} purchased successfully. Status: {ord.status.toUpperCase()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CRM Purchase Orders list */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="text-sm font-bold text-white tracking-wide">Fulfillment Order History</h4>
            
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {(customer.orders || []).length === 0 ? (
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl text-center text-slate-500 font-mono text-[10px]">
                  No order history tracked in CRM database.
                </div>
              ) : (
                customer.orders.map((ord: any) => (
                  <div key={ord.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <h5 className="font-bold text-slate-200 truncate max-w-[180px]">{ord.item}</h5>
                      <span className="text-[9px] text-slate-500">{ord.id} • Purchased {ord.date}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">${ord.amount.toFixed(2)}</p>
                      <span className={cn(
                        "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mt-1.5 inline-block",
                        ord.status === 'delivered' ? 'bg-brand-emerald/15 text-brand-emerald' : 'bg-brand-orange/15 text-brand-orange'
                      )}>
                        {ord.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
