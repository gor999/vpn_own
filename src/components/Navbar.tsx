import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, Tv, Film, Globe, Gauge, SlidersHorizontal, Lock } from 'lucide-react';
import type { ConnectionStatus, VPNServer } from '../types/vpn.ts';

interface NavbarProps {
  activeTab: 'dashboard' | 'bbc' | 'cinema' | 'servers' | 'diagnostics';
  setActiveTab: (tab: 'dashboard' | 'bbc' | 'cinema' | 'servers' | 'diagnostics') => void;
  status: ConnectionStatus;
  currentServer: VPNServer;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleConnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  status,
  currentServer,
  onOpenSettings,
  onOpenGuide,
  onToggleConnect,
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isUk = currentServer.countryCode === 'GB';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-rose-600 shadow-lg shadow-blue-500/20 text-white font-bold">
            <Shield className="w-5 h-5" />
            <span className="absolute -bottom-1 -right-1 text-xs">🇬🇧</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg">BritShield</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                VPN & Media
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">UK Unblocker & Free Cinema Station</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">VPN Shield</span>
            <span className="sm:hidden">Shield</span>
          </button>

          <button
            onClick={() => setActiveTab('bbc')}
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'bbc'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            <span>BBC Live</span>
            <span className="flex h-1.5 w-1.5 sm:h-2 sm:w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-rose-500"></span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('cinema')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'cinema'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <span>Free Cinema</span>
          </button>

          <button
            onClick={() => setActiveTab('servers')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'servers'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Servers</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Diagnostics</span>
            <span className="sm:hidden">Tools</span>
          </button>
        </nav>

        {/* Right Status Pill & Settings */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleConnect}
            className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isConnected
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/60'
                : isConnecting
                ? 'bg-amber-950/60 border-amber-500/50 text-amber-400 animate-pulse'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-400 hover:bg-rose-900/60'
            }`}
            title="Click to toggle VPN connection"
          >
            {isConnected ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {currentServer.flag} {isUk ? 'UK Tunnel Active' : `${currentServer.city} Active`}
                </span>
              </>
            ) : isConnecting ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Disconnected</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
            title="How to Use & Quick Guide"
            aria-label="How to Use"
          >
            <span>Guide</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="VPN Settings & Protocols"
            aria-label="VPN Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
