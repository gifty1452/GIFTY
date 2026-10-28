import { Player, MapObstacle, Pickup, Vector2, ActiveAbilityEffect } from '../types/game';
import { hasLineOfSight } from './physics';
import { WEAPONS } from './constants';

export interface BotState {
  targetPlayerId: string | null;
  lastKnownPos: Vector2 | null;
  reactionTimer: number;
  strafeTimer: number;
  strafeDirection: number; // 1 or -1
  isPeeking: boolean;
  coverPoint: Vector2 | null;
  desiredAngle: number;
  wantsToShoot: boolean;
  wantsToTactical: boolean;
  wantsToSlide: boolean;
}

export function updateBotAI(
  bot: Player,
  players: Player[],
  obstacles: MapObstacle[],
  pickups: Pickup[],
  abilityEffects: ActiveAbilityEffect[],
  botState: BotState,
  deltaTime: number
): { moveVector: Vector2; aimAngle: number; shoot: boolean; tactical: boolean; slide: boolean } {
  // Find closest living enemy
  const enemies = players.filter(p => p.team !== bot.team && !p.isDead);
  let closestEnemy: Player | null = null;
  let minDist = Infinity;

  for (const enemy of enemies) {
    const dist = Math.hypot(enemy.x - bot.x, enemy.y - bot.y);
    if (dist < minDist) {
      minDist = dist;
      closestEnemy = enemy;
    }
  }

  // Set difficulty traits
  const difficulty = bot.botDifficulty || 'medium';
  let aimSmoothing = 8;
  let reactionDelay = 0.25;
  let inaccuracy = 0.08;

  if (difficulty === 'easy') {
    aimSmoothing = 4;
    reactionDelay = 0.45;
    inaccuracy = 0.16;
  } else if (difficulty === 'hard') {
    aimSmoothing = 14;
    reactionDelay = 0.16;
    inaccuracy = 0.04;
  } else if (difficulty === 'predator') {
    aimSmoothing = 22;
    reactionDelay = 0.08;
    inaccuracy = 0.015;
  }

  let moveX = 0;
  let moveY = 0;
  let shoot = false;
  let tactical = false;
  let slide = false;

  botState.strafeTimer -= deltaTime;
  if (botState.strafeTimer <= 0) {
    botState.strafeTimer = 0.4 + Math.random() * 0.6;
    botState.strafeDirection = Math.random() > 0.5 ? 1 : -1;
  }

  if (closestEnemy) {
    const canSee = hasLineOfSight(
      { x: bot.x, y: bot.y },
      { x: closestEnemy.x, y: closestEnemy.y },
      obstacles
    );

    if (canSee) {
      botState.lastKnownPos = { x: closestEnemy.x, y: closestEnemy.y };
      botState.reactionTimer += deltaTime;

      // Calculate desired aim angle
      const directAngle = Math.atan2(closestEnemy.y - bot.y, closestEnemy.x - bot.x);
      // Small predictable inaccuracy
      const noisyAngle = directAngle + (Math.sin(Date.now() * 0.005) * inaccuracy);
      botState.desiredAngle = noisyAngle;

      if (botState.reactionTimer >= reactionDelay) {
        shoot = true;
      }

      // Tactical decision:
      // If low health and Titan, drop dome shield!
      if (bot.health + bot.shield < 80 && bot.heroId === 'titan' && bot.tacticalCooldown <= 0) {
        tactical = true;
      }
      // If Spectre is critically low, Void Phase to escape
      if (bot.health < 40 && bot.heroId === 'spectre' && bot.tacticalCooldown <= 0) {
        tactical = true;
      }
      // If Blaze sees enemy within 350px, flash them!
      if (minDist < 350 && bot.heroId === 'blaze' && bot.tacticalCooldown <= 0) {
        tactical = true;
      }
      // If Cipher, sonar ping to reveal
      if (bot.heroId === 'cipher' && bot.tacticalCooldown <= 0) {
        tactical = true;
      }

      // Movement logic in combat: Strafe and maintain optimal weapon range
      const weapon = WEAPONS[bot.weaponId] || WEAPONS.phantom;
      let optimalDistance = 350;
      if (weapon.category === 'Shotgun') optimalDistance = 140;
      if (weapon.category === 'Sniper') optimalDistance = 550;
      if (weapon.category === 'SMG') optimalDistance = 220;

      const angleToEnemy = Math.atan2(closestEnemy.y - bot.y, closestEnemy.x - bot.x);
      const strafeAngle = angleToEnemy + (Math.PI / 2) * botState.strafeDirection;

      if (minDist > optimalDistance + 60) {
        // Advance while strafing
        moveX = Math.cos(angleToEnemy) * 0.7 + Math.cos(strafeAngle) * 0.5;
        moveY = Math.sin(angleToEnemy) * 0.7 + Math.sin(strafeAngle) * 0.5;
        // Occasionally slide into engagement
        if (minDist > 300 && bot.slideCooldown <= 0 && Math.random() < 0.15) {
          slide = true;
        }
      } else if (minDist < optimalDistance - 60) {
        // Retreat while strafing
        moveX = -Math.cos(angleToEnemy) * 0.8 + Math.cos(strafeAngle) * 0.4;
        moveY = -Math.sin(angleToEnemy) * 0.8 + Math.sin(strafeAngle) * 0.4;
      } else {
        // Pure strafe jiggle
        moveX = Math.cos(strafeAngle);
        moveY = Math.sin(strafeAngle);
      }
    } else {
      // Enemy out of sight: investigate last known pos or search pickups
      botState.reactionTimer = 0;
      shoot = false;

      // If low on HP/shield, seek nearest active pickup
      let targetPickup: Pickup | null = null;
      if (bot.health < 60 || bot.shield < 40) {
        const available = pickups.filter(p => p.active);
        let bestDist = Infinity;
        for (const p of available) {
          const d = Math.hypot(p.x - bot.x, p.y - bot.y);
          if (d < bestDist) {
            bestDist = d;
            targetPickup = p;
          }
        }
      }

      const dest = targetPickup ? { x: targetPickup.x, y: targetPickup.y } : (botState.lastKnownPos || { x: 700, y: 450 });
      const angleToDest = Math.atan2(dest.y - bot.y, dest.x - bot.x);

      moveX = Math.cos(angleToDest);
      moveY = Math.sin(angleToDest);
      botState.desiredAngle = angleToDest;
    }
  } else {
    // Wander towards center
    const centerAngle = Math.atan2(450 - bot.y, 700 - bot.x);
    moveX = Math.cos(centerAngle) * 0.5;
    moveY = Math.sin(centerAngle) * 0.5;
    botState.desiredAngle = centerAngle;
  }

  // Smooth rotation
  let angleDiff = botState.desiredAngle - bot.angle;
  // Normalize angle difference to [-PI, PI]
  while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
  while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

  const newAngle = bot.angle + angleDiff * Math.min(1, deltaTime * aimSmoothing);

  // Normalize move vector
  const moveLen = Math.hypot(moveX, moveY);
  if (moveLen > 0.001) {
    moveX /= moveLen;
    moveY /= moveLen;
  }

  return {
    moveVector: { x: moveX, y: moveY },
    aimAngle: newAngle,
    shoot,
    tactical,
    slide
  };
}
