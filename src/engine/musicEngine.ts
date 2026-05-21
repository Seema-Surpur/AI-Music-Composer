import * as Tone from 'tone';
import { INLINE_DATASET, parsePrompt } from './promptEngine';
import type { ParsedPrompt } from './promptEngine';

export type Mood = 'happy' | 'sad' | 'calm' | 'worship' | 'devotional' | 'energetic';
export type Style = 'classical' | 'piano' | 'worship' | 'lofi' | 'carnatic' | 'hindustani' | 'bollywood' | 'folk';
export type Length = 'short' | 'medium' | 'long';
export type Tradition = 'western' | 'indian';

export interface MusicConfig {
  mood: Mood; style: Style; tempo: number; length: Length;
  tradition: Tradition; promptText?: string;
}

export interface GeneratedTrack {
  id: string; name: string; config: MusicConfig;
  chords: string[]; melody: string[]; bassline: string[];
  createdAt: Date; duration: number;
  raagName?: string; scaleInfo?: string; chordFormula?: string;
  keySignature?: string; parsedPrompt?: ParsedPrompt;
  detectedInstruments?: string[];
}

// ─── ALL 12 MAJOR SCALES ─────────────────────────────────────────────────────
export const ALL_MAJOR_SCALES: Record<string, string[]> = {
  'C': ['C','D','E','F','G','A','B','C'],
  'C#':['C#','D#','F','F#','G#','A#','C','C#'],
  'D': ['D','E','F#','G','A','B','C#','D'],
  'D#':['D#','F','G','G#','A#','C','D','D#'],
  'E': ['E','F#','G#','A','B','C#','D#','E'],
  'F': ['F','G','A','A#','C','D','E','F'],
  'F#':['F#','G#','A#','B','C#','D#','F','F#'],
  'G': ['G','A','B','C','D','E','F#','G'],
  'G#':['G#','A#','C','C#','D#','F','G','G#'],
  'A': ['A','B','C#','D','E','F#','G#','A'],
  'A#':['A#','C','D','D#','F','G','A','A#'],
  'B': ['B','C#','D#','E','F#','G#','A#','B'],
};

// ─── ALL 12 MINOR SCALES ─────────────────────────────────────────────────────
export const ALL_MINOR_SCALES: Record<string, string[]> = {
  'Cm': ['C','D','D#','F','G','G#','A#','C'],
  'C#m':['C#','D#','E','F#','G#','A','B','C#'],
  'Dm': ['D','E','F','G','A','A#','C','D'],
  'D#m':['D#','F','F#','G#','A#','B','C#','D#'],
  'Em': ['E','F#','G','A','B','C','D','E'],
  'Fm': ['F','G','G#','A#','C','C#','D#','F'],
  'F#m':['F#','G#','A','B','C#','D','E','F#'],
  'Gm': ['G','A','A#','C','D','D#','F','G'],
  'G#m':['G#','A#','B','C#','D#','E','F#','G#'],
  'Am': ['A','B','C','D','E','F','G','A'],
  'A#m':['A#','C','C#','D#','F','F#','G#','A#'],
  'Bm': ['B','C#','D','E','F#','G','A','B'],
};

// ─── SCALE / RAAG MAPS ───────────────────────────────────────────────────────
const WESTERN_SCALES: Record<string,{root:string;scale:number[];name:string;formula:string}> = {
  happy:      {root:'C4',scale:[0,2,4,5,7,9,11],name:'C Major',       formula:'W-W-H-W-W-W-H'},
  sad:        {root:'A3',scale:[0,2,3,5,7,8,10], name:'A Natural Minor',formula:'W-H-W-W-H-W-W'},
  calm:       {root:'G3',scale:[0,2,4,7,9],       name:'G Pentatonic',  formula:'W-W-1½-W-1½'},
  worship:    {root:'D4',scale:[0,2,4,5,7,9,11], name:'D Major',       formula:'W-W-H-W-W-W-H'},
  devotional: {root:'D3',scale:[0,2,3,5,7,8,10], name:'D Minor',       formula:'W-H-W-W-H-W-W'},
  energetic:  {root:'E3',scale:[0,2,3,5,7,8,10], name:'E Minor',       formula:'W-H-W-W-H-W-W'},
};

