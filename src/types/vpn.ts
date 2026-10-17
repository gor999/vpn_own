export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'disconnecting' | 'error';

export type VPNProtocol = 'wireguard' | 'openvpn_udp' | 'openvpn_tcp' | 'stealth_proxy';

export interface VPNServer {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  ip: string;
  pingMs: number;
  loadPercent: number;
  category: 'streaming' | 'p2p' | 'standard' | 'double_vpn';
  isUkBbcOptimized?: boolean;
  wireguardPort?: number;
  openvpnPort?: number;
  bandwidthGbps: number;
}

export interface SecuritySettings {
  killSwitch: boolean;
  dnsLeakProtection: boolean;
  splitTunneling: boolean;
  autoConnectOnLaunch: boolean;
  adBlockerEnabled: boolean;
  protocol: VPNProtocol;
  splitTunnelDomains: string[];
}

export interface MovieItem {
  id: string;
  title: string;
  year: number;
  duration: string;
  rating: string;
  genre: string;
  director: string;
  leadActors: string[];
  posterUrl: string;
  videoUrl: string; // Direct streamable public domain video url from Archive.org or Wikimedia
  description: string;
  tags: string[];
  quality: '1080p Remaster' | '720p HD' | '480p Classic';
}

export interface BBCNewsArticle {
  id: string;
  title: string;
  category: 'World' | 'UK' | 'Business' | 'Technology' | 'Science' | 'Entertainment';
  time: string;
  summary: string;
  content: string[];
  imageUrl: string;
  readTime: string;
  bbcUrl: string;
  hasVideo?: boolean;
}

export interface SpeedTestState {
  isRunning: boolean;
  step: 'idle' | 'ping' | 'download' | 'upload' | 'complete';
  ping: number;
  jitter: number;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
}

export interface ConnectionMetrics {
  bytesDownloaded: number;
  bytesUploaded: number;
  connectedDurationSec: number;
  currentDownloadMbps: number;
  currentUploadMbps: number;
}
