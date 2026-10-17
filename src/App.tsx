import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { BBCNewsView } from './components/BBCNewsView.tsx';
import { FreeCinemaView } from './components/FreeCinemaView.tsx';
import { ServerListView } from './components/ServerListView.tsx';
import { DiagnosticsView } from './components/DiagnosticsView.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { QuickGuideModal } from './components/QuickGuideModal.tsx';
import { INITIAL_SERVERS } from './data/mockData.ts';
import type {
  ConnectionStatus,
  VPNServer,
  ConnectionMetrics,
  SecuritySettings,
} from './types/vpn.ts';
import { simulateTrafficTick } from './utils/vpnLogic.ts';

export default function App() {
  const [servers, setServers] = useState<VPNServer[]>(INITIAL_SERVERS);
  const [currentServer, setCurrentServer] = useState<VPNServer>(INITIAL_SERVERS[0]);
  const [status, setStatus] = useState<ConnectionStatus>('connected'); // Connected to UK server by default so user can immediately watch BBC and films
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bbc' | 'cinema' | 'servers' | 'diagnostics'>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [connectionStepText, setConnectionStepText] = useState<string>('UK Tunnel Protected');

  const [settings, setSettings] = useState<SecuritySettings>({
    killSwitch: true,
    dnsLeakProtection: true,
    splitTunneling: false,
    autoConnectOnLaunch: true,
    adBlockerEnabled: true,
    protocol: 'wireguard',
    splitTunnelDomains: ['localhost', 'localbank.co.uk'],
  });

  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    bytesDownloaded: 48_240_000, // Pre-seeded initial usage (~48 MB)
    bytesUploaded: 12_800_000,
    connectedDurationSec: 320,
    currentDownloadMbps: 114.2,
    currentUploadMbps: 42.5,
  });

  // Check URL params (?tab=bbc, ?autostart=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam === 'bbc' || tabParam === 'cinema' || tabParam === 'servers' || tabParam === 'diagnostics') {
      setActiveTab(tabParam);
    }
  }, []);

  // Traffic heartbeat ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => simulateTrafficTick(prev, status === 'connected', currentServer.loadPercent));
    }, 1000);
    return () => clearInterval(timer);
  }, [status, currentServer.loadPercent]);

  // Connect / Disconnect Handler with realistic step transitions
  const handleToggleConnect = () => {
    if (status === 'connected') {
      setStatus('disconnecting');
      setConnectionStepText('Terminating WireGuard Tunnel...');
      setTimeout(() => {
        setStatus('disconnected');
        setConnectionStepText('Disconnected & Unencrypted');
        setMetrics((prev) => ({
          ...prev,
          currentDownloadMbps: 0,
          currentUploadMbps: 0,
        }));
      }, 700);
    } else if (status === 'disconnected') {
      setStatus('connecting');
      setConnectionStepText('Resolving UK DNS & Allocating Node...');

      setTimeout(() => {
        setConnectionStepText('Exchanging ChaCha20 Handshake Keys...');
        setTimeout(() => {
          setConnectionStepText(`Assigned UK Virtual IP: ${currentServer.ip}`);
          setTimeout(() => {
            setStatus('connected');
            setConnectionStepText('UK Tunnel Protected & Active');
          }, 600);
        }, 600);
      }, 600);
    }
  };

  const handleSelectServer = (server: VPNServer) => {
    setCurrentServer(server);
  };

  const handleSelectAndConnect = (server: VPNServer) => {
    setCurrentServer(server);
    if (status !== 'connected') {
      setStatus('connecting');
      setConnectionStepText(`Connecting to ${server.city}...`);
      setTimeout(() => {
        setStatus('connected');
        setConnectionStepText(`Connected to ${server.name}`);
      }, 800);
    }
  };

  const handleConnectToUk = () => {
    const uk = servers.find((s) => s.countryCode === 'GB') || servers[0];
    setCurrentServer(uk);
    if (status !== 'connected') {
      handleToggleConnect();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white antialiased">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={status}
        currentServer={currentServer}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onToggleConnect={handleToggleConnect}
      />

      {/* BBC Live News Ticker Ribbon */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs overflow-hidden backdrop-blur-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center gap-3">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="bg-rose-600 text-white font-extrabold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
              BBC WIRE
            </span>
          </div>

          <div className="flex-1 overflow-hidden whitespace-nowrap text-slate-300">
            <span className="animate-pulse text-slate-400 font-mono text-[11px] mr-2">16:20 GMT</span>
            <span className="font-medium text-slate-200">
              UK & European Nations Ratify £45bn North Sea Energy Pact &bull; Bank of England Holds Benchmark Lending Rate at 5.0% &bull; Cambridge Deep Tech Quantum Center Opens &bull; BFI Restores 100+ Classic Film Masters
            </span>
          </div>

          <button
            onClick={() => setActiveTab('bbc')}
            className="flex-shrink-0 text-[11px] text-rose-400 hover:text-rose-300 font-semibold underline decoration-rose-500/40 cursor-pointer hidden md:inline"
          >
            Watch Broadcast &rarr;
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            status={status}
            currentServer={currentServer}
            metrics={metrics}
            settings={settings}
            connectionStepText={connectionStepText}
            onToggleConnect={handleToggleConnect}
            onSelectServer={handleSelectServer}
            allServers={servers}
            onOpenBbc={() => setActiveTab('bbc')}
            onOpenCinema={() => setActiveTab('cinema')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {activeTab === 'bbc' && (
          <BBCNewsView
            isConnected={status === 'connected'}
            currentServer={currentServer}
            onConnectToUk={handleConnectToUk}
          />
        )}

        {activeTab === 'cinema' && (
          <FreeCinemaView
            isConnected={status === 'connected'}
            currentServer={currentServer}
          />
        )}

        {activeTab === 'servers' && (
          <ServerListView
            servers={servers}
            currentServer={currentServer}
            isConnected={status === 'connected'}
            onSelectAndConnect={handleSelectAndConnect}
          />
        )}

        {activeTab === 'diagnostics' && (
          <DiagnosticsView
            currentServer={currentServer}
            isConnected={status === 'connected'}
          />
        )}
      </main>

      {/* Quick Guide Modal */}
      <QuickGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onNavigateToBbc={() => setActiveTab('bbc')}
        onNavigateToCinema={() => setActiveTab('cinema')}
        onNavigateToDiagnostics={() => setActiveTab('diagnostics')}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">BritShield VPN & Media Station</span>
            <span>&bull;</span>
            <span>Zero-Log WireGuard Tunnel</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>100% Free Public Domain Streaming</span>
            <span>&bull;</span>
            <span>Official BBC London Feeds</span>
            <span>&bull;</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Security Settings
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
