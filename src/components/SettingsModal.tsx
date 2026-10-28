import React from 'react';
import { GameSettings } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { Sliders, Volume2, Shield, Crosshair, Eye } from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const updateSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    if (key === 'soundVolume') {
      soundEngine.setVolume(value as number);
    }
  };

  const updateCrosshair = <K extends keyof GameSettings['crosshair']>(key: K, value: GameSettings['crosshair'][K]) => {
    const updated = {
      ...settings,
      crosshair: {
        ...settings.crosshair,
        [key]: value
      }
    };
    onUpdateSettings(updated);
  };

  const ch = settings.crosshair;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-slate-100">PENGATURAN KOMPETITIF & RETICLE</h2>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
          >
            Selesai [ESC]
          </button>
        </div>

        {/* Section 1: Interactive Crosshair Customizer */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-6 items-center">
          {/* Live Preview Box */}
          <div className="w-48 h-48 bg-slate-950 rounded-xl border border-slate-700/70 relative flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
            {/* Background dummy target */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <div className="w-24 h-24 rounded-full border border-rose-500/50 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-rose-500/70 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                </div>
              </div>
            </div>

            {/* Custom Crosshair Preview */}
            <div className="relative pointer-events-none">
              {ch.dot && (
                <div
                  className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: `${ch.thickness * 2}px`,
                    height: `${ch.thickness * 2}px`,
                    backgroundColor: ch.color
                  }}
                />
              )}
              {/* Top prong */}
              <div
                className="absolute -translate-x-1/2"
                style={{
                  bottom: `${ch.gap}px`,
                  width: `${ch.thickness}px`,
                  height: `${ch.size}px`,
                  backgroundColor: ch.color
                }}
              />
              {/* Bottom prong */}
              <div
                className="absolute -translate-x-1/2"
                style={{
                  top: `${ch.gap}px`,
                  width: `${ch.thickness}px`,
                  height: `${ch.size}px`,
                  backgroundColor: ch.color
                }}
              />
              {/* Left prong */}
              <div
                className="absolute -translate-y-1/2"
                style={{
                  right: `${ch.gap}px`,
                  height: `${ch.thickness}px`,
                  width: `${ch.size}px`,
                  backgroundColor: ch.color
                }}
              />
              {/* Right prong */}
              <div
                className="absolute -translate-y-1/2"
                style={{
                  left: `${ch.gap}px`,
                  height: `${ch.thickness}px`,
                  width: `${ch.size}px`,
                  backgroundColor: ch.color
                }}
              />
            </div>
            <span className="absolute bottom-2 text-[10px] font-mono text-slate-500">Preview Reticle</span>
          </div>

          {/* Crosshair Controls */}
          <div className="flex-1 space-y-3 w-full">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Crosshair className="w-4 h-4" /> Kustomisasi Crosshair
            </h3>

            {/* Color buttons */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-16">Warna:</span>
              {['#00ffcc', '#22c55e', '#facc15', '#ec4899', '#ffffff'].map(c => (
                <button
                  key={c}
                  onClick={() => updateCrosshair('color', c)}
                  className={`w-6 h-6 rounded-full border-2 transition ${
                    ch.color === c ? 'border-white scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Size Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24">Ukuran ({ch.size}px):</span>
              <input
                type="range"
                min="4"
                max="20"
                value={ch.size}
                onChange={e => updateCrosshair('size', Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
            </div>

            {/* Gap Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24">Jarak Gap ({ch.gap}px):</span>
              <input
                type="range"
                min="2"
                max="16"
                value={ch.gap}
                onChange={e => updateCrosshair('gap', Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
            </div>

            {/* Dot toggle & Bloom */}
            <div className="flex items-center gap-6 pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={ch.dot}
                  onChange={e => updateCrosshair('dot', e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                Titik Tengah (Center Dot)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={ch.dynamicBloom}
                  onChange={e => updateCrosshair('dynamicBloom', e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                Dynamic Recoil Bloom
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Audio & Visual Juice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" /> Audio Efek (Web Audio Synth)
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 w-24">Volume SFX:</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={e => updateSetting('soundVolume', Number(e.target.value))}
                className="flex-1 accent-cyan-400"
              />
              <span className="text-xs font-mono text-slate-300">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
              <Eye className="w-4 h-4" /> Umpan Balik Visual
            </h3>
            <div className="space-y-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.damageNumbers}
                  onChange={e => updateSetting('damageNumbers', e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                Angka Kerusakan Mengambang (Floating Damage Numbers)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={e => updateSetting('screenShake', e.target.checked)}
                  className="rounded accent-cyan-400"
                />
                Hentakan Kamera (Screen Shake)
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: AI & Match Settings */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
            <Shield className="w-4 h-4" /> Kesulitan Bot & Aturan Pertandingan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Tingkat Kesulitan AI Bot (Simulasi Ranked):</label>
              <div className="grid grid-cols-4 gap-2">
                {(['easy', 'medium', 'hard', 'predator'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => updateSetting('botDifficulty', diff)}
                    className={`py-1.5 rounded-lg text-xs font-mono uppercase font-semibold transition border ${
                      settings.botDifficulty === diff
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Target Ronde untuk Menang:</label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 5, 7, 9].map(target => (
                  <button
                    key={target}
                    onClick={() => updateSetting('roundTarget', target)}
                    className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                      settings.roundTarget === target
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {target} Ronde
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition shadow-lg shadow-cyan-500/20"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
