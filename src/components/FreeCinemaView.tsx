import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Search,
  Sparkles,
  Info,
  Clock,
  Star,
  ShieldCheck,
  Zap,
  Download,
  Share2,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import type { MovieItem, VPNServer } from '../types/vpn.ts';
import { FREE_FILMS } from '../data/mockData.ts';
import { filterMovies } from '../utils/vpnLogic.ts';

interface FreeCinemaViewProps {
  isConnected: boolean;
  currentServer: VPNServer;
}

export const FreeCinemaView: React.FC<FreeCinemaViewProps> = ({
  isConnected,
  currentServer,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeMovie, setActiveMovie] = useState<MovieItem | null>(null);

  // Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const genres = ['All', 'Horror', 'Mystery', 'Sci-Fi', 'Comedy', 'Drama', 'Action'];
  const filteredMovies = filterMovies(FREE_FILMS, searchQuery, selectedGenre);

  // Featured hero movie
  const featuredMovie = FREE_FILMS[0]; // Night of the Living Dead or Sherlock Holmes

  const handlePlayMovie = (movie: MovieItem) => {
    setActiveMovie(movie);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatVideoTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Hero Featured Movie Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 transform scale-105 filter blur-[1px]"
          style={{ backgroundImage: `url(${featuredMovie.posterUrl})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />

        <div className="relative z-10 p-6 sm:p-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FREE FEATURED CINEMA</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {featuredMovie.genre}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {featuredMovie.quality}
            </span>
            <span className="text-xs text-slate-400 font-mono">{featuredMovie.duration}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {featuredMovie.title} ({featuredMovie.year})
          </h2>

          <p className="text-sm text-slate-300 line-clamp-3 leading-relaxed">
            {featuredMovie.description}
          </p>

          <div className="text-xs text-slate-400 flex items-center gap-3">
            <span>Directed by <span className="text-white font-medium">{featuredMovie.director}</span></span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-amber-400 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              {featuredMovie.rating}
            </span>
            <span>&bull;</span>
            <span className="text-emerald-400">100% Free Legal Stream</span>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handlePlayMovie(featuredMovie)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all transform hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Full Movie Free</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {isConnected
                  ? `Tunnel Protected via ${currentServer.city}`
                  : 'VPN Off: Safe Public Domain Stream'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            <span>Public Domain Free Films Vault</span>
          </h3>
          <p className="text-xs text-slate-400">
            Unrestricted classic cinema: horror, mystery, comedy, sci-fi, and British detective reels
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search films, actors, directors..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Genre Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {genres.map((genre) => (
          <button
            key={genre}
            onClick={() => setSelectedGenre(genre)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedGenre === genre
                ? 'bg-amber-600 text-slate-950 shadow-md shadow-amber-600/30 font-bold'
                : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="group bg-slate-900/70 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between"
          >
            <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />

              {/* Quality & Year badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 shadow-md">
                  {movie.quality}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-slate-300 border border-slate-700">
                  {movie.genre}
                </span>
              </div>

              <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-950/80 px-2 py-0.5 rounded-md text-[11px] font-semibold text-amber-400 border border-slate-800">
                <Star className="w-3 h-3 fill-current" />
                <span>{movie.rating}</span>
              </div>

              {/* Hover quick play button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/60 backdrop-blur-[2px]">
                <button
                  onClick={() => handlePlayMovie(movie)}
                  className="w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/40 transform hover:scale-110 transition-transform cursor-pointer"
                  aria-label={`Play ${movie.title}`}
                >
                  <Play className="w-6 h-6 fill-current translate-x-0.5" />
                </button>
              </div>

              {/* Title & Duration at bottom of poster */}
              <div className="absolute bottom-3 left-3 right-3">
                <span className="text-[11px] text-slate-400 font-mono">{movie.year} &bull; {movie.duration}</span>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {movie.title}
                </h4>
              </div>
            </div>

            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {movie.description}
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  <span className="text-slate-500">Stars:</span> {movie.leadActors.join(', ')}
                </div>

                <button
                  onClick={() => handlePlayMovie(movie)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Stream Film Now</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {activeMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
          <div
            ref={playerContainerRef}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="px-5 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">
                  {activeMovie.quality}
                </span>
                <h3 className="font-bold text-white text-sm sm:text-base line-clamp-1">
                  {activeMovie.title} ({activeMovie.year})
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center gap-1"
                >
                  {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                  <span>{copiedLink ? 'Copied' : 'Share'}</span>
                </button>

                <button
                  onClick={() => {
                    setActiveMovie(null);
                    setIsPlaying(false);
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  aria-label="Close movie player"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Video Player Box */}
            <div className="relative aspect-video w-full bg-black flex items-center justify-center group/video">
              <video
                ref={videoRef}
                src={activeMovie.videoUrl}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlayPause}
              />

              {/* VPN Shield Watermark */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-200 flex items-center gap-2 pointer-events-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>BritShield High-Speed Buffer &bull; {currentServer.city}</span>
              </div>

              {/* Big Center Play Icon when paused */}
              {!isPlaying && (
                <button
                  onClick={togglePlayPause}
                  className="absolute w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                  aria-label="Play video"
                >
                  <Play className="w-7 h-7 fill-current translate-x-0.5" />
                </button>
              )}

              {/* Bottom Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 flex flex-col gap-2">
                {/* Scrubbing slider */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                  aria-label="Video scrubber"
                />

                <div className="flex items-center justify-between text-xs text-slate-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="p-1 hover:text-amber-400 cursor-pointer"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>

                    <button
                      onClick={toggleMute}
                      className="p-1 hover:text-amber-400 cursor-pointer"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="font-mono text-[11px] text-slate-300">
                      {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Playback speed buttons */}
                    <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700 text-[10px]">
                      {[1, 1.25, 1.5].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`px-1.5 py-0.5 rounded ${
                            playbackRate === speed ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={toggleFullscreen}
                      className="p-1 hover:text-amber-400 cursor-pointer"
                      aria-label="Toggle Fullscreen"
                    >
                      {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Movie Info & Details */}
            <div className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xl font-bold text-white">{activeMovie.title} ({activeMovie.year})</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Directed by <span className="text-slate-200 font-medium">{activeMovie.director}</span> &bull; Starring {activeMovie.leadActors.join(', ')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                    Free Public Domain
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                {activeMovie.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                {activeMovie.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Streaming Tunnel Health Card */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-300">
                    Accelerated VPN Route: <span className="text-white font-medium">{currentServer.name}</span>
                  </span>
                </div>
                <span className="text-emerald-400 font-semibold font-mono">10.0 Gbps Link</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
