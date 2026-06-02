'use client';

import React, { useState } from 'react';
import { useAgents } from '../../hooks/useApi';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AgentGrid() {
  const { data: agentStatuses = [], isLoading } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // Pipeline Step Simulator state
  const [activePipelineStep, setActivePipelineStep] = useState<number | null>(null);

  const activeAgentId = selectedAgentId || (agentStatuses.length > 0 ? agentStatuses[0].id : null);
  const selectedAgent = agentStatuses.find(a => a.id === activeAgentId);

  // Workflow pipeline definition
  const pipelineSteps = [
    { num: 1, label: 'Intent Classification', icon: 'Sparkles', desc: 'Titan parses query category and sets route parameters.' },
    { num: 2, label: 'Identity Verification', icon: 'KeyRound', desc: 'Validates Cognito access token credentials.' },
    { num: 3, label: 'RAG Retrieval', icon: 'Database', desc: 'Searches OpenSearch indexes to extract matching document chunks.' },
    { num: 4, label: 'Tool Lambda Exec', icon: 'Code', desc: 'Triggers backend API integrations (CRM/Billing databases).' },
    { num: 5, label: 'LLM Orchestrator', icon: 'BrainCircuit', desc: 'Claude 3.5 Sonnet merges context & generates final response.' }
  ];

  const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (Icons as any)[name];
    if (!IconComponent) return <Icons.Cpu className={className} />;
    return <IconComponent className={className} />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-blue animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing Multi-Agent Telemetry Grid...</span>
      </div>
    );
  }

  if (agentStatuses.length === 0) {
    return (
      <div className="glass-panel p-12 text-center text-slate-500 rounded-2xl border border-slate-800">
        <Icons.Activity className="w-10 h-10 mx-auto mb-2 text-slate-600 animate-pulse" />
        <h4 className="font-bold text-white text-sm">No Active Agents Mapped</h4>
        <p className="text-xs text-slate-400 mt-1">Please start the FastAPI backend to load the agent activities metrics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Multi-Agent Grid (5 agents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {agentStatuses.map((agent) => {
          const isSelected = activeAgentId === agent.id;
          const isProcessing = agent.status === 'processing';
          
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgentId(agent.id)}
              className={cn(
                "glass-card p-4 rounded-xl text-left flex flex-col justify-between h-48 transition-all border cursor-pointer",
                isSelected 
                  ? "bg-slate-900/70 border-brand-blue/60 shadow-lg shadow-brand-blue/5" 
                  : "bg-transparent border-slate-850 hover:bg-slate-900/10 hover:border-slate-800"
              )}
            >
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-between">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-900">
                    <Icons.Cpu className={cn("w-5 h-5", isSelected ? "text-brand-blue" : "text-slate-400")} />
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center gap-1.5">
                    {isProcessing && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-ping" />
                    )}
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                      agent.health === 'healthy' 
                        ? 'bg-brand-emerald/10 text-brand-emerald' 
                        : 'bg-brand-orange/15 text-brand-orange animate-pulse'
                    }`}>
                      {agent.health}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide truncate">{agent.name}</h4>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wide block truncate mt-0.5">
                    {(agent.role || '').split('&')[0]}
                  </span>
                </div>
              </div>

              {/* Mini Stats strip */}
              <div className="w-full border-t border-slate-900/80 pt-2.5 flex items-center justify-between text-[9px] font-mono text-slate-400">
                <div className="flex flex-col">
                  <span>LATENCY</span>
                  <span className="font-bold text-white">{agent.latency}ms</span>
                </div>
                <div className="flex flex-col text-right">
                  <span>THROUGHPUT</span>
                  <span className="font-bold text-slate-300">{agent.requestsPerMin} r/m</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Pipeline Workflow & Selected Agent technical specifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Dynamic Workflow pipeline trace */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-2 space-y-6">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">Multi-Agent Request Processing Pipeline</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Click steps below to simulate a request tracing through AWS Cloud endpoints</p>
          </div>

          {/* Steps Sequence */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative py-4">
            
            {pipelineSteps.map((step, idx) => {
              const isActive = activePipelineStep === step.num;
              
              return (
                <React.Fragment key={step.num}>
                  {/* Step bubble */}
                  <button
                    onClick={() => setActivePipelineStep(isActive ? null : step.num)}
                    className={cn(
                      "w-12 h-12 rounded-full border flex items-center justify-center relative cursor-pointer group transition-all duration-300",
                      isActive 
                        ? "bg-brand-blue border-brand-blue text-white shadow-xl shadow-brand-blue/30 scale-110" 
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700 hover:text-white"
                    )}
                    title={step.label}
                  >
                    <DynamicIcon name={step.icon} className="w-5 h-5" />
                    
                    <span className="absolute -bottom-6 text-[9px] font-mono whitespace-nowrap text-slate-400 group-hover:text-slate-200">
                      {step.label.split(' ')[0]}
                    </span>

                    {/* Step order index */}
                    <span className="absolute -top-1 -right-1 bg-slate-900 border border-slate-800 text-[8px] font-mono font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {step.num}
                    </span>
                  </button>

                  {/* Flow Arrow */}
                  {idx < pipelineSteps.length - 1 && (
                    <div className="hidden md:block h-[1px] flex-1 bg-slate-800 relative">
                      {isActive && (
                        <span className="absolute top-1/2 left-0 w-2 h-2 rounded-full bg-brand-cyan -translate-y-1/2 animate-ping" style={{ left: '50%' }} />
                      )}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          </div>

          {/* Trace step details */}
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 font-mono text-[11px] h-20 flex items-center justify-center">
            {activePipelineStep ? (
              <div className="space-y-1 text-center animate-fade-in">
                <span className="text-[9px] font-bold text-brand-orange tracking-widest uppercase">
                  SIMULATION: STEP {activePipelineStep} ACTIVE
                </span>
                <p className="text-slate-200 font-semibold">{pipelineSteps[activePipelineStep - 1].label}</p>
                <p className="text-slate-400">{pipelineSteps[activePipelineStep - 1].desc}</p>
              </div>
            ) : (
              <span className="text-slate-500 italic">Select any pipeline step bubble above to run a telemetry diagnostics trace.</span>
            )}
          </div>
        </div>

        {/* Selected Agent Specifications Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            TECHNICAL PROPERTIES & PROMPT
          </span>
          {selectedAgent ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">{selectedAgent.name}</h4>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Role: {selectedAgent.role}</p>
              </div>

              <div className="space-y-1.5 font-mono text-[10px] bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <div className="flex justify-between">
                  <span className="text-slate-500">AWS LLM MODEL:</span>
                  <span className="text-brand-orange truncate max-w-[130px] font-bold" title={selectedAgent.modelId}>{selectedAgent.modelId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">AVERAGE LATENCY:</span>
                  <span className="text-slate-300 font-semibold">{selectedAgent.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ACCURACY SLA:</span>
                  <span className="text-brand-emerald font-bold">{selectedAgent.accuracyRate}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">Current Node Activity:</span>
                <div className="p-2 bg-slate-900/60 border border-slate-850 rounded text-slate-300 leading-relaxed font-mono text-[10px] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan mt-1 flex-shrink-0 animate-ping" />
                  <p>{selectedAgent.activity}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-bold block">System Agent prompt configuration:</span>
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-900/80">
                  {selectedAgent.id.includes('intent') 
                    ? 'SYS-PROMPT: [IntentRouter] Parse queries into MDM-security, hardware-warranty, CRM-enquiry. Evaluate critical tags and compute token thresholds...' 
                    : selectedAgent.id.includes('knowledge') 
                    ? 'SYS-PROMPT: [RAGAgent] Receive search values. Invoke OpenSearch index. Filter vectors using KNN with overlap constraints. Cite absolute S3 pathways...'
                    : 'SYS-PROMPT: [BaseAgent] Co-ordinate tool schema parameters. Process API JSON inputs and enforce standard response formatting outputs.'}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">No agent selected.</p>
          )}
        </div>

      </div>

    </div>
  );
}
