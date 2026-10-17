import React, { useState } from 'react';
import {
  Globe,
  Search,
  Filter,
  Zap,
  ShieldCheck,
  Radio,
  Check,
  ArrowRight,
  Tv,
  Star,
  Activity,
} from 'lucide-react';
import type { VPNServer } from '../types/vpn.ts';

interface ServerListViewProps {
  servers: VPNServer[];
  currentServer: VPNServer;
  isConnected: boolean;
  onSelectAndConnect: (server: VPNServer) => void;
}

export const ServerListView: React.FC<ServerListViewProps> = ({
  servers,
  currentServer,
  isConnected,
  onSelectAndConnect,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'streaming' | 'p2p' | 'double_vpn'>('all');
  const [favorites, setFavorites] = useState<string[]>(['uk-london-1']);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const filteredServers = servers.filter((srv) => {
    const matchesCategory = categoryFilter === 'all' || srv.category === categoryFilter;
    const matchesSearch =
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.city.toLowerCase().includes(search.toLowerCase()) ||
      srv.country.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <span>High-Speed Global Server Network</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dedicated 10Gbps bare-metal gateways with WireGuard & OpenVPN zero-log infrastructure
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search country, city, or IP..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Locations ({servers.length})
        </button>
        <button
          onClick={() => setCategoryFilter('streaming')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            categoryFilter === 'streaming'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5 text-rose-400" />
          <span>BBC & Streaming Optimized</span>
        </button>
        <button
          onClick={() => setCategoryFilter('p2p')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            categoryFilter === 'p2p'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>P2P Shield</span>
        </button>
        <button
          onClick={() => setCategoryFilter('double_vpn')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            categoryFilter === 'double_vpn'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
          <span>Multi-Hop Double VPN</span>
        </button>
      </div>

      {/* Servers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredServers.map((srv) => {
          const isSelected = currentServer.id === srv.id;
          const isCurrentConnected = isSelected && isConnected;
          const isFav = favorites.includes(srv.id);

          return (
            <div
              key={srv.id}
              onClick={() => onSelectAndConnect(srv)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                isCurrentConnected
                  ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40'
                  : isSelected
                  ? 'bg-indigo-950/30 border-indigo-500/50'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <span className="text-3xl">{srv.flag}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{srv.name}</h3>
                    {srv.isUkBbcOptimized && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                        BBC iPlayer
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span>{srv.city}, {srv.country}</span>
                    <span>&bull;</span>
                    <span className="font-mono text-slate-300">{srv.ip}</span>
                  </div>
                </div>
              </div>

              {/* Server Stats & Connect Action */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1 text-xs font-semibold text-slate-300">
                    <Activity className="w-3 h-3 text-blue-400" />
                    <span>{srv.pingMs} ms</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Load: <span className="font-medium text-slate-300">{srv.loadPercent}%</span>
                  </div>
                </div>

                <button
                  onClick={(e) => toggleFavorite(srv.id, e)}
                  className={`p-2 rounded-lg hover:bg-slate-800 transition-colors ${
                    isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                  }`}
                  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                </button>

                <button
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 ${
                    isCurrentConnected
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {isCurrentConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <span>Connect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
