import React, { useState, useCallback } from 'react';
import { Sparkles, Play, Square, Download, Save, Music, ChevronRight, Sun, Heart, Cloud, Zap, Flame, Wind, CheckCircle } from 'lucide-react';
import type { Mood, Style, Length, Tradition, GeneratedTrack, MusicConfig } from '../engine/musicEngine';
import { createTrack, playTrack, stopTrack, exportMIDI, exportWAV, exportMP3 } from '../engine/musicEngine';
import ChordVisualizer from '../components/ChordVisualizer';
import WaveformDisplay from '../components/WaveformDisplay';

interface Props { onAddToLibrary:(track:GeneratedTrack)=>void; }

const TRADITIONS:[{id:Tradition;label:string;flag:string;desc:string}] = [
  [{id:'western', label:'Western',  flag:'🎼', desc:'Scales, chords, harmony'},
   {id:'indian',  label:'Indian',   flag:'🪘', desc:'Raags, swaras, taals'}] as any
] as any;

const TRADITIONS_LIST:[{id:Tradition;label:string;flag:string;desc:string}] = [
  {id:'western',label:'Western',flag:'🎼',desc:'Scales, chords, harmony'},
  {id:'indian', label:'Indian', flag:'🪘',desc:'Raags, swaras, taals'},
] as any;

const MOODS = [
  {id:'happy' as Mood,     label:'Happy',      icon:<Sun size={16}/>,    color:'mood-happy',      desc:'Bright & uplifting'},
  {id:'sad' as Mood,       label:'Melancholic', icon:<Heart size={16}/>,  color:'mood-sad',        desc:'Deep & emotional'},
  {id:'calm' as Mood,      label:'Calm',        icon:<Cloud size={16}/>,  color:'mood-calm',       desc:'Peaceful & serene'},
  {id:'worship' as Mood,   label:'Worship',     icon:<Zap size={16}/>,    color:'mood-worship',    desc:'Sacred & devotional'},
  {id:'devotional' as Mood,label:'Devotional',  icon:<Flame size={16}/>,  color:'mood-devotional', desc:'Prayerful & deep'},
  {id:'energetic' as Mood, label:'Energetic',   icon:<Wind size={16}/>,   color:'mood-energetic',  desc:'Powerful & vibrant'},
];

const WESTERN_STYLES = [
  {id:'classical' as Style,emoji:'🎻',desc:'Orchestral elegance'},
  {id:'piano' as Style,    emoji:'🎹',desc:'Solo piano beauty'},
  {id:'worship' as Style,  emoji:'🙏',desc:'Spiritual harmony'},
  {id:'lofi' as Style,     emoji:'🎧',desc:'Chill vibes'},
];

const INDIAN_STYLES = [
  {id:'carnatic' as Style,   emoji:'🪗',desc:'South Indian classical'},
  {id:'hindustani' as Style, emoji:'🎸',desc:'North Indian classical'},
  {id:'bollywood' as Style,  emoji:'🎬',desc:'Filmi & fusion'},
  {id:'folk' as Style,       emoji:'🥁',desc:'Regional folk sounds'},
];

const LENGTHS = [
  {id:'short' as Length, label:'Short',  bars:'8 bars',  approx:'~15s'},
  {id:'medium' as Length,label:'Medium', bars:'16 bars', approx:'~30s'},
  {id:'long' as Length,  label:'Long',   bars:'32 bars', approx:'~60s'},
];

