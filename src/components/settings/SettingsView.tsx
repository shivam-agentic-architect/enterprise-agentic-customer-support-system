'use client';

import React, { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings, useProfile } from '../../hooks/useApi';
import * as Icons from 'lucide-react';
import { BEDROCK_MODELS } from '../../constants';
import { cn } from '../../lib/utils';
import { useAppStore } from '../../store/useAppStore';

export default function SettingsView() {
  const { addNotification } = useAppStore();
  const { data: settingsData, isLoading: isSettingsLoading } = useSettings();
  const { data: profile } = useProfile();
  const updateSettingsMutation = useUpdateSettings();

  const [successMsg, setSuccessMsg] = useState(false);
  const [localModel, setLocalModel] = useState('anthropic.claude-3-5-sonnet');
  const [localTemp, setLocalTemp] = useState(0.3);
  const [localTokens, setLocalTokens] = useState(2000);
  const [localPrompt, setLocalPrompt] = useState('');

  // Sync state with API fetch once loaded
  useEffect(() => {
    if (settingsData) {
      setLocalModel(settingsData.bedrockModel || 'anthropic.claude-3-5-sonnet');
      setLocalTemp(settingsData.temperature || 0.3);
      setLocalTokens(settingsData.maxTokens || 2000);
      setLocalPrompt(settingsData.systemPrompt || '');
    }
  }, [settingsData]);

  const handleSave = () => {
    updateSettingsMutation.mutate({
      bedrockModel: localModel,
      temperature: localTemp,
      maxTokens: localTokens,
      systemPrompt: localPrompt
    }, {
      onSuccess: () => {
        setSuccessMsg(true);
        addNotification('API configurations successfully written to AWS Bedrock stack.', 'success');
        setTimeout(() => setSuccessMsg(false), 2500);
      }
    });
  };

  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-orange animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing AWS Bedrock configs...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT: Config Panel (8 cols) */}
      <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">AWS Bedrock Runtime Configuration</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Parameters regulating LLM temperature, reasoning thresholds, and system prompts</p>
          </div>
          <Icons.Sliders className="w-4 h-4 text-brand-orange" />
        </div>

        {successMsg && (
          <div className="p-3 bg-brand-emerald/15 border border-brand-emerald/20 text-brand-emerald rounded-lg text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Icons.CheckCircle2 className="w-4 h-4" />
            System parameters updated successfully! Mapped to active AWS endpoints.
          </div>
        )}

        <div className="space-y-4 text-xs">
          
          {/* Bedrock Model selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold block">ACTIVE BEDROCK LLM ENGINE</label>
            <select
              value={localModel}
              onChange={(e) => setLocalModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-white font-semibold focus:outline-none focus:border-brand-blue cursor-pointer"
            >
              {BEDROCK_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.provider} - Latency: {m.latency})
                </option>
              ))}
            </select>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Temp */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <label className="font-bold">CREATIVITY TEMPERATURE</label>
                <span className="font-bold text-white">{localTemp}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={localTemp}
                onChange={(e) => setLocalTemp(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-blue mt-2"
              />
              <span className="text-[9px] text-slate-500 font-mono mt-1 block">Low value creates precise deterministic RAG answers.</span>
            </div>

            {/* Tokens */}
            <div className="space-y-1.5 p-3.5 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                <label className="font-bold">MAX TOKEN QUOTA LIMIT</label>
                <span className="font-bold text-white">{localTokens}</span>
              </div>
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={localTokens}
                onChange={(e) => setLocalTokens(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-blue mt-2"
              />
              <span className="text-[9px] text-slate-500 font-mono mt-1 block">Caps maximum generation chunk sizes per customer query.</span>
            </div>

          </div>

          {/* System prompt template */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-bold block uppercase tracking-wider">Base AI Orchestration Prompt Template</label>
            <textarea
              rows={4}
              value={localPrompt}
              onChange={(e) => setLocalPrompt(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg p-3 text-white font-mono leading-relaxed focus:outline-none focus:border-brand-blue placeholder-slate-600"
              placeholder="Input core instructions..."
            />
          </div>

          {/* Save button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
              className="w-full sm:w-auto py-2.5 px-6 rounded-lg bg-brand-blue hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-lg shadow-brand-blue/15 cursor-pointer"
            >
              {updateSettingsMutation.isPending ? 'Synchronizing AWS Stack...' : 'Synchronize AWS Stack'}
            </button>
          </div>

        </div>
      </div>

      {/* RIGHT: Status/Integration (4 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* User Account profiles */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            OPERATOR SETTINGS
          </span>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200">
                {profile?.full_name?.charAt(0) || 'AD'}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">{profile?.full_name || 'Admin Operator'}</h4>
                <p className="text-[10px] text-slate-400">Security Group: {profile?.role?.toUpperCase() || 'T3 SLA'}</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-[10px]">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                <span className="text-slate-500">MFA STATUS</span>
                <span className="px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald font-bold">SECURE COGNITO</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                <span className="text-slate-500">SESSION EMAIL</span>
                <span className="text-slate-300 font-bold truncate max-w-[150px]" title={profile?.email}>{profile?.email || 'admin@lauki.care'}</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">ENCRYPTION PROTOCOL</span>
                <span className="text-brand-orange font-bold">AES-256-GCM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Swappers Toggles */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-xs">
          <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            INTEGRATED AWS CLUSTERS
          </span>
          
          <div className="space-y-3 font-mono text-[10px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Cognito Identity Provider</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">OpenSearch Vector Node</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Amazon Connect IVR</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">Salesforce CRM Syncer</span>
              <span className="w-2.5 h-2.5 rounded-full bg-brand-emerald" />
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
