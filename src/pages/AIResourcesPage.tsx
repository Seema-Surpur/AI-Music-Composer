import React, { useState } from 'react';
import { Brain, ExternalLink, Layers, Database, Music2, GitBranch } from 'lucide-react';

type Tab = 'github'|'daw'|'buildpath';

interface GHProject {
  name:string; org:string; desc:string; useCase:string;
  url:string; stars:string; type:'model'|'tool'|'dataset'|'audio';
  difficulty:'beginner'|'intermediate'|'advanced';
}

const GH_PROJECTS:GHProject[] = [
  {name:'magenta',          org:'google-magenta', desc:'Google\'s AI music & art generation platform. Melody generation, drum generation, style transfer, performance RNN.',useCase:'Melody + chord generation, MIDI output',url:'https://github.com/magenta/magenta',stars:'19k+',type:'model',difficulty:'beginner'},
  {name:'music-transformer', org:'google-magenta',desc:'Transformer architecture for music composition. Better long-term structure than LSTM. Generates coherent multi-bar sequences.',useCase:'Long-form composition, chord memory',url:'https://github.com/magenta/magenta/tree/main/magenta/models/music_transformer',stars:'Magenta repo',type:'model',difficulty:'intermediate'},
  {name:'jukebox',           org:'openai',         desc:'OpenAI\'s neural network that generates music with singing in the raw audio domain. High quality but computationally expensive.',useCase:'Direct audio generation with vocals',url:'https://github.com/openai/jukebox',stars:'8k+',type:'audio',difficulty:'advanced'},
  {name:'riffusion',         org:'riffusion',      desc:'Real-time music generation using stable diffusion on spectrograms. Practical and creative. Generates from text prompts.',useCase:'Text-to-music, real-time generation',url:'https://github.com/riffusion/riffusion',stars:'3k+',type:'audio',difficulty:'intermediate'},
  {name:'ddsp',              org:'magenta',         desc:'Differentiable Digital Signal Processing — synthesizes realistic instrument sounds using physics-based models.',useCase:'Natural instrument synthesis, Indian instruments',url:'https://github.com/magenta/ddsp',stars:'2.6k+',type:'tool',difficulty:'advanced'},
  {name:'musicgen',          org:'facebookresearch',desc:'Meta\'s state-of-the-art text-to-music model. Conditional music generation with melody conditioning.',useCase:'Prompt-to-music, style conditioning',url:'https://github.com/facebookresearch/audiocraft',stars:'20k+',type:'model',difficulty:'intermediate'},
  {name:'audiocraft',        org:'facebookresearch',desc:'Framework containing MusicGen + AudioGen. Best open-source music generation currently available.',useCase:'Production-quality music from text prompts',url:'https://github.com/facebookresearch/audiocraft',stars:'20k+',type:'model',difficulty:'intermediate'},
  {name:'spleeter',          org:'deezer-research', desc:'Deezer\'s source separation library. Splits mixed audio into stems: vocals, drums, bass, other.',useCase:'Real stem splitting from any audio file',url:'https://github.com/deezer/spleeter',stars:'25k+',type:'tool',difficulty:'beginner'},
  {name:'demucs',            org:'facebookresearch',desc:'Facebook\'s state-of-the-art music source separation. Better than Spleeter on most benchmarks.',useCase:'High-quality instrument stem separation',url:'https://github.com/facebookresearch/demucs',stars:'7k+',type:'tool',difficulty:'intermediate'},
  {name:'pretty_midi',       org:'craffel',         desc:'Python library for reading, writing and modifying MIDI files. Essential for all MIDI-based AI music work.',useCase:'MIDI file parsing + creation in Python',url:'https://github.com/craffel/pretty-midi',stars:'2k+',type:'tool',difficulty:'beginner'},
  {name:'music21',           org:'mit-music',       desc:'MIT\'s toolkit for computer-aided musicology. Music theory analysis, score parsing, Roman numeral analysis.',useCase:'Music theory analysis, raag detection',url:'https://github.com/cuthbertLab/music21',stars:'2k+',type:'tool',difficulty:'intermediate'},
];

