import React, { useState, useRef, useEffect } from 'react';
import {
  Tv,
  Radio,
  Volume2,
  VolumeX,
  Maximize2,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Search,
  Clock,
  Sparkles,
  BookOpen,
  Share2,
  Check,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Flame,
  Globe2,
} from 'lucide-react';
import type { VPNServer, BBCNewsArticle } from '../types/vpn.ts';
import { BBC_NEWS_ARTICLES } from '../data/mockData.ts';

interface BBCNewsViewProps {
  isConnected: boolean;
  currentServer: VPNServer;
  onConnectToUk: () => void;
}

export const BBCNewsView: React.FC<BBCNewsViewProps> = ({
  isConnected,
  currentServer,
  onConnectToUk,
}) => {
  const isUkServer = isConnected && currentServer.countryCode === 'GB';
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeArticle, setActiveArticle] = useState<BBCNewsArticle | null>(null);
  const [activeBroadcastChannel, setActiveBroadcastChannel] = useState<'live_bulletin' | 'radio_world' | 'westminster'>('live_bulletin');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [isPlayingAudioNarration, setIsPlayingAudioNarration] = useState<boolean>(false);
  const [isAudioLivePlaying, setIsAudioLivePlaying] = useState<boolean>(false);

  // Audio equalizer canvas
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let bars = 24;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = isAudioLivePlaying
          ? Math.random() * (canvas.height - 8) + 8
          : 4;
        const x = i * barWidth;
        const y = canvas.height - height;

        ctx.fillStyle = isAudioLivePlaying ? '#f43f5e' : '#475569';
        ctx.fillRect(x + 1.5, y, barWidth - 3, height);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAudioLivePlaying]);

  const toggleAudioLive = () => {
    if (!audioRef.current) return;
    if (isAudioLivePlaying) {
      audioRef.current.pause();
      setIsAudioLivePlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsAudioLivePlaying(true);
    }
  };

  // Filter articles
  const categories = ['All', 'World', 'UK', 'Business', 'Technology', 'Science', 'Entertainment'];
  const filteredArticles = BBC_NEWS_ARTICLES.filter((art) => {
    const matchesCat = selectedCategory === 'All' || art.category === selectedCategory;
    const matchesQuery =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleShareArticle = (art: BBCNewsArticle) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(art.bbcUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToggleNarration = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudioNarration) {
        window.speechSynthesis.cancel();
        setIsPlayingAudioNarration(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudioNarration(false);
        utterance.onerror = () => setIsPlayingAudioNarration(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudioNarration(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* VPN Geo Status Alert Bar */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isUkServer
            ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/40 text-emerald-200'
            : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl ${
              isUkServer ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isUkServer ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-base text-white">
                {isUkServer
                  ? 'UK Virtual IP Active: BBC Broadcasting Fully Unlocked'
                  : 'BBC Geo-Notice: Connected Outside United Kingdom'}
              </span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  isUkServer
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {isUkServer ? `🇬🇧 London (${currentServer.ip})` : 'Region Shield Off'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isUkServer
                ? 'Encrypted tunnel is verified through London W1. Direct BBC iPlayer and live feeds recognize your IP as domestic United Kingdom.'
                : 'Connect to our London or Manchester node to simulate UK residential routing and bypass BBC region restrictions.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          {!isUkServer ? (
            <button
              onClick={onConnectToUk}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🇬🇧 Connect UK London Tunnel</span>
            </button>
          ) : (
            <a
              href="https://www.bbc.co.uk/iplayer/live/bbcnews"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
            >
              <Tv className="w-4 h-4" />
              <span>Open BBC iPlayer UK</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Main BBC Live Player Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Player Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-xs font-black tracking-widest">
                BBC
              </span>
              <h2 className="font-extrabold text-white text-sm sm:text-base tracking-wide">
                NEWS LIVE BROADCAST CHANNEL &bull; LONDON
              </h2>
            </div>
          </div>

          {/* Broadcast Channel Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveBroadcastChannel('live_bulletin')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeBroadcastChannel === 'live_bulletin'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Live Video Bulletin</span>
            </button>
            <button
              onClick={() => setActiveBroadcastChannel('radio_world')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                activeBroadcastChannel === 'radio_world'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>BBC World Radio</span>
            </button>
          </div>
        </div>

        {/* Video / Audio Transmission Frame */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {activeBroadcastChannel === 'live_bulletin' ? (
            <div className="relative w-full h-full bg-slate-950 flex flex-col justify-between">
              {/* Working HTML5 Video Stream */}
              <video
                controls
                autoPlay
                muted
                playsInline
                loop
                className="w-full h-full object-cover"
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
                poster="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80"
              />

              {/* BBC Lower Thirds Ticker Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent p-4 sm:p-5 pointer-events-none">
                <div className="flex items-center gap-3">
                  <span className="bg-rose-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-md tracking-wider">
                    BREAKING
                  </span>
                  <div className="text-white text-xs sm:text-sm font-semibold truncate">
                    UK and European Leaders Ratify North Sea Renewable Power Compact &bull; Bank of England Holds Benchmark Rate
                  </div>
                </div>
              </div>

              {/* Top Watermark */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-200 flex items-center gap-2 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>BritShield UK Fast Relay &bull; London W1A 1AA</span>
              </div>
            </div>
          ) : (
            /* Live World Service Radio Transmitter Studio */
            <div className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-rose-600/20 border-2 border-rose-500/40 text-rose-500 flex items-center justify-center mx-auto shadow-2xl">
                  <Radio className="w-12 h-12" />
                </div>
                {isAudioLivePlaying && (
                  <div className="absolute -inset-2 rounded-full border-2 border-rose-500/30 animate-ping pointer-events-none" />
                )}
              </div>

              <div>
                <span className="text-xs uppercase font-extrabold text-rose-500 tracking-wider">
                  BBC World Service Audio Transmitter
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  24/7 International News & Current Affairs
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Direct digital audio stream originating from BBC Broadcasting House, Portland Place, London.
                </p>
              </div>

              {/* Animated Sound Equalizer Canvas */}
              <div className="w-64 h-12 bg-slate-900/80 rounded-xl border border-slate-800 p-2">
                <canvas
                  ref={eqCanvasRef}
                  width={240}
                  height={36}
                  className="w-full h-full block"
                />
              </div>

              {/* Live Audio element */}
              <audio
                ref={audioRef}
                src="https://stream.live.vc.bbcmedia.co.uk/bbc_world_service"
                preload="none"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleAudioLive}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
                    isAudioLivePlaying
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  {isAudioLivePlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-current" />
                      <span>Pause Radio Stream</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      <span>Start Listening Live</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Player Footer & Quick Launch to iPlayer */}
        <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-rose-500" />
              <span>Broadcasting Hub: London Studio B</span>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-xs text-slate-400">1080p 50fps Ultra-Low Latency</span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.bbc.co.uk/news"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <span>BBC Online News</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href="https://www.bbc.co.uk/iplayer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
            >
              <Tv className="w-3.5 h-3.5" />
              <span>BBC iPlayer Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* BBC Breaking News Articles Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-500" />
              <span>Latest BBC News Headlines & Reports</span>
            </h3>
            <p className="text-xs text-slate-400">Curated daily dispatches from BBC London correspondents</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search BBC News..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => setActiveArticle(article)}
              className="group bg-slate-900/70 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-white backdrop-blur-md border border-slate-800 uppercase tracking-wider">
                    {article.category}
                  </span>
                </div>
                {article.hasVideo && (
                  <div className="absolute bottom-3 right-3 p-1.5 rounded-lg bg-rose-600 text-white text-xs shadow-md">
                    <Tv className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{article.time}</span>
                    <span>&bull;</span>
                    <span>{article.readTime}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white group-hover:text-rose-400 transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-rose-400 group-hover:text-rose-300">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Full Dispatch</span>
                  </span>
                  <span>&rarr;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                  BBC {activeArticle.category}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{activeArticle.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                  <span>{activeArticle.time}</span>
                  <span>&bull;</span>
                  <span>{activeArticle.readTime}</span>
                  <span>&bull;</span>
                  <span className="text-emerald-400">Verified BBC Dispatch</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveArticle(null);
                  if (isPlayingAudioNarration) {
                    window.speechSynthesis?.cancel();
                    setIsPlayingAudioNarration(false);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden h-64 w-full">
              <img
                src={activeArticle.imageUrl}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Audio narration button */}
            <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span className="text-slate-300">BBC Audio Reader (Text-to-Speech)</span>
              </div>
              <button
                onClick={() => handleToggleNarration(activeArticle.content.join('. '))}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                  isPlayingAudioNarration
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {isPlayingAudioNarration ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Listen (London Accent)</span>
                  </>
                )}
              </button>
            </div>

            {/* Article Content */}
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              {activeArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleShareArticle(activeArticle)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Share Article'}</span>
              </button>

              <a
                href={activeArticle.bbcUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
              >
                <span>Read Original on BBC.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
