import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, FileCheck2, FilePlus } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo & Name */}
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400 group-hover:scale-105 transition-all shadow-lg shadow-emerald-500/10">
              <Shield className="w-5 h-5" />
              <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Trust<span className="text-emerald-400">Doc</span>
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 -mt-1">
                Crypto Proof
              </span>
            </div>
          </NavLink>

          {/* Navigation links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 shadow-inner border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <span>Home</span>
            </NavLink>

            <NavLink
              to="/issue"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 shadow-inner border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <FilePlus className="w-4 h-4 text-emerald-400" />
              <span>Issue Document</span>
            </NavLink>

            <NavLink
              to="/verify"
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-slate-800/90 text-emerald-400 shadow-inner border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              <span>Verify Document</span>
            </NavLink>
          </nav>

          {/* Right Status Badge */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse"></span>
              <span className="font-mono text-slate-300 font-medium">P-256 ECDSA</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Merkle Tree</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