const DAW_STEPS = {
  'FL Studio': {
    steps:[
      {n:'1', title:'Install FL Studio', desc:'Download from image-line.com. Fruity edition for MIDI, Producer edition for audio. Student discount available.'},
      {n:'2', title:'Load a VST', desc:'Go to Options → Manage Plugins → Add plugin folder. Add SwarPlug or Kontakt folder. Reload plugins.'},
      {n:'3', title:'Import Jubal MIDI', desc:'In FL Studio, right-click the pattern area → Import MIDI. Select your .mid file from Jubal. Each track (Melody/Chords/Bass) becomes a separate channel.'},
      {n:'4', title:'Assign Instruments', desc:'Click each channel → Assign a VST instrument (piano, sitar, tabla). Use Kontakt for orchestral, SwarPlug for Indian.'},
      {n:'5', title:'Mix Levels', desc:'Open Mixer (F9). Set volumes: Melody -3dB, Chords -6dB, Bass -8dB. Add reverb on Melody send.'},
      {n:'6', title:'Export', desc:'File → Export → MP3/WAV. Set quality to 320kbps for MP3, 44.1kHz 16-bit for WAV.'},
    ],
    tip:'Use the Piano Roll (F7) to edit individual notes from Jubal. Great for micro-editing melodies.',
  },
  'Ableton Live': {
    steps:[
      {n:'1', title:'Install Ableton', desc:'Download from ableton.com. Intro is free with basic features. Suite for advanced VST support.'},
      {n:'2', title:'Load VSTs', desc:'Preferences → Plug-Ins → VST2/VST3 folder. Rescan. Kontakt and SwarPlug appear in the instrument browser.'},
      {n:'3', title:'Drag Jubal MIDI', desc:'Drag the .mid file directly into Ableton\'s Session or Arrangement view. Tracks auto-populate with channels.'},
      {n:'4', title:'Assign Instruments', desc:'Double-click each track → drag VST instrument from browser. Set Melody → violin/bansuri, Chords → piano, Bass → bass guitar.'},
      {n:'5', title:'Apply Effects', desc:'Drag EQ Eight onto each track. High-pass Melody at 200Hz. Boost presence 3kHz. Add Reverb on send channel.'},
      {n:'6', title:'Master & Export', desc:'Add Glue Compressor + Limiter on Master track. File → Export Audio/Video → WAV 44.1kHz 24-bit.'},
    ],
    tip:'Ableton\'s Clip Launcher is perfect for looping Jubal\'s short/medium length tracks live.',
  },
};

const INLINE_DATASETS = [
  {name:'MAESTRO Phrases',      type:'piano',    desc:'Expressive piano timing patterns from professional performances. Powers the piano & classical style melody generation in Jubal.',        mood:'All moods',tradition:'Western',status:'Built-in'},
  {name:'Lakh MIDI Chord Vocab',type:'midi',     desc:'Chord progression vocabulary extracted from 170k+ MIDI files. Powers the chord progression generator for all 8 styles.',                mood:'All moods',tradition:'Both',   status:'Built-in'},
  {name:'Groove MIDI Patterns', type:'drums',    desc:'Real human drum timing patterns from Google Magenta. Powers the rhythm pattern selection in the Arrangement Engine.',                   mood:'All',       tradition:'Western',status:'Built-in'},
  {name:'CompMusic Raag Phrases',type:'indian',  desc:'Melodic phrases from Hindustani/Carnatic research corpus. Powers Indian tradition melody generation (Bhupali, Bhairavi, Yaman etc.)', mood:'All Indian',tradition:'Indian', status:'Built-in'},
  {name:'SARAGA Devotional',    type:'indian',   desc:'South Indian classical audio research data. Informs devotional and Carnatic style phrase generation.',                                  mood:'Devotional',tradition:'Indian', status:'Built-in'},
  {name:'NSynth Timbres',       type:'audio',    desc:'Instrument timbre profiles from Google\'s 300k note dataset. Used to shape synth envelope settings per instrument type.',            mood:'All',       tradition:'Both',   status:'Built-in'},
];

