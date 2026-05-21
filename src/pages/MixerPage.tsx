import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, Play, Square, Sliders, CheckCircle, AlertCircle, Sparkles, Music2 } from 'lucide-react';
import { mixAndMasterAudio, composeFromAudio, playTrack, stopTrack } from '../engine/musicEngine';
import type { GeneratedTrack } from '../engine/musicEngine';
import WaveformDisplay from '../components/WaveformDisplay';

type Stage = 'idle'|'loaded'|'mixing'|'done'|'composing'|'composed'|'error';

export default function MixerPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [fileName, setFileName] = useState('');
  const [masteredUrl, setMasteredUrl] = useState<string|null>(null);
  const [originalUrl, setOriginalUrl] = useState<string|null>(null);
  const [analysisText, setAnalysisText] = useState('');
  const [composedTrack, setComposedTrack] = useState<GeneratedTrack|null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playingType, setPlayingType] = useState<'original'|'mastered'|'composed'|null>(null);
  const [mixProgress, setMixProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const bufferRef = useRef<AudioBuffer|null>(null);
  const origAudioRef = useRef<HTMLAudioElement|null>(null);
  const mastAudioRef = useRef<HTMLAudioElement|null>(null);

  const handleFile = async (e:React.ChangeEvent<HTMLInputElement>) => {
    const file=e.target.files?.[0]; if(!file) return;
    setFileName(file.name); setStage('loaded');
    setMasteredUrl(null); setComposedTrack(null); setAnalysisText('');
    try {
      const arr=await file.arrayBuffer();
      const ctx=new AudioContext();
      bufferRef.current=await ctx.decodeAudioData(arr);
      setOriginalUrl(URL.createObjectURL(file));
    } catch { setErrorMsg('Could not decode audio.'); setStage('error'); }
  };

  const handleMixMaster = async () => {
    if(!bufferRef.current) return;
    setStage('mixing'); setMixProgress(0);
    const tick=setInterval(()=>setMixProgress(p=>{if(p>=88){clearInterval(tick);return 88;} return p+9;}),300);
    try {
      const blob=await mixAndMasterAudio(bufferRef.current);
      clearInterval(tick); setMixProgress(100);
      setMasteredUrl(URL.createObjectURL(blob));
      setStage('done');
    } catch { clearInterval(tick); setErrorMsg('Mixing failed.'); setStage('error'); }
  };

  const handleComposeFromAudio = async () => {
    if(!bufferRef.current) return;
    setStage('composing'); setMixProgress(0);
    const tick=setInterval(()=>setMixProgress(p=>{if(p>=85){clearInterval(tick);return 85;}return p+7;}),250);
    try {
      const{track,analysis}=await composeFromAudio(bufferRef.current);
      clearInterval(tick); setMixProgress(100);
      setComposedTrack(track); setAnalysisText(analysis);
      setStage('composed');
    } catch { clearInterval(tick); setErrorMsg('Composition analysis failed.'); setStage('error'); }
  };

  const playAudio=(type:'original'|'mastered')=>{
    const url=type==='original'?originalUrl:masteredUrl;
    if(!url) return;
    const ref=type==='original'?origAudioRef:mastAudioRef;
    if(playingType===type){ ref.current?.pause(); setPlayingType(null); return; }
    origAudioRef.current?.pause(); mastAudioRef.current?.pause();
    if(!ref.current){ ref.current=new Audio(url); ref.current.onended=()=>setPlayingType(null); }
    ref.current.play(); setPlayingType(type);
  };

  const handlePlayComposed=async()=>{
    if(!composedTrack) return;
    if(playing){ stopTrack(); setPlaying(false); setProgress(0); return; }
    setPlaying(true);
    await playTrack(composedTrack,p=>setProgress(p),()=>{setPlaying(false);setProgress(0);});
  };

  const handleDL=(url:string,name:string)=>{
    const a=document.createElement('a');a.href=url;a.download=name;a.click();
  };

  const handleDLComposed=async(type:'midi'|'wav'|'mp3')=>{
    if(!composedTrack) return;
    const{exportMIDI,exportWAV,exportMP3}=await import('../engine/musicEngine');
    let blob:Blob,filename:string;
    if(type==='midi'){blob=await exportMIDI(composedTrack);filename=`${composedTrack.name.replace(/ /g,'_')}.mid`;}
    else if(type==='mp3'){blob=await exportMP3(composedTrack);filename=`${composedTrack.name.replace(/ /g,'_')}.mp3`;}
    else{blob=await exportWAV(composedTrack);filename=`${composedTrack.name.replace(/ /g,'_')}.wav`;}
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=filename;a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mixer-page">
      <div className="mixer-hero">
        <Sliders size={28}/>
        <div>
          <h1>Mix, Master & Compose</h1>
          <p>Upload audio → professional mastering OR generate a new AI composition inspired by it</p>
        </div>
      </div>

      {/* DSP Chain */}
      <div className="chain-display">
        {['HP Filter','Low Shelf','Mid Presence','Air Shelf','Compressor','Limiter','Output'].map((s,i,a)=>(
          <React.Fragment key={s}>
            <div className={`chain-node ${['done','composing','composed'].includes(stage)?'active':''}`}>{s}</div>
            {i<a.length-1&&<div className="chain-arrow">→</div>}
          </React.Fragment>
        ))}
      </div>

      <div className="mixer-main">
        {/* Upload */}
        <div className={`upload-zone ${stage!=='idle'?'uploaded':''}`}>
          <label className="upload-label">
            <input type="file" accept="audio/*" onChange={handleFile} style={{display:'none'}}/>
            {stage==='idle'?(
              <><Upload size={40} className="upload-icon"/>
                <div className="upload-title">Drop your audio here</div>
                <div className="upload-sub">MP3, WAV, M4A, MPEG — any audio</div>
                <div className="upload-btn-fake">Choose File</div></>
            ):(
              <div className="upload-loaded">
                <Music2 size={28} style={{color:'var(--accent2)'}}/>
                <div className="upload-filename">{fileName}</div>
                <div className="upload-reupload">Click to change file</div>
              </div>
            )}
          </label>
        </div>

        {/* Original playback */}
        {originalUrl&&stage!=='idle'&&(
          <div className="audio-row">
            <span className="audio-row-label">Original</span>
            <button className={`mini-play-btn ${playingType==='original'?'playing':''}`} onClick={()=>playAudio('original')}>
              {playingType==='original'?<Square size={13}/>:<Play size={13}/>} {playingType==='original'?'Stop':'Play'}
            </button>
          </div>
        )}

        {/* Two action buttons */}
        {(stage==='loaded'||stage==='done'||stage==='composed')&&(
          <div className="mixer-actions">
            <button className="master-btn" onClick={handleMixMaster}>
              <Sliders size={18}/><span>Mix & Master</span>
            </button>
            <button className="compose-from-btn" onClick={handleComposeFromAudio}>
              <Sparkles size={18}/><span>Generate New Composition</span>
            </button>
          </div>
        )}

        {/* Progress bar */}
        {(stage==='mixing'||stage==='composing')&&(
          <div className="mix-progress">
            <div className="mix-progress-label">
              {stage==='mixing'?'Applying mastering chain…':'Analyzing audio + composing new piece…'}
            </div>
            <div className="mix-progress-bar"><div className="mix-progress-fill" style={{width:`${mixProgress}%`}}/></div>
          </div>
        )}

        {/* Mastered result */}
        {masteredUrl&&(
          <div className="mastered-card">
            <div className="mastered-title"><CheckCircle size={16} style={{color:'#34d399'}}/> Mastered Version Ready</div>
            <div className="mastered-improvements">
              {['HP filter (80Hz)','Low shelf +2dB','Mid presence +3dB','Air shelf +2dB','Compression 3:1','Brick-wall limiter'].map(s=>(
                <div key={s} className="improvement-item">✅ {s}</div>
              ))}
            </div>
            <div className="mastered-actions">
              <button className={`mini-play-btn ${playingType==='mastered'?'playing':''}`} onClick={()=>playAudio('mastered')}>
                {playingType==='mastered'?<Square size={13}/>:<Play size={13}/>} {playingType==='mastered'?'Stop':'Play Mastered'}
              </button>
              <button className="download-master-btn" onClick={()=>handleDL(masteredUrl,`${fileName.replace(/\.[^.]+$/,'')}_mastered.wav`)}>
                <Download size={14}/> WAV
              </button>
            </div>
          </div>
        )}

        {/* Composed result */}
        {composedTrack&&stage==='composed'&&(
          <div className="composed-card">
            <div className="composed-title"><Sparkles size={16} style={{color:'var(--accent2)'}}/> New AI Composition Generated!</div>
            <div className="composed-analysis">{analysisText}</div>
            <div className="composed-track-info">
              <span className="ct-name">{composedTrack.name}</span>
              <span className="ct-detail">{composedTrack.config.tempo} BPM</span>
              <span className="ct-detail">{composedTrack.scaleInfo}</span>
            </div>
            <WaveformDisplay playing={playing} progress={progress} mood={composedTrack.config.mood}/>
            {playing&&<div className="progress-bar-wrap"><div className="progress-bar-fill" style={{width:`${progress}%`}}/></div>}
            <div className="composed-actions">
              <button className={`mini-play-btn ${playing?'playing':''}`} onClick={handlePlayComposed}>
                {playing?<><Square size={13}/> Stop</>:<><Play size={13}/> Play</>}
              </button>
              <button className="download-master-btn" onClick={()=>handleDLComposed('midi')}><Download size={14}/> MIDI</button>
              <button className="download-master-btn" onClick={()=>handleDLComposed('wav')}><Download size={14}/> WAV</button>
              <button className="download-master-btn" onClick={()=>handleDLComposed('mp3')}><Download size={14}/> MP3</button>
            </div>
          </div>
        )}

        {stage==='error'&&<div className="mix-error"><AlertCircle size={16}/> {errorMsg}</div>}
      </div>
    </div>
  );
}
