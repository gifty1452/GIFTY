import React from 'react';
import { Player, KillfeedEntry } from '../types/game';
import { HEROES, WEAPONS } from '../game/constants';
import {
  Shield,
  Heart,
  Zap,
  Target,
  Sparkles,
  Activity,
  Crosshair,
  Flame,
  Radio,
  EyeOff,
  Orbit,
  Bomb,
  Sun
} from 'lucide-react';

interface HUDProps {
  player: Player;
  p2?: Player;
  p1Score: number;
  p2Score: number;
  roundTarget: number;
  killfeed: KillfeedEntry[];
  currentRound: number;
  onOpenSettings: () => void;
  onOpenLoadout: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  p2,
  p1Score,
  p2Score,
  roundTarget,
  killfeed,
  currentRound,
  onOpenSettings,
  onOpenLoadout
}) => {
  const hero = HEROES[player.heroId] || HEROES.spectre;
  const weapon = WEAPONS[player.weaponId] || WEAPONS.phantom;

  const hpPct = Math.max(0, Math.min(100, (player.health / player.maxHealth) * 100));
  const shieldPct = Math.max(0, Math.min(100, (player.shield / player.maxShield) * 100));
  const ammoPct = Math.max(0, Math.min(100, (player.ammo / weapon.magazineSize) * 100));

  const isTacticalReady = player.tacticalCooldown <= 0;
  const isUltReady = player.ultimateCharge >= 100;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-5 z-20">
      {/* Top Header: Match Score, Round, Tickrate */}
      <div className="flex items-start justify-between">
        {/* Left: Server Tickrate & Match telemetry */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/80 backdrop-blur-md rounded border border-slate-700/60 shadow-lg text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold">128 TICKRATE</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">12ms PING</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">0% LOSS</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="pointer-events-auto px-2.5 py-1 text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            >
              ⚙ Pengaturan
            </button>
            <button
              onClick={onOpenLoadout}
              className="pointer-events-auto px-2.5 py-1 text-xs bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-700/60 transition"
            >
              🔫 Ganti Senjata [1-5]
            </button>
          </div>
        </div>

        {/* Center: Competitive Round Scoreboard */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-6 px-6 py-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
            {/* Team 1 Score */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Tim Alpha</span>
              <span className="text-3xl font-black font-mono text-cyan-400">{p1Score}</span>
            </div>

            <div className="flex flex-col items-center px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">ROUND {currentRound}</span>
              <span className="text-xs font-mono text-slate-300">Target {roundTarget} Menang</span>
            </div>

            {/* Team 2 Score */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black font-mono text-rose-500">{p2Score}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Tim Omega</span>
            </div>
          </div>
        </div>

        {/* Right: Real-time Killfeed */}
        <div className="flex flex-col items-end gap-1.5 w-64">
          {killfeed.map(k => (
            <div
              key={k.id}
              className="flex items-center gap-2 px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded border border-slate-700/70 text-xs font-mono shadow-md animate-in fade-in slide-in-from-right duration-200"
            >
              <span className={k.killerTeam === 1 ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                {k.killerName}
              </span>
              <span className="text-slate-400 text-[10px]">[{k.weaponName}]</span>
              {k.isHeadshot && (
                <span className="text-amber-400 font-bold flex items-center gap-0.5 text-[11px]" title="Headshot!">
                  🎯 CRIT
                </span>
              )}
              <span className="text-slate-500">➜</span>
              <span className={k.victimTeam === 1 ? 'text-cyan-400' : 'text-rose-400'}>
                {k.victimName}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Slide / Movement notification indicator */}
      <div className="flex flex-col items-center justify-center">
        {player.isSliding && (
          <div className="px-4 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs uppercase tracking-widest border border-cyan-400/40 rounded-full animate-pulse shadow-cyan-500/20 shadow-lg">
            ⚡ SLIDING...
          </div>
        )}
        {player.isDashing && (
          <div className="px-4 py-1 bg-purple-500/20 text-purple-300 font-mono text-xs uppercase tracking-widest border border-purple-400/40 rounded-full animate-pulse shadow-purple-500/20 shadow-lg">
            💨 TACTICAL DASH!
          </div>
        )}
        {player.isReloading && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="text-xs font-mono text-amber-300 animate-pulse font-semibold">RELOADING...</span>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-amber-500/50">
              <div
                className="h-full bg-amber-400 transition-all duration-75"
                style={{ width: `${Math.round(player.reloadProgress * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom HUD: Health/Shield on left, Abilities in middle, Weapon & Ammo on right */}
      <div className="flex items-end justify-between">
        {/* Left: Player Status Gauges (HP & Shield) */}
        <div className="flex flex-col gap-2 w-72 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-lg">{hero.avatar}</span>
              <div>
                <span className="font-bold text-slate-100">{hero.name}</span>
                <span className="text-[10px] text-cyan-400 ml-1.5 font-mono">{hero.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
              <span>K: {player.kills}</span>
              <span>D: {player.deaths}</span>
              <span>DMG: {player.damageDealt}</span>
            </div>
          </div>

          {/* Shield Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1 text-sky-400 font-semibold">
                <Shield className="w-3.5 h-3.5" /> SHIELD
              </span>
              <span className="text-sky-300">{player.shield} / {player.maxShield}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-sky-900/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 rounded-full transition-all duration-150"
                style={{ width: `${shieldPct}%` }}
              />
            </div>
          </div>

          {/* Health Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <Heart className="w-3.5 h-3.5" /> HEALTH
              </span>
              <span className="text-emerald-300">{player.health} / {player.maxHealth}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden border border-emerald-950/60 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  hpPct > 35 ? 'bg-gradient-to-r from-emerald-600 to-green-400' : 'bg-rose-500 animate-pulse'
                }`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Hero Abilities (Tactical & Ultimate) */}
        <div className="flex items-center gap-4 p-2 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
          {/* Tactical Ability [Q] */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-14 h-14 rounded-lg flex flex-col items-center justify-center border transition-all ${
                isTacticalReady
                  ? 'bg-slate-800 border-cyan-400/80 shadow-lg shadow-cyan-500/20 text-cyan-300'
                  : 'bg-slate-950/80 border-slate-700 text-slate-500'
              }`}
            >
              <Zap className="w-5 h-5 mb-0.5" />
              <span className="absolute bottom-1 right-1.5 text-[9px] font-mono font-bold px-1 bg-slate-900/90 rounded text-cyan-400">
                Q
              </span>
              {!isTacticalReady && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center rounded-lg font-mono font-bold text-amber-400 text-xs">
                  {player.tacticalCooldown.toFixed(1)}s
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 max-w-[70px] truncate text-center">
              {hero.tactical.name}
            </span>
          </div>

          {/* Ultimate Ability [E] */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-16 h-16 rounded-xl flex flex-col items-center justify-center border transition-all ${
                isUltReady
                  ? 'bg-gradient-to-br from-amber-600/30 to-purple-600/30 border-amber-400 shadow-xl shadow-amber-500/30 text-amber-300 animate-pulse'
                  : 'bg-slate-950/80 border-slate-700 text-slate-500'
              }`}
            >
              <Sparkles className="w-6 h-6 mb-0.5" />
              <span className="absolute bottom-1 right-1.5 text-[10px] font-mono font-bold px-1 bg-slate-900/90 rounded text-amber-400">
                E
              </span>
              {!isUltReady && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center rounded-xl font-mono">
                  <span className="text-[11px] font-bold text-slate-300">{Math.round(player.ultimateCharge)}%</span>
                  <div className="w-10 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${player.ultimateCharge}%` }} />
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] font-mono text-amber-300 mt-1 font-semibold max-w-[80px] truncate text-center">
              {hero.ultimate.name}
            </span>
          </div>
        </div>

        {/* Right: Weapon & Ammo Counter */}
        <div className="flex items-center gap-4 p-3 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{weapon.category}</span>
            <span className="text-base font-bold text-slate-100">{weapon.name}</span>
            <span className="text-[10px] font-mono text-slate-400">Tekan [R] untuk Reload</span>
          </div>

          <div className="h-10 w-px bg-slate-700" />

          {/* Ammo Numbers */}
          <div className="flex items-baseline gap-1 font-mono">
            <span
              className={`text-4xl font-black ${
                player.ammo <= 5 ? 'text-rose-500 animate-pulse' : 'text-slate-100'
              }`}
            >
              {player.ammo}
            </span>
            <span className="text-lg text-slate-500">/{weapon.magazineSize}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
