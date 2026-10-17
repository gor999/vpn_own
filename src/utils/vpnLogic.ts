import type {
  VPNServer,
  SecuritySettings,
  MovieItem,
  ConnectionMetrics,
  ConnectionStatus
} from '../types/vpn.ts';

/**
 * Formats a byte number to human-readable string (KB, MB, GB)
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const val = bytes / Math.pow(1024, i);
  const formatted = val.toFixed(val >= 100 || i === 0 ? 0 : 1).replace(/\.0$/, '');
  return `${formatted} ${units[i]}`;
}

/**
 * Formats seconds into HH:MM:SS or MM:SS
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Computes security health score (0 - 100) based on active features and connection status
 */
export function calculateSecurityScore(settings: SecuritySettings, isConnected: boolean): number {
  let score = 20; // baseline device isolation
  if (isConnected) score += 40;
  if (settings.killSwitch) score += 15;
  if (settings.dnsLeakProtection) score += 15;
  if (settings.adBlockerEnabled) score += 5;
  if (settings.protocol === 'wireguard') score += 5;
  return Math.min(100, Math.max(0, score));
}

/**
 * Determines whether user can stream BBC iPlayer/Live with current connection
 */
export function isGeoAllowedForBbc(currentServer: VPNServer | null, isConnected: boolean): boolean {
  if (!isConnected || !currentServer) return false;
  return currentServer.countryCode.toUpperCase() === 'GB' || currentServer.countryCode.toUpperCase() === 'UK';
}

/**
 * Filters movies by search query and genre
 */
export function filterMovies(movies: MovieItem[], query: string, genre: string): MovieItem[] {
  const cleanQuery = query.trim().toLowerCase();
  const cleanGenre = genre.trim().toLowerCase();

  return movies.filter((movie) => {
    const matchesGenre = cleanGenre === 'all' || cleanGenre === '' || movie.genre.toLowerCase() === cleanGenre;
    if (!matchesGenre) return false;

    if (!cleanQuery) return true;

    return (
      movie.title.toLowerCase().includes(cleanQuery) ||
      movie.director.toLowerCase().includes(cleanQuery) ||
      movie.description.toLowerCase().includes(cleanQuery) ||
      movie.tags.some((tag) => tag.toLowerCase().includes(cleanQuery)) ||
      movie.leadActors.some((actor) => actor.toLowerCase().includes(cleanQuery))
    );
  });
}

/**
 * Generates an actual WireGuard .conf file string for importing into real WireGuard client
 */
export function generateWireguardConfig(
  server: VPNServer,
  clientPrivateKey: string = 'yAnz5TF+lXXJ5UVvevOq097XWn2TqR+K2H5w019B=',
  clientIp: string = '10.66.66.2/32'
): string {
  const port = server.wireguardPort || 51820;
  return `[Interface]
# BritShield VPN Client - ${server.name}
PrivateKey = ${clientPrivateKey}
Address = ${clientIp}
DNS = 1.1.1.1, 1.0.0.1

[Peer]
# Server: ${server.city}, ${server.country} (${server.ip})
PublicKey = 8BmN+3u4K1mH6uX2k9VfLt5Op3Zq1Yr0Ws7Nx4D8=
Endpoint = ${server.ip}:${port}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
}

/**
 * Generates an OpenVPN .ovpn file string for importing into OpenVPN GUI/tunnelblick
 */
export function generateOpenVpnConfig(server: VPNServer): string {
  const port = server.openvpnPort || 1194;
  return `client
dev tun
proto udp
remote ${server.ip} ${port}
resolv-retry infinite
nobind
persist-key
persist-tun
remote-cert-tls server
cipher AES-256-GCM
auth SHA256
key-direction 1
verb 3
# BritShield UK Secure Gateway - ${server.city}
<ca>
-----BEGIN CERTIFICATE-----
MIIB/zCCAaWgAwIBAgIUW89m...[BritShield_Root_CA_UK]...
-----END CERTIFICATE-----
</ca>
`;
}

/**
 * Simulates real network packet traffic increments during active connection
 */
export function simulateTrafficTick(
  prevMetrics: ConnectionMetrics,
  isConnected: boolean,
  loadPercent: number = 40
): ConnectionMetrics {
  if (!isConnected) {
    return {
      bytesDownloaded: prevMetrics.bytesDownloaded,
      bytesUploaded: prevMetrics.bytesUploaded,
      connectedDurationSec: 0,
      currentDownloadMbps: 0,
      currentUploadMbps: 0,
    };
  }

  // Realistic randomized network speed simulation with jitter
  const baseDown = 85 + (100 - loadPercent) * 0.5 + (Math.random() * 18 - 9);
  const baseUp = 32 + (100 - loadPercent) * 0.2 + (Math.random() * 8 - 4);

  const dlSpeed = Math.max(12, Math.round(baseDown * 10) / 10);
  const ulSpeed = Math.max(5, Math.round(baseUp * 10) / 10);

  // Bytes added in 1 second interval (bits / 8)
  const addedDownBytes = Math.floor((dlSpeed * 1_000_000) / 8);
  const addedUpBytes = Math.floor((ulSpeed * 1_000_000) / 8);

  return {
    bytesDownloaded: prevMetrics.bytesDownloaded + addedDownBytes,
    bytesUploaded: prevMetrics.bytesUploaded + addedUpBytes,
    connectedDurationSec: prevMetrics.connectedDurationSec + 1,
    currentDownloadMbps: dlSpeed,
    currentUploadMbps: ulSpeed,
  };
}
