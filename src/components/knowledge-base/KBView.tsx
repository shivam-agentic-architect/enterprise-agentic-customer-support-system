'use client';

import React, { useState } from 'react';
import { useKBArticles, useUploadKB } from '../../hooks/useApi';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

export default function KBView() {
  const { data: kbArticles = [], isLoading } = useKBArticles();
  const uploadMutation = useUploadKB();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');

  // Semantic search result mock/interactive
  const [aiQuery, setAiQuery] = useState('');
  const [aiSearchResult, setAiSearchResult] = useState<any[] | null>(null);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  // File categories tabs
  const categories = [
    { id: 'all', label: 'All Documents', icon: 'FolderOpen' },
    { id: 'policy', label: 'Company Policies', icon: 'ShieldAlert' },
    { id: 'faq', label: 'FAQs Index', icon: 'HelpCircle' },
    { id: 'sop', label: 'Standard SOPs', icon: 'FileCheck' },
    { id: 'api', label: 'API Integrations', icon: 'Code2' }
  ];

  const DynamicIcon = ({ name, className }: { name: string; className?: string }) => {
    const IconComponent = (Icons as any)[name];
    if (!IconComponent) return <Icons.File className={className} />;
    return <IconComponent className={className} />;
  };

  // Uploader Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadFileName(file.name);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 250);

    uploadMutation.mutate({
      file
    }, {
      onSuccess: () => {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(null), 1200);
      },
      onError: () => {
        clearInterval(interval);
        setUploadProgress(null);
        alert('File upload compilation failed.');
      }
    });
  };

  // Semantic AI query simulation for RAG visualization
  const handleAISearch = async () => {
    if (!aiQuery.trim()) return;
    setIsSearchingAI(true);
    setAiSearchResult(null);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const query = aiQuery.toLowerCase();
    let matches: any[] = [];

    if (query.includes('activation') || query.includes('mdm') || query.includes('error')) {
      matches = [
        {
          id: 'KB-992',
          title: 'MDM Profile Error 994 Activation Workaround (KB-992)',
          snippet: '...devices failing to load local token profiles can trigger a Cognito credential rotation via active lambda endpoint parameters inside the security catalog...',
          source: 's3://kb-policies/refund-v2.pdf',
          score: 0.96
        },
        {
          id: 'KB-102',
          title: 'Lauki Platform Enterprise Security Architecture Whitepaper (KB-102)',
          snippet: '...VPC private subnets host Cognito User Pools validating secure identity logs and rotating public security keys on 8443 listeners...',
          source: 's3://kb-policies/security-audit-v1.pdf',
          score: 0.81
        }
      ];
    } else {
      matches = [
        {
          id: 'KB-501',
          title: 'Standard Product Refund Policy & Warranty Claims (KB-501)',
          snippet: '...all electronic device RMAs undergo laser verification. Custom engraving exceptions apply for specific enterprise accounts...',
          source: 's3://kb-policies/standard-warranty.md',
          score: 0.89
        }
      ];
    }

    setAiSearchResult(matches);
    setIsSearchingAI(false);
  };

  // Standard category and search filter
  const filteredArticles = kbArticles.filter((a) => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-slate-400">
        <Icons.Loader2 className="w-10 h-10 text-brand-cyan animate-spin mb-3.5" />
        <span className="font-mono text-xs tracking-[0.2em] text-slate-500 uppercase">Synchronizing OpenSearch Vector Embeddings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Uploader Console & AI RAG Search header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* RAG Vector AI Semantic Search */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
          <div>
            <h4 className="text-sm font-bold text-white tracking-wide">RAG Vector Semantic Search</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Queries raw chunks and vector embeddings using Claude 3.5 Sonnet & Bedrock</p>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. How does security token authorization rotate on MDM failure?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAISearch()}
              className="flex-1 bg-slate-950 border border-slate-850 rounded-lg py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-cyan font-mono"
            />
            <button
              onClick={handleAISearch}
              disabled={isSearchingAI || !aiQuery.trim()}
              className="py-2 px-4 rounded-lg bg-brand-cyan disabled:opacity-40 hover:bg-cyan-600 font-bold text-xs text-brand-dark transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              {isSearchingAI ? (
                <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Icons.Sparkles className="w-3.5 h-3.5" />
              )}
              Ask RAG Vector
            </button>
          </div>

          {/* AI Search Citation Results */}
          {aiSearchResult && (
            <div className="space-y-3 mt-3 animate-fade-in">
              <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block">VECTOR SEARCH RESULTS (TOP RETRIEVALS)</span>
              
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {aiSearchResult.map((res, rIdx) => (
                  <div key={rIdx} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="font-bold text-brand-cyan">{res.title}</span>
                      <span className="text-brand-emerald font-bold">Similarity score: {(res.score * 100).toFixed(0)}%</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-mono pl-3 border-l-2 border-slate-800">
                      {res.snippet}
                    </p>
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-mono">
                      <Icons.MapPin className="w-3 h-3 text-brand-orange" />
                      <span>{res.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PDF/SOP Uploader Grid */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white tracking-wide">Sync Documents & Policies</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Upload local PDFs, SOPs or markdown policies. Files are parsed using Amazon Textract, chunked, vectorized, and stored in OpenSearch indexes.
            </p>
          </div>

          <div className="mt-4">
            {uploadProgress !== null ? (
              <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl space-y-3 font-mono text-[10px]">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="font-bold truncate max-w-[150px]">{uploadFileName}</span>
                  <span className="text-brand-cyan">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-850">
                  <div className="bg-brand-cyan h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-slate-500 leading-none mt-1">
                  {uploadProgress < 50 
                    ? '🤖 Running text extraction...' 
                    : uploadProgress < 90 
                    ? '🔐 Generating vector embeddings (Amazon Titan)...' 
                    : '📂 Indexing inside OpenSearch catalog...'}
                </p>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-800 hover:border-brand-blue/50 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-950/20 group">
                <Icons.UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-brand-blue mb-2 transition-colors" />
                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Choose document to upload</span>
                <span className="text-[9px] text-slate-500 font-mono mt-1 uppercase">PDF, markdown or DOC (Max 20MB)</span>
                <input
                  type="file"
                  accept=".pdf,.md,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

      </div>

      {/* 2. File Matrix Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Categories navigation (Left side) */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1 h-fit">
          <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-3 border-b border-slate-800/80 pb-2">
            DOCUMENT DIRECTORY
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all cursor-pointer",
                  isActive 
                    ? "bg-slate-900 text-white font-bold border-l-2 border-brand-blue" 
                    : "text-slate-400 hover:bg-slate-900/30 hover:text-slate-200"
                )}
              >
                <DynamicIcon name={cat.icon} className="w-4 h-4 text-slate-500" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Files Grids Listing (Right side) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Main search and counter bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Icons.Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search index database..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-brand-blue"
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 font-semibold self-end sm:self-center">
              MATCHES FOUND: {filteredArticles.length} DOCUMENTS
            </span>
          </div>

          {/* Files Grid cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 border border-slate-850 border-dashed rounded-xl col-span-2">
                <Icons.File className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No matching documents resolved.
              </div>
            ) : (
              filteredArticles.map((art) => (
                <div 
                  key={art.id} 
                  className="glass-card p-4 rounded-xl border border-slate-850 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-900">
                          {art.format === 'pdf' ? (
                            <Icons.FileText className="w-5 h-5 text-brand-rose" />
                          ) : (
                            <Icons.Code className="w-5 h-5 text-brand-cyan" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white leading-tight max-w-[170px] truncate" title={art.title}>
                            {art.title}
                          </h4>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">
                            {art.id.slice(0, 8)} • {art.size}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider ${
                        art.status === 'indexed' 
                          ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20' 
                          : 'bg-brand-orange/15 text-brand-orange animate-pulse'
                      }`}>
                        {art.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono max-h-16 overflow-hidden">
                      {art.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-900 pt-3 text-[9px] font-mono text-slate-500">
                    <span>SYNCED: {art.lastSync}</span>
                    <span className="text-brand-cyan font-bold">CITED {art.citationsCount} TIMES</span>
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
