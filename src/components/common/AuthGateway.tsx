'use client';

import React, { useState, useEffect } from 'react';
import { useLogin, useProfile } from '../../hooks/useApi';
import * as Icons from 'lucide-react';
import { clearTokens } from '../../services/apiClient';

export default function AuthGateway({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading: isProfileLoading, refetch } = useProfile();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [authExpired, setAuthExpired] = useState(false);

  // Listen for global authentication expired events (triggered by Axios on failed refresh loops)
  useEffect(() => {
    const handleAuthExpired = () => {
      setAuthExpired(true);
      setErrorMsg('Operator login session expired. Please re-authenticate.');
      clearTokens();
      refetch();
    };

    window.addEventListener('lauki_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('lauki_auth_expired', handleAuthExpired);
  }, [refetch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please populate all credential fields.');
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          setEmail('');
          setPassword('');
          setErrorMsg('');
          setAuthExpired(false);
          refetch();
        },
        onError: (err: any) => {
          const detail = err.response?.data?.detail;
          setErrorMsg(detail || 'Incorrect operator credentials. Try again.');
        }
      }
    );
  };

  const handleQuickFill = (selectedEmail: string) => {
    setEmail(selectedEmail);
    setPassword('AdminPassword123!');
    setErrorMsg('');
  };

  // Sleek system loading screen
  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center text-slate-400 selection:bg-brand-blue relative">
        <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
        <div className="flex flex-col items-center gap-4">
          <Icons.Cpu className="w-12 h-12 text-brand-blue animate-spin" />
          <div className="space-y-1 text-center">
            <span className="font-mono text-xs tracking-[0.2em] text-slate-400 font-bold uppercase block">LAUKI AI PLATFORM</span>
            <span className="font-mono text-[10px] text-brand-cyan tracking-widest uppercase font-semibold">Resolving Cognito User Pools Session...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is successfully authenticated, load the dashboard console
  if (user && !authExpired) {
    return <>{children}</>;
  }

  // Otherwise, lock access and render our premium Operator login interface
  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 flex flex-col justify-center items-center px-4 relative selection:bg-brand-blue selection:text-white">
      
      {/* Dynamic backdrop glows */}
      <div className="absolute top-[-10%] left-[5%] w-[40vw] h-[40vw] rounded-full bg-brand-blue/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-cyan/5 blur-[150px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative space-y-6 animate-fade-in">
        
        {/* Brand/System Logo Indicator */}
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-blue text-white shadow-xl shadow-brand-blue/30 flex-shrink-0 animate-pulse-glow">
            <Icons.ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h3 className="font-extrabold text-white tracking-wider text-base">LAUKI GATEWAY</h3>
            <p className="text-[10px] text-brand-cyan font-mono tracking-widest font-semibold uppercase mt-0.5">Secure Operator Authentication</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-brand-rose/15 border border-brand-rose/25 text-brand-rose rounded-xl text-xs flex items-center gap-2.5 leading-relaxed font-medium">
            <Icons.AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Operator Email Address</label>
            <div className="relative">
              <Icons.Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="operator@lauki.care"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-brand-blue hover:border-slate-700 transition-all rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Security Password</label>
            <div className="relative">
              <Icons.Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-850 focus:border-brand-blue hover:border-slate-700 transition-all rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-3.5 rounded-xl bg-brand-blue hover:bg-blue-600 disabled:opacity-40 text-white font-bold text-xs tracking-wider transition-all shadow-xl shadow-brand-blue/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loginMutation.isPending ? (
              <>
                <Icons.Loader2 className="w-4 h-4 animate-spin" />
                Validating Token Signatures...
              </>
            ) : (
              <>
                <Icons.Fingerprint className="w-4 h-4" />
                Sign In to Console
              </>
            )}
          </button>
        </form>

        {/* Quick Testing Seeder Block (Helpful for users running locally) */}
        <div className="pt-4 border-t border-slate-900 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-widest">Local Seed Credentials</span>
            <Icons.Database className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickFill('admin@lauki.care')}
              className="p-2 bg-slate-950/60 border border-slate-850 hover:border-slate-700 rounded-lg text-left text-[10px] text-slate-400 font-mono transition-all flex flex-col justify-between hover:text-white"
            >
              <span className="font-bold text-brand-orange text-[9px]">ADMIN OPERATOR</span>
              <span className="truncate mt-1">admin@lauki.care</span>
            </button>
            <button
              onClick={() => handleQuickFill('agent@lauki.care')}
              className="p-2 bg-slate-950/60 border border-slate-850 hover:border-slate-700 rounded-lg text-left text-[10px] text-slate-400 font-mono transition-all flex flex-col justify-between hover:text-white"
            >
              <span className="font-bold text-brand-blue text-[9px]">SUPPORT AGENT</span>
              <span className="truncate mt-1">agent@lauki.care</span>
            </button>
          </div>
        </div>

      </div>

      <div className="mt-8 text-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
        Lauki Secure Gatekeeper • AWS Cognito Token Exchange Pool V2
      </div>

    </div>
  );
}
