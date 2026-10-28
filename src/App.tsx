import React, { useState } from 'react';
import {
  GameMode,
  HeroId,
  WeaponId,
  GameSettings,
  Player,
  KillfeedEntry
} from './types/game';
import { HEROES, WEAPONS, MAPS, DEFAULT_SETTINGS, RANKS } from './game/constants';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { HeroSelector } from './components/HeroSelector';
import { WeaponSelector } from './components/WeaponSelector';
import { SettingsModal } from './components/SettingsModal';
import { MatchEndModal } from './components/MatchEndModal';
import { AimTrainer } from './components/AimTrainer';
import {
  Play,
  Users,
  Target,
  Swords,
  Shield,
  Sliders,
  Crosshair,
  Award,
  Zap,
  Info,
  ChevronRight,
  Flame,
  Activity
} from 'lucide-react';

export default function App() {
  // Navigation & Screen state
  const [inGame, setInGame] = useState(false);
  const [inAimTrainer, setInAimTrainer] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameMode>('ranked_duel');
  const [selectedMapId, setSelectedMapId] = useState<string>('neo_haven');

  // Loadout state
  const [playerHeroId, setPlayerHeroId] = useState<HeroId>('spectre');
  const [playerWeaponId, setPlayerWeaponId] = useState<WeaponId>('phantom');
  const [p2HeroId, setP2HeroId] = useState<HeroId>('titan');
  const [p2WeaponId, setP2WeaponId] = useState<WeaponId>('viper');

  // Modals
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [showWeaponModal, setShowWeaponModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Settings & RP progression
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [currentRP, setCurrentRP] = useState(850); // Starts at Gold rank

  // Active in-game HUD telemetry
  const [hudData, setHudData] = useState<{
    player: Player;
    p2?: Player;
    p1Score: number;
    p2Score: number;
    roundTarget: number;
    killfeed: KillfeedEntry[];
    currentRound: number;
  } | null>(null);

  // Post match summary
  const [matchSummary, setMatchSummary] = useState<{
    winnerTeam: number;
    playerKills: number;
    playerDeaths: number;
    damageDealt: number;
    headshots: number;
    accuracy: number;
  } | null>(null);

  const activeHero = HEROES[playerHeroId] || HEROES.spectre;
  const activeWeapon = WEAPONS[playerWeaponId] || WEAPONS.phantom;
  const currentRank = [...RANKS].reverse().find(r => currentRP >= r.minRP) || RANKS[0];

  const handleStartGame = () => {
    if (selectedMode === 'aim_range') {
      setInAimTrainer(true);
    } else {
      setInGame(true);
      setMatchSummary(null);
    }
  };

  const handleMatchEnd = (stats: {
    winnerTeam: number;
    playerKills: number;
    playerDeaths: number;
    damageDealt: number;
    headshots: number;
    accuracy: number;
  }) => {
    const isVictory = stats.winnerTeam === 1;
    const rpDelta = isVictory ? 28 + stats.playerKills * 4 : -14;
    setCurrentRP(prev => Math.max(0, prev + rpDelta));
    setMatchSummary(stats);
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Active In-Game Arena */}
      {inGame && (
        <div className="relative w-full h-full">
          <GameCanvas
            mode={selectedMode}
            mapId={selectedMapId}
            playerHeroId={playerHeroId}
            playerWeaponId={playerWeaponId}
            p2HeroId={p2HeroId}
            p2WeaponId={p2WeaponId}
            settings={settings}
            onMatchEnd={handleMatchEnd}
            onUpdateHUD={setHudData}
          />

          {hudData && (
            <HUD
              player={hudData.player}
              p2={hudData.p2}
              p1Score={hudData.p1Score}
              p2Score={hudData.p2Score}
              roundTarget={hudData.roundTarget}
              killfeed={hudData.killfeed}
              currentRound={hudData.currentRound}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenLoadout={() => setShowWeaponModal(true)}
            />
          )}

          {/* Quick Exit to Lobby Button */}
          <button
            onClick={() => {
              setInGame(false);
              setMatchSummary(null);
            }}
            className="absolute top-4 left-4 z-30 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-xs font-mono text-slate-400 rounded-lg border border-slate-700/80 transition shadow-lg"
          >
            ← Kembali ke Menu
          </button>

          {/* Post Match Summary */}
          {matchSummary && (
            <MatchEndModal
              stats={matchSummary}
              currentRP={currentRP}
              onPlayAgain={() => {
                setMatchSummary(null);
                // Trigger reset
                setInGame(false);
                setTimeout(() => setInGame(true), 50);
              }}
              onGoToLobby={() => {
                setInGame(false);
                setMatchSummary(null);
              }}
            />
          )}
        </div>
      )}

      {/* Active Aim Trainer Mode */}
      {inAimTrainer && (
        <AimTrainer
          weaponId={playerWeaponId}
          settings={settings}
          onBackToMenu={() => setInAimTrainer(false)}
        />
      )}

      {/* Main Lobby / Hub Screen */}
      {!inGame && !inAimTrainer && (
        <div className="relative w-full h-full flex flex-col justify-between p-6 md:p-8 bg-radial from-slate-900 via-slate-950 to-slate-950 overflow-y-auto">
          {/* Subtle Cyber Grid Background lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b18_1px,transparent_1px),linear-gradient(to_bottom,#1e293b18_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          {/* Top Navigation Bar */}
          <header className="relative z-10 flex items-center justify-between pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-500/10 border border-cyan-400/40 rounded-xl shadow-lg shadow-cyan-500/20">
                <Swords className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-100">
                    APEX <span className="text-cyan-400">TACTICS</span>
                  </h1>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-400 rounded border border-cyan-800 font-semibold">
                    v1.0 • 128 TICK
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Arena PvP Shooter Kompetitif dengan Kontrol Presisi & Hero Gunplay
                </p>
              </div>
            </div>

            {/* Profile & Rank Rating */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowGuideModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono rounded-lg border border-slate-800 transition"
              >
                <Info className="w-4 h-4 text-cyan-400" />
                Pilar Game PvP Bagus
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition"
                title="Pengaturan Reticle & Audio"
              >
                <Sliders className="w-5 h-5 text-slate-400" />
              </button>

              <div className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-slate-800">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: `${currentRank.badgeColor}22`, color: currentRank.badgeColor }}
                >
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{currentRank.tier}</div>
                  <div className="text-[10px] font-mono text-cyan-400">{currentRP} RP</div>
                </div>
              </div>
            </div>
          </header>

          {/* Central Lobby View: Hero Showcase & Mode Selector */}
          <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-6">
            {/* Left Column: Hero & Gunsmith Loadout */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="p-5 bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                <div
                  className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: activeHero.color }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">HERO OPERATIF AKTIF</span>
                  <button
                    onClick={() => setShowHeroModal(true)}
                    className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Ganti Hero <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Hero Avatar & Identity */}
                <div className="flex items-center gap-4">
                  <span className="text-6xl p-4 bg-slate-950/80 rounded-2xl border border-slate-800 shadow-inner">
                    {activeHero.avatar}
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-slate-100">{activeHero.name}</h2>
                    <span className="text-xs font-mono text-cyan-400">{activeHero.title} • {activeHero.role}</span>
                    <p className="text-xs text-slate-400 mt-1">
                      {activeHero.passive.name}: {activeHero.passive.description}
                    </p>
                  </div>
                </div>

                {/* Abilities Preview */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/70">
                    <span className="text-[10px] font-mono text-cyan-400 block font-semibold">[Q] TACTICAL</span>
                    <span className="font-bold text-slate-200">{activeHero.tactical.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{activeHero.tactical.description}</span>
                  </div>

                  <div className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/70">
                    <span className="text-[10px] font-mono text-amber-400 block font-semibold">[E] ULTIMATE</span>
                    <span className="font-bold text-slate-200">{activeHero.ultimate.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{activeHero.ultimate.description}</span>
                  </div>
                </div>
              </div>

              {/* Weapon Loadout Card */}
              <div className="p-5 bg-slate-950/70 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-cyan-400">
                    <Crosshair className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500">SENJATA UTAMA</span>
                    <h3 className="font-bold text-slate-100 text-base">{activeWeapon.name}</h3>
                    <span className="text-xs font-mono text-slate-400">
                      {activeWeapon.damage} Dmg • {activeWeapon.fireRate * 60} RPM • {activeWeapon.magazineSize} Peluru
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setShowWeaponModal(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 text-xs font-mono rounded-lg border border-slate-800 transition"
                >
                  Gudang Senjata
                </button>
              </div>
            </div>

            {/* Right Column: Game Mode Selection & Map Choice */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              {/* Modes Selection */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  PILIH MODE PERMAINAN
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Ranked Duel 1v1 */}
                  <div
                    onClick={() => setSelectedMode('ranked_duel')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      selectedMode === 'ranked_duel'
                        ? 'bg-cyan-950/30 border-cyan-400 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Swords className="w-5 h-5 text-cyan-400" />
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded font-bold">
                        KOMPETITIF
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Ranked Duel 1v1</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Adu mekanik menembak murni melawan AI Bot tingkat turnamen dengan perhitungan rank RP.
                      </p>
                    </div>
                  </div>

                  {/* Local 2-Player Versus */}
                  <div
                    onClick={() => setSelectedMode('local_pvp')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      selectedMode === 'local_pvp'
                        ? 'bg-purple-950/30 border-purple-400 shadow-lg shadow-purple-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-purple-400" />
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-purple-900/40 text-purple-300 rounded font-bold">
                        1v1 LOCAL
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Local PvP (Satu Keyboard)</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Pemain 1 (WASD + Mouse) vs Pemain 2 (Arrow Keys + Numpad/Keys) di arena yang sama!
                      </p>
                    </div>
                  </div>

                  {/* 2v2 Team Deathmatch */}
                  <div
                    onClick={() => setSelectedMode('team_deathmatch')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      selectedMode === 'team_deathmatch'
                        ? 'bg-sky-950/30 border-sky-400 shadow-lg shadow-sky-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Shield className="w-5 h-5 text-sky-400" />
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-900/40 text-sky-300 rounded font-bold">
                        SQUAD 2v2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Squad 2v2 TDM</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Bekerjasama dengan rekan tim bot taktis untuk menguasai chokepoints dan dome shield.
                      </p>
                    </div>
                  </div>

                  {/* Aim Lab / Recoil Range */}
                  <div
                    onClick={() => setSelectedMode('aim_range')}
                    className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between ${
                      selectedMode === 'aim_range'
                        ? 'bg-amber-950/30 border-amber-400 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Target className="w-5 h-5 text-amber-400" />
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-900/40 text-amber-300 rounded font-bold">
                        LATIHAN
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-100">Aim Lab & Recoil Range</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Latih target flicking, waktu reaksi dalam milidetik, dan pola recoil senjata.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Selection (when not in aim trainer) */}
              {selectedMode !== 'aim_range' && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    PILIH PETA PERTANDINGAN
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {MAPS.map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMapId(m.id)}
                        className={`p-3 rounded-xl border text-left transition ${
                          selectedMapId === m.id
                            ? 'bg-slate-800 border-cyan-400 text-cyan-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-xs font-bold text-slate-200">{m.name}</div>
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">{m.theme}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Big Launch Play Button */}
              <button
                onClick={handleStartGame}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-lg uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/25 transition duration-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <Play className="w-6 h-6 fill-current" />
                {selectedMode === 'aim_range' ? 'MASUK KE AIM LAB' : 'MULAI PERTANDINGAN (PLAY)'}
              </button>
            </div>
          </main>

          {/* Quick Controls Cheat-Sheet Footer */}
          <footer className="relative z-10 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-4">
              <span>[WASD] Bergerak</span>
              <span>[SHIFT] Sprint</span>
              <span>[C / CTRL] Slide Meluncur</span>
              <span>[SPACE] Tactical Dash</span>
              <span>[KLIK KIRI] Tembak</span>
              <span>[R] Reload</span>
              <span>[Q] Hero Tactical</span>
              <span>[E] Hero Ultimate</span>
              <span>[1-5] Ganti Senjata</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Engine: 128-Tick Simulation • Sub-Tick Hitreg • Procedural Web Audio Synth
            </div>
          </footer>
        </div>
      )}

      {/* Hero Selection Modal */}
      {showHeroModal && (
        <HeroSelector
          selectedHeroId={playerHeroId}
          onSelectHero={id => setPlayerHeroId(id)}
          onClose={() => setShowHeroModal(false)}
        />
      )}

      {/* Weapon Selection Modal */}
      {showWeaponModal && (
        <WeaponSelector
          selectedWeaponId={playerWeaponId}
          onSelectWeapon={id => setPlayerWeaponId(id)}
          onClose={() => setShowWeaponModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* Educational PvP Shooter Guide Modal (Based on User's Elements) */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Info className="w-5 h-5 text-cyan-400" /> ELEMEN GAME PVP SHOOTER YANG BAGUS
              </h2>
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition"
              >
                Tutup [ESC]
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-cyan-400 text-sm mb-1">1. Kontrol dan Gunplay yang Presisi</h4>
                <p className="text-slate-400">
                  Sensasi menembak responsif didukung oleh hitbox apex yang tajam (headshot multiplier 2.0x), recoil naik bertahap, dan Time-to-Kill (TTK) seimbang dengan sistem Shield + Health.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-purple-400 text-sm mb-1">2. Mekanik Gerakan Fluid (Slide & Dash)</h4>
                <p className="text-slate-400">
                  Tekan [C / CTRL] saat bergerak untuk meluncur kencang (Slide) dengan hitbox lebih rendah, atau [SPACE] untuk Tactical Dash menghindari tembakan di chokepoint.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-emerald-400 text-sm mb-1">3. Desain Peta Seimbang (Symmetrical Lanes)</h4>
                <p className="text-slate-400">
                  Peta Neo Haven, Orbital Reactor, dan Cyber Yard dirancang dengan jalur 3-lane simetris, rintangan cover seimbang, jump pads, dan area pandang adil tanpa keunggulan spawn.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-400 text-sm mb-1">4. Variasi Karakter & Senjata (Meta Sehat)</h4>
                <p className="text-slate-400">
                  4 Operatif (Spectre, Titan, Blaze, Cipher) dengan skill taktis unik serta 5 jenis senjata (AR, SMG, Sniper, Shotgun, Plasma) yang memiliki kelebihan di rentang jarak berbeda.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-rose-400 text-sm mb-1">5. Tickrate Tinggi 128-Tick & Netcode Responsif</h4>
                <p className="text-slate-400">
                  Loop simulasi fisika 128-tick berkelanjutan mendeteksi proyektil dan hitscan tanpa jeda & ghost-hit, disertai feedback audio sintetis Web Audio API tanpa latensi.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
