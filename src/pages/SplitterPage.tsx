import React, { useState } from 'react';
import { Scissors, Play, Square, Download, Music2, ChevronDown } from 'lucide-react';
import type { GeneratedTrack } from '../engine/musicEngine';
import { splitStems, exportMIDI } from '../engine/musicEngine';
import * as Tone from 'tone';

interface Props {
  track: GeneratedTrack | null;
  allTracks: GeneratedTrack[];
  onSelectTrack: (track: GeneratedTrack) => void;
}

type StemName = 'Melody' | 'Chords' | 'Bass';

const STEM_COLORS: Record<StemName, string> = {
  Melody: '#f59e0b',
  Chords: '#6366f1',
  Bass: '#10b981',
};

const STEM_DESCRIPTIONS: Record<StemName, string> = {
  Melody: 'The main melodic line — the tune you hum',
  Chords: 'Harmonic chord progressions — the body of the sound',
  Bass: 'Low-end bass notes — the foundation',
};

export default function SplitterPage({ track, allTracks, onSelectTrack }: Props) {
  const [playingStem, setPlayingStem] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const stems = track ? splitStems(track) : [];

  const handlePlayStem = async (stem: { name: string; notes: string[]; type: string }) => {
    if (!track) return;
    if (playingStem === stem.name) {
      Tone.getTransport().stop();
      Tone.getTransport().cancel();
      setPlayingStem(null);
      return;
    }
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    setPlayingStem(stem.name);
    await Tone.start();

    const tempo = track.config.tempo;
    Tone.getTransport().bpm.value = tempo;

    if (stem.type === 'melody') {
      const syn = new Tone.Synth().toDestination();
      syn.set({ envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.5 }, volume: -6 });
      const step = 60 / tempo / 2;
      const notes = stem.notes.slice(0, 32);
      const events = notes.map((note, i) => ({ time: i * step, note }));
      const part = new Tone.Part((time: number, val: { note: string }) => {
        syn.triggerAttackRelease(val.note, '8n', time, 0.6);
      }, events);
      part.start(0);
      Tone.getTransport().start();
      const totalTime = notes.length * step * 1000 + 800;
      setTimeout(() => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        syn.dispose();
        part.dispose();
        setPlayingStem(null);
      }, totalTime);
    } else if (stem.type === 'chords') {
      const syn = new Tone.PolySynth().toDestination();
      syn.set({ envelope: { attack: 0.05, decay: 0.3, sustain: 0.6, release: 1.2 }, volume: -6 });
      const events = stem.notes.map((chord, i) => ({ time: `${i * 2}m`, notes: chord.split('-') }));
      const part = new Tone.Part((time: number, val: { notes: string[] }) => {
        syn.triggerAttackRelease(val.notes, '1n', time, 0.5);
      }, events);
      part.start(0);
      Tone.getTransport().start();
      const totalTime = stem.notes.length * (60 / tempo) * 8 * 1000 + 800;
      setTimeout(() => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        syn.dispose();
        part.dispose();
        setPlayingStem(null);
      }, totalTime);
    } else {
      const syn = new Tone.Synth().toDestination();
      syn.set({ envelope: { attack: 0.05, decay: 0.2, sustain: 0.5, release: 0.8 }, volume: -8 });
      const events = stem.notes.map((note, i) => ({ time: `${i * 4}m`, note }));
      const part = new Tone.Part((time: number, val: { note: string }) => {
        syn.triggerAttackRelease(val.note, '2n', time, 0.5);
      }, events);
      part.start(0);
      Tone.getTransport().start();
      const totalTime = stem.notes.length * (60 / tempo) * 16 * 1000 + 800;
      setTimeout(() => {
        Tone.getTransport().stop();
        Tone.getTransport().cancel();
        syn.dispose();
        part.dispose();
        setPlayingStem(null);
      }, totalTime);
    }
  };

  const handleDownloadStem = async (stem: { name: string; notes: string[]; type: string }) => {
    if (!track) return;
    const fakeTrack = { ...track, name: `${track.name} - ${stem.name}`, melody: stem.notes };
    const blob = await exportMIDI(fakeTrack);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${track.name.replace(/ /g, '_')}_${stem.name}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!track && allTracks.length === 0) {
    return (
      <div className="splitter-page">
        <div className="splitter-empty">
          <Scissors size={56} />
          <h2>No tracks to split</h2>
          <p>Generate and save a track first, then come back here to split it into stems.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="splitter-page">
      <div className="splitter-header">
        <div className="splitter-title">
          <Scissors size={24} />
          <h1>Music Splitter</h1>
        </div>
        <p className="splitter-desc">Isolate and play individual stems from your composition</p>

        {allTracks.length > 0 && (
          <div className="track-selector">
            <button className="track-select-btn" onClick={() => setShowDropdown(!showDropdown)}>
              <Music2 size={16} />
              <span>{track ? track.name : 'Select a track'}</span>
              <ChevronDown size={16} />
            </button>
            {showDropdown && (
              <div className="track-dropdown">
                {allTracks.map(t => (
                  <button
                    key={t.id}
                    className={`dropdown-item ${track?.id === t.id ? 'active' : ''}`}
                    onClick={() => { onSelectTrack(t); setShowDropdown(false); }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!track ? (
        <div className="splitter-empty">
          <Music2 size={48} />
          <p>Select a track from your library to split</p>
        </div>
      ) : (
        <div className="stems-grid">
          {stems.map(stem => {
            const color = STEM_COLORS[stem.name as StemName] ?? '#6366f1';
            const desc = STEM_DESCRIPTIONS[stem.name as StemName] ?? '';
            const isPlaying = playingStem === stem.name;

            return (
              <div key={stem.name} className="stem-card" style={{ '--stem-color': color } as React.CSSProperties}>
                <div className="stem-color-bar" style={{ background: color }} />
                <div className="stem-icon-wrap" style={{ background: color + '22' }}>
                  <Music2 size={28} style={{ color }} />
                </div>
                <div className="stem-info">
                  <h3 className="stem-name">{stem.name}</h3>
                  <p className="stem-desc">{desc}</p>
                  <div className="stem-notes-count">{stem.notes.length} notes</div>
                </div>

                <div className="stem-waveform">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`stem-wave-bar ${isPlaying ? 'animating' : ''}`}
                      style={{
                        height: `${20 + Math.sin(i * 0.8) * 15 + Math.cos(i * 1.3) * 10}%`,
                        background: color,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="stem-actions">
                  <button
                    className={`stem-play-btn ${isPlaying ? 'playing' : ''}`}
                    style={{ background: color }}
                    onClick={() => handlePlayStem(stem)}
                  >
                    {isPlaying ? <Square size={18} /> : <Play size={18} />}
                    <span>{isPlaying ? 'Stop' : 'Play'}</span>
                  </button>
                  <button className="stem-dl-btn" onClick={() => handleDownloadStem(stem)}>
                    <Download size={16} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