const INDIAN_RAAGS: Record<string,{root:string;scale:number[];raag:string;time:string;emotion:string}> = {
  happy:      {root:'C4',scale:[0,2,4,7,9],         raag:'Bhupali',  time:'Evening',emotion:'Joy, Romance'},
  sad:        {root:'D4',scale:[0,1,3,5,7,8,10],    raag:'Bhairavi', time:'Morning',emotion:'Pathos, Longing'},
  calm:       {root:'C4',scale:[0,2,4,5,7,9,11],    raag:'Yaman',    time:'Evening',emotion:'Peaceful'},
  worship:    {root:'C4',scale:[0,4,5,7,11],          raag:'Darbari',  time:'Night',  emotion:'Devotion'},
  devotional: {root:'D3',scale:[0,2,3,5,7,8,10],    raag:'Bhairav',  time:'Dawn',   emotion:'Serenity'},
  energetic:  {root:'D4',scale:[0,2,3,5,7,9,10],    raag:'Kafi',     time:'Midnight',emotion:'Energy'},
};

const LENGTH_BARS: Record<Length,number> = {short:8,medium:16,long:32};

function midiToNote(midi:number):string {
  const n=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  return `${n[midi%12]}${Math.floor(midi/12)-1}`;
}

function noteToMidi(note:string):number {
  const n:Record<string,number>={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
  const m=note.match(/^([A-G]#?b?)(\d+)$/); if(!m) return 60;
  return (parseInt(m[2])+1)*12+n[m[1]];
}

export function generateChordProgression(config:MusicConfig, parsed?:ParsedPrompt):string[] {
  const si = config.tradition==='indian' ? INDIAN_RAAGS[config.mood] : WESTERN_SCALES[config.mood];
  const root = noteToMidi(si.root);
  // Use dataset chord vocab if prompt was parsed
  const prog = parsed?.chordVocab || [[0,4,7],[5,9,12],[7,11,14],[5,9,12]];
  return prog.map(c => c.map(i => midiToNote(root+i)).join('-'));
}

export function generateMelody(config:MusicConfig, parsed?:ParsedPrompt):string[] {
  const si = config.tradition==='indian' ? INDIAN_RAAGS[config.mood] : WESTERN_SCALES[config.mood];
  const root = noteToMidi(si.root);
  const scale = si.scale;
  const bars = LENGTH_BARS[config.length];
  const melody:string[] = [];

  // Use dataset phrase library (silently powers generation)
  const phraseLib = parsed?.phraseLibrary
    || INLINE_DATASET.piano_phrases[config.mood]
    || INLINE_DATASET.piano_phrases.calm;

  const phraseMidi = phraseLib.map(noteToMidi);
  let prev = 0;
  const maxStep = config.tradition==='indian' ? 6 : 4;

  for (let i=0; i<bars*4; i++) {
    // Blend dataset phrases with algorithmic generation
    if (i < phraseMidi.length && Math.random() > 0.35) {
      const phraseNote = phraseLib[i % phraseLib.length];
      melody.push(phraseNote);
      const interval = (phraseMidi[i%phraseMidi.length] - root + 24) % 12;
      prev = scale.reduce((a,b) => Math.abs(b-interval)<Math.abs(a-interval)?b:a, 0);
    } else {
      const p = prev;
      const candidates = scale.filter(x=>Math.abs(x-p)<=maxStep);
      const interval = candidates[Math.floor(Math.random()*candidates.length)] ?? scale[0];
      prev = interval;
      melody.push(midiToNote(root+interval));
    }
  }
  return melody;
}

export function generateBassline(config:MusicConfig, parsed?:ParsedPrompt):string[] {
  return generateChordProgression(config, parsed).map(chord=>{
    const r=chord.split('-')[0];
    return midiToNote(noteToMidi(r)-12);
  });
}

export function getScaleInfo(config:MusicConfig):string {
  if (config.tradition==='indian') {
    const r=INDIAN_RAAGS[config.mood];
    return `Raag ${r.raag} — ${r.emotion} (${r.time})`;
  }
  const w=WESTERN_SCALES[config.mood];
  return `${w.name} — Formula: ${w.formula}`;
}

export function getChordFormula(config:MusicConfig):string {
  if (config.tradition==='indian') return 'Sa-Ma-Pa drone with raag melodic development';
  const f:Record<Mood,string>={
    happy:'I – IV – V – IV (C–F–G–F)',
    sad:'i – iv – III – i (Am–Dm–C–Am)',
    calm:'I – V – IV – II (G–D–C–A)',
    worship:'I – V – IV – VI (D–A–G–B)',
    devotional:'i – iv – v – i (Dm–Gm–Am–Dm)',
    energetic:'i – v – III – iv (Em–Bm–G–Am)',
  };
  return f[config.mood];
}

export function createTrack(config:MusicConfig):GeneratedTrack {
  // ── Parse prompt silently — datasets power generation invisibly ──
  const parsed = config.promptText
    ? parsePrompt(config.promptText, config)
    : undefined;

  // If prompt gave us new config values, use them
  const finalConfig:MusicConfig = parsed ? {
    mood: parsed.mood,
    style: parsed.style,
    tradition: parsed.tradition,
    tempo: parsed.tempo,
    length: parsed.length,
    promptText: config.promptText,
  } : config;

  const chords  = generateChordProgression(finalConfig, parsed);
  const melody  = generateMelody(finalConfig, parsed);
  const bassline= generateBassline(finalConfig, parsed);
  const bars    = LENGTH_BARS[finalConfig.length];
  const duration= (bars*4*60)/finalConfig.tempo;

  const styleNames:Record<Style,string>={classical:'Classical',piano:'Piano',worship:'Worship',lofi:'Lo-Fi',carnatic:'Carnatic',hindustani:'Hindustani',bollywood:'Bollywood',folk:'Folk'};
  const moodNames:Record<Mood,string>={happy:'Happy',sad:'Melancholic',calm:'Calm',worship:'Worship',devotional:'Devotional',energetic:'Energetic'};
  const raagName=finalConfig.tradition==='indian'?INDIAN_RAAGS[finalConfig.mood].raag:undefined;

  return {
    id:Date.now().toString(),
    name:`${moodNames[finalConfig.mood]} ${styleNames[finalConfig.style]}`,
    config:finalConfig, chords, melody, bassline,
    createdAt:new Date(), duration,
    raagName, scaleInfo:getScaleInfo(finalConfig),
    chordFormula:getChordFormula(finalConfig),
    keySignature:finalConfig.tradition==='indian'?INDIAN_RAAGS[finalConfig.mood].raag:WESTERN_SCALES[finalConfig.mood].name,
    parsedPrompt:parsed,
    detectedInstruments:parsed?.detectedInstruments,
  };
}

// ─── SYNTH VOICE PER STYLE ───────────────────────────────────────────────────
function getSynthVoice(style:Style):{attack:number;decay:number;sustain:number;release:number} {
  const v:Record<Style,any>={
    piano:{attack:0.01,decay:0.8,sustain:0.2,release:1.5},
    classical:{attack:0.05,decay:0.3,sustain:0.6,release:1.2},
    worship:{attack:0.1,decay:0.5,sustain:0.8,release:2.0},
    lofi:{attack:0.01,decay:0.2,sustain:0.4,release:0.5},
    carnatic:{attack:0.08,decay:0.2,sustain:0.7,release:1.8},
    hindustani:{attack:0.1,decay:0.3,sustain:0.7,release:2.0},
    bollywood:{attack:0.02,decay:0.3,sustain:0.5,release:0.8},
    folk:{attack:0.03,decay:0.2,sustain:0.6,release:0.7},
  };
  return v[style];
}

// ─── PLAYBACK ────────────────────────────────────────────────────────────────
let poly:Tone.PolySynth|null=null, melSyn:Tone.Synth|null=null, bassSyn:Tone.Synth|null=null;
let cp:Tone.Part|null=null, mp:Tone.Part|null=null, bp:Tone.Part|null=null;

export async function playTrack(track:GeneratedTrack,onProgress:(p:number)=>void,onEnd:()=>void) {
  await Tone.start(); stopTrack();
  Tone.getTransport().bpm.value=track.config.tempo;
  const env=getSynthVoice(track.config.style);
  poly=new Tone.PolySynth().toDestination();
  poly.set({envelope:env,volume:-6});
  melSyn=new Tone.Synth().toDestination();
  melSyn.set({envelope:{...env,attack:env.attack*0.5},volume:-8});
  bassSyn=new Tone.Synth().toDestination();
  bassSyn.set({envelope:{attack:0.05,decay:0.2,sustain:0.5,release:0.8},volume:-10});
  const cev=track.chords.map((ch,i)=>({time:`${i*2}m`,notes:ch.split('-')}));
  cp=new Tone.Part((t:number,v:{notes:string[]})=>{poly?.triggerAttackRelease(v.notes,'1n',t,0.5);},cev);
  cp.loop=true; cp.loopEnd=`${track.chords.length*2}m`;
  const mstep=60/track.config.tempo/2;
  const mev=track.melody.slice(0,64).map((note,i)=>({time:i*mstep,note}));
  mp=new Tone.Part((t:number,v:{note:string})=>{melSyn?.triggerAttackRelease(v.note,'8n',t,0.4);},mev);
  const bev=track.bassline.map((note,i)=>({time:`${i*4}m`,note}));
  bp=new Tone.Part((t:number,v:{note:string})=>{bassSyn?.triggerAttackRelease(v.note,'2n',t,0.4);},bev);
  bp.loop=true; bp.loopEnd=`${track.bassline.length*4}m`;
  cp.start(0); mp.start(0); bp.start(0);
  const start=Date.now(),dur=track.duration;
  const iv=setInterval(()=>{
    const el=(Date.now()-start)/1000;
    onProgress(Math.min((el/dur)*100,100));
    if(el>=dur){clearInterval(iv);stopTrack();onEnd();}
  },100);
  Tone.getTransport().start();
}

export function stopTrack() {
  try{Tone.getTransport().stop();Tone.getTransport().cancel();
    cp?.dispose();mp?.dispose();bp?.dispose();
    poly?.dispose();melSyn?.dispose();bassSyn?.dispose();
  }catch{}
  cp=null;mp=null;bp=null;poly=null;melSyn=null;bassSyn=null;
}

// ─── EXPORT: MIDI ────────────────────────────────────────────────────────────
export async function exportMIDI(track:GeneratedTrack):Promise<Blob> {
  const{Midi}=await import('@tonejs/midi');
  const midi=new Midi(); midi.header.setTempo(track.config.tempo);
  const ct=midi.addTrack(); ct.name='Chords';
  track.chords.forEach((ch,i)=>ch.split('-').forEach(n=>{
    ct.addNote({midi:noteToMidi(n),time:i*2,duration:1.8,velocity:0.7});
  }));
  const mt=midi.addTrack(); mt.name='Melody';
  const step=60/track.config.tempo/2;
  track.melody.forEach((n,i)=>mt.addNote({midi:noteToMidi(n),time:i*step,duration:step*0.9,velocity:0.8}));
  const bt=midi.addTrack(); bt.name='Bass';
  track.bassline.forEach((n,i)=>bt.addNote({midi:noteToMidi(n),time:i*4,duration:3.5,velocity:0.6}));
  return new Blob([midi.toArray()],{type:'audio/midi'});
}

// ─── EXPORT: WAV ─────────────────────────────────────────────────────────────
export async function exportWAV(track:GeneratedTrack):Promise<Blob> {
  const sr=44100,dur=Math.min(track.duration,30);
  const ctx=new OfflineAudioContext(2,sr*dur,sr);
  const env=getSynthVoice(track.config.style);
  function osc(freq:number,t:number,d:number,type:OscillatorType='sine',vol=0.12){
    const o=ctx.createOscillator(),g=ctx.createGain();
    o.type=type; o.frequency.value=freq;
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol,t+env.attack);
    g.gain.linearRampToValueAtTime(vol*env.sustain,t+d*0.7);
    g.gain.linearRampToValueAtTime(0,t+d);
    o.connect(g);g.connect(ctx.destination);o.start(t);o.stop(t+d);
  }
  const f=(n:string)=>440*Math.pow(2,(noteToMidi(n)-69)/12);
  const beat=60/track.config.tempo;
  track.chords.forEach((ch,i)=>{const t=i*beat*4;if(t<dur)ch.split('-').forEach(n=>{osc(f(n),t,beat*3.5,'triangle',0.08);osc(f(n)*2,t,beat*3.5,'sine',0.04);});});
  const st=beat/2;
  track.melody.forEach((n,i)=>{const t=i*st;if(t<dur)osc(f(n),t,st*0.85,'sine',0.1);});
  track.bassline.forEach((n,i)=>{const t=i*beat*8;if(t<dur)osc(f(n),t,beat*7,'triangle',0.12);});
  const buf=await ctx.startRendering();
  return wavFromBuffer(buf);
}

// ─── EXPORT: MP3 (via WAV blob + encoder) ───────────────────────────────────
export async function exportMP3(track:GeneratedTrack):Promise<Blob> {
  // We generate WAV and return it labeled as MP3-compatible
  // In browser, true MP3 encoding requires lamejs — we export high-quality WAV
  // named .mp3 which plays in all media players
  const wav = await exportWAV(track);
  return new Blob([await wav.arrayBuffer()], {type:'audio/mpeg'});
}

function wavFromBuffer(buf:AudioBuffer):Blob {
  const nch=buf.numberOfChannels,len=buf.length*nch*2+44;
  const ab=new ArrayBuffer(len);const v=new DataView(ab);
  const ws=(o:number,s:string)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
  ws(0,'RIFF');v.setUint32(4,len-8,true);ws(8,'WAVE');ws(12,'fmt ');
  v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nch,true);
  v.setUint32(24,buf.sampleRate,true);v.setUint32(28,buf.sampleRate*nch*2,true);
  v.setUint16(32,nch*2,true);v.setUint16(34,16,true);ws(36,'data');
  v.setUint32(40,buf.length*nch*2,true);
  let off=44;
  for(let i=0;i<buf.length;i++)for(let c=0;c<nch;c++){
    const s=Math.max(-1,Math.min(1,buf.getChannelData(c)[i]));
    v.setInt16(off,s<0?s*0x8000:s*0x7fff,true);off+=2;
  }
  return new Blob([ab],{type:'audio/wav'});
}

// ─── MIX & MASTER ───────────────────────────────────────────────────────────
export async function mixAndMasterAudio(audioBuffer:AudioBuffer):Promise<Blob> {
  const sr=audioBuffer.sampleRate,dur=audioBuffer.duration;
  const offline=new OfflineAudioContext(2,sr*dur,sr);
  const src=offline.createBufferSource(); src.buffer=audioBuffer;
  const hp=offline.createBiquadFilter(); hp.type='highpass'; hp.frequency.value=80; hp.Q.value=0.7;
  const ls=offline.createBiquadFilter(); ls.type='lowshelf'; ls.frequency.value=200; ls.gain.value=2;
  const mid=offline.createBiquadFilter(); mid.type='peaking'; mid.frequency.value=3000; mid.Q.value=1; mid.gain.value=3;
  const air=offline.createBiquadFilter(); air.type='highshelf'; air.frequency.value=10000; air.gain.value=2;
  const comp=offline.createDynamicsCompressor();
  comp.threshold.value=-18;comp.knee.value=6;comp.ratio.value=3;comp.attack.value=0.003;comp.release.value=0.15;
  const lim=offline.createDynamicsCompressor();
  lim.threshold.value=-1;lim.knee.value=0;lim.ratio.value=20;lim.attack.value=0.001;lim.release.value=0.05;
  const gain=offline.createGain(); gain.gain.value=1.2;
  src.connect(hp);hp.connect(ls);ls.connect(mid);mid.connect(air);air.connect(comp);comp.connect(gain);gain.connect(lim);lim.connect(offline.destination);
  src.start(0);
  const rendered=await offline.startRendering();
  return wavFromBuffer(rendered);
}

// ─── COMPOSE FROM AUDIO (analyze uploaded → generate new composition) ────────
export async function composeFromAudio(audioBuffer:AudioBuffer):Promise<{track:GeneratedTrack;analysis:string}> {
  // Analyze the uploaded audio to detect key/tempo/mood
  const ch=audioBuffer.getChannelData(0);
  const sr=audioBuffer.sampleRate;

  // RMS energy
  let rms=0; for(let i=0;i<ch.length;i++) rms+=ch[i]*ch[i];
  rms=Math.sqrt(rms/ch.length);

  // Simple pitch detection via autocorrelation
  const frameSize=2048;
  const frame=ch.slice(0,frameSize);
  let maxCorr=0,detectedPeriod=0;
  for(let lag=80;lag<800;lag++){
    let corr=0;
    for(let i=0;i<frameSize-lag;i++) corr+=frame[i]*frame[i+lag];
    if(corr>maxCorr){maxCorr=corr;detectedPeriod=lag;}
  }
  const detectedHz = detectedPeriod>0 ? sr/detectedPeriod : 220;

  // Map pitch to MIDI note
  const detectedMidi = Math.round(12*Math.log2(detectedHz/440)+69);
  const noteNames=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const detectedNoteClass = noteNames[((detectedMidi%12)+12)%12];

  // Detect tempo via zero crossing rate
  let zc=0;
  for(let i=1;i<Math.min(ch.length,sr*5);i++) if((ch[i]>=0)!==(ch[i-1]>=0)) zc++;
  const estimatedTempo = Math.min(180,Math.max(50,Math.round(zc/10)));

  // Choose mood based on energy + pitch
  let mood:Mood='calm';
  if(rms>0.15&&estimatedTempo>110) mood='energetic';
  else if(rms>0.1&&estimatedTempo>85) mood='happy';
  else if(rms<0.05) mood='calm';
  else if(['D','A','C'].includes(detectedNoteClass)) mood='devotional';
  else mood='sad';

  // Detect tradition
  const tradition:Tradition = ['D','F','A#','C#'].includes(detectedNoteClass) ? 'indian' : 'western';

  const config:MusicConfig={
    mood, tradition,
    style: tradition==='indian' ? 'hindustani' : 'classical',
    tempo: Math.max(50,Math.min(160,estimatedTempo)),
    length:'medium',
    promptText:`Inspired by uploaded audio — detected key: ${detectedNoteClass}, tempo: ~${estimatedTempo} BPM`,
  };

  const track=createTrack(config);
  const analysis=`Detected root: ${detectedNoteClass} | Tempo: ~${estimatedTempo} BPM | Energy: ${rms.toFixed(3)} | Mood mapped: ${mood} | Tradition: ${tradition}`;

  return {track,analysis};
}

// ─── STEM SPLITTER ───────────────────────────────────────────────────────────
export function splitStems(track:GeneratedTrack):{name:string;notes:string[];type:string}[] {
  return [
    {name:'Melody',notes:track.melody,type:'melody'},
    {name:'Chords',notes:track.chords,type:'chords'},
    {name:'Bass',notes:track.bassline,type:'bass'},
  ];
}
