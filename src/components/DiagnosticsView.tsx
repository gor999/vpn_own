import React, { useState } from 'react';
import {
  Gauge,
  ShieldCheck,
  ShieldAlert,
  Download,
  Copy,
  Check,
  Zap,
  Radio,
  FileCode,
  HardDrive,
  RefreshCw,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import type { VPNServer, SpeedTestState } from '../types/vpn.ts';
import { generateWireguardConfig, generateOpenVpnConfig } from '../utils/vpnLogic.ts';

interface DiagnosticsViewProps {
  currentServer: VPNServer;
  isConnected: boolean;
}

export const DiagnosticsView: React.FC<DiagnosticsViewProps> = ({
  currentServer,
  isConnected,
}) => {
  // Speed test state
  const [speedTest, setSpeedTest] = useState<SpeedTestState>({
    isRunning: false,
    step: 'idle',
    ping: 0,
    jitter: 0,
    downloadSpeed: 0,
    uploadSpeed: 0,
    progress: 0,
  });

  const [leakTestRunning, setLeakTestRunning] = useState<boolean>(false);
  const [leakTestDone, setLeakTestDone] = useState<boolean>(false);
  const [copiedWg, setCopiedWg] = useState<boolean>(false);
  const [copiedOvpn, setCopiedOvpn] = useState<boolean>(false);

  // Run simulated realistic speed test
  const handleRunSpeedTest = () => {
    if (speedTest.isRunning) return;

    setSpeedTest({
      isRunning: true,
      step: 'ping',
      ping: 0,
      jitter: 0,
      downloadSpeed: 0,
      uploadSpeed: 0,
      progress: 10,
    });

    // Step 1: Ping & Jitter
    setTimeout(() => {
      const ping = isConnected ? currentServer.pingMs : 45;
      const jitter = Math.floor(Math.random() * 4) + 1;
      setSpeedTest((prev) => ({
        ...prev,
        step: 'download',
        ping,
        jitter,
        progress: 35,
      }));

      // Step 2: Download test
      let dlInterval = setInterval(() => {
        setSpeedTest((prev) => {
          if (prev.step !== 'download') return prev;
          const target = isConnected ? 112 + Math.random() * 20 : 64 + Math.random() * 15;
          return {
            ...prev,
            downloadSpeed: Math.round(target * 10) / 10,
            progress: Math.min(75, prev.progress + 8),
          };
        });
      }, 200);

      setTimeout(() => {
        clearInterval(dlInterval);
        setSpeedTest((prev) => ({
          ...prev,
          step: 'upload',
          downloadSpeed: isConnected ? 124.6 : 72.4,
          progress: 80,
        }));

        // Step 3: Upload test
        let ulInterval = setInterval(() => {
          setSpeedTest((prev) => {
            if (prev.step !== 'upload') return prev;
            const target = isConnected ? 48 + Math.random() * 12 : 28 + Math.random() * 8;
            return {
              ...prev,
              uploadSpeed: Math.round(target * 10) / 10,
              progress: Math.min(95, prev.progress + 6),
            };
          });
        }, 200);

        setTimeout(() => {
          clearInterval(ulInterval);
          setSpeedTest((prev) => ({
            ...prev,
            isRunning: false,
            step: 'complete',
            uploadSpeed: isConnected ? 52.8 : 31.2,
            progress: 100,
          }));
        }, 1600);
      }, 1600);
    }, 1000);
  };

  const handleRunLeakTest = () => {
    setLeakTestRunning(true);
    setTimeout(() => {
      setLeakTestRunning(false);
      setLeakTestDone(true);
    }, 1200);
  };

  const wgConfig = generateWireguardConfig(currentServer);
  const ovpnConfig = generateOpenVpnConfig(currentServer);

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Gauge className="w-5 h-5 text-blue-400" />
          <span>Diagnostics & Tunnel Configurations</span>
        </h2>
        <p className="text-xs text-slate-400">
          Measure streaming throughput, verify DNS leak cloaking, and export WireGuard & OpenVPN profiles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Speedometer Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-white text-base">Streaming Speedometer</h3>
            </div>
            <span className="text-xs text-slate-400">
              Server: <span className="text-white font-medium">{currentServer.name}</span>
            </span>
          </div>

          {/* Central Meter Gauge Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-48 h-48 rounded-full border-4 border-slate-800 flex flex-col items-center justify-center bg-slate-950/60 shadow-inner">
              {/* Spinning ring during test */}
              {speedTest.isRunning && (
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-spin" />
              )}

              <div className="text-3xl font-black text-white font-mono">
                {speedTest.step === 'upload'
                  ? speedTest.uploadSpeed
                  : speedTest.downloadSpeed > 0
                  ? speedTest.downloadSpeed
                  : speedTest.ping > 0
                  ? `${speedTest.ping} ms`
                  : '—'}
              </div>
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider mt-1">
                {speedTest.step === 'idle'
                  ? 'Ready'
                  : speedTest.step === 'ping'
                  ? 'Testing Ping'
                  : speedTest.step === 'download'
                  ? 'Download Mbps'
                  : speedTest.step === 'upload'
                  ? 'Upload Mbps'
                  : 'Complete'}
              </span>
            </div>

            {/* Progress Bar */}
            {speedTest.isRunning && (
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
                <div
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${speedTest.progress}%` }}
                />
              </div>
            )}
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-500">Latency / Jitter</span>
              <div className="text-sm font-bold text-white font-mono mt-0.5">
                {speedTest.ping ? `${speedTest.ping}ms / ${speedTest.jitter}ms` : '—'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-500">Download</span>
              <div className="text-sm font-bold text-blue-400 font-mono mt-0.5">
                {speedTest.downloadSpeed ? `${speedTest.downloadSpeed} Mbps` : '—'}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-[11px] text-slate-500">Upload</span>
              <div className="text-sm font-bold text-purple-400 font-mono mt-0.5">
                {speedTest.uploadSpeed ? `${speedTest.uploadSpeed} Mbps` : '—'}
              </div>
            </div>
          </div>

          <button
            onClick={handleRunSpeedTest}
            disabled={speedTest.isRunning}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${speedTest.isRunning ? 'animate-spin' : ''}`} />
            <span>{speedTest.isRunning ? 'Testing Tunnel...' : 'Start Speed Test'}</span>
          </button>
        </div>

        {/* IP & DNS Leak Verification */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-white text-base">IP & DNS Leak Audit</h3>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-semibold ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isConnected ? 'PROTECTED' : 'EXPOSED'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">Public Visible IPv4:</span>
                <div className="font-mono text-sm font-bold text-white mt-0.5">
                  {isConnected ? currentServer.ip : '73.189.44.12 (ISP Address)'}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {isConnected ? 'Encrypted Virtual IP' : 'Real ISP Leaking'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">DNS Server Resolution:</span>
                <div className="font-mono text-sm font-bold text-white mt-0.5">
                  {isConnected ? '1.1.1.1 (Cloudflare / BritShield UK)' : 'ISP Recursive DNS'}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {isConnected ? 'Zero DNS Leaks' : 'ISP Logging'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400">WebRTC STUN Cloaking:</span>
                <div className="font-mono text-sm font-bold text-white mt-0.5">
                  {isConnected ? 'RFC 8489 Cloaked' : 'Local IP Visible'}
                </div>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  isConnected ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                }`}
              >
                {isConnected ? 'Passed' : 'At Risk'}
              </span>
            </div>
          </div>

          <button
            onClick={handleRunLeakTest}
            disabled={leakTestRunning}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${leakTestRunning ? 'animate-spin' : ''}`} />
            <span>{leakTestRunning ? 'Verifying Leaks...' : 'Run Real-Time Leak Check'}</span>
          </button>
        </div>
      </div>

      {/* WireGuard & OpenVPN Config Export */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span>Native Client Configuration Exporter</span>
          </h3>
          <p className="text-xs text-slate-400">
            Export ready-to-use profiles for WireGuard & OpenVPN clients on Windows, macOS, Linux, iOS & Android
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* WireGuard Card */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  WireGuard (.conf)
                </span>
                <span className="text-xs text-slate-400">{currentServer.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(wgConfig);
                    setCopiedWg(true);
                    setTimeout(() => setCopiedWg(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy WireGuard Config"
                >
                  {copiedWg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() =>
                    downloadFile(wgConfig, `britshield-${currentServer.id}.conf`, 'text/plain')
                  }
                  className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                  title="Download .conf file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto max-h-32 border border-slate-800/80">
              {wgConfig}
            </pre>
          </div>

          {/* OpenVPN Card */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  OpenVPN (.ovpn)
                </span>
                <span className="text-xs text-slate-400">{currentServer.city}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(ovpnConfig);
                    setCopiedOvpn(true);
                    setTimeout(() => setCopiedOvpn(false), 2000);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy OpenVPN Config"
                >
                  {copiedOvpn ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() =>
                    downloadFile(ovpnConfig, `britshield-${currentServer.id}.ovpn`, 'text/plain')
                  }
                  className="p-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
                  title="Download .ovpn file"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2.5 rounded-lg overflow-x-auto max-h-32 border border-slate-800/80">
              {ovpnConfig}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
