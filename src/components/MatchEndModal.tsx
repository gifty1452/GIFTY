import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, Target, Flame, RotateCcw, Home, Award } from 'lucide-react';
import { RANKS } from '../game/constants';

interface MatchEndModalProps {
  stats: {
    winnerTeam: number;
    playerKills: number;
    playerDeaths: number;
    damageDealt: number;
    headshots: number;
    accuracy: number;
  };
  currentRP: number;
  onPlayAgain: () => void;
  onGoToLobby: () => void;
}

export const MatchEndModal: React.FC<MatchEndModalProps> = ({
  stats,
  currentRP,
  onPlayAgain,
  onGoToLobby
}) => {
  const isVictory = stats.winnerTeam === 1;

  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [isVictory]);

  // Determine Rank Tier based on RP
  const currentRank = [...RANKS].reverse().find(r => currentRP >= r.minRP) || RANKS[0];
  const rpGained = isVictory ? 28 + stats.playerKills * 4 : -14;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl p-6 shadow-2xl flex flex-col items-center gap-6">
        {/* Banner */}
        <div className="flex flex-col items-center text-center">
          {isVictory ? (
            <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-400/50 shadow-lg shadow-emerald-500/20 mb-2">
              <Trophy className="w-10 h-10" />
            </div>
          ) : (
            <div className="p-4 bg-rose-500/20 text-rose-400 rounded-full border border-rose-400/50 shadow-lg shadow-rose-500/20 mb-2">
              <Skull className="w-10 h-10" />
            </div>
          )}

          <h2
            className={`text-3xl font-black uppercase tracking-wider ${
              isVictory ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            {isVictory ? 'VICTORY - KEMENANGAN ARENA' : 'DEFEAT - KEKALAHAN'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isVictory
              ? 'Kerjasama dan eksekusi mekanik tembakan yang luar biasa!'
              : 'Pertandingan yang sengit! Asah kontrol recoil dan manuver posisi.'}
          </p>
        </div>

        {/* Rank RP Card */}
        <div className="w-full p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-xl border flex items-center justify-center"
              style={{ backgroundColor: `${currentRank.badgeColor}22`, borderColor: currentRank.badgeColor }}
            >
              <Award className="w-6 h-6" style={{ color: currentRank.badgeColor }} />
            </div>
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase">Peringkat Kompetitif</span>
              <h3 className="font-bold text-slate-100 text-lg">{currentRank.tier}</h3>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-lg font-mono font-bold ${
                rpGained >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {rpGained >= 0 ? `+${rpGained}` : rpGained} RP
            </span>
            <div className="text-xs font-mono text-slate-400">Total: {currentRP + rpGained} RP</div>
          </div>
        </div>

        {/* Combat Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Eliminasi</span>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">{stats.playerKills}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Damage</span>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">{stats.damageDealt}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Headshot Crit</span>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{stats.headshots}</div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Akurasi Peluru</span>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{stats.accuracy}%</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onGoToLobby}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 border border-slate-700"
          >
            <Home className="w-4 h-4" /> Menu Utama
          </button>

          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <RotateCcw className="w-4 h-4" /> Main Lagi
          </button>
        </div>
      </div>
    </div>
  );
};
