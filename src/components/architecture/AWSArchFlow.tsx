'use client';

import React, { useState } from 'react';
import { AWS_SERVICES } from '../../constants';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AWSArchFlow() {
  const [selectedFlow, setSelectedFlow] = useState<'none' | 'faq' | 'escalate' | 'action'>('none');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('bedrock');

  const selectedService = AWS_SERVICES.find(s => s.id === selectedServiceId);

  // Flow details explanation
  const getFlowDescription = () => {
    switch (selectedFlow) {
      case 'faq':
        return '🔄 **Standard RAG FAQ Trace**: Customer -> API Gateway -> ECS AI Orchestrator -> Amazon Bedrock (Model searches OpenSearch vector indexes for answers) -> Formulates safe response -> Returns to client.';
      case 'escalate':
        return '📞 **Omnichannel Escalation Trace**: Customer frustrated -> Bedrock flags escalation metrics -> ECS Orchestrator invokes Amazon Connect telephony -> Seamless voice/chat transfer to human agent.';
      case 'action':
        return '⚡ **Lambda CRM Database Query Trace**: Customer inputs order request -> ECS invokes Bedrock Tool Calling -> Bedrock triggers AWS Lambda -> Query executed securely inside Amazon RDS (Aurora Serverless).';
      default:
        return '💡 Click one of the architectural tracing buttons above to visualize active data pathways through the AWS Cloud pipeline.';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Tracer Controls Header */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-white tracking-wide">AWS Cloud Infrastructure Tracing Console</h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Interact with diagnostic scenarios to inspect security boundaries and execution triggers</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedFlow(selectedFlow === 'faq' ? 'none' : 'faq')}
            className={cn(
              "py-2 px-3.5 rounded-lg border text-xs font-bold font-mono transition-all flex items-center gap-2",
              selectedFlow === 'faq' 
                ? "bg-brand-cyan border-brand-cyan text-brand-dark shadow-lg shadow-brand-cyan/20" 
                : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
            )}
          >
            <Icons.RotateCcw className="w-3.5 h-3.5" />
            Trace RAG FAQ Flow
          </button>

          <button
            onClick={() => setSelectedFlow(selectedFlow === 'escalate' ? 'none' : 'escalate')}
            className={cn(
              "py-2 px-3.5 rounded-lg border text-xs font-bold font-mono transition-all flex items-center gap-2",
              selectedFlow === 'escalate' 
                ? "bg-brand-rose border-brand-rose text-white shadow-lg shadow-brand-rose/20" 
                : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
            )}
          >
            <Icons.PhoneCall className="w-3.5 h-3.5" />
            Trace Escalation Flow
          </button>

          <button
            onClick={() => setSelectedFlow(selectedFlow === 'action' ? 'none' : 'action')}
            className={cn(
              "py-2 px-3.5 rounded-lg border text-xs font-bold font-mono transition-all flex items-center gap-2",
              selectedFlow === 'action' 
                ? "bg-brand-orange border-brand-orange text-brand-dark shadow-lg shadow-brand-orange/20" 
                : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700"
            )}
          >
            <Icons.Database className="w-3.5 h-3.5" />
            Trace Database Action Flow
          </button>
        </div>

        {/* Dynamic Trace Narrative display */}
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 font-mono text-[11px] min-h-12 flex items-center text-slate-300 leading-relaxed">
          {getFlowDescription()}
        </div>
      </div>

      {/* 2. Interactive SVG Architecture Diagram (Grid layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SVG Drawing Canvas (8 cols) */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-slate-800 flex items-center justify-center bg-slate-950/20 overflow-x-auto min-h-[400px]">
          
          <svg className="w-full min-w-[600px] h-[340px]" viewBox="0 0 800 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background grids */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* FLOW LINES DEFINITIONS */}
            
            {/* General connectors default grey */}
            <path d="M 80 170 H 150" stroke="#1E293B" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 220 170 H 290" stroke="#1E293B" strokeWidth="2" />
            
            {/* Split from Gateway */}
            <path d="M 360 170 H 420" stroke="#1E293B" strokeWidth="2" />
            
            {/* split to bedrock */}
            <path d="M 490 170 H 550" stroke="#1E293B" strokeWidth="2" />
            
            {/* bedrock <-> opensearch */}
            <path d="M 610 130 V 80 H 520" stroke="#1E293B" strokeWidth="2" />
            
            {/* split to lambda */}
            <path d="M 610 210 V 260 H 520" stroke="#1E293B" strokeWidth="2" />
            
            {/* Lambda <-> RDS / Aurora */}
            <path d="M 450 260 H 360" stroke="#1E293B" strokeWidth="2" />
            
            {/* split to Connect */}
            <path d="M 420 170 V 110 H 290" stroke="#1E293B" strokeWidth="2" />

            {/* TRACE FLOW PATHWAYS (NEON HIGHLIGHTS) */}
            
            {/* FAQ Flow: Gateway -> Orchestrator -> Bedrock -> OpenSearch */}
            {selectedFlow === 'faq' && (
              <g className="animate-pulse">
                <path d="M 80 170 H 150" stroke="#06B6D4" strokeWidth="3" />
                <path d="M 220 170 H 290" stroke="#06B6D4" strokeWidth="3" />
                <path d="M 360 170 H 420" stroke="#06B6D4" strokeWidth="3" />
                <path d="M 490 170 H 550" stroke="#06B6D4" strokeWidth="3" />
                <path d="M 610 130 V 80 H 520" stroke="#06B6D4" strokeWidth="3" />
              </g>
            )}

            {/* Escalation Flow: Gateway -> Connect (Voice handoff) */}
            {selectedFlow === 'escalate' && (
              <g className="animate-pulse">
                <path d="M 80 170 H 150" stroke="#F43F5E" strokeWidth="3" />
                <path d="M 220 170 H 290" stroke="#F43F5E" strokeWidth="3" />
                <path d="M 290 170 V 110 H 320" stroke="#F43F5E" strokeWidth="3" />
                <path d="M 420 170 V 110 H 360" stroke="#F43F5E" strokeWidth="3" />
              </g>
            )}

            {/* Action Flow: Gateway -> Bedrock -> Lambda -> RDS */}
            {selectedFlow === 'action' && (
              <g className="animate-pulse">
                <path d="M 80 170 H 150" stroke="#FF9900" strokeWidth="3" />
                <path d="M 220 170 H 290" stroke="#FF9900" strokeWidth="3" />
                <path d="M 360 170 H 420" stroke="#FF9900" strokeWidth="3" />
                <path d="M 490 170 H 550" stroke="#FF9900" strokeWidth="3" />
                <path d="M 610 210 V 260 H 520" stroke="#FF9900" strokeWidth="3" />
                <path d="M 450 260 H 360" stroke="#FF9900" strokeWidth="3" />
              </g>
            )}

            {/* SVG NODES */}

            {/* User Channel Portal */}
            <g transform="translate(10, 140)" className="cursor-pointer">
              <rect width="70" height="60" rx="6" fill="#1E293B" stroke="#334155" strokeWidth="1" />
              <text x="35" y="28" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle">Web / iOS</text>
              <text x="35" y="44" fill="#94A3B8" fontSize="8" textAnchor="middle">Channels</text>
            </g>

            {/* Amazon Cognito */}
            <g transform="translate(150, 140)" className="cursor-pointer" onClick={() => setSelectedServiceId('cognito')}>
              <rect width="70" height="60" rx="6" fill="#1E293B" stroke={selectedServiceId === 'cognito' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="28" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle">Cognito</text>
              <text x="35" y="44" fill="#E2E8F0" fontSize="8" fontStyle="italic" textAnchor="middle">Security Pool</text>
            </g>

            {/* API Gateway */}
            <g transform="translate(290, 140)" className="cursor-pointer" onClick={() => setSelectedServiceId('api-gateway')}>
              <rect width="70" height="60" rx="6" fill="#1E293B" stroke={selectedServiceId === 'api-gateway' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="28" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle">API Gateway</text>
              <text x="35" y="44" fill="#06B6D4" fontSize="8" textAnchor="middle">HTTPS / WSS</text>
            </g>

            {/* ECS AI Orchestrator */}
            <g transform="translate(420, 140)" className="cursor-pointer" onClick={() => setSelectedServiceId('ecs')}>
              <rect width="70" height="60" rx="6" fill="#1E293B" stroke={selectedServiceId === 'ecs' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="28" fill="#F8FAFC" fontSize="10" fontWeight="bold" textAnchor="middle">ECS (Fargate)</text>
              <text x="35" y="44" fill="#94A3B8" fontSize="8" textAnchor="middle">Orchestrator</text>
            </g>

            {/* Amazon Bedrock Agent */}
            <g transform="translate(550, 140)" className="cursor-pointer" onClick={() => setSelectedServiceId('bedrock')}>
              <rect width="80" height="80" rx="8" fill="#1E293B" stroke={selectedServiceId === 'bedrock' ? '#FF9900' : '#334155'} strokeWidth="2" />
              <text x="40" y="32" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">Amazon</text>
              <text x="40" y="46" fill="#F8FAFC" fontSize="11" fontWeight="bold" textAnchor="middle">Bedrock</text>
              <text x="40" y="64" fill="#FF9900" fontSize="8" fontWeight="bold" className="tracking-wide uppercase" textAnchor="middle">Multi-Agent FM</text>
            </g>

            {/* OpenSearch (Vector DB) */}
            <g transform="translate(450, 50)" className="cursor-pointer" onClick={() => setSelectedServiceId('opensearch')}>
              <rect width="70" height="50" rx="6" fill="#1E293B" stroke={selectedServiceId === 'opensearch' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="25" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle">OpenSearch</text>
              <text x="35" y="38" fill="#06B6D4" fontSize="8" textAnchor="middle">k-NN Vector RAG</text>
            </g>

            {/* AWS Lambda Tools */}
            <g transform="translate(450, 230)" className="cursor-pointer" onClick={() => setSelectedServiceId('lambda')}>
              <rect width="70" height="50" rx="6" fill="#1E293B" stroke={selectedServiceId === 'lambda' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="25" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle">AWS Lambda</text>
              <text x="35" y="38" fill="#FF9900" fontSize="8" textAnchor="middle">Tool Executor</text>
            </g>

            {/* Aurora RDS Database */}
            <g transform="translate(290, 230)" className="cursor-pointer" onClick={() => setSelectedServiceId('rds')}>
              <rect width="70" height="50" rx="6" fill="#1E293B" stroke={selectedServiceId === 'rds' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="25" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle">RDS Aurora</text>
              <text x="35" y="38" fill="#94A3B8" fontSize="8" textAnchor="middle">CRM Database</text>
            </g>

            {/* Amazon Connect voice center */}
            <g transform="translate(290, 50)" className="cursor-pointer" onClick={() => setSelectedServiceId('connect')}>
              <rect width="70" height="50" rx="6" fill="#1E293B" stroke={selectedServiceId === 'connect' ? '#2563EB' : '#334155'} strokeWidth="1.5" />
              <text x="35" y="25" fill="#F8FAFC" fontSize="9" fontWeight="bold" textAnchor="middle">Connect</text>
              <text x="35" y="38" fill="#F43F5E" fontSize="8" textAnchor="middle">Voice Call</text>
            </g>

          </svg>
        </div>

        {/* Selected Service technical spec-sheet (4 cols) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            AWS INFRASTRUCTURE DETAIL
          </span>

          {selectedService ? (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">{selectedService.name}</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-1">{selectedService.description}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] text-brand-orange font-bold font-mono uppercase block">Active Operational Role:</span>
                <p className="text-slate-300 font-medium leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                  {selectedService.role}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold block">Key Architectural features:</span>
                <ul className="space-y-1.5 pl-3 list-disc text-[11px] text-slate-300 leading-relaxed font-mono">
                  {selectedService.details.map((det, dIdx) => (
                    <li key={dIdx} className="marker:text-brand-blue">{det}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-center py-4">Click any node in the SVG diagram to check technical configurations.</p>
          )}
        </div>

      </div>

    </div>
  );
}
