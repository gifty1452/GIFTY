import { Hero, Weapon, GameMap, GameSettings, RankTier } from '../types/game';

export const WEAPONS: Record<string, Weapon> = {
  phantom: {
    id: 'phantom',
    name: 'Phantom-AR',
    category: 'Rifle',
    damage: 34,
    headshotMultiplier: 2.0,
    fireRate: 11, // rounds/s
    magazineSize: 30,
    reloadTime: 1.5,
    bulletSpeed: 1400,
    spread: 0.02,
    maxSpread: 0.08,
    recoilRecovery: 4.5,
    pellets: 1,
    description: 'Senapan serbu serbaguna dengan hentakan stabil dan akurasi tinggi.',
    icon: 'Crosshair',
    color: '#38bdf8' // sky blue
  },
  viper: {
    id: 'viper',
    name: 'Viper-SMG',
    category: 'SMG',
    damage: 19,
    headshotMultiplier: 1.75,
    fireRate: 18,
    magazineSize: 36,
    reloadTime: 1.1,
    bulletSpeed: 1250,
    spread: 0.045,
    maxSpread: 0.12,
    recoilRecovery: 5.5,
    pellets: 1,
    description: 'Submachine gun berkecepatan tinggi, unggul saat slide dan pertarungan jarak dekat.',
    icon: 'Zap',
    color: '#a855f7' // purple
  },
  valkyrie: {
    id: 'valkyrie',
    name: 'Valkyrie-50',
    category: 'Sniper',
    damage: 120,
    headshotMultiplier: 2.2, // 264 headshot (insta-kill)
    fireRate: 1.2,
    magazineSize: 5,
    reloadTime: 2.2,
    bulletSpeed: 2200,
    spread: 0.005,
    maxSpread: 0.18,
    recoilRecovery: 2.0,
    pellets: 1,
    description: 'Senapan runduk bolt-action berdaya hancur tinggi; satu tembakan kepala mematikan.',
    icon: 'Target',
    color: '#f43f5e' // rose
  },
  bulldog: {
    id: 'bulldog',
    name: 'Bulldog-12',
    category: 'Shotgun',
    damage: 15, // 8 pellets x 15 = 120 max damage
    headshotMultiplier: 1.5,
    fireRate: 2.3,
    magazineSize: 8,
    reloadTime: 1.8,
    bulletSpeed: 1100,
    spread: 0.14,
    maxSpread: 0.22,
    recoilRecovery: 3.5,
    pellets: 8,
    description: 'Shotgun semi-otomatis dengan sebaran peluru mematikan di ruang sempit.',
    icon: 'Flame',
    color: '#f97316' // orange
  },
  plasma: {
    id: 'plasma',
    name: 'Plasma-X',
    category: 'Energy',
    damage: 42,
    headshotMultiplier: 1.85,
    fireRate: 6.5,
    magazineSize: 24,
    reloadTime: 1.4,
    bulletSpeed: 1350,
    spread: 0.015,
    maxSpread: 0.06,
    recoilRecovery: 4.0,
    pellets: 1,
    description: 'Senjata proyektil energi neon beruntun dengan lintasan peluru presisi.',
    icon: 'Radio',
    color: '#22c55e' // emerald
  }
};

