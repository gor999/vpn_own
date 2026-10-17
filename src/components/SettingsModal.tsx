import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  ShieldCheck,
  Lock,
  Globe,
  Radio,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import type { SecuritySettings, VPNProtocol } from '../types/vpn.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SecuritySettings;
  onUpdateSettings: (newSettings: SecuritySettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [newDomain, setNewDomain] = useState('');

  if (!isOpen) return null;

  const handleToggle = (key: keyof Omit<SecuritySettings, 'protocol' | 'splitTunnelDomains'>) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleProtocolChange = (protocol: VPNProtocol) => {
    onUpdateSettings({
      ...settings,
      protocol,
    });
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '');
    if (!settings.splitTunnelDomains.includes(clean)) {
      onUpdateSettings({
        ...settings,
        splitTunnelDomains: [...settings.splitTunnelDomains, clean],
      });
      setNewDomain('');
    }
  };

  const handleRemoveDomain = (domain: string) => {
    onUpdateSettings({
      ...settings,
      splitTunnelDomains: settings.splitTunnelDomains.filter((d) => d !== domain),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">VPN Security & Protocol Settings</h3>
              <p className="text-xs text-slate-400">Customize encryption, kill switch, and tunneling</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protocol Switcher */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-blue-400" />
            <span>VPN Tunnel Protocol</span>
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { id: 'wireguard', name: 'WireGuard (Fastest)', desc: 'Modern ChaCha20, instant reconnect' },
              { id: 'openvpn_udp', name: 'OpenVPN UDP', desc: 'AES-256-GCM, best for live media' },
              { id: 'openvpn_tcp', name: 'OpenVPN TCP', desc: 'Reliable packet loss tolerance' },
              { id: 'stealth_proxy', name: 'Stealth Proxy', desc: 'Obfuscated, defeats deep inspection' },
            ].map((proto) => (
              <button
                key={proto.id}
                type="button"
                onClick={() => handleProtocolChange(proto.id as VPNProtocol)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  settings.protocol === proto.id
                    ? 'bg-blue-600/20 border-blue-500 text-white font-semibold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{proto.name}</span>
                  {settings.protocol === proto.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{proto.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Security & Privacy Shields
          </label>

          <div className="space-y-2.5">
            {/* Kill switch */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Automatic Kill Switch</span>
                <span className="text-[11px] text-slate-400">
                  Instantly block unencrypted internet packets if tunnel drops unexpectedly.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('killSwitch')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.killSwitch ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 left-1 ${
                    settings.killSwitch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* DNS Leak */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Encrypted DNS Leak Guard</span>
                <span className="text-[11px] text-slate-400">
                  Force all DNS requests through private zero-log Cloudflare/BritShield resolver.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('dnsLeakProtection')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.dnsLeakProtection ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 left-1 ${
                    settings.dnsLeakProtection ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Ad Blocker */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Shield Ad & Malware Filter</span>
                <span className="text-[11px] text-slate-400">
                  Blocks popups, tracking beacons, and video pre-roll ad networks.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('adBlockerEnabled')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.adBlockerEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 left-1 ${
                    settings.adBlockerEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Auto connect */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <span className="text-xs font-semibold text-white block">Auto-Connect on Launch</span>
                <span className="text-[11px] text-slate-400">
                  Automatically reconnect to the fastest UK server whenever opening the app.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoConnectOnLaunch')}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.autoConnectOnLaunch ? 'bg-emerald-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform transform absolute top-1 left-1 ${
                    settings.autoConnectOnLaunch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Split Tunneling */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Split Tunneling (Whitelisted Domains)
            </span>
            <button
              type="button"
              onClick={() => handleToggle('splitTunneling')}
              className={`text-xs px-2 py-0.5 rounded ${
                settings.splitTunneling ? 'bg-emerald-500/20 text-emerald-400 font-semibold' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {settings.splitTunneling ? 'Enabled' : 'Disabled'}
            </button>
          </div>

          {settings.splitTunneling && (
            <div className="space-y-2">
              <form onSubmit={handleAddDomain} className="flex gap-2">
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="e.g. localbank.co.uk"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {settings.splitTunnelDomains.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 border border-slate-700"
                  >
                    <span>{domain}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDomain(domain)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
