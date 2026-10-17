import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  formatDuration,
  calculateSecurityScore,
  isGeoAllowedForBbc,
  filterMovies,
  generateWireguardConfig,
  generateOpenVpnConfig,
  simulateTrafficTick
} from './vpnLogic.ts';
import type { VPNServer, SecuritySettings, MovieItem, ConnectionMetrics } from '../types/vpn.ts';

const mockUkServer: VPNServer = {
  id: 'uk-london-1',
  name: 'London - BBC Streaming Ultra',
  city: 'London',
  country: 'United Kingdom',
  countryCode: 'GB',
  flag: '🇬🇧',
  ip: '185.220.101.42',
  pingMs: 18,
  loadPercent: 42,
  category: 'streaming',
  isUkBbcOptimized: true,
  bandwidthGbps: 10,
  wireguardPort: 51820,
  openvpnPort: 1194
};

const mockUsServer: VPNServer = {
  id: 'us-ny-1',
  name: 'New York - US East',
  city: 'New York',
  country: 'United States',
  countryCode: 'US',
  flag: '🇺🇸',
  ip: '45.33.32.156',
  pingMs: 82,
  loadPercent: 65,
  category: 'standard',
  bandwidthGbps: 10
};

test('formatBytes handles zero, MB, and GB', () => {
  assert.equal(formatBytes(0), '0 B');
  assert.equal(formatBytes(1024), '1 KB');
  assert.equal(formatBytes(1024 * 1024 * 5.5), '5.5 MB');
  assert.equal(formatBytes(1024 * 1024 * 1024 * 2.3), '2.3 GB');
});

test('formatDuration formats mm:ss and hh:mm:ss properly', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3665), '01:01:05');
});

test('calculateSecurityScore evaluates security features correctly', () => {
  const baseSettings: SecuritySettings = {
    killSwitch: false,
    dnsLeakProtection: false,
    splitTunneling: false,
    autoConnectOnLaunch: false,
    adBlockerEnabled: false,
    protocol: 'openvpn_udp',
    splitTunnelDomains: []
  };

  const disconnectedScore = calculateSecurityScore(baseSettings, false);
  assert.equal(disconnectedScore, 20);

  const fullSettings: SecuritySettings = {
    killSwitch: true,
    dnsLeakProtection: true,
    splitTunneling: false,
    autoConnectOnLaunch: true,
    adBlockerEnabled: true,
    protocol: 'wireguard',
    splitTunnelDomains: []
  };

  const connectedScore = calculateSecurityScore(fullSettings, true);
  // 20 baseline + 40 (connected) + 15 (killSwitch) + 15 (dnsLeakProtection) + 5 (adBlock) + 5 (wireguard) = 100
  assert.equal(connectedScore, 100);
});

test('isGeoAllowedForBbc allows UK servers only when connected', () => {
  assert.equal(isGeoAllowedForBbc(mockUkServer, true), true);
  assert.equal(isGeoAllowedForBbc(mockUkServer, false), false);
  assert.equal(isGeoAllowedForBbc(mockUsServer, true), false);
  assert.equal(isGeoAllowedForBbc(null, true), false);
});

test('filterMovies matches by query and genre', () => {
  const sampleMovies: MovieItem[] = [
    {
      id: '1',
      title: 'Night of the Living Dead',
      year: 1968,
      duration: '96 min',
      rating: '7.8',
      genre: 'Horror',
      director: 'George A. Romero',
      leadActors: ['Duane Jones', 'Judith O\'Dea'],
      posterUrl: '',
      videoUrl: '',
      description: 'A ragtag group of Pennsylvanians barricade themselves.',
      tags: ['Zombie', 'Cult Classic'],
      quality: '1080p Remaster'
    },
    {
      id: '2',
      title: 'Sherlock Holmes: Dressed to Kill',
      year: 1946,
      duration: '72 min',
      rating: '7.1',
      genre: 'Mystery',
      director: 'Roy William Neill',
      leadActors: ['Basil Rathbone', 'Nigel Bruce'],
      posterUrl: '',
      videoUrl: '',
      description: 'Holmes and Watson investigate three stolen music boxes in London.',
      tags: ['Detective', 'British Classic', 'London'],
      quality: '720p HD'
    }
  ];

  // Genre filter
  assert.equal(filterMovies(sampleMovies, '', 'Horror').length, 1);
  assert.equal(filterMovies(sampleMovies, '', 'Mystery').length, 1);
  assert.equal(filterMovies(sampleMovies, '', 'All').length, 2);

  // Search query
  assert.equal(filterMovies(sampleMovies, 'Holmes', 'All').length, 1);
  assert.equal(filterMovies(sampleMovies, 'London', 'All').length, 1);
  assert.equal(filterMovies(sampleMovies, 'Romero', 'All').length, 1);
  assert.equal(filterMovies(sampleMovies, 'Nonexistent', 'All').length, 0);
});

test('generateWireguardConfig outputs expected interface and peer blocks', () => {
  const conf = generateWireguardConfig(mockUkServer);
  assert.ok(conf.includes('[Interface]'));
  assert.ok(conf.includes('[Peer]'));
  assert.ok(conf.includes('185.220.101.42:51820'));
});

test('generateOpenVpnConfig outputs expected directives and cipher', () => {
  const ovpn = generateOpenVpnConfig(mockUkServer);
  assert.ok(ovpn.includes('dev tun'));
  assert.ok(ovpn.includes('remote 185.220.101.42 1194'));
  assert.ok(ovpn.includes('cipher AES-256-GCM'));
});

test('simulateTrafficTick updates duration and accumulates bytes', () => {
  const initial: ConnectionMetrics = {
    bytesDownloaded: 1000,
    bytesUploaded: 500,
    connectedDurationSec: 10,
    currentDownloadMbps: 0,
    currentUploadMbps: 0
  };

  const next = simulateTrafficTick(initial, true, 50);
  assert.equal(next.connectedDurationSec, 11);
  assert.ok(next.bytesDownloaded > initial.bytesDownloaded);
  assert.ok(next.bytesUploaded > initial.bytesUploaded);
  assert.ok(next.currentDownloadMbps > 0);
  assert.ok(next.currentUploadMbps > 0);

  const disconnected = simulateTrafficTick(initial, false, 50);
  assert.equal(disconnected.connectedDurationSec, 0);
  assert.equal(disconnected.currentDownloadMbps, 0);
});
