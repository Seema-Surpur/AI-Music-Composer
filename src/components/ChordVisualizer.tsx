import React from 'react';

interface Props {
  chords: string[];
  melody: string[];
}

export default function ChordVisualizer({ chords, melody }: Props) {
  const noteToY = (note: string): number => {
    const noteMap: Record<string, number> = {
      C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
      'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
    };
    const match = note.match(/^([A-G]#?)(\d+)$/);
    if (!match) return 50;
    const semitone = noteMap[match[1]] ?? 0;
    const octave = parseInt(match[2]);
    const midi = octave * 12 + semitone;
    return Math.max(5, Math.min(95, 95 - ((midi - 48) / 24) * 90));
  };

  const svgWidth = Math.max(400, melody.length * 22);
  const points = melody.map((note, i) => `${i * 22 + 11},${noteToY(note) * 0.6 + 10}`).join(' ');

  return (
    <div className="chord-visualizer">
      <div className="cv-section">
        <div className="cv-label">Chord Progression</div>
        <div className="chord-pills">
          {chords.map((chord, i) => (
            <div key={i} className="chord-pill">
              {chord.split('-').map((note, j) => (
                <span key={j} className="chord-note">{note.replace(/\d/, '')}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="cv-section">
        <div className="cv-label">Melody Line</div>
        <div className="melody-svg-wrap">
          <svg
            viewBox={`0 0 ${svgWidth} 80`}
            preserveAspectRatio="xMidYMid meet"
            className="melody-svg"
          >
            <polyline
              points={points}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {melody.map((note, i) => (
              <circle
                key={i}
                cx={i * 22 + 11}
                cy={noteToY(note) * 0.6 + 10}
                r="3"
                fill="var(--accent)"
                opacity="0.8"
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
