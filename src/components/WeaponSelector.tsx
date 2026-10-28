import React from 'react';
import { WEAPONS } from '../game/constants';
import { WeaponId } from '../types/game';
import { Crosshair, Zap, Target, Flame, Radio, Check } from 'lucide-react';

interface WeaponSelectorProps {
  selectedWeaponId: WeaponId;
  onSelectWeapon: (id: WeaponId) => void;
  onClose: () => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  selectedWeaponId,
  onSelectWeapon,
  onClose
}) => {
  const weaponList = Object.values(WEAPONS);
  const activeWeapon = WEAPONS[selectedWeaponId] || WEAPONS.phantom;

  const getWeaponIcon = (id: string) => {
    switch (id) {
      case 'phantom': return <Crosshair className="w-5 h-5 text-sky-400" />;
      case 'viper': return <Zap className="w-5 h-5 text-purple-400" />;
      case 'valkyrie': return <Target className="w-5 h-5 text-rose-400" />;
      case 'bulldog': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'plasma': return <Radio className="w-5 h-5 text-emerald-400" />;
      default: return <Crosshair className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl p-6 shadow-2xl flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <span className="text-cyan-400">🎯</span> GUDANG SENJATA & GUNSMITH
            </h2>
            <p className="text-xs text-slate-400">
              Pilih senjata tempur sesuai gaya permainan: burst mid-range, spray lincah, atau one-shot sniper.
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
          >
            Tutup [ESC]
          </button>
        </div>

        {/* Weapons List */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {weaponList.map((w, index) => {
            const isSelected = w.id === selectedWeaponId;
            return (
              <div
                key={w.id}
                onClick={() => onSelectWeapon(w.id)}
                className={`cursor-pointer rounded-xl p-3.5 flex flex-col justify-between border transition-all duration-150 relative ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 p-1 bg-cyan-500 text-slate-950 rounded-full">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    {getWeaponIcon(w.id)}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 rounded text-slate-400">
                      [{index + 1}]
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-sm">{w.name}</h3>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase">{w.category}</span>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Dmg:</span>
                    <span className="text-slate-200 font-semibold">{w.damage * w.pellets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Headshot:</span>
                    <span className="text-amber-400 font-semibold">{Math.round(w.damage * w.headshotMultiplier * w.pellets)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>RPM:</span>
                    <span className="text-slate-200">{w.fireRate * 60}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mag:</span>
                    <span className="text-sky-400">{w.magazineSize}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Weapon In-Depth Breakdown */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getWeaponIcon(activeWeapon.id)}
              <div>
                <h4 className="font-bold text-slate-100 text-base">{activeWeapon.name} - Spesifikasi Lengkap</h4>
                <p className="text-xs text-slate-400">{activeWeapon.description}</p>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-md">
              Reload: {activeWeapon.reloadTime}s • Recoil Recov: {activeWeapon.recoilRecovery}x
            </span>
          </div>

          {/* Stat Progress Bars */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Damage Body</span>
                <span className="text-slate-200 font-bold">{activeWeapon.damage} HP</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{ width: `${Math.min(100, (activeWeapon.damage / 120) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Headshot Crit</span>
                <span className="text-amber-400 font-bold">{activeWeapon.headshotMultiplier}x</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(activeWeapon.headshotMultiplier / 2.5) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Fire Rate (RPM)</span>
                <span className="text-slate-200 font-bold">{activeWeapon.fireRate * 60}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${(activeWeapon.fireRate / 20) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                <span>Kapasitas Mag</span>
                <span className="text-slate-200 font-bold">{activeWeapon.magazineSize} Rds</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${(activeWeapon.magazineSize / 40) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-mono">
            Tip: Kamu juga dapat berganti senjata instan selama ronde berjalan dengan menekan tombol angka [1] sampai [5].
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            Lengkapi Senjata
          </button>
        </div>
      </div>
    </div>
  );
};
