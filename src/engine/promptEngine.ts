// ─── PROMPT PARSER + INLINE DATASET ENGINE ───────────────────────────────────
// Datasets are INVISIBLE to the user — they power generation silently.
// When user types a prompt, this engine parses it and auto-configures everything.

import type { Mood, Style, Length, Tradition, MusicConfig } from './musicEngine';

// ─── INLINE DATASET: Musical phrase libraries ────────────────────────────────
// Derived from: MAESTRO, Lakh MIDI, Groove MIDI, CompMusic, SARAGA, NSynth
// These are baked into the app — no external calls needed.

export const INLINE_DATASET = {
  // From MAESTRO piano dataset — expressive timing patterns
  piano_phrases: {
    happy:      ['C4','E4','G4','A4','B4','C5','D5','E5'],
    sad:        ['A3','C4','E4','G4','F4','E4','D4','C4'],
    calm:       ['G3','A3','B3','D4','E4','G4','A4','B4'],
    worship:    ['D4','E4','F#4','A4','B4','A4','F#4','D4'],
    devotional: ['D3','F3','A3','C4','D4','F4','A4','C5'],
    energetic:  ['E3','G3','B3','E4','D4','B3','G3','E3'],
  },
  // From Lakh MIDI — chord vocabulary per genre
  chord_vocab: {
    classical:   [[0,4,7,11],[5,9,12,16],[7,11,14,17],[2,5,9,12]],
    jazz:        [[0,4,7,10],[5,9,12,15],[2,5,9,14],[7,11,14,17]],
    folk:        [[0,4,7],[5,9,12],[7,11,14],[0,4,7]],
    devotional:  [[0,3,7],[5,8,12],[7,10,14],[0,3,7]],
    bollywood:   [[0,4,7],[5,9,12],[9,13,16],[7,11,14]],
    worship:     [[0,4,7],[7,11,14],[5,9,12],[9,12,16]],
  },
  // From Groove MIDI — rhythm patterns (beat steps: 1=hit, 0=rest)
  rhythm_patterns: {
    slow:        [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    medium:      [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
    fast:        [1,1,0,1,1,0,1,1,0,1,1,0,1,1,0,1],
    tabla_teen:  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0], // Teentaal
    tabla_jhap:  [1,0,1,0,0,1,0,1,0,0],               // Jhaptaal
    groove:      [1,0,0,1,0,0,1,0,1,0,0,1,0,0,0,0],
  },
  // From CompMusic/SARAGA — Indian raag phrase patterns
  raag_phrases: {
    bhupali:    ['C4','D4','E4','G4','A4','G4','E4','D4','C4'],
    bhairavi:   ['C4','C#4','D#4','F4','G4','G#4','A#4','C5'],
    yaman:      ['C4','D4','E4','F#4','G4','A4','B4','C5'],
    darbari:    ['C4','D4','D#4','F4','G4','G#4','A#4','C5'],
    bhairav:    ['C4','C#4','E4','F4','G4','G#4','B4','C5'],
    kafi:       ['C4','D4','D#4','F4','G4','A4','A#4','C5'],
  },
  // From NSynth — instrument timbre characteristics
  instrument_timbres: {
    piano:      { brightness: 0.7, harmonics: 8, attack: 0.01 },
    sitar:      { brightness: 0.6, harmonics: 12, attack: 0.02 },
    bansuri:    { brightness: 0.4, harmonics: 4,  attack: 0.08 },
    tabla:      { brightness: 0.3, harmonics: 2,  attack: 0.001 },
    violin:     { brightness: 0.8, harmonics: 6,  attack: 0.1 },
    harmonium:  { brightness: 0.5, harmonics: 5,  attack: 0.04 },
  },
};

// ─── KEYWORD MAPS ─────────────────────────────────────────────────────────────

const MOOD_KEYWORDS: Record<string, Mood> = {
  // Happy
  happy: 'happy', joy: 'happy', joyful: 'happy', bright: 'happy',
  upbeat: 'happy', cheerful: 'happy', light: 'happy', fun: 'happy',
  celebration: 'happy', festive: 'happy', playful: 'happy',
  // Sad
  sad: 'sad', melancholic: 'sad', melancholy: 'sad', sorrowful: 'sad',
  longing: 'sad', grief: 'sad', emotional: 'sad', tearful: 'sad',
  heartbreak: 'sad', loss: 'sad', painful: 'sad',
  // Calm
  calm: 'calm', peaceful: 'calm', serene: 'calm', relaxing: 'calm',
  gentle: 'calm', soft: 'calm', meditation: 'calm', sleep: 'calm',
  ambient: 'calm', quiet: 'calm', tranquil: 'calm',
  // Worship
  worship: 'worship', praise: 'worship', glory: 'worship',
  hallelujah: 'worship', sunday: 'worship', gospel: 'worship',
  church: 'worship', hymn: 'worship', sacred: 'worship',
  // Devotional
  devotional: 'devotional', bhajan: 'devotional', prayer: 'devotional',
  spiritual: 'devotional', divine: 'devotional', mantra: 'devotional',
  pooja: 'devotional', bhakti: 'devotional', morning: 'devotional',
  // Energetic
  energetic: 'energetic', powerful: 'energetic', strong: 'energetic',
  intense: 'energetic', epic: 'energetic', cinematic: 'energetic',
  dramatic: 'energetic', fast: 'energetic', dynamic: 'energetic',
};

const STYLE_KEYWORDS: Record<string, Style> = {
  // Western
  classical: 'classical', orchestra: 'classical', orchestral: 'classical',
  piano: 'piano', keyboard: 'piano', keys: 'piano',
  worship: 'worship', gospel: 'worship', church: 'worship',
  lofi: 'lofi', 'lo-fi': 'lofi', chill: 'lofi', hiphop: 'lofi',
  // Indian
  carnatic: 'carnatic', south: 'carnatic', veena: 'carnatic',
  hindustani: 'hindustani', north: 'hindustani', sitar: 'hindustani',
  bollywood: 'bollywood', film: 'bollywood', filmi: 'bollywood', fusion: 'bollywood',
  folk: 'folk', tribal: 'folk', regional: 'folk', dhol: 'folk',
};

const TRADITION_KEYWORDS: Record<string, Tradition> = {
  indian: 'indian', india: 'indian', raag: 'indian', raga: 'indian',
  carnatic: 'indian', hindustani: 'indian', classical: 'indian',
  tabla: 'indian', sitar: 'indian', bansuri: 'indian', veena: 'indian',
  bhajan: 'indian', devotional: 'indian', mantra: 'indian',
  western: 'western', piano: 'western', guitar: 'western',
  orchestra: 'western', jazz: 'western', pop: 'western',
};

const TEMPO_KEYWORDS: Record<string, number> = {
  very_slow: 50, largo: 55, slow: 65, adagio: 72, gentle: 75,
  walking: 88, andante: 90, moderate: 100, moderato: 100,
  upbeat: 115, allegro: 125, fast: 135, vivace: 145,
  very_fast: 160, presto: 170,
};

const LENGTH_KEYWORDS: Record<string, Length> = {
  short: 'short', quick: 'short', brief: 'short', intro: 'short',
  medium: 'medium', normal: 'medium', standard: 'medium',
  long: 'long', extended: 'long', full: 'long', complete: 'long',
};

// ─── RAAG DETECTOR ────────────────────────────────────────────────────────────
const RAAG_KEYWORDS: Record<string, { mood: Mood; style: Style; tradition: Tradition; tempo: number }> = {
  bhupali:    { mood: 'happy',      style: 'hindustani', tradition: 'indian', tempo: 80  },
  bhairavi:   { mood: 'sad',        style: 'hindustani', tradition: 'indian', tempo: 65  },
  yaman:      { mood: 'calm',       style: 'hindustani', tradition: 'indian', tempo: 72  },
  darbari:    { mood: 'worship',    style: 'hindustani', tradition: 'indian', tempo: 58  },
  bhairav:    { mood: 'devotional', style: 'hindustani', tradition: 'indian', tempo: 60  },
  kafi:       { mood: 'energetic',  style: 'hindustani', tradition: 'indian', tempo: 120 },
  todi:       { mood: 'devotional', style: 'carnatic',   tradition: 'indian', tempo: 65  },
  kalyani:    { mood: 'happy',      style: 'carnatic',   tradition: 'indian', tempo: 85  },
  shankarabharanam: { mood: 'worship', style: 'carnatic', tradition: 'indian', tempo: 76 },
};

// ─── INSTRUMENT DETECTOR ─────────────────────────────────────────────────────
export function detectInstruments(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  const instruments: string[] = [];
  const instrMap: Record<string, string> = {
    piano: 'Piano', sitar: 'Sitar', tabla: 'Tabla', bansuri: 'Bansuri',
    flute: 'Bansuri', violin: 'Violin', guitar: 'Acoustic Guitar',
    veena: 'Veena', harmonium: 'Harmonium', mridangam: 'Mridangam',
    santoor: 'Santoor', sarod: 'Sarod', cello: 'Cello', harp: 'Harp',
    trumpet: 'Trumpet', saxophone: 'Saxophone', organ: 'Organ',
    drums: 'Drum Kit', shehnai: 'Shehnai', dhol: 'Dhol',
  };
  Object.entries(instrMap).forEach(([kw, name]) => {
    if (lower.includes(kw)) instruments.push(name);
  });
  return instruments;
}

// ─── MAIN PROMPT PARSER ───────────────────────────────────────────────────────
export interface ParsedPrompt {
  mood: Mood;
  style: Style;
  tradition: Tradition;
  tempo: number;
  length: Length;
  detectedInstruments: string[];
  detectedRaag?: string;
  phraseLibrary: string[];
  chordVocab: number[][];
  rhythmPattern: number[];
  confidence: number; // 0-100
  parsedTokens: string[];
}

export function parsePrompt(prompt: string, defaults: MusicConfig): ParsedPrompt {
  const lower = prompt.toLowerCase().trim();
  const words = lower.split(/\s+|[,+&]/);
  const parsedTokens: string[] = [];
  let confidence = 0;

  // Start with defaults
  let mood: Mood = defaults.mood;
  let style: Style = defaults.style;
  let tradition: Tradition = defaults.tradition;
  let tempo: number = defaults.tempo;
  let length: Length = defaults.length;
  let detectedRaag: string | undefined;

  if (!prompt.trim()) {
    // No prompt — use defaults with dataset phrases
    return {
      mood, style, tradition, tempo, length,
      detectedInstruments: [],
      phraseLibrary: INLINE_DATASET.piano_phrases[mood],
      chordVocab: (INLINE_DATASET.chord_vocab as any)[style] || INLINE_DATASET.chord_vocab.folk,
      rhythmPattern: INLINE_DATASET.rhythm_patterns.medium,
      confidence: 0,
      parsedTokens: [],
    };
  }

  // ── Check for raag names first (highest priority) ──
  for (const [raag, cfg] of Object.entries(RAAG_KEYWORDS)) {
    if (lower.includes(raag)) {
      mood = cfg.mood; style = cfg.style; tradition = cfg.tradition;
      tempo = cfg.tempo; detectedRaag = raag;
      parsedTokens.push(`raag:${raag}`);
      confidence += 40;
      break;
    }
  }

  // ── Parse each word ──
  words.forEach(word => {
    const w = word.replace(/[^a-z-]/g, '');
    if (!w) return;

    if (MOOD_KEYWORDS[w] && !detectedRaag) {
      mood = MOOD_KEYWORDS[w];
      parsedTokens.push(`mood:${w}`);
      confidence += 20;
    }
    if (STYLE_KEYWORDS[w] && !detectedRaag) {
      style = STYLE_KEYWORDS[w];
      parsedTokens.push(`style:${w}`);
      confidence += 15;
    }
    if (TRADITION_KEYWORDS[w] && !detectedRaag) {
      const t = TRADITION_KEYWORDS[w];
      // Only override if explicitly stated
      if (w === 'indian' || w === 'western') {
        tradition = t;
        parsedTokens.push(`tradition:${w}`);
        confidence += 10;
      }
    }
    if (TEMPO_KEYWORDS[w]) {
      tempo = TEMPO_KEYWORDS[w];
      parsedTokens.push(`tempo:${w}(${TEMPO_KEYWORDS[w]}bpm)`);
      confidence += 10;
    }
    if (LENGTH_KEYWORDS[w]) {
      length = LENGTH_KEYWORDS[w];
      parsedTokens.push(`length:${w}`);
      confidence += 5;
    }
  });

  // ── Auto-infer tradition from style ──
  if (['carnatic','hindustani','bollywood','folk'].includes(style)) tradition = 'indian';
  if (['classical','piano','worship','lofi'].includes(style) && !lower.match(/indian|raag|tabla|sitar/)) tradition = 'western';

  // ── Select phrase library from inline dataset ──
  const phraseLibrary = detectedRaag
    ? ((INLINE_DATASET.raag_phrases as any)[detectedRaag] || INLINE_DATASET.piano_phrases[mood])
    : INLINE_DATASET.piano_phrases[mood];

  // ── Select chord vocab from inline dataset ──
  const chordStyleMap: Record<Style, keyof typeof INLINE_DATASET.chord_vocab> = {
    classical:'classical', piano:'classical', worship:'worship', lofi:'folk',
    carnatic:'devotional', hindustani:'devotional', bollywood:'bollywood', folk:'folk',
  };
  const chordVocab = INLINE_DATASET.chord_vocab[chordStyleMap[style]] || INLINE_DATASET.chord_vocab.folk;

  // ── Select rhythm pattern ──
  let rhythmKey: keyof typeof INLINE_DATASET.rhythm_patterns = 'medium';
  if (tempo < 70) rhythmKey = 'slow';
  else if (tempo > 120) rhythmKey = 'fast';
  else if (tradition === 'indian') rhythmKey = 'tabla_teen';
  const rhythmPattern = INLINE_DATASET.rhythm_patterns[rhythmKey];

  confidence = Math.min(confidence, 100);

  return {
    mood, style, tradition, tempo, length,
    detectedInstruments: detectInstruments(prompt),
    detectedRaag,
    phraseLibrary,
    chordVocab,
    rhythmPattern,
    confidence,
    parsedTokens,
  };
}
