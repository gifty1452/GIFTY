import React from 'react';
import { HEROES } from '../game/constants';
import { HeroId } from '../types/game';
import { Shield, Zap, Sparkles, Activity, Check } from 'lucide-react';

interface HeroSelectorProps {
  selectedHeroId: HeroId;
  onSelectHero: (id: HeroId) => void;
  onClose: () => void;
}

export const HeroSelector: React.FC<HeroSelectorProps> = ({
  selectedHeroId,
  onSelectHero,
  onClose
}) => {
  const heroesList = Object.values(HEROES);
  const activeHero = HEROES[selectedHeroId] || HEROES.spectre;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400">⚡</span> PILIH HERO OPERATIF
            </h2>
            <p className="text-xs text-slate-400">
              Setiap hero memiliki taktik pergerakan, ketahanan shield, dan kemampuan khusus berbeda.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
          >
            Tutup [ESC]
          </button>
        </div>

        {/* Hero Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {heroesList.map(h => {
            const isSelected = h.id === selectedHeroId;
            return (
              <div
                key={h.id}
                onClick={() => onSelectHero(h.id)}
                className={`cursor-pointer rounded-xl p-4 flex flex-col items-center gap-3 border transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 p-1 bg-cyan-500 text-slate-950 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <span className="text-4xl p-3 bg-slate-900 rounded-2xl border border-slate-800 shadow-inner">
                  {h.avatar}
                </span>
                <div className="text-center">
                  <h3 className="font-bold text-slate-100">{h.name}</h3>
                  <span className="text-[11px] font-mono text-cyan-400">{h.role}</span>
                </div>
                <div className="w-full text-slate-400 text-[10px] space-y-1 font-mono pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span>HP:</span> <span className="text-emerald-400">{h.health}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shield:</span> <span className="text-sky-400">{h.maxShield}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speed:</span> <span className="text-amber-400">{h.speed}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hero Ability Details */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activeHero.avatar}</span>
            <div>
              <h4 className="font-bold text-slate-100">{activeHero.name} - {activeHero.title}</h4>
              <p className="text-xs text-slate-400">{activeHero.passive.name}: {activeHero.passive.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
              <div className="p-2 bg-cyan-950 text-cyan-400 rounded-lg">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{activeHero.tactical.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-cyan-400 rounded">
                    Tombol [{activeHero.tactical.key}] • {activeHero.tactical.cooldown}s
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeHero.tactical.description}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex items-start gap-3">
              <div className="p-2 bg-amber-950 text-amber-400 rounded-lg">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">{activeHero.ultimate.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-amber-400 rounded">
                    Ultimate [{activeHero.ultimate.key}]
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeHero.ultimate.description}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            Konfirmasi Hero
          </button>
        </div>
      </div>
    </div>
  );
};
