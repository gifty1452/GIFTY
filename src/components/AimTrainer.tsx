import React, { useRef, useEffect, useState } from 'react';
import { WeaponId, GameSettings } from '../types/game';
import { WEAPONS } from '../game/constants';
import { soundEngine } from '../audio/soundEngine';
import { Target, RotateCcw, Crosshair, ArrowLeft, Zap } from 'lucide-react';

interface AimTrainerProps {
  weaponId: WeaponId;
  settings: GameSettings;
  onBackToMenu: () => void;
}

interface AimTarget {
  id: number;
  x: number;
  y: number;
  radius: number;
  spawnTime: number;
  duration: number;
  isHeadshotZone: boolean;
}

interface BulletHole {
  x: number;
  y: number;
  isHeadshot: boolean;
  time: number;
}

export const AimTrainer: React.FC<AimTrainerProps> = ({
  weaponId,
  settings,
  onBackToMenu
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeWeaponId, setActiveWeaponId] = useState<WeaponId>(weaponId);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [headshots, setHeadshots] = useState(0);
  const [misses, setMisses] = useState(0);
  const [avgReactionTime, setAvgReactionTime] = useState(0);
  const [timer, setTimer] = useState(45);
  const [isRunning, setIsRunning] = useState(true);

  const targetsRef = useRef<AimTarget[]>([]);
  const bulletHolesRef = useRef<BulletHole[]>([]);
  const nextTargetId = useRef(1);
  const reactionTimesRef = useRef<number[]>([]);
  const ammoRef = useRef(WEAPONS[activeWeaponId].magazineSize);
  const isReloadingRef = useRef(false);

  // Spawn targets periodically
  const spawnTarget = () => {
    if (!canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;

    const margin = 100;
    const x = margin + Math.random() * (width - margin * 2);
    const y = margin + Math.random() * (height - margin * 2 - 80);

    targetsRef.current.push({
      id: nextTargetId.current++,
      x,
      y,
      radius: 28,
      spawnTime: performance.now(),
      duration: 2200,
      isHeadshotZone: true
    });
  };

  useEffect(() => {
    // Populate initial 3 targets
    targetsRef.current = [];
    for (let i = 0; i < 3; i++) {
      spawnTarget();
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Main Canvas render loop
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = '#1e293b33';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Target Practice Bot Circles
      const now = performance.now();
      targetsRef.current = targetsRef.current.filter(t => {
        const age = now - t.spawnTime;
        if (age > t.duration) {
          setMisses(m => m + 1);
          spawnTarget();
          return false;
        }
        return true;
      });

      targetsRef.current.forEach(t => {
        const age = now - t.spawnTime;
        const scale = Math.min(1, age / 150);

        // Outer body ring
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner Headshot bullseye
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(t.x, t.y, (t.radius * 0.45) * scale, 0, Math.PI * 2);
        ctx.fill();

        // Center dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(t.x, t.y, (t.radius * 0.15) * scale, 0, Math.PI * 2);
        ctx.fill();

        // Shrinking timer ring
        const remaining = 1 - (age / t.duration);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(t.x, t.y, (t.radius + 6) * scale, 0, Math.PI * 2 * remaining);
        ctx.stroke();
      });

      // Draw Bullet Holes on Wall (Recoil spray grouping visualization)
      bulletHolesRef.current.forEach(h => {
        ctx.fillStyle = h.isHeadshot ? '#facc15' : '#38bdf8';
        ctx.shadowBlur = 6;
        ctx.shadowColor = h.isHeadshot ? '#eab308' : '#0284c7';
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.isHeadshot ? 4 : 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isRunning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Fire weapon
    const weapon = WEAPONS[activeWeaponId];
    if (ammoRef.current <= 0) {
      soundEngine.playReload();
      ammoRef.current = weapon.magazineSize;
      return;
    }

    ammoRef.current -= 1;
    soundEngine.playGunshot(activeWeaponId as any);

    // Check target hits
    const now = performance.now();
    let hitIndex = -1;
    let hitIsHeadshot = false;

    targetsRef.current.forEach((t, i) => {
      const dist = Math.hypot(clickX - t.x, clickY - t.y);
      if (dist <= t.radius) {
        hitIndex = i;
        if (dist <= t.radius * 0.45) {
          hitIsHeadshot = true;
        }
      }
    });

    if (hitIndex >= 0) {
      const hitTarget = targetsRef.current[hitIndex];
      const reactionTime = Math.round(now - hitTarget.spawnTime);
      reactionTimesRef.current.push(reactionTime);

      const avg = Math.round(
        reactionTimesRef.current.reduce((a, b) => a + b, 0) / reactionTimesRef.current.length
      );
      setAvgReactionTime(avg);

      if (hitIsHeadshot) {
        soundEngine.playHeadshot();
        setHeadshots(h => h + 1);
        setScore(s => s + 250);
      } else {
        soundEngine.playHitmarker();
        setScore(s => s + 100);
      }
      setHits(h => h + 1);

      targetsRef.current.splice(hitIndex, 1);
      spawnTarget();
    } else {
      setMisses(m => m + 1);
    }

    // Add bullet hole
    bulletHolesRef.current.push({
      x: clickX,
      y: clickY,
      isHeadshot: hitIsHeadshot,
      time: now
    });
    if (bulletHolesRef.current.length > 50) {
      bulletHolesRef.current.shift();
    }
  };

  const resetTrainer = () => {
    setScore(0);
    setHits(0);
    setHeadshots(0);
    setMisses(0);
    setAvgReactionTime(0);
    setTimer(45);
    setIsRunning(true);
    targetsRef.current = [];
    bulletHolesRef.current = [];
    reactionTimesRef.current = [];
    for (let i = 0; i < 3; i++) spawnTarget();
  };

  const totalShots = hits + misses;
  const accuracy = totalShots > 0 ? Math.round((hits / totalShots) * 100) : 0;

  return (
    <div className="relative w-full h-full flex flex-col bg-slate-950 p-6 select-none overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToMenu}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" /> AIM LAB & RECOIL RANGE
            </h1>
            <p className="text-xs text-slate-400">
              Latih refleks tembakan flick, akurasi headshot, dan pola recoil senjata.
            </p>
          </div>
        </div>

        {/* Weapon Selection in Trainer */}
        <div className="flex items-center gap-2">
          {Object.values(WEAPONS).map(w => (
            <button
              key={w.id}
              onClick={() => {
                setActiveWeaponId(w.id);
                ammoRef.current = w.magazineSize;
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition border ${
                activeWeaponId === w.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>

        <button
          onClick={resetTrainer}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-lg transition border border-slate-700"
        >
          <RotateCcw className="w-4 h-4" /> Reset Sesi
        </button>
      </div>

      {/* Top Stats Bar */}
      <div className="grid grid-cols-5 gap-3 py-3">
        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Sisa Waktu</span>
          <div className="text-xl font-black font-mono text-cyan-400">{timer}s</div>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Skor Latihan</span>
          <div className="text-xl font-black font-mono text-slate-100">{score}</div>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Akurasi</span>
          <div className="text-xl font-black font-mono text-emerald-400">{accuracy}%</div>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Headshot Crit</span>
          <div className="text-xl font-black font-mono text-amber-400">{headshots}</div>
        </div>
        <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Waktu Reaksi</span>
          <div className="text-xl font-black font-mono text-purple-400">{avgReactionTime}ms</div>
        </div>
      </div>

      {/* Interactive Aim Canvas */}
      <div className="flex-1 w-full bg-slate-900/40 rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1100}
          height={550}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-crosshair"
        />

        {!isRunning && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
            <h2 className="text-2xl font-bold text-slate-100">SESI LATIHAN SELESAI</h2>
            <div className="text-sm font-mono text-slate-300">
              Skor: <span className="text-cyan-400 font-bold">{score}</span> • Akurasi:{' '}
              <span className="text-emerald-400 font-bold">{accuracy}%</span> • Headshot:{' '}
              <span className="text-amber-400 font-bold">{headshots}</span>
            </div>
            <button
              onClick={resetTrainer}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition shadow-lg shadow-cyan-500/20"
            >
              Mulai Ulang Sesi
            </button>
          </div>
        )}
      </div>

      {/* Bottom controls tip */}
      <div className="pt-3 flex justify-between items-center text-xs font-mono text-slate-500">
        <span>Klik kiri mouse untuk menembak lingkaran target (kuning = Headshot, biru = Body).</span>
        <span>Mag: {ammoRef.current} / {WEAPONS[activeWeaponId].magazineSize} • Otomatis reload jika habis</span>
      </div>
    </div>
  );
};
