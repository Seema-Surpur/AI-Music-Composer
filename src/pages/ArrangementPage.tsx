import React, { useState } from 'react';
import { Layers, Play, Square, Download, Sparkles, ChevronRight } from 'lucide-react';
import * as Tone from 'tone';

interface Layer {
  id: string; name: string; emoji: string; enabled: boolean;
  notes: string[]; color: string; volume: number;
  category: 'melody'|'chords'|'bass'|'drums'|'pad'|'drone';
}

const STYLES_CONFIG = {
  'Worship + Indian + Emotional': {
    tempo: 72, scale: 'D Minor', key: 'D',
    layers: ['Bansuri Melody','Harmonium Chords','Tabla Rhythm','Tanpura Drone','Synth Pad'],
    mood: 'devotional',
  },
  'Cinematic Orchestral': {
    tempo: 90, scale: 'C Minor', key: 'C',
    layers: ['Violin Melody','Cello Bass','Choir Pad','Drum Hit','Piano'],
    mood: 'emotional',
  },
  'Bollywood Fusion': {
    tempo: 118, scale: 'D Major', key: 'D',
    layers: ['Sitar Lead','Tabla Beat','Synth Bass','Electric Guitar','Strings Pad'],
    mood: 'energetic',
  },
  'Carnatic Classical': {
    tempo: 80, scale: 'Shankarabharanam', key: 'C',
    layers: ['Veena Melody','Mridangam Rhythm','Tanpura Drone','Violin','Ghatam'],
    mood: 'devotional',
  },
  'Western Gospel': {
    tempo: 96, scale: 'G Major', key: 'G',
    layers: ['Piano Lead','Organ Pad','Bass Guitar','Drum Kit','Strings'],
    mood: 'worship',
  },
};

function buildLayers(style: string): Layer[] {
  const noteMap: Record<string,{notes:string[];color:string;category:Layer['category'];emoji:string}> = {
    'Bansuri Melody': { notes:['D5','E5','F5','G5','A5','C6','D6'], color:'#7c6dfa', category:'melody', emoji:'🪈' },
    'Harmonium Chords':{ notes:['D3-F3-A3','C3-E3-G3'], color:'#f59e0b', category:'chords', emoji:'🪗' },
    'Tabla Rhythm':   { notes:['C2','D2','C2','E2'], color:'#10b981', category:'drums', emoji:'🥁' },
    'Tanpura Drone':  { notes:['D2','A2','D3'], color:'#8b5cf6', category:'drone', emoji:'🎵' },
    'Synth Pad':      { notes:['D3','F3','A3'], color:'#ec4899', category:'pad', emoji:'🎛️' },
    'Violin Melody':  { notes:['C5','D5','E5','G5','A5'], color:'#7c6dfa', category:'melody', emoji:'🎻' },
    'Cello Bass':     { notes:['C3','G2','F2','G2'], color:'#6366f1', category:'bass', emoji:'🎼' },
    'Choir Pad':      { notes:['C4','E4','G4'], color:'#a78bfa', category:'pad', emoji:'🎶' },
    'Drum Hit':       { notes:['C1','D1','E1','C1'], color:'#f97316', category:'drums', emoji:'🥁' },
    'Piano':          { notes:['C4','E4','G4','B4'], color:'#fbbf24', category:'melody', emoji:'🎹' },
    'Sitar Lead':     { notes:['D4','E4','F4','G4','A4','C5'], color:'#7c6dfa', category:'melody', emoji:'🪕' },
    'Tabla Beat':     { notes:['C2','C2','D2','C2'], color:'#10b981', category:'drums', emoji:'🥁' },
    'Synth Bass':     { notes:['D2','C2','A1','D2'], color:'#3b82f6', category:'bass', emoji:'🎛️' },
    'Electric Guitar':{ notes:['F#4','G4','A4','B4'], color:'#f59e0b', category:'melody', emoji:'⚡' },
    'Strings Pad':    { notes:['D3','F3','A3'], color:'#8b5cf6', category:'pad', emoji:'🎻' },
    'Veena Melody':   { notes:['C4','D4','E4','G4','A4'], color:'#7c6dfa', category:'melody', emoji:'🎸' },
    'Mridangam Rhythm':{ notes:['C2','E2','C2','G2'], color:'#10b981', category:'drums', emoji:'🥁' },
    'Violin':         { notes:['E5','F5','G5','A5'], color:'#a78bfa', category:'melody', emoji:'🎻' },
    'Ghatam':         { notes:['C2','D2','C2'], color:'#f97316', category:'drums', emoji:'🥁' },
    'Piano Lead':     { notes:['G4','A4','B4','C5','D5'], color:'#fbbf24', category:'melody', emoji:'🎹' },
    'Organ Pad':      { notes:['G3','B3','D4'], color:'#ec4899', category:'pad', emoji:'⛪' },
    'Bass Guitar':    { notes:['G2','D2','C2','G2'], color:'#3b82f6', category:'bass', emoji:'🎵' },
    'Drum Kit':       { notes:['C1','E1','C1','G1'], color:'#f97316', category:'drums', emoji:'🥁' },
    'Strings':        { notes:['G3','B3','D4'], color:'#8b5cf6', category:'pad', emoji:'🎻' },
  };
  const cfg = STYLES_CONFIG[style as keyof typeof STYLES_CONFIG];
  return cfg.layers.map((name,i) => ({
    id: `${name}-${i}`, name, enabled: true,
    ...(noteMap[name] || {notes:['C4'],color:'#7c6dfa',category:'melody',emoji:'🎵'}),
    volume: name.includes('Drone')||name.includes('Pad') ? -8 : name.includes('Bass') ? -10 : -6,
  }));
}

