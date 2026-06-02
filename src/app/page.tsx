'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';

export default function LandingPage() {
  const { setActiveTab } = useAppStore();
  const router = useRouter();

  const handleCTA = (tab: string) => {
    setActiveTab(tab);
    router.push(`/${tab}`);
  };

  const features = [
    { title: 'Intelligent Intent Routers', icon: 'Cpu', desc: 'Titan NLP model classifies query categories in under 180ms to assign appropriate agent microservices.' },
    { title: 'RAG Knowledge Indexing', icon: 'Database', desc: 'Queries high-dimensional vector embeddings of company policies and FAQs mapped in OpenSearch clusters.' },
    { title: 'Connect Voice Telephony', icon: 'PhoneCall', desc: 'Integrates Amazon Connect call centers to seamlessly handoff high-frustration chats to live technicians.' },
    { title: 'Bi-directional CRM Synchronization', icon: 'RefreshCw', desc: 'AWS Lambda execution loops update CRM details, check ERP stocks, and issue customer refunds securely.' },
    { title: 'BI Operations Telemetry', icon: 'BarChart3', desc: 'Monitors real-time customer satisfaction indexes, AI automation metrics, and weekly cost savings charts.' },
    { title: 'Omnichannel Integrations', icon: 'Network', desc: 'Adapts standard response blocks for Web widgets, iOS/Android portals, and SMS contact gateways.' }
  ];

  const benefits = [
    { title: '81% AI Automation Rate', metric: '81.0%', desc: 'Four out of five customer care inquiries are resolved without any human dispatcher escalation.' },
    { title: '1.2s Average Latency', metric: '1.2s', desc: 'Serverless RAG fetches and AI reasoning cycles execute and reply inside milliseconds.' },
    { title: '78% Net Labor Reductions', metric: '78%', desc: 'Orchestrating AI workflows saves customer-care teams hundreds of hours of manual triage queues.' }
  ];

  const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (Icons as any)[name];
    if (!IconComponent) return <Icons.Cpu className={className} />;
    return <IconComponent className={className} />;
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col justify-between selection:bg-brand-blue selection:text-white relative">
      
      {/* Visual glowing aura elements */}
      <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-brand-blue/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-cyan/5 blur-[150px] pointer-events-none" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 glass-panel bg-brand-dark/40 px-6 py-4 flex items-center justify-between border-b border-slate-900/60 max-w-7xl mx-auto w-full rounded-b-2xl mt-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-blue text-white shadow-lg shadow-brand-blue/30 flex-shrink-0 animate-pulse-glow">
            <Icons.Cpu className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-white tracking-wider text-sm">LAUKI CARE</span>
            <span className="text-[9px] text-brand-cyan font-mono tracking-widest font-semibold uppercase">Enterprise AI Platform</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => handleCTA('dashboard')} 
            className="py-1.5 px-4 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold text-xs transition-all shadow-lg shadow-brand-blue/10 flex items-center gap-1.5"
          >
            Launch System
            <Icons.ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full text-center space-y-8 relative">
        <div className="space-y-4 max-w-3xl mx-auto">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-brand-blue/15 text-brand-cyan border border-brand-blue/20">
            AWS-INSPIRED COGNITIVE PLATFORM
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Automate Enterprise Customer Care with <span className="bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-orange bg-clip-text text-transparent">Multi-Agent AI</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            Harness Amazon Bedrock models, Cognito security token authentications, and OpenSearch vector RAG indexes to resolve support inquiries in real-time.
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button 
            onClick={() => handleCTA('dashboard')} 
            className="py-3 px-6 rounded-lg bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm transition-all shadow-xl shadow-brand-blue/20 flex items-center gap-2"
          >
            <Icons.LayoutDashboard className="w-4 h-4" />
            Enter Operations Console
          </button>
          
          <button 
            onClick={() => handleCTA('architecture')} 
            className="py-3 px-6 rounded-lg bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 font-bold text-sm transition-all flex items-center gap-2"
          >
            <Icons.Network className="w-4 h-4" />
            Inspect AWS Cloud Map
          </button>
        </div>

        {/* Dashboard Visual Mock */}
        <div className="relative pt-12 max-w-5xl mx-auto">
          <div className="glass-panel p-2 rounded-2xl border border-slate-850 shadow-2xl relative">
            <div className="bg-brand-dark/85 rounded-xl border border-slate-900 overflow-hidden aspect-[16/9] flex items-center justify-center p-8">
              
              {/* Graphic design showing live flow trace animation inside landing */}
              <div className="grid grid-cols-3 gap-6 w-full text-left">
                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between h-48 animate-float" style={{ animationDelay: '0ms' }}>
                  <Icons.KeyRound className="w-6 h-6 text-brand-blue" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Cognito Authenticated</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">AES-256 JWT checks</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between h-48 animate-float border-brand-orange/40 shadow-lg shadow-brand-orange/5" style={{ animationDelay: '1000ms' }}>
                  <Icons.BrainCircuit className="w-6 h-6 text-brand-orange" />
                  <div>
                    <h5 className="font-bold text-xs text-white">Bedrock Reasoning</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">Multi-Agent workflow sync</p>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between h-48 animate-float" style={{ animationDelay: '2000ms' }}>
                  <Icons.Database className="w-6 h-6 text-brand-cyan" />
                  <div>
                    <h5 className="font-bold text-xs text-white">OpenSearch Vector DB</h5>
                    <p className="text-[10px] text-slate-500 font-mono mt-1">k-NN overlapping RAG chunks</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </section>

      {/* CORE SPECIFICATIONS GRID */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">TECHNICAL FRAMEWORKS</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Technical Platform Specifications</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => (
            <div 
              key={feat.title} 
              className="glass-card p-6 rounded-2xl flex flex-col gap-4 text-left border border-slate-900"
            >
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 w-fit">
                <DynamicIcon name={feat.icon} className="w-5 h-5 text-brand-blue" />
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white tracking-wide">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PLATFORM BENEFITS SUMMARY */}
      <section className="py-20 bg-slate-950/40 border-y border-slate-900/80 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((ben) => (
            <div key={ben.title} className="space-y-3 text-left">
              <h3 className="text-3xl md:text-5xl font-extrabold text-white font-mono tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {ben.metric}
              </h3>
              <h4 className="text-xs font-bold text-brand-cyan font-mono uppercase tracking-wider">{ben.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-mono">
                {ben.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CLIENT TESTIMONIALS */}
      <section className="py-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest font-semibold">TESTIMONIALS</span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Trusted by Enterprise CTOs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-850 text-left space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed font-mono italic">
              {"\"Lauki Multi-Agent platform has transformed our device provisioning workflows. We synchronized Cognito security pools and the AI resolved MDM credentials errors autonomously, slashing support ticket volume by over 80%.\""}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                SJ
              </div>
              <div>
                <h5 className="text-xs font-bold text-white leading-none">Sarah Jenkins</h5>
                <span className="text-[9px] font-mono text-slate-500">CTO, NexusTech Enterprises</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-850 text-left space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed font-mono italic">
              {"\"Fulfillment delay enqueries used to clog our manual support tiers. Mapped Bedrock tool triggers to database lambdas, and clients now receive instant tracking updates directly inside our support chat, without manual assistance.\""}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-300">
                DC
              </div>
              <div>
                <h5 className="text-xs font-bold text-white leading-none">David Chen</h5>
                <span className="text-[9px] font-mono text-slate-500">VP Operations, Prism Media</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER NAVBAR */}
      <footer className="py-12 border-t border-slate-900 bg-brand-dark/50 px-6">
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-brand-blue">
              <Icons.Cpu className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white font-mono tracking-wider">LAUKI AI CUSTOMER CARE</span>
          </div>

          <div className="flex gap-6 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
            <button onClick={() => handleCTA('dashboard')} className="hover:text-white transition-colors">Operational Console</button>
            <button onClick={() => handleCTA('architecture')} className="hover:text-white transition-colors">AWS Cloud Architecture</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
