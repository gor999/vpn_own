import React from 'react';
import {
  X,
  HelpCircle,
  Play,
  Tv,
  Film,
  ShieldCheck,
  Download,
  Smartphone,
  Laptop,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface QuickGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBbc: () => void;
  onNavigateToCinema: () => void;
  onNavigateToDiagnostics: () => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({
  isOpen,
  onClose,
  onNavigateToBbc,
  onNavigateToCinema,
  onNavigateToDiagnostics,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-white">
                How to Use BritShield VPN & Media Hub
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Quick 3-step guide to streaming live BBC news and free classic films
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Step Interactive Cards */}
        <div className="space-y-4">
          {/* Step 1: VPN Connection */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                <span>Verify UK VPN Connection</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-normal">
                  Pre-Connected
                </span>
              </h4>
            </div>
            <p className="text-xs text-slate-300 pl-8 leading-relaxed">
              When you load the app, you are automatically connected to our <strong className="text-white">UK - London #1 (BBC Ultra)</strong> node. Your public IP appears as a London residential address (<code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">185.220.101.42</code>). If you ever disconnect, simply tap the central round power switch on the dashboard.
            </p>
          </div>

          {/* Step 2: Watch BBC News */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Tv className="w-4 h-4 text-rose-400" />
                  <span>Watch BBC News Live & Audio</span>
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToBbc();
                }}
                className="text-xs px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Go to BBC Tab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 pl-8 leading-relaxed">
              Click the <strong className="text-rose-400">BBC Live</strong> tab in the top navigation bar. Here you can:
            </p>
            <ul className="text-xs text-slate-400 pl-12 list-disc space-y-1">
              <li>Watch live video news bulletins transmitted with real-time lower-third tickers.</li>
              <li>Listen to the 24/7 BBC World Service digital radio stream with animated equalizer.</li>
              <li>Click <strong className="text-slate-200">Open BBC iPlayer UK</strong> to launch the official BBC UK portal directly with your unblocked virtual IP.</li>
              <li>Read breaking headlines and listen to audio narration in London accents.</li>
            </ul>
          </div>

          {/* Step 3: Stream Free Movies */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Film className="w-4 h-4 text-amber-400" />
                  <span>Stream Free Classic Movies & Cinema</span>
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToCinema();
                }}
                className="text-xs px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Go to Cinema</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 pl-8 leading-relaxed">
              Click the <strong className="text-amber-400">Free Cinema</strong> tab. Browse remastered public-domain cinematic classics (Horror, Mystery, Sci-Fi, Comedy). Click <strong className="text-slate-200">Watch Full Movie Free</strong> or any poster to launch the high-definition video player with speed controls, scrubber, and 10Gbps stream acceleration.
            </p>
          </div>

          {/* Step 4: Use on your PC or Phone */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  <span>Use as a System VPN on PC & Mobile</span>
                </h4>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToDiagnostics();
                }}
                className="text-xs px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Export Profiles</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 pl-8 leading-relaxed">
              Want your whole computer or phone to use the UK VPN? Head to the <strong className="text-indigo-400">Diagnostics</strong> tab. Download the <code className="text-blue-400 font-mono">.conf</code> (WireGuard) or <code className="text-amber-400 font-mono">.ovpn</code> (OpenVPN) file, open the official free WireGuard or OpenVPN client on Windows, Mac, Android, or iOS, and import it.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            100% Free &bull; Zero Subscription &bull; No Sign-Up Needed
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/30 cursor-pointer"
          >
            Got It, Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
};