export const HEROES: Record<string, Hero> = {
  spectre: {
    id: 'spectre',
    name: 'Spectre',
    title: 'Void Infiltrator',
    role: 'Infiltrator',
    color: '#8b5cf6',
    accentColor: '#c084fc',
    health: 100,
    maxShield: 75,
    speed: 310,
    avatar: '👁️',
    passive: {
      name: 'Sixth Sense',
      description: 'Menerima peringatan visual saat musuh membidik dari blindspot.'
    },
    tactical: {
      id: 'void_phase',
      name: 'Void Phase',
      key: 'Q',
      cooldown: 12,
      description: 'Masuk ke dimensi void selama 2.2 detik: kebal peluru dan meningkatkan kecepatan.',
      icon: 'EyeOff'
    },
    ultimate: {
      id: 'singularity_rift',
      name: 'Singularity Rift',
      key: 'E',
      cooldown: 28,
      description: 'Melempar vortex gravitasi yang menarik lawan ke pusatnya.',
      icon: 'Orbit'
    }
  },
  titan: {
    id: 'titan',
    name: 'Titan',
    title: 'Armored Vanguard',
    role: 'Vanguard',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    health: 125,
    maxShield: 100,
    speed: 280,
    avatar: '🛡️',
    passive: {
      name: 'Fortified Plating',
      description: 'Mengurangi efek slow dan memiliki pertahanan shield ekstra kokoh.'
    },
    tactical: {
      id: 'dome_shield',
      name: 'Dome Shield',
      key: 'Q',
      cooldown: 15,
      description: 'Memasang perisai kubah energi selama 5 detik yang menahan seluruh tembakan.',
      icon: 'Shield'
    },
    ultimate: {
      id: 'orbital_strike',
      name: 'Orbital Strike',
      key: 'E',
      cooldown: 30,
      description: 'Memanggil salvo rudal dari satelit ke area target yang ditentukan.',
      icon: 'Bomb'
    }
  },
  blaze: {
    id: 'blaze',
    name: 'Blaze',
    title: 'Combat Duelist',
    role: 'Duelist',
    color: '#f97316',
    accentColor: '#fb923c',
    health: 100,
    maxShield: 75,
    speed: 320,
    avatar: '🔥',
    passive: {
      name: 'Adrenaline Rush',
      description: 'Mendapat lonjakan kecepatan gerak (+20%) sesaat setelah melukai lawan.'
    },
    tactical: {
      id: 'flash_flare',
      name: 'Curve Flash',
      key: 'Q',
      cooldown: 10,
      description: 'Melempar suar cahaya yang menyilaukan dan membutakan musuh selama 1.8 detik.',
      icon: 'Sun'
    },
    ultimate: {
      id: 'inferno_blast',
      name: 'Inferno Overdrive',
      key: 'E',
      cooldown: 25,
      description: 'Mode pembakaran: reload instan, peningkatan laju tembak 30%, dan regenerasi shield.',
      icon: 'Zap'
    }
  },
  cipher: {
    id: 'cipher',
    name: 'Cipher',
    title: 'Tactical Recon',
    role: 'Recon',
    color: '#06b6d4',
    accentColor: '#22d3ee',
    health: 100,
    maxShield: 75,
    speed: 300,
    avatar: '📡',
    passive: {
      name: 'Radar Sweep',
      description: 'Langkah kaki musuh dalam radius terdengar menghasilkan gelombang di radar minimap.'
    },
    tactical: {
      id: 'sonar_pulse',
      name: 'Sonar Dart',
      key: 'Q',
      cooldown: 14,
      description: 'Menembakkan panah sonar yang memindai dan menandai musuh di balik rintangan.',
      icon: 'Radio'
    },
    ultimate: {
      id: 'emp_overload',
      name: 'EMP Wave',
      key: 'E',
      cooldown: 28,
      description: 'Gelombang elektromagnetik yang melenyapkan 50 shield musuh dan mendisable skill.',
      icon: 'Activity'
    }
  }
};

