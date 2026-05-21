import React, { useEffect, useRef } from 'react';
import type { Mood } from '../engine/musicEngine';

interface Props {
  playing: boolean;
  progress: number;
  mood: Mood;
}

const MOOD_COLORS: Record<Mood, string> = {
  devotional: '#ec4899',
  energetic: '#f97316',
  happy: '#f59e0b',
  sad: '#6366f1',
  calm: '#10b981',
  worship: '#8b5cf6',
};

export default function WaveformDisplay({ playing, progress, mood }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);
  const color = MOOD_COLORS[mood];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 60;
    const amplitudes = Array.from({ length: bars }, (_, i) =>
      0.2 + Math.abs(Math.sin(i * 0.4)) * 0.5 + Math.abs(Math.cos(i * 0.7)) * 0.3
    );

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;
      ctx!.clearRect(0, 0, W, H);

      const barW = W / bars - 2;
      const playedBars = Math.floor((progress / 100) * bars);

      for (let i = 0; i < bars; i++) {
        const amp = amplitudes[i];
        const wave = playing ? Math.sin(timeRef.current * 4 + i * 0.3) * 0.15 : 0;
        const h = (amp + wave) * H * 0.8;
        const x = i * (barW + 2);
        const y = (H - h) / 2;

        ctx!.fillStyle = i < playedBars
          ? color
          : color + '44';
        ctx!.beginPath();
        ctx!.roundRect(x, y, barW, h, 3);
        ctx!.fill();
      }

      if (playing) {
        timeRef.current += 0.04;
        animRef.current = requestAnimationFrame(draw);
      }
    }

    if (playing) {
      animRef.current = requestAnimationFrame(draw);
    } else {
      draw();
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [playing, progress, mood, color]);

  return (
    <div className="waveform-display">
      <canvas
        ref={canvasRef}
        width={500}
        height={80}
        className="waveform-canvas"
      />
    </div>
  );
}