export default function ArrangementPage() {
  const [selectedStyle, setSelectedStyle] = useState('');
  const [layers, setLayers] = useState<Layer[]>([]);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  const handleGenerate = () => {
    const style = customPrompt || selectedStyle;
    if (!style) return;
    setGenerating(true);
    setTimeout(() => {
      const key = Object.keys(STYLES_CONFIG).find(k =>
        k.toLowerCase().includes(style.toLowerCase().split(' ')[0])
      ) || Object.keys(STYLES_CONFIG)[0];
      setLayers(buildLayers(key));
      setGenerating(false);
    }, 1400);
  };

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id===id ? {...l,enabled:!l.enabled} : l));
  };

  const adjustVolume = (id: string, vol: number) => {
    setLayers(prev => prev.map(l => l.id===id ? {...l,volume:vol} : l));
  };

  const handlePlay = async () => {
    if (playing) { Tone.getTransport().stop(); Tone.getTransport().cancel(); setPlaying(false); return; }
    await Tone.start();
    Tone.getTransport().stop(); Tone.getTransport().cancel();
    const style = selectedStyle || Object.keys(STYLES_CONFIG)[0];
    const cfg = STYLES_CONFIG[style as keyof typeof STYLES_CONFIG];
    Tone.getTransport().bpm.value = cfg?.tempo || 80;

    const enabledLayers = layers.filter(l => l.enabled);
    const synths: (Tone.Synth | Tone.PolySynth | Tone.MembraneSynth | Tone.PluckSynth)[] = [];

    enabledLayers.forEach(layer => {
      let synth: any;
      if (layer.category === 'drums') {
        synth = new Tone.MembraneSynth().toDestination();
        synth.volume.value = layer.volume;
      } else if (layer.category === 'pad' || layer.category === 'drone' || layer.category === 'chords') {
        synth = new Tone.PolySynth().toDestination();
        synth.set({ envelope:{attack:0.3,decay:0.2,sustain:0.8,release:1.5}, volume: layer.volume });
      } else if (layer.category === 'bass') {
        synth = new Tone.Synth().toDestination();
        synth.set({ envelope:{attack:0.02,decay:0.3,sustain:0.5,release:0.5}, volume: layer.volume });
      } else {
        synth = new Tone.Synth().toDestination();
        synth.set({ envelope:{attack:0.05,decay:0.2,sustain:0.6,release:0.4}, volume: layer.volume });
      }
      synths.push(synth);

      const step = 60 / (cfg?.tempo || 80) / 2;
      const notes = layer.notes;

      if (layer.category === 'pad' || layer.category === 'drone') {
        const notesToPlay = notes[0].includes('-') ? notes[0].split('-') : notes;
        const part = new Tone.Part((time: number) => {
          (synth as Tone.PolySynth).triggerAttackRelease(notesToPlay, '2n', time, 0.4);
        }, [{time:0}]);
        part.loop = true; part.loopEnd = '4m'; part.start(0);
      } else if (layer.category === 'chords') {
        const chordNotes = notes[0].includes('-') ? notes[0].split('-') : [notes[0],'E4','G4'];
        const part = new Tone.Part((time: number) => {
          (synth as Tone.PolySynth).triggerAttackRelease(chordNotes, '2n', time, 0.5);
        }, [{time:0},{time:'2m'}]);
        part.loop = true; part.loopEnd = '4m'; part.start(0);
      } else {
        const events = notes.map((n,i) => ({time: i*step, note: n.includes('-')?n.split('-')[0]:n}));
        const part = new Tone.Part((time: number, val: {note:string}) => {
          try { (synth as Tone.Synth).triggerAttackRelease(val.note,'8n',time,0.5); } catch {}
        }, events);
        part.loop = true; part.loopEnd = `${notes.length*step}`;
        part.start(0);
      }
    });

    Tone.getTransport().start();
    setPlaying(true);

    setTimeout(() => {
      Tone.getTransport().stop(); Tone.getTransport().cancel();
      synths.forEach(s => { try { s.dispose(); } catch {} });
      setPlaying(false);
    }, 16000);
  };

  const categoryColors: Record<Layer['category'],string> = {
    melody:'#7c6dfa', chords:'#f59e0b', bass:'#3b82f6',
    drums:'#f97316', pad:'#8b5cf6', drone:'#10b981',
  };

  return (
    <div className="arrangement-page">
      <div className="arr-hero">
        <Layers size={28}/>
        <div>
          <h1>Arrangement Engine</h1>
          <p>Convert melody → full band arrangement with style conditioning</p>
        </div>
      </div>

      {/* Style Conditioning */}
      <div className="arr-conditioning">
        <div className="arr-section-title">Style Conditioning</div>
        <div className="style-presets">
          {Object.keys(STYLES_CONFIG).map(s => (
            <button key={s} className={`style-preset-btn ${selectedStyle===s?'active':''}`}
              onClick={()=>setSelectedStyle(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="arr-or">or type your own prompt</div>
        <div className="arr-prompt-row">
          <input className="arr-prompt-input" placeholder='e.g. "Hindustani + Calm + Piano + Tabla"'
            value={customPrompt} onChange={e=>setCustomPrompt(e.target.value)}/>
          <button className={`arr-generate-btn ${generating?'loading':''}`}
            onClick={handleGenerate} disabled={generating}>
            {generating?<><div className="btn-spinner"/>Arranging…</>:<><Sparkles size={16}/>Generate Arrangement<ChevronRight size={14}/></>}
          </button>
        </div>
      </div>

      {/* Layer mixer */}
      {layers.length > 0 && (
        <div className="arr-mixer">
          <div className="arr-mixer-header">
            <div className="arr-section-title">Multi-track Arrangement</div>
            <button className={`arr-play-btn ${playing?'playing':''}`} onClick={handlePlay}>
              {playing?<><Square size={16}/> Stop</>:<><Play size={16}/> Play All</>}
            </button>
          </div>
          <div className="arr-tracks">
            {layers.map(layer => (
              <div key={layer.id} className={`arr-track ${!layer.enabled?'disabled':''}`}>
                <div className="arr-track-left">
                  <button className={`arr-mute-btn ${!layer.enabled?'muted':''}`}
                    onClick={()=>toggleLayer(layer.id)}
                    style={{background: layer.enabled ? categoryColors[layer.category]+'22' : 'var(--bg4)',
                            borderColor: layer.enabled ? categoryColors[layer.category]+'55' : 'var(--border)'}}>
                    <span>{layer.emoji}</span>
                  </button>
                  <div className="arr-track-info">
                    <div className="arr-track-name">{layer.name}</div>
                    <div className="arr-track-cat" style={{color: categoryColors[layer.category]}}>
                      {layer.category}
                    </div>
                  </div>
                </div>
                <div className="arr-track-mid">
                  {/* Mini waveform visualization */}
                  <div className="arr-mini-wave">
                    {[...Array(24)].map((_,i) => (
                      <div key={i} className={`arr-wave-bar ${layer.enabled?'active':''}`}
                        style={{
                          height:`${15+Math.abs(Math.sin(i*0.7+parseInt(layer.id.slice(-1)||'0')))*25}px`,
                          background: layer.enabled ? categoryColors[layer.category] : 'var(--bg4)',
                          animationDelay:`${i*0.04}s`,
                        }}/>
                    ))}
                  </div>
                </div>
                <div className="arr-track-right">
                  <span className="arr-vol-label">Vol</span>
                  <input type="range" min={-24} max={0} value={layer.volume}
                    onChange={e=>adjustVolume(layer.id,Number(e.target.value))}
                    className="arr-vol-slider" style={{'--track-color':categoryColors[layer.category]} as any}/>
                  <span className="arr-vol-val">{layer.volume}dB</span>
                  <button className={`arr-solo-btn ${layer.enabled?'':'off'}`} onClick={()=>toggleLayer(layer.id)}>
                    {layer.enabled?'ON':'OFF'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="arr-info-row">
            <div className="arr-info-item"><span>🎚️</span><span>Adjust volume per track</span></div>
            <div className="arr-info-item"><span>🔇</span><span>Click emoji to mute/unmute</span></div>
            <div className="arr-info-item"><span>▶️</span><span>Play all enabled tracks together</span></div>
          </div>
        </div>
      )}

      {/* AI Modules explanation */}
      <div className="arr-modules">
        <div className="arr-section-title">AI Composer Modules</div>
        <div className="module-cards">
          {[
            {num:'1',title:'Composition Model',desc:'Generates chords, melody & rhythm using Music Transformer (Google Magenta). Better long-term structure than LSTM.',tools:['Music Transformer','LSTM','Magenta'],color:'#7c6dfa'},
            {num:'2',title:'Arrangement Engine',desc:'Converts melody → full band. Adds bass, drums, pads automatically based on style conditioning prompt.',tools:['Style Conditioning','Voice Leading','Auto-Orchestration'],color:'#f59e0b'},
            {num:'3',title:'Style Conditioning',desc:'Maps user prompt ("Worship + Indian + Emotional") to tempo, scale, instrument selection, and rhythm pattern.',tools:['Prompt Parsing','Mood Mapping','Tradition Router'],color:'#10b981'},
            {num:'4',title:'Mixing & Mastering',desc:'Balances levels, adds reverb & EQ, compresses properly. Applies iZotope-style DSP chain automatically.',tools:['EQ Chain','Compression','Limiter','Reverb'],color:'#ec4899'},
          ].map(m=>(
            <div key={m.num} className="module-card" style={{'--mc':m.color} as any}>
              <div className="mc-num" style={{background:m.color}}>{m.num}</div>
              <div className="mc-title">{m.title}</div>
              <div className="mc-desc">{m.desc}</div>
              <div className="mc-tools">
                {m.tools.map(t=><span key={t} className="mc-tool">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Build Path */}
      <div className="arr-buildpath">
        <div className="arr-section-title">Recommended Build Path</div>
        <div className="build-steps">
          {[
            {step:'Phase 1',title:'Generate MIDI + VSTs',desc:'Use Lakh MIDI dataset, train melody/chord generator, render using Kontakt VSTs, export songs.',status:'current'},
            {step:'Phase 2',title:'Auto-Mixing',desc:'Add Groove MIDI for drums, implement DSP mastering chain (EQ → Compress → Limit → Reverb).',status:'next'},
            {step:'Phase 3',title:'Audio Generation',desc:'Experiment with Riffusion/DDSP for direct audio output. Add Indian instrument simulation.',status:'future'},
          ].map(s=>(
            <div key={s.step} className={`build-step ${s.status}`}>
              <div className="bs-badge">{s.step}</div>
              <div className="bs-title">{s.title}</div>
              <div className="bs-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