export const MAPS: GameMap[] = [
  {
    id: 'neo_haven',
    name: 'Neo Haven (3-Lane Arena)',
    theme: 'Cyber City',
    width: 1400,
    height: 900,
    spawnPointsP1: [
      { x: 120, y: 450 },
      { x: 120, y: 350 },
      { x: 120, y: 550 }
    ],
    spawnPointsP2: [
      { x: 1280, y: 450 },
      { x: 1280, y: 350 },
      { x: 1280, y: 550 }
    ],
    obstacles: [
      // Outer borders
      { id: 'b_top', x: 0, y: 0, w: 1400, h: 25, type: 'wall' },
      { id: 'b_bot', x: 0, y: 875, w: 1400, h: 25, type: 'wall' },
      { id: 'b_left', x: 0, y: 0, w: 25, h: 900, type: 'wall' },
      { id: 'b_right', x: 1375, y: 0, w: 25, h: 900, type: 'wall' },

      // Mid Courtyard pillars & covers (Symmetrical)
      { id: 'mid_pillar_top', x: 670, y: 220, w: 60, h: 120, type: 'wall', color: '#1e293b' },
      { id: 'mid_pillar_bot', x: 670, y: 560, w: 60, h: 120, type: 'wall', color: '#1e293b' },
      { id: 'mid_center_block', x: 660, y: 410, w: 80, h: 80, type: 'cover', color: '#334155' },

      // Left Lane Covers (P1 side)
      { id: 'p1_top_box', x: 340, y: 160, w: 80, h: 80, type: 'cover', color: '#334155' },
      { id: 'p1_mid_wall', x: 380, y: 360, w: 40, h: 180, type: 'wall', color: '#1e293b' },
      { id: 'p1_bot_box', x: 340, y: 660, w: 80, h: 80, type: 'cover', color: '#334155' },

      // Right Lane Covers (P2 side)
      { id: 'p2_top_box', x: 980, y: 160, w: 80, h: 80, type: 'cover', color: '#334155' },
      { id: 'p2_mid_wall', x: 980, y: 360, w: 40, h: 180, type: 'wall', color: '#1e293b' },
      { id: 'p2_bot_box', x: 980, y: 660, w: 80, h: 80, type: 'cover', color: '#334155' },

      // Jump Pads to propel players across chokepoints
      { id: 'jp_left', x: 500, y: 430, w: 40, h: 40, type: 'jumppad', color: '#38bdf8' },
      { id: 'jp_right', x: 860, y: 430, w: 40, h: 40, type: 'jumppad', color: '#38bdf8' }
    ],
    pickups: [
      { id: 'pick_hp_top', x: 700, y: 110, radius: 18, type: 'health', respawnTimer: 0, active: true },
      { id: 'pick_shield_bot', x: 700, y: 790, radius: 18, type: 'shield', respawnTimer: 0, active: true },
      { id: 'pick_ammo_p1', x: 260, y: 450, radius: 16, type: 'ammo', respawnTimer: 0, active: true },
      { id: 'pick_ammo_p2', x: 1140, y: 450, radius: 16, type: 'ammo', respawnTimer: 0, active: true }
    ]
  },
  {
    id: 'orbital_reactor',
    name: 'Orbital Reactor (Octagonal Core)',
    theme: 'Space Station',
    width: 1400,
    height: 900,
    spawnPointsP1: [
      { x: 160, y: 450 },
      { x: 160, y: 300 },
      { x: 160, y: 600 }
    ],
    spawnPointsP2: [
      { x: 1240, y: 450 },
      { x: 1240, y: 300 },
      { x: 1240, y: 600 }
    ],
    obstacles: [
      // Outer borders
      { id: 'b_top', x: 0, y: 0, w: 1400, h: 25, type: 'wall' },
      { id: 'b_bot', x: 0, y: 875, w: 1400, h: 25, type: 'wall' },
      { id: 'b_left', x: 0, y: 0, w: 25, h: 900, type: 'wall' },
      { id: 'b_right', x: 1375, y: 0, w: 25, h: 900, type: 'wall' },

      // Circular core barriers
      { id: 'core_tl', x: 560, y: 280, w: 70, h: 70, type: 'wall', color: '#4338ca' },
      { id: 'core_tr', x: 770, y: 280, w: 70, h: 70, type: 'wall', color: '#4338ca' },
      { id: 'core_bl', x: 560, y: 550, w: 70, h: 70, type: 'wall', color: '#4338ca' },
      { id: 'core_br', x: 770, y: 550, w: 70, h: 70, type: 'wall', color: '#4338ca' },
      { id: 'core_center', x: 660, y: 410, w: 80, h: 80, type: 'energy_barrier', color: '#6366f1' },

      // Outer wings
      { id: 'wing_l_top', x: 350, y: 180, w: 40, h: 180, type: 'wall', color: '#1e1b4b' },
      { id: 'wing_l_bot', x: 350, y: 540, w: 40, h: 180, type: 'wall', color: '#1e1b4b' },
      { id: 'wing_r_top', x: 1010, y: 180, w: 40, h: 180, type: 'wall', color: '#1e1b4b' },
      { id: 'wing_r_bot', x: 1010, y: 540, w: 40, h: 180, type: 'wall', color: '#1e1b4b' }
    ],
    pickups: [
      { id: 'pick_reactor_shield', x: 700, y: 450, radius: 20, type: 'shield', respawnTimer: 0, active: true },
      { id: 'pick_top_hp', x: 700, y: 180, radius: 18, type: 'health', respawnTimer: 0, active: true },
      { id: 'pick_bot_hp', x: 700, y: 720, radius: 18, type: 'health', respawnTimer: 0, active: true }
    ]
  },
  {
    id: 'cyber_yard',
    name: 'Cyber Yard (Close-Quarters)',
    theme: 'Industrial Yard',
    width: 1400,
    height: 900,
    spawnPointsP1: [
      { x: 130, y: 220 },
      { x: 130, y: 450 },
      { x: 130, y: 680 }
    ],
    spawnPointsP2: [
      { x: 1270, y: 220 },
      { x: 1270, y: 450 },
      { x: 1270, y: 680 }
    ],
    obstacles: [
      // Outer borders
      { id: 'b_top', x: 0, y: 0, w: 1400, h: 25, type: 'wall' },
      { id: 'b_bot', x: 0, y: 875, w: 1400, h: 25, type: 'wall' },
      { id: 'b_left', x: 0, y: 0, w: 25, h: 900, type: 'wall' },
      { id: 'b_right', x: 1375, y: 0, w: 25, h: 900, type: 'wall' },

      // Shipping Containers (Heavy Tactical Angles)
      { id: 'crate_1', x: 300, y: 260, w: 160, h: 80, type: 'cover', color: '#d97706' },
      { id: 'crate_2', x: 300, y: 560, w: 160, h: 80, type: 'cover', color: '#d97706' },
      { id: 'crate_3', x: 940, y: 260, w: 160, h: 80, type: 'cover', color: '#d97706' },
      { id: 'crate_4', x: 940, y: 560, w: 160, h: 80, type: 'cover', color: '#d97706' },

      { id: 'crate_mid_1', x: 620, y: 150, w: 160, h: 90, type: 'wall', color: '#475569' },
      { id: 'crate_mid_2', x: 620, y: 660, w: 160, h: 90, type: 'wall', color: '#475569' },
      { id: 'crate_center_cross', x: 650, y: 410, w: 100, h: 80, type: 'cover', color: '#0f766e' }
    ],
    pickups: [
      { id: 'pick_yard_ammo_1', x: 500, y: 450, radius: 18, type: 'ammo', respawnTimer: 0, active: true },
      { id: 'pick_yard_ammo_2', x: 900, y: 450, radius: 18, type: 'ammo', respawnTimer: 0, active: true },
      { id: 'pick_yard_hp', x: 700, y: 450, radius: 18, type: 'health', respawnTimer: 0, active: true }
    ]
  }
];

