'use client';

import React, { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';
import { SUGGESTED_PROMPTS } from '../../constants';
import { useConversations, useCustomers, useTickets, useSendMessage, useCreateConversation } from '../../hooks/useApi';
import { useAppStore } from '../../store/useAppStore';

export default function ChatView() {
  const { activeConversationId, setActiveConversationId, addNotification } = useAppStore();

  const { data: conversations = [], isLoading: isConversationsLoading } = useConversations();
  const { data: customers = [] } = useCustomers();
  const { data: tickets = [] } = useTickets();

  const sendMessageMutation = useSendMessage();
  const createConvMutation = useCreateConversation();

  const [inputMsg, setInputMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Active Session Resolution
  const activeConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
  const customer = customers.find(c => c.id === activeConv?.customerId);
  const customerTickets = tickets.filter(t => t.customerId === activeConv?.customerId);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, sendMessageMutation.isPending]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || !activeConv) return;
    setInputMsg('');
    
    sendMessageMutation.mutate({
      customerId: activeConv.customerId,
      message: textToSend
    }, {
      onSuccess: () => {
        addNotification(`AI Agent processed query: "${textToSend.slice(0, 20)}..."`, 'success');
      },
      onError: () => {
        addNotification('LangGraph Multi-Agent execution failed.', 'error');
      }
    });
  };

  const handleCreateSession = (customerId: string, topic: string) => {
    createConvMutation.mutate({
      customerId,
      topic
    }, {
      onSuccess: (data) => {
        setActiveConversationId(data.id);
        addNotification(`New AI session resolved: ${data.id.slice(0, 8)}`, 'info');
      }
    });
  };

  // Filter conversations
  const filteredConvs = conversations.filter(c => 
    c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.topic && c.topic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isConversationsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing Live Chat Sessions...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* COLUMN 1: Session Selector (3 cols) */}
      <div className="lg:col-span-3 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-full">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/10 space-y-3">
          <span className="text-xs font-bold text-white tracking-wide block">ACTIVE SESSIONS</span>
          <div className="relative">
            <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        {/* Sessions Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredConvs.length === 0 ? (
            <div className="p-4 text-center text-slate-500 font-mono text-[10px]">
              No active conversations.
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-xl transition-all border flex gap-3 group relative cursor-pointer",
                    isActive 
                      ? "bg-slate-900/70 border-brand-blue/30 shadow-inner" 
                      : "bg-transparent border-transparent hover:bg-slate-900/20 hover:border-slate-850"
                  )}
                >
                  {/* Avatar with Status indicator */}
                  <div className="relative flex-shrink-0">
                    {conv.customerAvatar ? (
                      <img src={conv.customerAvatar} alt={conv.customerName} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                        {conv.customerName.charAt(0)}
                      </div>
                    )}
                    <span className={cn(
                      "absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-brand-dark",
                      conv.status === 'escalated' 
                        ? 'bg-brand-rose animate-pulse' 
                        : conv.status === 'waiting' 
                        ? 'bg-brand-orange' 
                        : 'bg-brand-emerald'
                    )} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">{conv.customerName}</span>
                      <span className="text-[9px] font-mono text-slate-500">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-[10px] text-brand-cyan font-medium truncate mt-0.5">{conv.topic || 'General Support'}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-1">{conv.lastMessageText}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* COLUMN 2: Chat Workspace (6 cols) */}
      <div className="lg:col-span-6 glass-panel rounded-2xl border border-slate-800 flex flex-col overflow-hidden h-full">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] text-brand-blue font-bold px-2 py-0.5 rounded bg-brand-blue/15">
              {activeConv?.id.slice(0, 8) || 'SESSION'}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-tight">{activeConv?.customerName || 'Select Customer'}</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Topic: {activeConv?.topic || 'SLA Diagnostics'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
              activeConv?.status === 'escalated' ? 'bg-brand-rose/15 text-brand-rose' : 'bg-brand-emerald/15 text-brand-emerald'
            )}>
              {activeConv?.status || 'active'}
            </span>
          </div>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeConv?.messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-3 max-w-[85%] animate-fade-in",
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                )}
              >
                {/* Profile Icon */}
                <div className="w-8 h-8 rounded-full border border-slate-850 flex items-center justify-center font-bold text-xs bg-slate-900 text-slate-300 flex-shrink-0">
                  {isUser ? 'U' : <Icons.Cpu className="w-4 h-4 text-brand-blue" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div className={cn(
                    "p-3.5 rounded-2xl text-xs leading-relaxed",
                    isUser 
                      ? "bg-brand-blue text-white rounded-tr-none font-medium" 
                      : "bg-slate-950/50 border border-slate-850 text-slate-200 rounded-tl-none"
                  )}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? "mt-2" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>

                  {/* Dynamic Agent Stages (Typing simulator indicators) */}
                  {!isUser && msg.agentPhase && msg.agentPhase !== 'complete' && (
                    <div className="p-2.5 bg-slate-900/50 border border-slate-850/80 rounded-xl flex flex-wrap gap-2 items-center text-[10px] font-mono animate-pulse">
                      <div className="flex items-center gap-1.5 text-brand-blue">
                        <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Intent Checked</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-brand-orange">
                        <Icons.ArrowRight className="w-3 h-3 text-slate-600" />
                        <span>Security Audited</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-brand-cyan">
                        <Icons.ArrowRight className="w-3 h-3 text-slate-600" />
                        <span>RAG Context Mapped</span>
                      </div>
                    </div>
                  )}

                  {/* RAG Source Citations */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="pt-1.5 space-y-1.5">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">VECTOR SOURCES CITATIONS</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.sources.map((src, sIdx) => (
                          <div 
                            key={sIdx}
                            className="p-2 bg-slate-950 rounded-lg border border-slate-900 text-[10px] font-mono flex items-center justify-between hover:border-slate-850 transition-colors"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Icons.FileText className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0" />
                              <span className="text-slate-300 truncate" title={src.title}>{src.title}</span>
                            </div>
                            <span className="text-brand-emerald font-bold flex-shrink-0">{(src.score * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Metadata */}
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                    <span>{msg.timestamp}</span>
                    {msg.tokensUsed && (
                      <>
                        <span>•</span>
                        <span>{msg.tokensUsed} tokens</span>
                      </>
                    )}
                  </div>

                </div>
              </div>
            );
          })}

          {/* Pending loading segments typing indicator */}
          {sendMessageMutation.isPending && (
            <div className="flex gap-3 max-w-[85%] animate-pulse mr-auto">
              <div className="w-8 h-8 rounded-full border border-slate-850 flex items-center justify-center font-bold text-xs bg-slate-900 text-slate-300">
                <Icons.Cpu className="w-4 h-4 text-brand-blue animate-spin" />
              </div>
              <div className="space-y-1.5">
                <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[9px] font-mono text-brand-cyan">Bedrock multi-agent pipeline executing...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-4 py-2 border-t border-slate-900 bg-slate-950/20 flex gap-2 overflow-x-auto select-none no-scrollbar">
          {SUGGESTED_PROMPTS.map((p, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(p)}
              className="px-2.5 py-1 bg-slate-950 border border-slate-850 hover:border-brand-blue hover:text-white rounded-full text-[10px] text-slate-400 font-medium whitespace-nowrap transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Message Input Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/10 flex items-center gap-2">
          
          {/* File Attach */}
          <button 
            className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white transition-all text-slate-400"
            title="Attach Log files/PDFs"
          >
            <Icons.Paperclip className="w-4 h-4" />
          </button>

          {/* Voice Msg */}
          <button 
            className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:bg-slate-900 hover:text-white transition-all text-slate-400"
            title="Simulate Voice Input"
          >
            <Icons.Mic className="w-4 h-4" />
          </button>

          {/* Input text */}
          <input
            type="text"
            placeholder="Ask AI Orchestrator or run MDM diagnosis commands..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputMsg)}
            className="flex-1 bg-slate-950 border border-slate-850 rounded-lg py-2 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue"
          />

          {/* Send */}
          <button 
            onClick={() => handleSend(inputMsg)}
            disabled={!inputMsg.trim() || sendMessageMutation.isPending}
            className="p-2 rounded-lg bg-brand-blue disabled:opacity-40 hover:bg-blue-600 text-white transition-all flex items-center justify-center cursor-pointer"
            title="Dispatch Command"
          >
            <Icons.Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* COLUMN 3: CRM Context Panel (3 cols) */}
      <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto">
        
        {/* Customer Details Widget */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            CRM CLIENT CARD
          </span>
          {customer ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {customer.avatar ? (
                  <img src={customer.avatar} alt={customer.name} className="w-10 h-10 rounded-full border border-slate-700 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                    {customer.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-white text-sm">{customer.name}</h4>
                  <span className="text-[10px] font-mono text-brand-orange uppercase">{customer.plan} account</span>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-[10px] bg-slate-950/40 p-2.5 rounded-lg border border-slate-900">
                <div className="flex justify-between">
                  <span className="text-slate-500">EMAIL:</span>
                  <span className="text-slate-300 truncate max-w-[120px]" title={customer.email}>{customer.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PHONE:</span>
                  <span className="text-slate-300">{customer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">CLIENT ID:</span>
                  <span className="text-slate-300">{customer.id.slice(0, 8)}...</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block">Account Summary:</span>
                <p className="text-slate-300 leading-relaxed bg-slate-900/30 p-2 rounded border border-slate-850/50">
                  {customer.summary || 'No operational summary logged.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No active client mapped.</p>
          )}
        </div>

        {/* AI Dynamic Recommendations */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-brand-cyan font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            Dynamic AI Recommendations
          </span>
          <div className="space-y-2">
            {(!customer || !customer.aiRecommendations || customer.aiRecommendations.length === 0) ? (
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 text-center text-slate-500 font-mono text-[10px]">
                No dynamic alerts active.
              </div>
            ) : (
              customer.aiRecommendations.map((rec, rIdx) => (
                <div 
                  key={rIdx} 
                  className="p-2.5 bg-slate-950 rounded-lg border border-slate-900 flex gap-2 items-start"
                >
                  <Icons.Sparkles className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0 mt-0.5 animate-pulse" />
                  <p className="text-slate-200 leading-relaxed font-medium">{rec}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Order Logs Timeline */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            CLIENT HARDWARE LOGS
          </span>
          <div className="space-y-2">
            {(!customer || !customer.orders || customer.orders.length === 0) ? (
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 text-center text-slate-500 font-mono text-[10px]">
                No orders loaded in CRM.
              </div>
            ) : (
              customer.orders.map((ord) => (
                <div 
                  key={ord.id} 
                  className="p-2.5 bg-slate-950/40 rounded-xl border border-slate-900 flex items-center justify-between gap-2"
                >
                  <div>
                    <h5 className="font-semibold text-slate-200 truncate max-w-[120px]">{ord.item}</h5>
                    <span className="text-[9px] font-mono text-slate-500">{ord.id} • {ord.date}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white font-mono">${ord.amount.toFixed(2)}</p>
                    <span className={cn(
                      "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block",
                      ord.status === 'delivered' ? 'bg-brand-emerald/10 text-brand-emerald' : 'bg-brand-orange/10 text-brand-orange'
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
  );
}
