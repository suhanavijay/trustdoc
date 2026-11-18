import React from 'react';
import { Shield, Lock, FileCode, CheckCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Tagline */}
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-200 text-sm">TrustDoc</span>
            <span className="text-slate-600">—</span>
            <span className="text-xs text-slate-400">Cryptographic Document Verification System</span>
          </div>

          {/* Cryptography Stack Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-emerald-400">
              <Lock className="w-3 h-3" /> SHA-256
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-400">
              <FileCode className="w-3 h-3" /> ECDSA P-256
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 font-mono text-purple-400">
              <CheckCircle className="w-3 h-3" /> Merkle Trees
            </span>
          </div>

          {/* Subtitle / Built info */}
          <div className="text-xs text-slate-500 text-center md:text-right">
            Zero-Trust Architecture • Non-repudiation Guarantees
          </div>
        </div>
      </div>
    </footer>
  );
};