export const RANKS: { tier: RankTier; minRP: number; badgeColor: string; icon: string }[] = [
  { tier: 'Bronze', minRP: 0, badgeColor: '#b45309', icon: 'Shield' },
  { tier: 'Silver', minRP: 400, badgeColor: '#94a3b8', icon: 'ShieldCheck' },
  { tier: 'Gold', minRP: 800, badgeColor: '#eab308', icon: 'Award' },
  { tier: 'Platinum', minRP: 1300, badgeColor: '#06b6d4', icon: 'Sparkles' },
  { tier: 'Diamond', minRP: 1900, badgeColor: '#3b82f6', icon: 'Diamond' },
  { tier: 'Master', minRP: 2600, badgeColor: '#a855f7', icon: 'Crown' },
  { tier: 'Apex Predator', minRP: 3500, badgeColor: '#ef4444', icon: 'Flame' }
];

export const DEFAULT_SETTINGS: GameSettings = {
  soundVolume: 0.8,
  musicVolume: 0.4,
  screenShake: true,
  damageNumbers: true,
  crosshair: {
    color: '#00ffcc',
    size: 9,
    gap: 5,
    thickness: 2,
    dot: true,
    dynamicBloom: true
  },
  showHitboxes: false,
  bloodParticles: true,
  botDifficulty: 'medium',
  roundTarget: 5
};
