import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Player,
  Bullet,
  Particle,
  DamageNumber,
  ActiveAbilityEffect,
  GameMap,
  GameSettings,
  KillfeedEntry,
  GameMode,
  Vector2
} from '../types/game';
import { WEAPONS, HEROES, MAPS } from '../game/constants';
import {
  getLineAABBIntersection,
  getLineCircleIntersection,
  resolveCircleBoxCollision,
  evaluateHeadshot
} from '../game/physics';
import { soundEngine } from '../audio/soundEngine';
import { BotState, updateBotAI } from '../game/botAI';

interface GameCanvasProps {
  mode: GameMode;
  mapId: string;
  playerHeroId: string;
  playerWeaponId: string;
  p2HeroId?: string;
  p2WeaponId?: string;
  settings: GameSettings;
  onMatchEnd: (stats: {
    winnerTeam: number;
    playerKills: number;
    playerDeaths: number;
    damageDealt: number;
    headshots: number;
    accuracy: number;
  }) => void;
  onUpdateHUD: (data: {
    player: Player;
    p2?: Player;
    p1Score: number;
    p2Score: number;
    roundTarget: number;
    killfeed: KillfeedEntry[];
    currentRound: number;
  }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  mode,
  mapId,
  playerHeroId,
  playerWeaponId,
  p2HeroId = 'titan',
  p2WeaponId = 'viper',
  settings,
  onMatchEnd,
  onUpdateHUD
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Match state
  const [currentRound, setCurrentRound] = useState(1);
  const [p1RoundWins, setP1RoundWins] = useState(0);
  const [p2RoundWins, setP2RoundWins] = useState(0);

  // References for continuous game loop
  const gameStateRef = useRef<{
    map: GameMap;
    players: Player[];
    bullets: Bullet[];
    particles: Particle[];
    damageNumbers: DamageNumber[];
    abilityEffects: ActiveAbilityEffect[];
    killfeed: KillfeedEntry[];
    botStates: Map<string, BotState>;
    camera: { x: number; y: number; zoom: number };
    screenShake: number;
    mousePos: Vector2;
    p2AimPos: Vector2;
    keysDown: Set<string>;
    mouseDown: boolean;
    shotsFired: number;
    shotsHit: number;
    isPaused: boolean;
    roundEndTime: number | null;
  }>({
    map: MAPS.find(m => m.id === mapId) || MAPS[0],
    players: [],
    bullets: [],
    particles: [],
    damageNumbers: [],
    abilityEffects: [],
    killfeed: [],
    botStates: new Map(),
    camera: { x: 0, y: 0, zoom: 1 },
    screenShake: 0,
    mousePos: { x: 700, y: 450 },
    p2AimPos: { x: 200, y: 450 },
    keysDown: new Set(),
    mouseDown: false,
    shotsFired: 0,
    shotsHit: 0,
    isPaused: false,
    roundEndTime: null
  });

  // Spawn/Reset players for a round
  const resetRound = useCallback((newRoundNum: number) => {
    const selectedMap = MAPS.find(m => m.id === mapId) || MAPS[0];
    const hero1 = HEROES[playerHeroId] || HEROES.spectre;
    const hero2 = HEROES[p2HeroId] || HEROES.titan;

    const p1Spawn = selectedMap.spawnPointsP1[0] || { x: 150, y: 450 };
    const p2Spawn = selectedMap.spawnPointsP2[0] || { x: 1250, y: 450 };

    const p1: Player = {
      id: 'p1',
      name: 'Agent 1 (You)',
      isBot: false,
      team: 1,
      heroId: hero1.id,
      weaponId: (playerWeaponId as any) || 'phantom',
      x: p1Spawn.x,
      y: p1Spawn.y,
      vx: 0,
      vy: 0,
      radius: 20,
      angle: 0,
      health: hero1.health,
      maxHealth: hero1.health,
      shield: hero1.maxShield,
      maxShield: hero1.maxShield,
      ammo: WEAPONS[playerWeaponId]?.magazineSize || 30,
      isReloading: false,
      reloadProgress: 0,
      isDead: false,
      respawnTimer: 0,
      isSprinting: false,
      isSliding: false,
      slideCooldown: 0,
      slideTimer: 0,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      recoilSpread: 0,
      lastShotTime: 0,
      tacticalCooldown: 0,
      tacticalActiveTime: 0,
      ultimateCharge: 50,
      ultimateActiveTime: 0,
      isBlinded: 0,
      isRevealed: 0,
      kills: gameStateRef.current.players.find(p => p.id === 'p1')?.kills || 0,
      deaths: gameStateRef.current.players.find(p => p.id === 'p1')?.deaths || 0,
      damageDealt: gameStateRef.current.players.find(p => p.id === 'p1')?.damageDealt || 0,
      headshots: gameStateRef.current.players.find(p => p.id === 'p1')?.headshots || 0,
      score: gameStateRef.current.players.find(p => p.id === 'p1')?.score || 0
    };

    const p2IsBot = mode !== 'local_pvp';
    const p2: Player = {
      id: 'p2',
      name: p2IsBot ? `Apex Bot (${settings.botDifficulty.toUpperCase()})` : 'Player 2',
      isBot: p2IsBot,
      botDifficulty: settings.botDifficulty,
      team: 2,
      heroId: hero2.id,
      weaponId: (p2WeaponId as any) || 'viper',
      x: p2Spawn.x,
      y: p2Spawn.y,
      vx: 0,
      vy: 0,
      radius: 20,
      angle: Math.PI,
      health: hero2.health,
      maxHealth: hero2.health,
      shield: hero2.maxShield,
      maxShield: hero2.maxShield,
      ammo: WEAPONS[p2WeaponId]?.magazineSize || 35,
      isReloading: false,
      reloadProgress: 0,
      isDead: false,
      respawnTimer: 0,
      isSprinting: false,
      isSliding: false,
      slideCooldown: 0,
      slideTimer: 0,
      isDashing: false,
      dashTimer: 0,
      dashCooldown: 0,
      recoilSpread: 0,
      lastShotTime: 0,
      tacticalCooldown: 0,
      tacticalActiveTime: 0,
      ultimateCharge: 50,
      ultimateActiveTime: 0,
      isBlinded: 0,
      isRevealed: 0,
      kills: gameStateRef.current.players.find(p => p.id === 'p2')?.kills || 0,
      deaths: gameStateRef.current.players.find(p => p.id === 'p2')?.deaths || 0,
      damageDealt: gameStateRef.current.players.find(p => p.id === 'p2')?.damageDealt || 0,
      headshots: gameStateRef.current.players.find(p => p.id === 'p2')?.headshots || 0,
      score: gameStateRef.current.players.find(p => p.id === 'p2')?.score || 0
    };

    const initialPlayers = [p1, p2];

    // If team deathmatch mode, add teammates and enemies (2v2)
    if (mode === 'team_deathmatch') {
      const p3Spawn = selectedMap.spawnPointsP1[1] || { x: 150, y: 350 };
      const p4Spawn = selectedMap.spawnPointsP2[1] || { x: 1250, y: 350 };

      const teammate: Player = {
        ...p1,
        id: 'bot_ally',
        name: 'Ally Alpha',
        isBot: true,
        team: 1,
        heroId: 'blaze',
        weaponId: 'phantom',
        x: p3Spawn.x,
        y: p3Spawn.y
      };

      const enemy2: Player = {
        ...p2,
        id: 'bot_enemy2',
        name: 'Rival Bravo',
        isBot: true,
        team: 2,
        heroId: 'cipher',
        weaponId: 'valkyrie',
        x: p4Spawn.x,
        y: p4Spawn.y
      };

      initialPlayers.push(teammate, enemy2);
    }

    gameStateRef.current.players = initialPlayers;
    gameStateRef.current.map = selectedMap;
    gameStateRef.current.bullets = [];
    gameStateRef.current.particles = [];
    gameStateRef.current.damageNumbers = [];
    gameStateRef.current.abilityEffects = [];
    gameStateRef.current.roundEndTime = null;

    // Reset bot states
    const newBotStates = new Map<string, BotState>();
    initialPlayers.forEach(p => {
      if (p.isBot) {
        newBotStates.set(p.id, {
          targetPlayerId: null,
          lastKnownPos: null,
          reactionTimer: 0,
          strafeTimer: 0.5,
          strafeDirection: 1,
          isPeeking: false,
          coverPoint: null,
          desiredAngle: p.angle,
          wantsToShoot: false,
          wantsToTactical: false,
          wantsToSlide: false
        });
      }
    });
    gameStateRef.current.botStates = newBotStates;
    setCurrentRound(newRoundNum);
  }, [mapId, playerHeroId, playerWeaponId, p2HeroId, p2WeaponId, mode, settings.botDifficulty]);

  // Handle shooting logic
  const fireWeapon = (shooter: Player, targetAngle: number) => {
    if (shooter.isDead || shooter.isReloading) return;
    if (shooter.tacticalActiveTime > 0 && shooter.heroId === 'spectre') return; // Cannot shoot while in void
    if (shooter.ammo <= 0) {
      startReload(shooter);
      return;
    }

    const weapon = WEAPONS[shooter.weaponId] || WEAPONS.phantom;
    const now = Date.now() / 1000;
    const minInterval = 1 / weapon.fireRate;

    if (now - shooter.lastShotTime < minInterval) return;

    shooter.lastShotTime = now;
    shooter.ammo -= 1;
    shooter.recoilSpread = Math.min(weapon.maxSpread, shooter.recoilSpread + weapon.spread * 0.9);

    if (shooter.id === 'p1') {
      gameStateRef.current.shotsFired += weapon.pellets;
      if (settings.screenShake) {
        gameStateRef.current.screenShake = weapon.category === 'Sniper' ? 8 : (weapon.category === 'Shotgun' ? 6 : 3);
      }
    }

    // Play gunshot sound
    soundEngine.playGunshot(shooter.weaponId as any);

    // Muzzle flash particles
    const barrelDist = shooter.radius + 15;
    const muzzleX = shooter.x + Math.cos(targetAngle) * barrelDist;
    const muzzleY = shooter.y + Math.sin(targetAngle) * barrelDist;

    for (let i = 0; i < 6; i++) {
      const spreadAng = targetAngle + (Math.random() - 0.5) * 0.6;
      const speed = 120 + Math.random() * 180;
      gameStateRef.current.particles.push({
        x: muzzleX,
        y: muzzleY,
        vx: Math.cos(spreadAng) * speed,
        vy: Math.sin(spreadAng) * speed,
        radius: 2 + Math.random() * 2,
        color: weapon.color,
        alpha: 1,
        decay: 8,
        glow: true
      });
    }

    // Spawn bullets (1 for rifles/snipers, multiple for shotgun)
    const pelletCount = weapon.pellets;
    for (let i = 0; i < pelletCount; i++) {
      const currentSpread = shooter.isSliding ? weapon.spread * 0.7 : shooter.recoilSpread;
      const spreadOffset = (Math.random() - 0.5) * currentSpread * (pelletCount > 1 ? 2.2 : 1);
      const bulletAngle = targetAngle + spreadOffset;

      const bulletSpeed = weapon.bulletSpeed;
      const bullet: Bullet = {
        id: Math.random().toString(),
        ownerId: shooter.id,
        team: shooter.team,
        x: muzzleX,
        y: muzzleY,
        prevX: muzzleX,
        prevY: muzzleY,
        vx: Math.cos(bulletAngle) * bulletSpeed,
        vy: Math.sin(bulletAngle) * bulletSpeed,
        damage: weapon.damage,
        headshotMultiplier: weapon.headshotMultiplier,
        color: weapon.color,
        radius: weapon.category === 'Sniper' ? 3.5 : (weapon.category === 'Energy' ? 4 : 2.5),
        life: 0,
        maxLife: 1.4,
        trail: []
      };

      gameStateRef.current.bullets.push(bullet);
    }

    // Auto reload if empty
    if (shooter.ammo <= 0) {
      startReload(shooter);
    }
  };

  const startReload = (p: Player) => {
    if (p.isReloading || p.isDead) return;
    const weapon = WEAPONS[p.weaponId] || WEAPONS.phantom;
    if (p.ammo === weapon.magazineSize) return;

    p.isReloading = true;
    p.reloadProgress = 0;
    soundEngine.playReload();
  };

  // Ability Activation
  const triggerTactical = (p: Player) => {
    if (p.isDead || p.tacticalCooldown > 0) return;
    const hero = HEROES[p.heroId];
    p.tacticalCooldown = hero.tactical.cooldown;
    p.tacticalActiveTime = 2.2;

    soundEngine.playAbilitySound(hero.tactical.id as any);

    if (hero.id === 'spectre') {
      // Void Phase
      gameStateRef.current.abilityEffects.push({
        type: 'void_phase',
        ownerId: p.id,
        team: p.team,
        x: p.x,
        y: p.y,
        radius: 35,
        duration: 2.2,
        maxDuration: 2.2,
        color: '#a855f7'
      });
    } else if (hero.id === 'titan') {
      // Dome Shield
      gameStateRef.current.abilityEffects.push({
        type: 'dome_shield',
        ownerId: p.id,
        team: p.team,
        x: p.x,
        y: p.y,
        radius: 120,
        duration: 5.0,
        maxDuration: 5.0,
        color: '#3b82f6'
      });
    } else if (hero.id === 'blaze') {
      // Curve flash
      const flashX = p.x + Math.cos(p.angle) * 220;
      const flashY = p.y + Math.sin(p.angle) * 220;

      gameStateRef.current.abilityEffects.push({
        type: 'flash_flare',
        ownerId: p.id,
        team: p.team,
        x: flashX,
        y: flashY,
        radius: 280,
        duration: 1.8,
        maxDuration: 1.8,
        color: '#fbbf24'
      });

      // Blind any player looking at flash
      gameStateRef.current.players.forEach(other => {
        if (other.team !== p.team && !other.isDead) {
          const d = Math.hypot(other.x - flashX, other.y - flashY);
          if (d < 380) {
            other.isBlinded = 2.0;
          }
        }
      });
    } else if (hero.id === 'cipher') {
      // Sonar pulse
      gameStateRef.current.abilityEffects.push({
        type: 'sonar_pulse',
        ownerId: p.id,
        team: p.team,
        x: p.x,
        y: p.y,
        radius: 20,
        duration: 2.5,
        maxDuration: 2.5,
        color: '#06b6d4'
      });

      // Reveal all enemies in area
      gameStateRef.current.players.forEach(other => {
        if (other.team !== p.team && !other.isDead) {
          other.isRevealed = 4.0;
        }
      });
    }
  };

  const triggerUltimate = (p: Player) => {
    if (p.isDead || p.ultimateCharge < 100) return;
    p.ultimateCharge = 0;
    p.ultimateActiveTime = 5.0;

    const hero = HEROES[p.heroId];
    if (hero.id === 'titan') {
      // Orbital strike on target area
      const strikeX = p.x + Math.cos(p.angle) * 350;
      const strikeY = p.y + Math.sin(p.angle) * 350;

      gameStateRef.current.abilityEffects.push({
        type: 'orbital_strike',
        ownerId: p.id,
        team: p.team,
        x: strikeX,
        y: strikeY,
        radius: 180,
        duration: 3.5,
        maxDuration: 3.5,
        color: '#ef4444'
      });
    } else if (hero.id === 'blaze') {
      // Instant reload and max shields
      p.ammo = WEAPONS[p.weaponId]?.magazineSize || 30;
      p.shield = p.maxShield;
    } else if (hero.id === 'cipher') {
      // EMP Overload
      gameStateRef.current.players.forEach(other => {
        if (other.team !== p.team && !other.isDead) {
          other.shield = Math.max(0, other.shield - 50);
          other.tacticalCooldown = 4.0;
        }
      });
    }
  };

  // Keyboard and Mouse Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      gameStateRef.current.keysDown.add(e.code);

      // P1 Controls
      if (e.code === 'KeyR') {
        const p1 = gameStateRef.current.players.find(p => p.id === 'p1');
        if (p1) startReload(p1);
      }
      if (e.code === 'KeyQ') {
        const p1 = gameStateRef.current.players.find(p => p.id === 'p1');
        if (p1) triggerTactical(p1);
      }
      if (e.code === 'KeyE') {
        const p1 = gameStateRef.current.players.find(p => p.id === 'p1');
        if (p1) triggerUltimate(p1);
      }

      // Quick weapon switches (1-5)
      const weaponKeys: Record<string, string> = {
        Digit1: 'phantom',
        Digit2: 'viper',
        Digit3: 'valkyrie',
        Digit4: 'bulldog',
        Digit5: 'plasma'
      };
      if (weaponKeys[e.code]) {
        const p1 = gameStateRef.current.players.find(p => p.id === 'p1');
        if (p1 && !p1.isDead) {
          p1.weaponId = weaponKeys[e.code] as any;
          p1.ammo = WEAPONS[weaponKeys[e.code]].magazineSize;
          p1.isReloading = false;
        }
      }

      // P2 Controls in Local PvP
      if (mode === 'local_pvp') {
        const p2 = gameStateRef.current.players.find(p => p.id === 'p2');
        if (p2) {
          if (e.code === 'Numpad4' || e.code === 'KeyU') triggerTactical(p2);
          if (e.code === 'Numpad5' || e.code === 'KeyI') triggerUltimate(p2);
          if (e.code === 'Numpad0' || e.code === 'Enter') {
            fireWeapon(p2, p2.angle);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      gameStateRef.current.keysDown.delete(e.code);
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        gameStateRef.current.mouseDown = true;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        gameStateRef.current.mouseDown = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;

      // Translate mouse pos through camera transform
      const screenX = (e.clientX - rect.left) * scaleX;
      const screenY = (e.clientY - rect.top) * scaleY;

      const worldX = screenX + gameStateRef.current.camera.x;
      const worldY = screenY + gameStateRef.current.camera.y;

      gameStateRef.current.mousePos = { x: worldX, y: worldY };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mode]);

  // Main 128-tick simulated physics & 60-144fps render loop
  useEffect(() => {
    resetRound(1);
    let animationFrameId: number;
    let lastTime = performance.now();
    let tickAccumulator = 0;
    const TICK_DURATION = 1 / 128; // 128 tickrate simulation

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      tickAccumulator += dt;

      // Fixed 128-tick updates
      while (tickAccumulator >= TICK_DURATION) {
        updateSimulation(TICK_DURATION);
        tickAccumulator -= TICK_DURATION;
      }

      // Render frame
      renderCanvas();

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [resetRound]);

  // Simulation step
  const updateSimulation = (dt: number) => {
    const state = gameStateRef.current;
    if (state.isPaused) return;

    // Screen shake decay
    if (state.screenShake > 0) {
      state.screenShake = Math.max(0, state.screenShake - dt * 18);
    }

    const p1 = state.players.find(p => p.id === 'p1');
    const p2 = state.players.find(p => p.id === 'p2');

    // Check round over
    const team1Alive = state.players.filter(p => p.team === 1 && !p.isDead).length;
    const team2Alive = state.players.filter(p => p.team === 2 && !p.isDead).length;

    if ((team1Alive === 0 || team2Alive === 0) && state.roundEndTime === null) {
      state.roundEndTime = Date.now() + 2500;
      const winnerTeam = team1Alive > 0 ? 1 : 2;

      if (winnerTeam === 1) {
        setP1RoundWins(prev => {
          const next = prev + 1;
          if (next >= settings.roundTarget) {
            setTimeout(() => {
              const accuracy = state.shotsFired > 0 ? Math.round((state.shotsHit / state.shotsFired) * 100) : 0;
              onMatchEnd({
                winnerTeam: 1,
                playerKills: p1?.kills || 0,
                playerDeaths: p1?.deaths || 0,
                damageDealt: p1?.damageDealt || 0,
                headshots: p1?.headshots || 0,
                accuracy
              });
            }, 1200);
          }
          return next;
        });
      } else {
        setP2RoundWins(prev => {
          const next = prev + 1;
          if (next >= settings.roundTarget) {
            setTimeout(() => {
              const accuracy = state.shotsFired > 0 ? Math.round((state.shotsHit / state.shotsFired) * 100) : 0;
              onMatchEnd({
                winnerTeam: 2,
                playerKills: p1?.kills || 0,
                playerDeaths: p1?.deaths || 0,
                damageDealt: p1?.damageDealt || 0,
                headshots: p1?.headshots || 0,
                accuracy
              });
            }, 1200);
          }
          return next;
        });
      }
    }

    // Advance round if ended
    if (state.roundEndTime && Date.now() > state.roundEndTime) {
      if (p1RoundWins < settings.roundTarget && p2RoundWins < settings.roundTarget) {
        resetRound(currentRound + 1);
      }
    }

    // Process Pickups
    state.map.pickups.forEach(pickup => {
      if (!pickup.active) {
        pickup.respawnTimer -= dt;
        if (pickup.respawnTimer <= 0) {
          pickup.active = true;
        }
      } else {
        state.players.forEach(p => {
          if (!p.isDead) {
            const dist = Math.hypot(p.x - pickup.x, p.y - pickup.y);
            if (dist < p.radius + pickup.radius) {
              if (pickup.type === 'health' && p.health < p.maxHealth) {
                p.health = Math.min(p.maxHealth, p.health + 50);
                pickup.active = false;
                pickup.respawnTimer = 18;
                soundEngine.playAbilitySound('sonar_pulse');
              } else if (pickup.type === 'shield' && p.shield < p.maxShield) {
                p.shield = Math.min(p.maxShield, p.shield + 50);
                pickup.active = false;
                pickup.respawnTimer = 22;
                soundEngine.playAbilitySound('dome_shield');
              } else if (pickup.type === 'ammo' && p.ammo < (WEAPONS[p.weaponId]?.magazineSize || 30)) {
                p.ammo = WEAPONS[p.weaponId]?.magazineSize || 30;
                pickup.active = false;
                pickup.respawnTimer = 12;
                soundEngine.playReload();
              }
            }
          }
        });
      }
    });

    // Update Ability Effects
    for (let i = state.abilityEffects.length - 1; i >= 0; i--) {
      const eff = state.abilityEffects[i];
      eff.duration -= dt;
      if (eff.duration <= 0) {
        state.abilityEffects.splice(i, 1);
        continue;
      }

      // Orbital strike damages players caught inside periodically
      if (eff.type === 'orbital_strike') {
        state.players.forEach(p => {
          if (!p.isDead && p.team !== eff.team) {
            const d = Math.hypot(p.x - eff.x, p.y - eff.y);
            if (d < eff.radius) {
              applyDamage(p, 45 * dt, eff.ownerId, false);
            }
          }
        });
      }
    }

    // Update Players
    state.players.forEach(player => {
      if (player.isDead) return;

      const hero = HEROES[player.heroId] || HEROES.spectre;
      const weapon = WEAPONS[player.weaponId] || WEAPONS.phantom;

      // Recoil spread recovery
      player.recoilSpread = Math.max(0, player.recoilSpread - dt * weapon.recoilRecovery);

      // Cooldown timers
      if (player.tacticalCooldown > 0) player.tacticalCooldown = Math.max(0, player.tacticalCooldown - dt);
      if (player.tacticalActiveTime > 0) player.tacticalActiveTime = Math.max(0, player.tacticalActiveTime - dt);
      if (player.ultimateActiveTime > 0) player.ultimateActiveTime = Math.max(0, player.ultimateActiveTime - dt);
      if (player.slideCooldown > 0) player.slideCooldown = Math.max(0, player.slideCooldown - dt);
      if (player.dashCooldown > 0) player.dashCooldown = Math.max(0, player.dashCooldown - dt);
      if (player.isBlinded > 0) player.isBlinded = Math.max(0, player.isBlinded - dt);
      if (player.isRevealed > 0) player.isRevealed = Math.max(0, player.isRevealed - dt);

      // Reloading progress
      if (player.isReloading) {
        player.reloadProgress += dt / weapon.reloadTime;
        if (player.reloadProgress >= 1) {
          player.isReloading = false;
          player.ammo = weapon.magazineSize;
          player.reloadProgress = 0;
        }
      }

      // Movement input resolution
      let moveX = 0;
      let moveY = 0;
      let targetAimAngle = player.angle;
      let wantSlide = false;
      let wantDash = false;

      if (player.id === 'p1') {
        // Player 1 controls
        if (state.keysDown.has('KeyW')) moveY -= 1;
        if (state.keysDown.has('KeyS')) moveY += 1;
        if (state.keysDown.has('KeyA')) moveX -= 1;
        if (state.keysDown.has('KeyD')) moveX += 1;

        wantSlide = state.keysDown.has('KeyC') || state.keysDown.has('ControlLeft');
        wantDash = state.keysDown.has('Space');
        player.isSprinting = state.keysDown.has('ShiftLeft');

        targetAimAngle = Math.atan2(state.mousePos.y - player.y, state.mousePos.x - player.x);
        player.angle = targetAimAngle;

        // Auto-firing on mouse hold
        if (state.mouseDown) {
          fireWeapon(player, player.angle);
        }
      } else if (player.id === 'p2' && mode === 'local_pvp') {
        // Player 2 local PvP controls
        if (state.keysDown.has('ArrowUp')) moveY -= 1;
        if (state.keysDown.has('ArrowDown')) moveY += 1;
        if (state.keysDown.has('ArrowLeft')) moveX -= 1;
        if (state.keysDown.has('ArrowRight')) moveX += 1;

        wantSlide = state.keysDown.has('Numpad1') || state.keysDown.has('KeyK');
        wantDash = state.keysDown.has('Numpad2') || state.keysDown.has('KeyL');

        // Aim towards p1
        if (p1) {
          targetAimAngle = Math.atan2(p1.y - player.y, p1.x - player.x);
          player.angle = targetAimAngle;
        }
      } else if (player.isBot) {
        // Bot AI
        const botState = state.botStates.get(player.id);
        if (botState) {
          const aiAction = updateBotAI(
            player,
            state.players,
            state.map.obstacles,
            state.map.pickups,
            state.abilityEffects,
            botState,
            dt
          );

          moveX = aiAction.moveVector.x;
          moveY = aiAction.moveVector.y;
          player.angle = aiAction.aimAngle;

          if (aiAction.shoot) {
            fireWeapon(player, player.angle);
          }
          if (aiAction.tactical) {
            triggerTactical(player);
          }
          wantSlide = aiAction.slide;
        }
      }

      // Slide mechanic
      const isMoving = Math.abs(moveX) > 0 || Math.abs(moveY) > 0;
      if (wantSlide && isMoving && player.slideCooldown <= 0 && !player.isSliding) {
        player.isSliding = true;
        player.slideTimer = 0.45;
        player.slideCooldown = 1.6;
        soundEngine.playSlide();

        // Slide trail particles
        for (let i = 0; i < 8; i++) {
          state.particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 50,
            vy: (Math.random() - 0.5) * 50,
            radius: 4,
            color: '#64748b',
            alpha: 0.8,
            decay: 3
          });
        }
      }

      if (player.isSliding) {
        player.slideTimer -= dt;
        if (player.slideTimer <= 0) {
          player.isSliding = false;
        }
      }

      // Tactical Dash mechanic
      if (wantDash && isMoving && player.dashCooldown <= 0 && !player.isDashing) {
        player.isDashing = true;
        player.dashTimer = 0.15;
        player.dashCooldown = 3.5;
        soundEngine.playDash();

        // Ghost trail particles
        for (let i = 0; i < 12; i++) {
          state.particles.push({
            x: player.x,
            y: player.y,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            radius: player.radius,
            color: hero.accentColor,
            alpha: 0.7,
            decay: 4,
            glow: true
          });
        }
      }

      if (player.isDashing) {
        player.dashTimer -= dt;
        if (player.dashTimer <= 0) {
          player.isDashing = false;
        }
      }

      // Speed multipliers
      let currentSpeed = hero.speed;
      if (player.isSliding) currentSpeed *= 1.8;
      if (player.isDashing) currentSpeed *= 3.2;
      if (player.isSprinting && !player.isSliding) currentSpeed *= 1.25;
      if (player.tacticalActiveTime > 0 && player.heroId === 'spectre') currentSpeed *= 1.4;

      const norm = Math.hypot(moveX, moveY);
      if (norm > 0) {
        moveX = (moveX / norm) * currentSpeed;
        moveY = (moveY / norm) * currentSpeed;
      }

      // Smooth velocity interpolation
      player.vx = player.vx * 0.8 + moveX * 0.2;
      player.vy = player.vy * 0.8 + moveY * 0.2;

      let nextX = player.x + player.vx * dt;
      let nextY = player.y + player.vy * dt;

      // Obstacle collision & jump pads
      state.map.obstacles.forEach(obs => {
        if (obs.type === 'jumppad') {
          // Check jump pad activation
          if (
            nextX >= obs.x &&
            nextX <= obs.x + obs.w &&
            nextY >= obs.y &&
            nextY <= obs.y + obs.h
          ) {
            // Propel player in their moving direction with burst
            player.vx *= 2.2;
            player.vy *= 2.2;
            soundEngine.playDash();
          }
          return;
        }

        const resolved = resolveCircleBoxCollision(
          { x: nextX, y: nextY, radius: player.radius },
          obs
        );
        nextX = resolved.x;
        nextY = resolved.y;
      });

      player.x = nextX;
      player.y = nextY;
    });

    // Update Bullets with Continuous Collision Detection
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      const b = state.bullets[i];
      b.life += dt;
      if (b.life >= b.maxLife) {
        state.bullets.splice(i, 1);
        continue;
      }

      b.prevX = b.x;
      b.prevY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > 5) b.trail.shift();

      let bulletConsumed = false;

      // Check Dome Shield collisions
      for (const eff of state.abilityEffects) {
        if (eff.type === 'dome_shield') {
          const dStart = Math.hypot(b.prevX - eff.x, b.prevY - eff.y);
          const dEnd = Math.hypot(b.x - eff.x, b.y - eff.y);
          // If bullet crosses dome boundary
          if ((dStart < eff.radius && dEnd >= eff.radius) || (dStart >= eff.radius && dEnd < eff.radius)) {
            bulletConsumed = true;
            soundEngine.playShieldBreak();
            // Shield hit spark
            for (let k = 0; k < 6; k++) {
              state.particles.push({
                x: b.x,
                y: b.y,
                vx: (Math.random() - 0.5) * 120,
                vy: (Math.random() - 0.5) * 120,
                radius: 3,
                color: eff.color,
                alpha: 1,
                decay: 6,
                glow: true
              });
            }
            break;
          }
        }
      }
      if (bulletConsumed) {
        state.bullets.splice(i, 1);
        continue;
      }

      // Check Obstacle collisions
      for (const obs of state.map.obstacles) {
        if (obs.type === 'jumppad') continue;
        const hit = getLineAABBIntersection({ x: b.prevX, y: b.prevY }, { x: b.x, y: b.y }, obs);
        if (hit.hit && hit.point) {
          bulletConsumed = true;

          // Wall ricochet sparks
          for (let k = 0; k < 5; k++) {
            state.particles.push({
              x: hit.point.x,
              y: hit.point.y,
              vx: (Math.random() - 0.5) * 140,
              vy: (Math.random() - 0.5) * 140,
              radius: 2,
              color: '#fde047',
              alpha: 1,
              decay: 7
            });
          }
          break;
        }
      }
      if (bulletConsumed) {
        state.bullets.splice(i, 1);
        continue;
      }

      // Check Player hitscan / projectile collision
      for (const target of state.players) {
        if (target.team === b.team || target.isDead) continue;
        if (target.tacticalActiveTime > 0 && target.heroId === 'spectre') continue; // Intangible in void

        const hit = getLineCircleIntersection(
          { x: b.prevX, y: b.prevY },
          { x: b.x, y: b.y },
          { x: target.x, y: target.y },
          target.radius
        );

        if (hit.hit && hit.point) {
          bulletConsumed = true;

          // Headshot detection!
          const isHeadshot = evaluateHeadshot(target, hit.point);
          const finalDamage = isHeadshot ? b.damage * b.headshotMultiplier : b.damage;

          if (b.ownerId === 'p1') {
            state.shotsHit += 1;
          }

          applyDamage(target, finalDamage, b.ownerId, isHeadshot);

          // Impact particles
          const sparkColor = target.shield > 0 ? '#38bdf8' : (settings.bloodParticles ? '#ef4444' : '#f97316');
          for (let k = 0; k < (isHeadshot ? 12 : 7); k++) {
            state.particles.push({
              x: hit.point.x,
              y: hit.point.y,
              vx: (Math.random() - 0.5) * 160,
              vy: (Math.random() - 0.5) * 160,
              radius: isHeadshot ? 3.5 : 2,
              color: sparkColor,
              alpha: 1,
              decay: 5,
              glow: isHeadshot
            });
          }
          break;
        }
      }

      if (bulletConsumed) {
        state.bullets.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        state.particles.splice(i, 1);
      }
    }