const DIFF_COLORS = {beginner:'#10b981',intermediate:'#f59e0b',advanced:'#ef4444'};
const TYPE_COLORS = {model:'#7c6dfa',tool:'#10b981',dataset:'#f59e0b',audio:'#ec4899'};

export default function AIResourcesPage() {
  const [tab, setTab] = useState<Tab>('github');
  const [daw, setDaw] = useState<keyof typeof DAW_STEPS>('FL Studio');

  return (
    <div className="ai-resources-page">
      <div className="air-hero">
        <Brain size={28}/>
        <div>
          <h1>AI Resources & Integration</h1>
          <p>GitHub projects, DAW integration, dataset architecture, build path</p>
        </div>
      </div>

      <div className="theory-tabs">
        <button className={`theory-tab ${tab==='github'?'active':''}`} onClick={()=>setTab('github')}>🤖 GitHub AI Projects</button>
        <button className={`theory-tab ${tab==='daw'?'active':''}`} onClick={()=>setTab('daw')}>🎛️ DAW Integration</button>
        <button className={`theory-tab ${tab==='buildpath'?'active':''}`} onClick={()=>setTab('buildpath')}>🚀 Pro Build Path</button>
      </div>

      {/* GitHub Projects */}
      {tab==='github' && (
        <div className="air-content">
          <div className="air-section-desc">
            The best open-source AI music repositories — from melody generation to stem separation to realistic instrument synthesis.
          </div>
          <div className="gh-grid">
            {GH_PROJECTS.map(p=>(
              <div key={p.name} className="gh-card">
                <div className="gh-card-top">
                  <div className="gh-badges">
                    <span className="gh-type-badge" style={{background:TYPE_COLORS[p.type]+'22',color:TYPE_COLORS[p.type],border:`1px solid ${TYPE_COLORS[p.type]}44`}}>{p.type}</span>
                    <span className="gh-diff-badge" style={{background:DIFF_COLORS[p.difficulty]+'22',color:DIFF_COLORS[p.difficulty],border:`1px solid ${DIFF_COLORS[p.difficulty]}44`}}>{p.difficulty}</span>
                  </div>
                  <span className="gh-stars">⭐ {p.stars}</span>
                </div>
                <div className="gh-name">{p.org}/<strong>{p.name}</strong></div>
                <div className="gh-desc">{p.desc}</div>
                <div className="gh-usecase"><span className="gh-uc-label">Use for:</span> {p.useCase}</div>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="gh-link">
                  <GitBranch size={13}/> View on GitHub <ExternalLink size={11}/>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* DAW Integration */}
      {tab==='daw' && (
        <div className="air-content">
          <div className="air-section-desc">
            How to take Jubal's exported MIDI/WAV files into a professional DAW for full production quality.
          </div>
          <div className="daw-selector">
            {(Object.keys(DAW_STEPS) as (keyof typeof DAW_STEPS)[]).map(d=>(
              <button key={d} className={`daw-sel-btn ${daw===d?'active':''}`} onClick={()=>setDaw(d)}>
                {d==='FL Studio'?'🎹':'🎛️'} {d}
              </button>
            ))}
          </div>
          <div className="daw-steps-list">
            {DAW_STEPS[daw].steps.map(s=>(
              <div key={s.n} className="daw-step">
                <div className="daw-step-num">{s.n}</div>
                <div className="daw-step-content">
                  <div className="daw-step-title">{s.title}</div>
                  <div className="daw-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="daw-tip"><span>💡 Pro Tip:</span> {DAW_STEPS[daw].tip}</div>
          <div className="vst-table-wrap">
            <div className="air-section-desc" style={{marginTop:24}}>Recommended VST Stack</div>
            <div className="vst-grid">
              {[
                {inst:'Piano',     vst:'Keyscape',           cost:'$399',why:'Most realistic piano available'},
                {inst:'Strings',   vst:'Spitfire LABS',      cost:'Free',why:'Professional orchestral strings'},
                {inst:'Indian All',vst:'SwarPlug 4',         cost:'~$60',why:'All Indian instruments in one'},
                {inst:'Drums',     vst:'Steven Slate Drums', cost:'$149',why:'Industry standard drum plugin'},
                {inst:'Pads/Synth',vst:'Omnisphere 2',       cost:'$499',why:'Best pad/texture library'},
                {inst:'General',   vst:'Kontakt 7 (Player)', cost:'Free',why:'Universal instrument player'},
              ].map(r=>(
                <div key={r.inst} className="vst-row">
                  <span className="vst-inst">{r.inst}</span>
                  <span className="vst-name">{r.vst}</span>
                  <span className={`vst-cost ${r.cost==='Free'?'free':''}`}>{r.cost}</span>
                  <span className="vst-why">{r.why}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Build Path */}
      {tab==='buildpath' && (
        <div className="air-content">
          <div className="air-section-desc">
            The recommended progression from basic MIDI generation to professional AI music production.
          </div>
          <div className="build-phases">
            {[
              {phase:'Phase 1', title:'MIDI + VSTs (Start Here)',color:'#10b981',status:'current',
                stack:['Dataset: Lakh MIDI + MAESTRO','Model: Music Transformer (Magenta)','Output: MIDI files','Sound: Kontakt Free Player + SwarPlug','DAW: FL Studio / Ableton'],
                desc:'Generate MIDI with Jubal, load into DAW, assign real VST instruments. This alone gives near-professional quality.'},
              {phase:'Phase 2', title:'Auto-Mixing + Drums',color:'#f59e0b',status:'next',
                stack:['Dataset: Groove MIDI (Google Magenta)','Add: Drum pattern generation','Add: DSP mastering chain (Jubal has this)','Add: Reverb / Stereo widening','Tool: iZotope Ozone Essentials'],
                desc:'Add Groove MIDI for realistic drum patterns. Implement DSP chain for automatic mixing. Jubal\'s Mix & Master page handles this.'},
              {phase:'Phase 3', title:'Audio Generation',color:'#7c6dfa',status:'future',
                stack:['Model: MusicGen (Meta AudioCraft)','Model: Riffusion (diffusion-based)','Tool: DDSP (realistic Indian instruments)','Output: Direct WAV audio','Advanced: Jukebox (OpenAI)'],
                desc:'Skip MIDI entirely and generate raw audio. MusicGen is the current best. Add DDSP for realistic Indian instrument simulation.'},
              {phase:'Phase 4', title:'Full Production Pipeline',color:'#ec4899',status:'future',
                stack:['Multi-track stem generation','Automatic arrangement (Jubal does this)','Stem separation (Spleeter/Demucs)','Vocal generation (RVC / SV2TTS)','Distribution-ready masters'],
                desc:'Complete end-to-end pipeline: prompt → arrangement → mix → master → distribute.'},
            ].map(p=>(
              <div key={p.phase} className={`phase-card ${p.status}`} style={{'--pc':p.color} as any}>
                <div className="pc-header">
                  <div className="pc-phase-badge" style={{background:p.color}}>{p.phase}</div>
                  <div className="pc-status">{p.status==='current'?'✅ Available Now':p.status==='next'?'🔄 In Progress':'🔮 Future'}</div>
                </div>
                <div className="pc-title">{p.title}</div>
                <p className="pc-desc">{p.desc}</p>
                <div className="pc-stack">
                  {p.stack.map(s=><div key={s} className="pc-stack-item">{s}</div>)}
                </div>
              </div>
            ))}
          </div>
          <div className="pro-combo">
            <div className="pro-combo-title">🔥 Pro Starter Combo (Best Value)</div>
            <div className="pro-combo-grid">
              {[['Dataset','MAESTRO + Lakh MIDI','Free'],['Model','Music Transformer (Magenta)','Free'],
                ['Output','MIDI → Jubal','Built-in'],['Sound','Kontakt Player + SwarPlug','$60'],
                ['DAW','FL Studio Producer','$99 (student)'],['Master','Jubal Mix & Master','Built-in']].map(r=>(
                <div key={r[0]} className="pcg-row">
                  <span className="pcg-role">{r[0]}</span>
                  <span className="pcg-tool">{r[1]}</span>
                  <span className={`pcg-cost ${r[2]==='Free'||r[2]==='Built-in'?'free':''}`}>{r[2]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