export default function GeneratorPage({onAddToLibrary}:Props) {
  const [tradition, setTradition] = useState<Tradition>('western');
  const [mood,    setMood]    = useState<Mood>('happy');
  const [style,   setStyle]   = useState<Style>('piano');
  const [length,  setLength]  = useState<Length>('medium');
  const [tempo,   setTempo]   = useState(90);
  const [promptText, setPromptText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [playing,    setPlaying]    = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [currentTrack, setCurrentTrack] = useState<GeneratedTrack|null>(null);
  const [saved,      setSaved]      = useState(false);
  const [exporting,  setExporting]  = useState<'midi'|'wav'|'mp3'|null>(null);
  const [promptResult, setPromptResult] = useState<string|null>(null);

  const styles = tradition==='indian' ? INDIAN_STYLES : WESTERN_STYLES;
  const tempoLabel = tempo<70?'Largo':tempo<90?'Adagio':tempo<110?'Andante':tempo<130?'Moderato':'Allegro';

  const handleTraditionChange=(t:Tradition)=>{
    setTradition(t);
    setStyle(t==='indian'?'carnatic':'piano');
  };

  const handleGenerate = useCallback(()=>{
    setGenerating(true); stopTrack(); setPlaying(false); setProgress(0); setSaved(false); setPromptResult(null);
    setTimeout(()=>{
      const config:MusicConfig={mood,style,tempo,length,tradition,promptText};
      const track=createTrack(config);
      setCurrentTrack(track);
      setGenerating(false);
      // Show what the prompt detected
      if(track.parsedPrompt && track.parsedPrompt.confidence>0) {
        const p=track.parsedPrompt;
        const tokens = p.parsedTokens.map(t=>t.replace(':',' → ')).join(' | ');
        setPromptResult(`Detected: ${tokens} (${p.confidence}% match)`);
        // Update UI sliders to match parsed values
        setMood(track.config.mood);
        setStyle(track.config.style);
        setTradition(track.config.tradition);
        setTempo(track.config.tempo);
        setLength(track.config.length);
      }
    },1200);
  },[mood,style,tempo,length,tradition,promptText]);

  const handlePlay=useCallback(async()=>{
    if(!currentTrack) return;
    if(playing){stopTrack();setPlaying(false);setProgress(0);return;}
    setPlaying(true);setProgress(0);
    await playTrack(currentTrack,p=>setProgress(p),()=>{setPlaying(false);setProgress(0);});
  },[currentTrack,playing]);

  const dl=async(type:'midi'|'wav'|'mp3')=>{
    if(!currentTrack) return;
    setExporting(type);
    let blob:Blob, filename:string;
    if(type==='midi'){blob=await exportMIDI(currentTrack); filename=`${currentTrack.name.replace(/ /g,'_')}.mid`;}
    else if(type==='mp3'){blob=await exportMP3(currentTrack); filename=`${currentTrack.name.replace(/ /g,'_')}.mp3`;}
    else{blob=await exportWAV(currentTrack); filename=`${currentTrack.name.replace(/ /g,'_')}.wav`;}
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);setExporting(null);
  };

  return (
    <div className="generator-page">
      <div className="gen-left">
        {/* Tradition */}
        <section className="config-section">
          <div className="section-label"><span className="section-num">00</span><span>Music Tradition</span></div>
          <div className="tradition-row">
            {(TRADITIONS_LIST as any[]).map((t:any)=>(
              <button key={t.id} className={`tradition-btn ${tradition===t.id?'active':''}`} onClick={()=>handleTraditionChange(t.id)}>
                <span className="tradition-flag">{t.flag}</span>
                <span className="tradition-label">{t.label}</span>
                <span className="tradition-desc">{t.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Prompt — NOW DRIVES GENERATION */}
        <section className="config-section">
          <div className="section-label"><span className="section-num">01</span><span>Prompt (auto-configures everything)</span></div>
          <textarea className="prompt-textarea"
            placeholder={'Try: "peaceful bansuri raag bhairav slow"\nor: "happy piano fast short"\nor: "devotional sitar tabla medium"'}
            value={promptText} onChange={e=>setPromptText(e.target.value)} rows={3}/>
          <div className="prompt-hint">💡 Type any mood, style, instrument, raag name, or tempo — AI parses it automatically</div>
          {promptResult && (
            <div className="prompt-result"><CheckCircle size={13}/><span>{promptResult}</span></div>
          )}
        </section>

        {/* Mood */}
        <section className="config-section">
          <div className="section-label"><span className="section-num">02</span><span>Mood <span className="section-auto">(auto-set by prompt)</span></span></div>
          <div className="mood-grid">
            {MOODS.map(m=>(
              <button key={m.id} className={`mood-card ${m.color} ${mood===m.id?'selected':''}`} onClick={()=>setMood(m.id)}>
                <div className="mood-icon">{m.icon}</div>
                <div className="mood-label">{m.label}</div>
                <div className="mood-desc">{m.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Style */}
        <section className="config-section">
          <div className="section-label"><span className="section-num">03</span><span>Style <span className="section-auto">(auto-set by prompt)</span></span></div>
          <div className="style-grid">
            {styles.map(s=>(
              <button key={s.id} className={`style-card ${style===s.id?'selected':''}`} onClick={()=>setStyle(s.id)}>
                <span className="style-emoji">{s.emoji}</span>
                <span className="style-label">{s.id.charAt(0).toUpperCase()+s.id.slice(1)}</span>
                <span className="style-desc">{s.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Controls */}
        <section className="config-section">
          <div className="section-label"><span className="section-num">04</span><span>Tempo & Length <span className="section-auto">(auto-set by prompt)</span></span></div>
          <div className="controls-row">
            <div className="tempo-control">
              <div className="control-header">
                <span className="control-name">Tempo</span>
                <span className="control-value">{tempo} BPM <em>{tempoLabel}</em></span>
              </div>
              <input type="range" min={50} max={180} value={tempo} onChange={e=>setTempo(Number(e.target.value))} className="tempo-slider"/>
              <div className="slider-labels"><span>Slow</span><span>Fast</span></div>
            </div>
            <div className="length-control">
              <div className="control-name">Length</div>
              <div className="length-options">
                {LENGTHS.map(l=>(
                  <button key={l.id} className={`length-btn ${length===l.id?'selected':''}`} onClick={()=>setLength(l.id)}>
                    <span className="length-label">{l.label}</span>
                    <span className="length-bars">{l.bars}</span>
                    <span className="length-approx">{l.approx}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <button className={`generate-btn ${generating?'loading':''}`} onClick={handleGenerate} disabled={generating}>
          {generating?(<><div className="spinner"/><span>Composing…</span></>):(<><Sparkles size={20}/><span>Generate Music</span><ChevronRight size={18}/></>)}
        </button>
      </div>

      <div className="gen-right">
        {!currentTrack&&!generating&&(
          <div className="empty-state">
            <div className="empty-icon"><Music size={48}/></div>
            <h3>Your composition will appear here</h3>
            <p>Type a prompt or select options — then Generate</p>
          </div>
        )}
        {generating&&(
          <div className="generating-state">
            <div className="gen-animation">{[...Array(5)].map((_,i)=><div key={i} className="gen-bar" style={{animationDelay:`${i*0.1}s`}}/>)}</div>
            <p>AI composing using built-in dataset…</p>
          </div>
        )}
        {currentTrack&&!generating&&(
          <div className="track-result">
            <div className="track-header">
              <div className="track-title-area">
                <h2 className="track-name">{currentTrack.name}</h2>
                <div className="track-meta">
                  <span className="meta-tag">{currentTrack.config.tradition}</span>
                  <span className="meta-tag">{currentTrack.config.style}</span>
                  <span className="meta-tag">{currentTrack.config.tempo} BPM</span>
                  <span className="meta-tag">{Math.round(currentTrack.duration)}s</span>
                  {currentTrack.raagName&&<span className="meta-tag meta-raag">Raag {currentTrack.raagName}</span>}
                </div>
              </div>
            </div>

            {/* Theory info */}
            <div className="theory-box">
              <div className="theory-row">
                <span className="theory-label">Scale / Raag</span>
                <span className="theory-value">{currentTrack.scaleInfo}</span>
              </div>
              <div className="theory-row">
                <span className="theory-label">Chord Formula</span>
                <span className="theory-value">{currentTrack.chordFormula}</span>
              </div>
              {currentTrack.detectedInstruments && currentTrack.detectedInstruments.length>0 && (
                <div className="theory-row">
                  <span className="theory-label">Instruments</span>
                  <span className="theory-value">{currentTrack.detectedInstruments.join(', ')}</span>
                </div>
              )}
              {currentTrack.parsedPrompt && currentTrack.parsedPrompt.confidence>0 && (
                <div className="theory-row">
                  <span className="theory-label">Dataset Used</span>
                  <span className="theory-value dataset-tag">
                    {currentTrack.config.tradition==='indian' ? '🇮🇳 CompMusic / SARAGA phrases' : '🎹 MAESTRO / Lakh MIDI phrases'}
                  </span>
                </div>
              )}
            </div>

            <WaveformDisplay playing={playing} progress={progress} mood={mood}/>
            {playing&&(<div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${progress}%`}}/></div>)}

            <div className="playback-controls">
              <button className={`play-btn ${playing?'playing':''}`} onClick={handlePlay}>
                {playing?<Square size={20}/>:<Play size={20}/>}
                <span>{playing?'Stop':'Play'}</span>
              </button>
              <div className="export-group">
                <button className="export-btn" onClick={()=>dl('midi')} disabled={!!exporting}>
                  <Download size={14}/>{exporting==='midi'?'…':'MIDI'}
                </button>
                <button className="export-btn" onClick={()=>dl('wav')} disabled={!!exporting}>
                  <Download size={14}/>{exporting==='wav'?'…':'WAV'}
                </button>
                <button className="export-btn export-mp3" onClick={()=>dl('mp3')} disabled={!!exporting}>
                  <Download size={14}/>{exporting==='mp3'?'…':'MP3'}
                </button>
                <button className={`save-btn ${saved?'saved':''}`} onClick={()=>{onAddToLibrary(currentTrack!);setSaved(true);}} disabled={saved}>
                  <Save size={14}/>{saved?'Saved!':'Save'}
                </button>
              </div>
            </div>

            <ChordVisualizer chords={currentTrack.chords} melody={currentTrack.melody.slice(0,16)}/>
          </div>
        )}
      </div>
    </div>
  );
}