    // Update Floating Damage Numbers
    for (let i = state.damageNumbers.length - 1; i >= 0; i--) {
      const dn = state.damageNumbers[i];
      dn.y += dn.vy * dt;
      dn.alpha -= 1.6 * dt;
      if (dn.alpha <= 0) {
        state.damageNumbers.splice(i, 1);
      }
    }

    // Update Camera (tracks Player 1 with smooth lerp and slight lookahead)
    if (p1 && canvasRef.current) {
      const lookaheadX = (state.mousePos.x - p1.x) * 0.15;
      const lookaheadY = (state.mousePos.y - p1.y) * 0.15;
      const targetCamX = p1.x + lookaheadX - canvasRef.current.width / 2;
      const targetCamY = p1.y + lookaheadY - canvasRef.current.height / 2;

      state.camera.x += (targetCamX - state.camera.x) * 0.12;
      state.camera.y += (targetCamY - state.camera.y) * 0.12;

      // Clamp camera inside map bounds
      state.camera.x = Math.max(0, Math.min(state.map.width - canvasRef.current.width, state.camera.x));
      state.camera.y = Math.max(0, Math.min(state.map.height - canvasRef.current.height, state.camera.y));
    }

    // Push HUD updates to React
    if (p1) {
      onUpdateHUD({
        player: p1,
        p2: p2,
        p1Score: p1RoundWins,
        p2Score: p2RoundWins,
        roundTarget: settings.roundTarget,
        killfeed: state.killfeed,
        currentRound
      });
    }
  };

  // Damage calculation & killfeed
  const applyDamage = (target: Player, damage: number, attackerId: string, isHeadshot: boolean) => {
    const state = gameStateRef.current;
    const roundedDamage = Math.round(damage);
    const attacker = state.players.find(p => p.id === attackerId);

    const hadShield = target.shield > 0;
    if (target.shield > 0) {
      if (target.shield >= roundedDamage) {
        target.shield -= roundedDamage;
      } else {
        const remaining = roundedDamage - target.shield;
        target.shield = 0;
        target.health = Math.max(0, target.health - remaining);
        soundEngine.playShieldBreak();
      }
    } else {
      target.health = Math.max(0, target.health - roundedDamage);
    }

    // Sound effects
    if (attackerId === 'p1') {
      if (isHeadshot) {
        soundEngine.playHeadshot();
      } else {
        soundEngine.playHitmarker();
      }
    }

    // Record attacker stats
    if (attacker) {
      attacker.damageDealt += roundedDamage;
      attacker.score += roundedDamage;
      attacker.ultimateCharge = Math.min(100, attacker.ultimateCharge + (isHeadshot ? 15 : 8));
      if (isHeadshot) attacker.headshots += 1;

      // Blaze passive adrenaline rush
      if (attacker.heroId === 'blaze') {
        attacker.vx *= 1.2;
        attacker.vy *= 1.2;
      }
    }

    // Spawn damage number
    if (settings.damageNumbers) {
      state.damageNumbers.push({
        id: Math.random().toString(),
        x: target.x + (Math.random() - 0.5) * 20,
        y: target.y - 25,
        damage: roundedDamage,
        isHeadshot,
        isShield: hadShield && target.shield > 0,
        alpha: 1,
        vy: -55
      });
    }

    // Check elimination
    if (target.health <= 0 && !target.isDead) {
      target.isDead = true;
      target.deaths += 1;

      if (attacker) {
        attacker.kills += 1;
        attacker.score += 250;
        attacker.ultimateCharge = Math.min(100, attacker.ultimateCharge + 25);
        if (attacker.id === 'p1') {
          soundEngine.playKillChime(attacker.kills);
        }
      }

      // Add to killfeed
      const weaponName = attacker ? (WEAPONS[attacker.weaponId]?.name || 'Rifle') : 'Combat';
      state.killfeed.unshift({
        id: Math.random().toString(),
        killerName: attacker?.name || 'Hazard',
        killerTeam: attacker?.team || 1,
        victimName: target.name,
        victimTeam: target.team,
        weaponName,
        isHeadshot,
        timestamp: Date.now()
      });

      if (state.killfeed.length > 5) {
        state.killfeed.pop();
      }
    }
  };

  // Rendering
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const state = gameStateRef.current;
    const map = state.map;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (state.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * state.screenShake * 2;
      shakeY = (Math.random() - 0.5) * state.screenShake * 2;
    }

    // Translate to Camera
    ctx.translate(-state.camera.x + shakeX, -state.camera.y + shakeY);

    // 1. Draw Tactical Floor & Arena Grid
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, map.width, map.height);

    // Subtle tactical grid
    ctx.strokeStyle = '#1e293b22';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = 0; x < map.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, map.height);
      ctx.stroke();
    }
    for (let y = 0; y < map.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(map.width, y);
      ctx.stroke();
    }

    // Symmetrical center ring
    ctx.strokeStyle = '#38bdf818';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(map.width / 2, map.height / 2, 140, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Draw Pickups
    map.pickups.forEach(pickup => {
      ctx.save();
      if (pickup.active) {
        const pulse = Math.sin(Date.now() * 0.006) * 3;
        ctx.shadowBlur = 12;
        if (pickup.type === 'health') {
          ctx.shadowColor = '#22c55e';
          ctx.fillStyle = '#16a34a';
          ctx.beginPath();
          ctx.arc(pickup.x, pickup.y, pickup.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('+', pickup.x, pickup.y);
        } else if (pickup.type === 'shield') {
          ctx.shadowColor = '#38bdf8';
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(pickup.x, pickup.y, pickup.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('SH', pickup.x, pickup.y);
        } else {
          ctx.shadowColor = '#f59e0b';
          ctx.fillStyle = '#d97706';
          ctx.beginPath();
          ctx.arc(pickup.x, pickup.y, pickup.radius + pulse, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('AM', pickup.x, pickup.y);
        }
      } else {
        ctx.strokeStyle = '#334155';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(pickup.x, pickup.y, pickup.radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 3. Draw Ability Effects (Dome Shield, Flash, Sonar)
    state.abilityEffects.forEach(eff => {
      ctx.save();
      if (eff.type === 'dome_shield') {
        const alpha = (eff.duration / eff.maxDuration) * 0.45;
        ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.arc(eff.x, eff.y, eff.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (eff.type === 'orbital_strike') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(eff.x, eff.y, eff.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (eff.type === 'sonar_pulse') {
        const progress = 1 - (eff.duration / eff.maxDuration);
        const radius = eff.radius + progress * 320;
        ctx.strokeStyle = `rgba(6, 182, 212, ${1 - progress})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(eff.x, eff.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    // 4. Draw Map Obstacles
    map.obstacles.forEach(obs => {
      ctx.save();
      if (obs.type === 'jumppad') {
        ctx.fillStyle = '#0369a1';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#38bdf8';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

        // Arrows indicating direction
        ctx.fillStyle = '#e0f2fe';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', obs.x + obs.w / 2, obs.y + obs.h / 2);
      } else {
        // Wall drop shadow
        ctx.shadowColor = '#00000088';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetY = 6;

        ctx.fillStyle = obs.color || '#1e293b';
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

        // Neon border highlight
        ctx.shadowBlur = 0;
        ctx.strokeStyle = obs.type === 'cover' ? '#475569' : '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);

        // Diagonal hazard stripes on tactical covers
        if (obs.type === 'cover') {
          ctx.strokeStyle = '#fbbf2422';
          ctx.lineWidth = 1;
          for (let p = 0; p < obs.w + obs.h; p += 20) {
            ctx.beginPath();
            ctx.moveTo(obs.x + p, obs.y);
            ctx.lineTo(obs.x, obs.y + p);
            ctx.stroke();
          }
        }
      }
      ctx.restore();
    });

    // 5. Draw Bullets & Trails
    state.bullets.forEach(b => {
      ctx.save();
      // Bullet trail
      if (b.trail.length > 1) {
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.radius * 1.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(b.trail[0].x, b.trail[0].y);
        for (let k = 1; k < b.trail.length; k++) {
          ctx.lineTo(b.trail[k].x, b.trail[k].y);
        }
        ctx.stroke();
      }

      // Glowing bullet head
      ctx.fillStyle = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 6. Draw Particles
    state.particles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.alpha);
      if (p.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 7. Draw Players
    state.players.forEach(player => {
      if (player.isDead) return;

      const hero = HEROES[player.heroId] || HEROES.spectre;
      const isP1 = player.id === 'p1';
      const isFriendly = player.team === 1;

      ctx.save();

      // Void Phase transparency
      if (player.tacticalActiveTime > 0 && player.heroId === 'spectre') {
        ctx.globalAlpha = 0.35;
      }

      // Draw shadow
      ctx.shadowColor = '#00000099';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;

      // Draw Gun Barrel
      const barrelLen = player.radius + 14;
      const barrelWidth = 6;
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.angle);
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, -barrelWidth / 2, barrelLen, barrelWidth);

      // Gun muzzle tip
      const weapon = WEAPONS[player.weaponId] || WEAPONS.phantom;
      ctx.fillStyle = weapon.color;
      ctx.fillRect(barrelLen - 4, -barrelWidth / 2, 4, barrelWidth);
      ctx.restore();

      // Player Body Circle
      ctx.fillStyle = isFriendly ? '#0284c7' : '#dc2626';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
      ctx.fill();

      // Hero Outer Trim
      ctx.strokeStyle = hero.accentColor;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Directional Head / Visor Apex (indicates headshot orientation clearly!)
      const headDist = player.radius * 0.45;
      const headRadius = player.radius * 0.45;
      const headX = player.x + Math.cos(player.angle) * headDist;
      const headY = player.y + Math.sin(player.angle) * headDist;

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius, 0, Math.PI * 2);
      ctx.fill();

      // Glowing tactical visor line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(headX, headY, headRadius * 0.8, player.angle - 0.7, player.angle + 0.7);
      ctx.stroke();

      // Health and Shield circular arc gauges above player
      const barY = player.y - player.radius - 14;
      const barW = 44;
      const barH = 5;

      // HP background
      ctx.fillStyle = '#0f172a88';
      ctx.fillRect(player.x - barW / 2, barY, barW, barH);

      // HP fill
      const hpPct = Math.max(0, player.health / player.maxHealth);
      ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : '#ef4444';
      ctx.fillRect(player.x - barW / 2, barY, barW * hpPct, barH);

      // Shield bar above HP
      if (player.maxShield > 0) {
        const shieldPct = Math.max(0, player.shield / player.maxShield);
        ctx.fillStyle = '#0284c788';
        ctx.fillRect(player.x - barW / 2, barY - 4, barW, 3);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(player.x - barW / 2, barY - 4, barW * shieldPct, 3);
      }

      // Name & Hero tag
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(player.name, player.x, barY - 8);

      ctx.restore();
    });

    // 8. Draw Damage Numbers
    state.damageNumbers.forEach(dn => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, dn.alpha);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      if (dn.isHeadshot) {
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#facc15'; // Golden yellow for headshot
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;
        ctx.fillText(`CRIT ${dn.damage}!`, dn.x, dn.y);
      } else if (dn.isShield) {
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#38bdf8'; // Cyan for shield hit
        ctx.fillText(`${dn.damage}`, dn.x, dn.y);
      } else {
        ctx.font = 'bold 14px monospace';
        ctx.fillStyle = '#f8fafc'; // White for body hit
        ctx.fillText(`${dn.damage}`, dn.x, dn.y);
      }
      ctx.restore();
    });

    // 9. Crosshair & Flashbang Overlays
    ctx.restore(); // Return to screen space

    // Blinding Flash Effect
    const p1Player = state.players.find(p => p.id === 'p1');
    if (p1Player && p1Player.isBlinded > 0) {
      const blindAlpha = Math.min(1, p1Player.isBlinded / 1.5);
      ctx.fillStyle = `rgba(255, 255, 255, ${blindAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Custom Tactical Crosshair at Mouse Position
    const crosshair = settings.crosshair;
    const mouseX = state.mousePos.x - state.camera.x + shakeX;
    const mouseY = state.mousePos.y - state.camera.y + shakeY;

    ctx.save();
    ctx.strokeStyle = crosshair.color;
    ctx.lineWidth = crosshair.thickness;

    const dynamicGap = crosshair.gap + (p1Player && crosshair.dynamicBloom ? p1Player.recoilSpread * 140 : 0);
    const size = crosshair.size;

    // Center dot
    if (crosshair.dot) {
      ctx.fillStyle = crosshair.color;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, crosshair.thickness, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4 crosshair prongs
    ctx.beginPath();
    // Top
    ctx.moveTo(mouseX, mouseY - dynamicGap);
    ctx.lineTo(mouseX, mouseY - dynamicGap - size);
    // Bottom
    ctx.moveTo(mouseX, mouseY + dynamicGap);
    ctx.lineTo(mouseX, mouseY + dynamicGap + size);
    // Left
    ctx.moveTo(mouseX - dynamicGap, mouseY);
    ctx.lineTo(mouseX - dynamicGap - size, mouseY);
    // Right
    ctx.moveTo(mouseX + dynamicGap, mouseY);
    ctx.lineTo(mouseX + dynamicGap + size, mouseY);
    ctx.stroke();
    ctx.restore();

    // 10. Minimap Radar (Top-Right)
    const mapW = 160;
    const mapH = (map.height / map.width) * mapW;
    const mapX = canvas.width - mapW - 20;
    const mapY = 20;

    ctx.save();
    ctx.fillStyle = '#0f172aee';
    ctx.fillRect(mapX, mapY, mapW, mapH);
    ctx.strokeStyle = '#38bdf855';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mapX, mapY, mapW, mapH);

    const scaleX = mapW / map.width;
    const scaleY = mapH / map.height;

    // Minimap obstacles
    ctx.fillStyle = '#334155';
    map.obstacles.forEach(obs => {
      ctx.fillRect(mapX + obs.x * scaleX, mapY + obs.y * scaleY, obs.w * scaleX, obs.h * scaleY);
    });

    // Minimap players
    state.players.forEach(p => {
      if (p.isDead) return;
      const px = mapX + p.x * scaleX;
      const py = mapY + p.y * scaleY;

      ctx.fillStyle = p.team === 1 ? '#38bdf8' : '#ef4444';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Vision cone
      ctx.strokeStyle = p.team === 1 ? '#38bdf866' : '#ef444444';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(p.angle) * 10, py + Math.sin(p.angle) * 10);
      ctx.stroke();
    });

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-contain cursor-crosshair"
      />
    </div>
  );
};
