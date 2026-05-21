import React, { useState } from 'react';
import { Play, Square, Download, Trash2, Scissors, Music2, Clock } from 'lucide-react';
import type { GeneratedTrack } from '../engine/musicEngine';
import { playTrack, stopTrack, exportMIDI, exportWAV } from '../engine/musicEngine';

interface Props {
  tracks: GeneratedTrack[];
  onRemove: (id: string) => void;
  onSplit: (track: GeneratedTrack) => void;
}

export default function LibraryPage({ tracks, onRemove, onSplit }: Props) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handlePlay = async (track: GeneratedTrack) => {
    if (playingId === track.id) {
      stopTrack();
      setPlayingId(null);
      setProgress(p => ({ ...p, [track.id]: 0 }));
      return;
    }
    if (playingId) {
      stopTrack();
      setPlayingId(null);
    }
    setPlayingId(track.id);
    await playTrack(
      track,
      pct => setProgress(p => ({ ...p, [track.id]: pct })),
      () => { setPlayingId(null); setProgress(p => ({ ...p, [track.id]: 0 })); }
    );
  };

  const handleDownloadMIDI = async (track: GeneratedTrack) => {
    const blob = await exportMIDI(track);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.name.replace(/ /g, '_')}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWAV = async (track: GeneratedTrack) => {
    const blob = await exportWAV(track);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.name.replace(/ /g, '_')}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const moodColors: Record<string, string> = {
    happy: '#f59e0b',
    sad: '#6366f1',
    calm: '#10b981',
    worship: '#8b5cf6',
  devotional: '#ec4899',
  energetic: '#f97316',
  };

  if (tracks.length === 0) {
    return (
      <div className="library-page">
        <div className="library-empty">
          <div className="library-empty-icon"><Music2 size={56} /></div>
          <h2>Your library is empty</h2>
          <p>Generate music and save it to your library — it'll appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="library-page">
      <div className="library-header">
        <h1>Your Library</h1>
        <span className="library-count">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="track-list">
        {tracks.map(track => {
          const isPlaying = playingId === track.id;
          const prog = progress[track.id] ?? 0;
          const color = moodColors[track.config.mood] ?? '#6366f1';

          return (
            <div key={track.id} className={`track-card ${isPlaying ? 'track-active' : ''}`}>
              <div className="track-card-accent" style={{ background: color }} />

              <div className="track-card-left">
                <button
                  className={`track-play-btn ${isPlaying ? 'stop' : ''}`}
                  onClick={() => handlePlay(track)}
                  style={{ '--accent': color } as React.CSSProperties}
                >
                  {isPlaying ? <Square size={18} /> : <Play size={18} />}
                </button>
              </div>

              <div className="track-card-info">
                <div className="track-card-name">{track.name}</div>
                <div className="track-card-tags">
                  <span className="tag">{track.config.style}</span>
                  <span className="tag">{track.config.mood}</span>
                  <span className="tag">{track.config.tempo} BPM</span>
                </div>
                {isPlaying && (
                  <div className="track-progress">
                    <div className="track-progress-fill" style={{ width: `${prog}%`, background: color }} />
                  </div>
                )}
              </div>

              <div className="track-card-meta">
                <Clock size={12} />
                <span>{Math.round(track.duration)}s</span>
              </div>

              <div className="track-card-actions">
                <button className="action-btn" title="Download MIDI" onClick={() => handleDownloadMIDI(track)}>
                  <Download size={15} />
                  <span>MIDI</span>
                </button>
                <button className="action-btn" title="Download WAV" onClick={() => handleDownloadWAV(track)}>
                  <Download size={15} />
                  <span>WAV</span>
                </button>
                <button className="action-btn split-btn" title="Open in Splitter" onClick={() => onSplit(track)}>
                  <Scissors size={15} />
                  <span>Split</span>
                </button>
                <button className="action-btn delete-btn" title="Delete" onClick={() => onRemove(track.id)}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
