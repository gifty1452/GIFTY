import { Vector2, MapObstacle, Player, Bullet } from '../types/game';

// Check intersection between two line segments (p1 -> p2) and (p3 -> p4)
export function getLineIntersection(
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  p4: Vector2
): { hit: boolean; point?: Vector2; dist?: number } {
  const dX = p2.x - p1.x;
  const dY = p2.y - p1.y;
  const sX = p4.x - p3.x;
  const sY = p4.y - p3.y;

  const denom = dX * sY - dY * sX;
  if (Math.abs(denom) < 0.00001) return { hit: false };

  const s = (-dY * (p1.x - p3.x) + dX * (p1.y - p3.y)) / denom;
  const t = (sX * (p1.y - p3.y) - sY * (p1.x - p3.x)) / denom;

  if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
    const ix = p1.x + t * dX;
    const iy = p1.y + t * dY;
    const dist = Math.hypot(ix - p1.x, iy - p1.y);
    return { hit: true, point: { x: ix, y: iy }, dist };
  }

  return { hit: false };
}

// Check if a line segment intersects an axis-aligned bounding box (obstacle)
export function getLineAABBIntersection(
  start: Vector2,
  end: Vector2,
  obs: MapObstacle
): { hit: boolean; point?: Vector2; dist?: number } {
  const minX = obs.x;
  const maxX = obs.x + obs.w;
  const minY = obs.y;
  const maxY = obs.y + obs.h;

  const segs: [Vector2, Vector2][] = [
    [{ x: minX, y: minY }, { x: maxX, y: minY }],
    [{ x: maxX, y: minY }, { x: maxX, y: maxY }],
    [{ x: maxX, y: maxY }, { x: minX, y: maxY }],
    [{ x: minX, y: maxY }, { x: minX, y: minY }]
  ];

  let closestHit: { hit: boolean; point?: Vector2; dist?: number } = { hit: false };
  let minDist = Infinity;

  for (const [p3, p4] of segs) {
    const inter = getLineIntersection(start, end, p3, p4);
    if (inter.hit && inter.dist !== undefined && inter.dist < minDist) {
      minDist = inter.dist;
      closestHit = inter;
    }
  }

  return closestHit;
}

// Check circle vs line segment collision for precise bullet hits against player
export function getLineCircleIntersection(
  start: Vector2,
  end: Vector2,
  center: Vector2,
  radius: number
): { hit: boolean; dist?: number; point?: Vector2 } {
  const dX = end.x - start.x;
  const dY = end.y - start.y;
  const segLenSq = dX * dX + dY * dY;

  if (segLenSq === 0) {
    const distSq = (start.x - center.x) ** 2 + (start.y - center.y) ** 2;
    if (distSq <= radius * radius) {
      return { hit: true, dist: 0, point: { ...start } };
    }
    return { hit: false };
  }

  // Projection of center onto segment
  const t = Math.max(0, Math.min(1, ((center.x - start.x) * dX + (center.y - start.y) * dY) / segLenSq));
  const projX = start.x + t * dX;
  const projY = start.y + t * dY;

  const distSq = (center.x - projX) ** 2 + (center.y - projY) ** 2;
  if (distSq <= radius * radius) {
    const dist = Math.hypot(projX - start.x, projY - start.y);
    return { hit: true, dist, point: { x: projX, y: projY } };
  }

  return { hit: false };
}

// Smooth circle vs Box resolution for player movement
export function resolveCircleBoxCollision(
  circle: { x: number; y: number; radius: number },
  box: { x: number; y: number; w: number; h: number }
): { x: number; y: number; collided: boolean } {
  // Find closest point on box to circle center
  const closestX = Math.max(box.x, Math.min(circle.x, box.x + box.w));
  const closestY = Math.max(box.y, Math.min(circle.y, box.y + box.h));

  const distX = circle.x - closestX;
  const distY = circle.y - closestY;
  const distSq = distX * distX + distY * distY;

  if (distSq < circle.radius * circle.radius) {
    const dist = Math.sqrt(distSq);
    if (dist === 0) {
      // Inside box, push out towards nearest edge
      return { x: circle.x + circle.radius, y: circle.y, collided: true };
    }
    const overlap = circle.radius - dist;
    const nx = distX / dist;
    const ny = distY / dist;
    return {
      x: circle.x + nx * overlap,
      y: circle.y + ny * overlap,
      collided: true
    };
  }

  return { x: circle.x, y: circle.y, collided: false };
}

// Raycast Line of Sight (LOS) between two points
export function hasLineOfSight(start: Vector2, end: Vector2, obstacles: MapObstacle[]): boolean {
  for (const obs of obstacles) {
    if (obs.type === 'jumppad') continue; // jump pads don't block sight
    const hit = getLineAABBIntersection(start, end, obs);
    if (hit.hit) {
      return false;
    }
  }
  return true;
}

// Check whether hit is a Headshot:
// The head is modeled as an apex circle in front of player's center along their aim angle
export function evaluateHeadshot(player: Player, hitPoint: Vector2): boolean {
  const headDistance = player.radius * 0.45;
  const headRadius = player.radius * 0.45;
  const headCenter = {
    x: player.x + Math.cos(player.angle) * headDistance,
    y: player.y + Math.sin(player.angle) * headDistance
  };

  const distToHead = Math.hypot(hitPoint.x - headCenter.x, hitPoint.y - headCenter.y);
  return distToHead <= headRadius;
}
