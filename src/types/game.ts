export type HeroId = 'spectre' | 'titan' | 'blaze' | 'cipher';

export type WeaponId = 'phantom' | 'viper' | 'valkyrie' | 'bulldog' | 'plasma';

export type GameMode = 'ranked_duel' | 'team_deathmatch' | 'local_pvp' | 'aim_range';

export type RankTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Apex Predator';

export interface Ability {
  id: string;
  name: string;
  key: string;
  cooldown: number; // in seconds
  description: string;
  icon: string;
}

export interface Hero {
  id: HeroId;
  name: string;
  title: string;
  role: 'Duelist' | 'Vanguard' | 'Infiltrator' | 'Recon';
  color: string;
  accentColor: string;
  health: number;
  maxShield: number;
  speed: number;
  avatar: string;
  passive: {
    name: string;
    description: string;
  };
  tactical: Ability;
  ultimate: Ability;
}

export interface Weapon {
  id: WeaponId;
  name: string;
  category: 'Rifle' | 'SMG' | 'Sniper' | 'Shotgun' | 'Energy';
  damage: number;
  headshotMultiplier: number;
  fireRate: number; // rounds per second
  magazineSize: number;
  reloadTime: number; // in seconds
  bulletSpeed: number; // px per sec or 0 for hitscan
  spread: number; // base spread angle in radians
  maxSpread: number;
  recoilRecovery: number;
  pellets: number; // for shotguns
  description: string;
  icon: string;
  color: string;
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
  glow?: boolean;
}

export interface Bullet {
  id: string;
  ownerId: string;
  team: number;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  damage: number;
  headshotMultiplier: number;
  color: string;
  radius: number;
  life: number;
  maxLife: number;
  trail: Vector2[];
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  damage: number;
  isHeadshot: boolean;
  isShield: boolean;
  alpha: number;
  vy: number;
}

export interface MapObstacle {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'wall' | 'cover' | 'jumppad' | 'hazard' | 'energy_barrier';
  color?: string;
  health?: number;
  maxHealth?: number;
}

export interface Pickup {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'health' | 'shield' | 'ammo';
  respawnTimer: number;
  active: boolean;
}

export interface ActiveAbilityEffect {
  type: 'void_phase' | 'dome_shield' | 'flash_flare' | 'sonar_pulse' | 'orbital_strike' | 'smoke';
  ownerId: string;
  team: number;
  x: number;
  y: number;
  radius: number;
  duration: number;
  maxDuration: number;
  color: string;
}

export interface Player {
  id: string;
  name: string;
  isBot: boolean;
  botDifficulty?: 'easy' | 'medium' | 'hard' | 'predator';
  team: number; // 1 or 2
  heroId: HeroId;
  weaponId: WeaponId;
  
  // Transforms & Physics
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number; // radians
  
  // Status
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  ammo: number;
  isReloading: boolean;
  reloadProgress: number; // 0 to 1
  isDead: boolean;
  respawnTimer: number;
  
  // Movement mechanics
  isSprinting: boolean;
  isSliding: boolean;
  slideCooldown: number;
  slideTimer: number;
  isDashing: boolean;
  dashTimer: number;
  dashCooldown: number;
  
  // Combat stats
  recoilSpread: number;
  lastShotTime: number;
  tacticalCooldown: number;
  tacticalActiveTime: number;
  ultimateCharge: number; // 0 to 100
  ultimateActiveTime: number;
  isBlinded: number; // timer in seconds
  isRevealed: number; // timer in seconds
  
  // Scores
  kills: number;
  deaths: number;
  damageDealt: number;
  headshots: number;
  score: number;
}

export interface KillfeedEntry {
  id: string;
  killerName: string;
  killerTeam: number;
  victimName: string;
  victimTeam: number;
  weaponName: string;
  isHeadshot: boolean;
  timestamp: number;
}

export interface CrosshairSettings {
  color: string;
  size: number;
  gap: number;
  thickness: number;
  dot: boolean;
  dynamicBloom: boolean;
}

export interface GameSettings {
  soundVolume: number;
  musicVolume: number;
  screenShake: boolean;
  damageNumbers: boolean;
  crosshair: CrosshairSettings;
  showHitboxes: boolean;
  bloodParticles: boolean;
  botDifficulty: 'easy' | 'medium' | 'hard' | 'predator';
  roundTarget: number;
}

export interface GameMap {
  id: string;
  name: string;
  theme: string;
  width: number;
  height: number;
  spawnPointsP1: Vector2[];
  spawnPointsP2: Vector2[];
  obstacles: MapObstacle[];
  pickups: Pickup[];
}
