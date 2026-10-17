import React, { useEffect, useRef } from 'react';
import {
  Power,
  ShieldCheck,
  ShieldAlert,
  ArrowDown,
  ArrowUp,
  Clock,
  Zap,
  Globe,
  Radio,
  Tv,
  Film,
  Lock,
  Download,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import type {
  ConnectionStatus,
  VPNServer,
  ConnectionMetrics,
  SecuritySettings
} from '../types/vpn.ts';
import { formatBytes, formatDuration, calculateSecurityScore } from '../utils/vpnLogic.ts';

interface DashboardViewProps {
  status: ConnectionStatus;
  currentServer: VPNServer;
  metrics: ConnectionMetrics;
  settings: SecuritySettings;
  connectionStepText: string;
  onToggleConnect: () => void;
  onSelectServer: (server: VPNServer) => void;
  allServers: VPNServer[];
  onOpenBbc: () => void;
  onOpenCinema: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  status,
  currentServer,
  metrics,
  settings,
  connectionStepText,
  onToggleConnect,
  onSelectServer,
  allServers,
  onOpenBbc,
  onOpenCinema,
  onOpenSettings,
  onOpenGuide,
}) => {
  const isConnected = status === 'connected';
  const isConnecting = status === 'connecting';
  const isUkServer = currentServer.countryCode === 'GB';
  const securityScore = calculateSecurityScore(settings, isConnected);

  // Speed canvas graph
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const speedHistoryRef = useRef<number[]>(new Array(30).fill(0));

  useEffect(() => {
    // Push new point
    speedHistoryRef.current.push(isConnected ? metrics.currentDownloadMbps : 0);
    if (speedHistoryRef.current.length > 30) {
      speedHistoryRef.current.shift();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Draw background grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let y = 15; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw speed line
    const history = speedHistoryRef.current;
    const maxVal = Math.max(120, ...history);
    const step = width / (history.length - 1);

    ctx.beginPath();
    history.forEach((val, index) => {
      const x = index * step;
      const y = height - (val / maxVal) * (height - 15) - 5;
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    // Stroke
    ctx.strokeStyle = isConnected ? '#3b82f6' : '#64748b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Gradient fill under the curve
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    if (isConnected) {
      gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
      gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
    } else {
      gradient.addColorStop(0, 'rgba(100, 116, 139, 0.2)');
      gradient.addColorStop(1, 'rgba(100, 116, 139, 0.0)');
    }
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [metrics.currentDownloadMbps, isConnected]);

  return (
    <div className="space-y-6">
      {/* Top Hero Banner - Streaming Unblocking Highlight */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isConnected && isUkServer
            ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 border-emerald-500/40 text-emerald-100'
            : isConnected
            ? 'bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border-blue-500/40 text-blue-100'
            : 'bg-gradient-to-r from-rose-950/50 via-slate-900 to-slate-900 border-rose-500/30 text-rose-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-3 rounded-xl ${
                isConnected && isUkServer
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isConnected
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {isConnected ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg text-white">
                  {isConnected && isUkServer
                    ? 'UK Gateway Online: BBC iPlayer & Free Cinema Ready'
                    : isConnected
                    ? `Connected to ${currentServer.name}`
                    : 'VPN Disconnected: Your Real IP Is Visible'}
                </h2>
                {isConnected && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono whitespace-nowrap">
                    AES-256-GCM
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {isConnected && isUkServer
                  ? 'Your virtual IP is located in London. BBC News live broadcast and free classic films are fully unlocked without geo-restrictions.'
                  : isConnected
                  ? 'To watch BBC News without restrictions, switch to any United Kingdom (London or Manchester) node.'
                  : 'Click the central button below to encrypt your tunnel and acquire a high-speed UK IP address.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            {(!isConnected || !isUkServer) && (
              <button
                onClick={() => {
                  const ukServer = allServers.find((s) => s.countryCode === 'GB');
                  if (ukServer) {
                    onSelectServer(ukServer);
                    if (!isConnected) onToggleConnect();
                  }
                }}
                className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>🇬🇧 Quick-Connect UK</span>
              </button>
            )}
            <button
              onClick={onOpenGuide}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>How to Start? 💡</span>
            </button>
            <button
              onClick={onOpenBbc}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Tv className="w-4 h-4 text-rose-400" />
              <span>Watch BBC</span>
            </button>
            <button
              onClick={onOpenCinema}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Film className="w-4 h-4 text-amber-400" />
              <span>Free Cinema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: VPN Centerpiece + Real-Time Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Big Power Switch & Server Picker (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-sm shadow-xl">
          {/* Ambient background aura */}
          <div
            className={`absolute -top-24 -left-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isConnected ? 'bg-emerald-600/15' : isConnecting ? 'bg-amber-600/15' : 'bg-rose-600/10'
            }`}
          />
          <div
            className={`absolute -bottom-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
              isConnected ? 'bg-blue-600/15' : 'bg-slate-700/10'
            }`}
          />

          {/* Header of card: Protocol & Status badge */}
          <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800/80 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">TUNNEL PROTOCOL:</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 uppercase">
                {settings.protocol.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">SECURITY SCORE:</span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded ${
                  securityScore >= 80
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                }`}
              >
                {securityScore}%
              </span>
            </div>
          </div>

          {/* Central Power Button */}
          <div className="my-8 flex flex-col items-center z-10">
            <div className="relative flex items-center justify-center">
              {/* Outer pulsing animated rings */}
              {isConnected && (
                <>
                  <div className="absolute w-52 h-52 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
                  <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-500/40 animate-pulse" />
                </>
              )}
              {isConnecting && (
                <div className="absolute w-48 h-48 rounded-full border-2 border-dashed border-amber-400 animate-spin" />
              )}

              {/* The big circular toggle button */}
              <button
                onClick={onToggleConnect}
                disabled={isConnecting}
                className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl cursor-pointer ${
                  isConnected
                    ? 'bg-gradient-to-b from-emerald-500 to-teal-700 text-white shadow-emerald-500/30 hover:from-emerald-400 hover:to-teal-600'
                    : isConnecting
                    ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-amber-500/30 cursor-wait'
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 text-slate-300 border-2 border-slate-700/80 hover:border-slate-500 shadow-slate-950/60'
                }`}
                aria-label={isConnected ? 'Disconnect from VPN' : 'Connect to VPN'}
              >
                <Power className={`w-12 h-12 mb-1 ${isConnected ? 'text-white' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isConnected ? 'Disconnect' : isConnecting ? 'Connecting' : 'Connect'}
                </span>
              </button>
            </div>

            {/* Connection feedback status label */}
            <div className="mt-4 text-center">
              <p
                className={`text-sm font-semibold tracking-wide ${
                  isConnected ? 'text-emerald-400' : isConnecting ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {connectionStepText}
              </p>
              {isConnected && (
                <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Encrypted Tunnel Established &bull; 0% Packet Loss
                </p>
              )}
            </div>
          </div>

          {/* Current Server Selector Card */}
          <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{currentServer.flag}</span>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-semibold text-white text-sm">{currentServer.name}</span>
                    {currentServer.isUkBbcOptimized && (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-medium border border-rose-500/30 whitespace-nowrap">
                        BBC Ready
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Virtual IP: <span className="font-mono text-slate-300">{isConnected ? currentServer.ip : 'Hidden'}</span> &bull; Latency: {currentServer.pingMs}ms
                  </p>
                </div>
              </div>

              {/* Server selector dropdown */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <select
                  value={currentServer.id}
                  onChange={(e) => {
                    const found = allServers.find((s) => s.id === e.target.value);
                    if (found) onSelectServer(found);
                  }}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                  aria-label="Select VPN Server"
                >
                  {allServers.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.flag} {srv.city} ({srv.pingMs}ms)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Speed Meter & Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time speed graph */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <h3 className="font-semibold text-sm text-white">Live Speed Monitor</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {metrics.currentDownloadMbps.toFixed(1)} Mbps
              </span>
            </div>

            {/* Canvas graph */}
            <div className="h-28 w-full bg-slate-950/80 rounded-xl overflow-hidden border border-slate-800/70 p-1 relative">
              <canvas
                ref={canvasRef}
                width={360}
                height={100}
                className="w-full h-full block"
              />
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-[1px]">
                  <span className="text-xs text-slate-400">Tunnel Inactive</span>
                </div>
              )}
            </div>

            {/* Speeds Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
                  <span>Download</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {metrics.currentDownloadMbps.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">Mbps</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Total: {formatBytes(metrics.bytesDownloaded)}
                </div>
              </div>

              <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                  <ArrowUp className="w-3.5 h-3.5 text-purple-400" />
                  <span>Upload</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {metrics.currentUploadMbps.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-400">Mbps</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Total: {formatBytes(metrics.bytesUploaded)}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Stats & Security Features */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm shadow-xl space-y-3">
            <h3 className="font-semibold text-sm text-white flex items-center justify-between">
              <span>Security & Telemetry</span>
              <button
                onClick={onOpenSettings}
                className="text-xs text-blue-400 hover:text-blue-300 font-normal"
              >
                Configure
              </button>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/40">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Connected Uptime:</span>
                </span>
                <span className="font-mono font-semibold text-white">
                  {formatDuration(metrics.connectedDurationSec)}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/40">
                <span className="text-slate-400">Kill Switch Protection:</span>
                <span className={`font-semibold ${settings.killSwitch ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {settings.killSwitch ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/40">
                <span className="text-slate-400">DNS Leak Guard:</span>
                <span className={`font-semibold ${settings.dnsLeakProtection ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {settings.dnsLeakProtection ? 'Encrypted 1.1.1.1' : 'ISP Default'}
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/50 border border-slate-800/40">
                <span className="text-slate-400">Ad & Tracker Filter:</span>
                <span className={`font-semibold ${settings.adBlockerEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {settings.adBlockerEnabled ? 'Blocking 42,000 domains' : 'Off'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Shortcuts: BBC Live & Free Cinema Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BBC Hub Card */}
        <div
          onClick={onOpenBbc}
          className="group relative bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/30 hover:border-rose-500/60 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-rose-900/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/30">
                <Tv className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-rose-400 tracking-wider">
                  UK Live Broadcasting
                </span>
                <h3 className="font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                  BBC News & World Feeds
                </h3>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Stream official live BBC broadcasts, breaking headlines from Westminster and world capitals, and audio podcasts.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Live Feed Online
            </span>
            <span className="text-slate-400 group-hover:text-white font-medium flex items-center gap-1">
              Watch Broadcast &rarr;
            </span>
          </div>
        </div>

        {/* Free Cinema Card */}
        <div
          onClick={onOpenCinema}
          className="group relative bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-xl hover:shadow-amber-900/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                <Film className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Free Legal Cinema
                </span>
                <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition-colors">
                  Classic Movies & 1080p Vault
                </h3>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" />
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Stream classic films: Night of the Living Dead, Sherlock Holmes, Cary Grant comedies, Fritz Lang sci-fi, and Charlie Chaplin.
          </p>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-amber-400 font-semibold">100% Free & Unlimited</span>
            <span className="text-slate-400 group-hover:text-white font-medium flex items-center gap-1">
              Enter Theater &rarr;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
