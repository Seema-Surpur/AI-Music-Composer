import React, { useState } from 'react';
import { Volume2, Play, Square, Info } from 'lucide-react';
import * as Tone from 'tone';

type Category = 'all'|'keyboard'|'strings'|'brass'|'percussion'|'indian-strings'|'indian-perc'|'indian-wind'|'hybrid';

interface Instrument {
  id:string; name:string; category:Category; emoji:string;
  tradition:'western'|'indian'|'both';
  description:string; vst:string; dataset:string;
  demoNotes:string[]; demoPattern:string;
  envelope:{attack:number;decay:number;sustain:number;release:number};
  synthType:'synth'|'poly'|'membrane'|'pluck';
}

const INSTRUMENTS:Instrument[] = [
  // ── KEYBOARD ──
  {id:'piano',       name:'Piano',              category:'keyboard',      emoji:'🎹',tradition:'western',description:'Grand piano — bright attack, natural decay. Industry standard for composition.',vst:'Keyscape / Kontakt Una Corda',dataset:'MAESTRO (200h, Google Magenta)',envelope:{attack:0.01,decay:0.8,sustain:0.2,release:1.5},synthType:'synth',demoNotes:['C4','E4','G4','B4','C5'],demoPattern:'arp'},
  {id:'epiano',      name:'Electric Piano',     category:'keyboard',      emoji:'🎷',tradition:'western',description:'Rhodes/Wurlitzer — warm bell-like attack, classic jazz/soul feel.',vst:'Scarbee Mark I / Native Instruments',dataset:'NSynth (electric-piano class)',envelope:{attack:0.01,decay:0.5,sustain:0.4,release:0.8},synthType:'synth',demoNotes:['E3','G3','B3','D4','E4'],demoPattern:'chord'},
  {id:'synth-pad',   name:'Synthesizer / Pad',  category:'keyboard',      emoji:'🎛️',tradition:'western',description:'Lush atmospheric pads — sustained evolving textures for cinematic work.',vst:'Omnisphere / Serum',dataset:'NSynth synthetic class',envelope:{attack:0.8,decay:0.3,sustain:0.9,release:2.0},synthType:'poly',demoNotes:['C3','E3','G3'],demoPattern:'chord'},
  {id:'organ',       name:'Organ',              category:'keyboard',      emoji:'⛪',tradition:'western',description:'Church / Hammond organ — sustained tonewheel, essential for worship.',vst:'GSi VB3-II / Hammond B3 (Kontakt)',dataset:'NSynth organ class',envelope:{attack:0.01,decay:0.01,sustain:1.0,release:0.1},synthType:'synth',demoNotes:['C3','G3','C4','E4','G4'],demoPattern:'chord'},
  // ── STRINGS ──
  {id:'acoustic-guitar',name:'Acoustic Guitar', category:'strings',       emoji:'🎸',tradition:'western',description:'Warm plucked strings — folk, pop, worship rhythm parts.',vst:'Ample Guitar / Kontakt Session Guitarist',dataset:'NSynth guitar class + GuitarSet',envelope:{attack:0.01,decay:0.3,sustain:0.4,release:0.6},synthType:'pluck',demoNotes:['E2','A2','D3','G3','B3'],demoPattern:'strum'},
  {id:'electric-guitar',name:'Electric Guitar', category:'strings',       emoji:'⚡',tradition:'western',description:'Clean and distorted electric tones — rock, blues, lead lines.',vst:'Helix Native / Bias FX / Kontakt',dataset:'NSynth guitar-electric class',envelope:{attack:0.01,decay:0.2,sustain:0.7,release:0.4},synthType:'synth',demoNotes:['E3','G3','B3','E4'],demoPattern:'arp'},
  {id:'bass-guitar',   name:'Bass Guitar',      category:'strings',       emoji:'🎵',tradition:'western',description:'Foundational low-end groove — electric bass for all genres.',vst:'Scarbee Bass / Kontakt',dataset:'NSynth bass class',envelope:{attack:0.02,decay:0.3,sustain:0.5,release:0.5},synthType:'synth',demoNotes:['E1','A1','D2','G2'],demoPattern:'walk'},
  {id:'violin',        name:'Violin',           category:'strings',       emoji:'🎻',tradition:'both',description:'Expressive bowed strings — melody, counter-melody, cinematic lines.',vst:'BBCSO / Spitfire Labs Strings',dataset:'NSynth string class + URMP',envelope:{attack:0.1,decay:0.1,sustain:0.8,release:0.4},synthType:'synth',demoNotes:['A4','B4','C5','D5','E5'],demoPattern:'melody'},
  {id:'viola',         name:'Viola',            category:'strings',       emoji:'🎼',tradition:'western',description:'Deeper bowed strings — rich mid-range, orchestral harmony and texture.',vst:'BBCSO Viola / Spitfire Labs',dataset:'URMP Viola class',envelope:{attack:0.12,decay:0.1,sustain:0.75,release:0.5},synthType:'synth',demoNotes:['C4','D4','E4','G4','A4'],demoPattern:'melody'},
  {id:'cello',         name:'Cello',            category:'strings',       emoji:'🎼',tradition:'western',description:'Deep rich bowed bass strings — emotional depth, cinematic scoring.',vst:'Spitfire Labs / BBCSO',dataset:'NSynth string-low class + URMP',envelope:{attack:0.12,decay:0.1,sustain:0.7,release:0.5},synthType:'synth',demoNotes:['C3','D3','E3','G3','A3'],demoPattern:'melody'},
  {id:'harp',          name:'Harp',             category:'strings',       emoji:'🪗',tradition:'western',description:'Glissando arpeggios — orchestral sparkle, fantasy & cinematic.',vst:'Etherealwinds Harp / Kontakt',dataset:'NSynth pluck class',envelope:{attack:0.01,decay:1.2,sustain:0.1,release:1.0},synthType:'pluck',demoNotes:['C4','E4','G4','B4','D5','F5'],demoPattern:'gliss'},
  // ── BRASS & WOODWINDS ──
  {id:'trumpet',       name:'Trumpet',          category:'brass',         emoji:'🎺',tradition:'western',description:'Bright powerful brass — fanfares, jazz solos, orchestral stabs.',vst:'Sample Modeling Trumpet / BBCSO',dataset:'NSynth brass class + URMP',envelope:{attack:0.04,decay:0.1,sustain:0.8,release:0.2},synthType:'synth',demoNotes:['G4','A4','B4','C5','D5'],demoPattern:'melody'},
  {id:'trombone',      name:'Trombone',         category:'brass',         emoji:'🎺',tradition:'western',description:'Smooth sliding brass — orchestral bass lines, jazz, gospel fills.',vst:'Sample Modeling Trombone / BBCSO',dataset:'NSynth brass-low class',envelope:{attack:0.06,decay:0.1,sustain:0.75,release:0.3},synthType:'synth',demoNotes:['G3','A3','B3','C4','D4'],demoPattern:'melody'},
  {id:'saxophone',     name:'Saxophone',        category:'brass',         emoji:'🎷',tradition:'western',description:'Jazzy soulful woodwind — alto/tenor sax for jazz, gospel, R&B.',vst:'Embertone Saxon / Kontakt',dataset:'NSynth reed class',envelope:{attack:0.05,decay:0.1,sustain:0.7,release:0.3},synthType:'synth',demoNotes:['D4','E4','F4','G4','A4'],demoPattern:'melody'},
  {id:'clarinet',      name:'Clarinet',         category:'brass',         emoji:'🎵',tradition:'western',description:'Pure woodwind — classical solos, folk melodies, orchestral inner voices.',vst:'Embertone Clarinet / Spitfire',dataset:'NSynth reed-clarinet class',envelope:{attack:0.05,decay:0.1,sustain:0.65,release:0.35},synthType:'synth',demoNotes:['E4','F4','G4','A4','B4'],demoPattern:'melody'},
  {id:'flute',         name:'Flute (Western)',  category:'brass',         emoji:'🪈',tradition:'western',description:'Airy pure woodwind — classical melodies, folk, orchestral.',vst:'Embertone Flute / Spitfire Labs',dataset:'NSynth flute class + URMP',envelope:{attack:0.06,decay:0.1,sustain:0.6,release:0.4},synthType:'synth',demoNotes:['C5','D5','E5','G5','A5'],demoPattern:'melody'},
  // ── PERCUSSION ──
  {id:'drum-kit',      name:'Drum Kit',         category:'percussion',    emoji:'🥁',tradition:'western',description:'Full acoustic kit — kick, snare, hi-hat, cymbals for any genre.',vst:'Steven Slate Drums / Kontakt',dataset:'Groove MIDI Dataset (Google Magenta)',envelope:{attack:0.001,decay:0.3,sustain:0.0,release:0.1},synthType:'membrane',demoNotes:['C1','D1','E1','F1','G1'],demoPattern:'beat'},
  {id:'elec-drums',    name:'Electronic Drums', category:'percussion',    emoji:'🎛️',tradition:'western',description:'Electronic drum machine sounds — 808, TR-909, modern EDM beats.',vst:'BeatMaker / Kontakt Battery',dataset:'Groove MIDI + NSynth percussion',envelope:{attack:0.001,decay:0.2,sustain:0.0,release:0.08},synthType:'membrane',demoNotes:['C1','F1','C1','F1','G1'],demoPattern:'beat'},
  {id:'cajon',         name:'Cajón',            category:'percussion',    emoji:'📦',tradition:'western',description:'Percussive wooden box — flamenco, folk, acoustic sessions.',vst:'Kontakt / Impact LX',dataset:'ENST Drums / custom packs',envelope:{attack:0.001,decay:0.4,sustain:0.0,release:0.2},synthType:'membrane',demoNotes:['C1','E1','C1','E1'],demoPattern:'beat'},
  // ── INDIAN STRINGS ──
  {id:'sitar',         name:'Sitar',            category:'indian-strings',emoji:'🪕',tradition:'indian',description:'Iconic North Indian string — resonating drone strings, microtonal bends.',vst:'SwarPlug / Prominy Sitar',dataset:'CompMusic Hindustani / SARAGA',envelope:{attack:0.02,decay:0.8,sustain:0.3,release:1.2},synthType:'pluck',demoNotes:['D4','E4','F4','G4','A4','A#4'],demoPattern:'raag'},
  {id:'veena',         name:'Veena',            category:'indian-strings',emoji:'🎸',tradition:'indian',description:'Ancient South Indian string — Carnatic classical foundation.',vst:'SwarPlug Veena / Shruti Box apps',dataset:'CompMusic Carnatic + SARAGA',envelope:{attack:0.02,decay:0.7,sustain:0.4,release:1.0},synthType:'pluck',demoNotes:['C4','D4','E4','G4','A4'],demoPattern:'raag'},
  {id:'sarod',         name:'Sarod',            category:'indian-strings',emoji:'🎸',tradition:'indian',description:'Fretless North Indian lute — deep meditative tones, wide melodic range.',vst:'SwarPlug / Indian Keys libs',dataset:'CompMusic Hindustani SARAGA',envelope:{attack:0.02,decay:0.9,sustain:0.35,release:1.3},synthType:'pluck',demoNotes:['D3','E3','F3','A3','D4'],demoPattern:'raag'},
  {id:'tanpura',       name:'Tanpura (Drone)',  category:'indian-strings',emoji:'🎵',tradition:'indian',description:'Constant harmonic drone — foundation of all Indian classical performance.',vst:'iTanpura / Riyaz app',dataset:'CompMusic drone recordings',envelope:{attack:0.3,decay:0.5,sustain:0.9,release:2.0},synthType:'poly',demoNotes:['C3','G3','C4'],demoPattern:'drone'},
  {id:'santoor',       name:'Santoor',          category:'indian-strings',emoji:'🪗',tradition:'indian',description:'100-string hammered dulcimer — crystalline tones, Kashmiri classical.',vst:'SwarPlug / Kontakt custom packs',dataset:'SARAGA Indian classical',envelope:{attack:0.01,decay:0.6,sustain:0.3,release:0.9},synthType:'pluck',demoNotes:['D4','F4','A4','C5','D5'],demoPattern:'raag'},
  // ── INDIAN PERCUSSION ──
  {id:'tabla',         name:'Tabla',            category:'indian-perc',   emoji:'🥁',tradition:'indian',description:'Twin hand drums — heartbeat of Hindustani music. Tonal and percussive.',vst:'SwarPlug Tabla / BandLab',dataset:'MAESTRO Indian + CompMusic Tabla',envelope:{attack:0.001,decay:0.5,sustain:0.0,release:0.3},synthType:'membrane',demoNotes:['C2','D2','E2','C2','D2'],demoPattern:'taal'},
  {id:'mridangam',     name:'Mridangam',        category:'indian-perc',   emoji:'🥁',tradition:'indian',description:'Two-headed drum — primary percussion in Carnatic classical music.',vst:'SwarPlug / Kontakt Indian packs',dataset:'CompMusic Carnatic + SARAGA',envelope:{attack:0.001,decay:0.4,sustain:0.0,release:0.25},synthType:'membrane',demoNotes:['C2','E2','C2','E2','G2'],demoPattern:'taal'},
  {id:'dhol',          name:'Dhol',             category:'indian-perc',   emoji:'🥁',tradition:'indian',description:'Double-headed barrel drum — folk festivals, Bhangra, energetic rhythm.',vst:'Kontakt Indian Drums / Sample packs',dataset:'CompMusic folk + Bhangra',envelope:{attack:0.001,decay:0.6,sustain:0.0,release:0.3},synthType:'membrane',demoNotes:['C1','C1','G1','C1'],demoPattern:'beat'},
  {id:'dholak',        name:'Dholak',           category:'indian-perc',   emoji:'🥁',tradition:'indian',description:'Two-faced hand drum — folk, devotional, Bollywood rhythm sections.',vst:'Kontakt Indian / SwarPlug',dataset:'CompMusic folk + Bollywood',envelope:{attack:0.001,decay:0.5,sustain:0.0,release:0.25},synthType:'membrane',demoNotes:['C2','C2','E2','G2','C2'],demoPattern:'taal'},
  {id:'ghatam',        name:'Ghatam',           category:'indian-perc',   emoji:'🫙',tradition:'indian',description:'Clay pot percussion — unique tonal resonance in Carnatic ensembles.',vst:'SwarPlug / custom sample packs',dataset:'CompMusic Carnatic Ghatam',envelope:{attack:0.001,decay:0.35,sustain:0.0,release:0.2},synthType:'membrane',demoNotes:['G2','A2','G2','C3'],demoPattern:'taal'},
  {id:'kanjira',       name:'Kanjira',          category:'indian-perc',   emoji:'🪘',tradition:'indian',description:'Small frame drum — virtuosic Carnatic percussion, cymbal jingles.',vst:'SwarPlug / Carnatic packs',dataset:'CompMusic Carnatic Kanjira',envelope:{attack:0.001,decay:0.3,sustain:0.0,release:0.15},synthType:'membrane',demoNotes:['C3','D3','C3','E3'],demoPattern:'taal'},
  // ── INDIAN WIND ──
  {id:'bansuri',       name:'Bansuri',          category:'indian-wind',   emoji:'🪈',tradition:'indian',description:'Bamboo flute — hauntingly beautiful, essential in Hindustani classical.',vst:'SwarPlug Bansuri / BandLab Indian',dataset:'CompMusic + SARAGA',envelope:{attack:0.08,decay:0.1,sustain:0.7,release:0.5},synthType:'synth',demoNotes:['D5','E5','F5','G5','A5','C6'],demoPattern:'raag'},
  {id:'shehnai',       name:'Shehnai',          category:'indian-wind',   emoji:'🎺',tradition:'indian',description:'Double reed oboe — auspicious ceremonies, North Indian classical.',vst:'SwarPlug / Udupi Music apps',dataset:'CompMusic Hindustani + folk',envelope:{attack:0.06,decay:0.1,sustain:0.8,release:0.3},synthType:'synth',demoNotes:['C5','D5','E5','F5','G5'],demoPattern:'raag'},
  {id:'nadaswaram',    name:'Nadaswaram',       category:'indian-wind',   emoji:'🎺',tradition:'indian',description:'South Indian double reed — powerful ceremonial and festival instrument.',vst:'SwarPlug / Carnatic sample packs',dataset:'CompMusic Carnatic Nadaswaram',envelope:{attack:0.05,decay:0.1,sustain:0.85,release:0.35},synthType:'synth',demoNotes:['C5','D5','E5','G5','A5'],demoPattern:'raag'},
  // ── HYBRID ──
  {id:'harmonium',     name:'Harmonium',        category:'hybrid',        emoji:'🪗',tradition:'indian',description:'Reed organ — cornerstone of Indian devotional/bhajan accompaniment.',vst:'SwarPlug Harmonium / Shruti Box',dataset:'SARAGA devotional + bhajan',envelope:{attack:0.04,decay:0.1,sustain:0.9,release:0.3},synthType:'synth',demoNotes:['C3','E3','G3','C4','G3','E3'],demoPattern:'chord'},
  {id:'indian-synth',  name:'Indian Synth',     category:'hybrid',        emoji:'🎛️',tradition:'indian',description:'Modern film/devotional synth pads — Bollywood, devotional ambient.',vst:'Omnisphere Indian presets / Serum',dataset:'SwarPlug + Bollywood MIDI',envelope:{attack:0.5,decay:0.3,sustain:0.8,release:2.5},synthType:'poly',demoNotes:['D3','F3','A3','D4'],demoPattern:'pad'},
];

const CATEGORY_LABELS:Record<Category,string>={
  all:'All (35)',keyboard:'🎹 Keyboard',strings:'🎸 Strings',brass:'🎺 Brass & Wind',
  percussion:'🥁 Percussion','indian-strings':'🎻 Indian Strings',
  'indian-perc':'🥁 Indian Percussion','indian-wind':'🎶 Indian Wind',hybrid:'🎹 Hybrid',
};

export default function InstrumentsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [playingId, setPlayingId] = useState<string|null>(null);
  const [selectedInst, setSelectedInst] = useState<Instrument|null>(null);

  const filtered = activeCategory==='all' ? INSTRUMENTS : INSTRUMENTS.filter(i=>i.category===activeCategory);

  const playDemo=async(inst:Instrument)=>{
    if(playingId===inst.id){
      Tone.getTransport().stop();Tone.getTransport().cancel();setPlayingId(null);return;
    }
    Tone.getTransport().stop();Tone.getTransport().cancel();
    await Tone.start(); setPlayingId(inst.id);
    Tone.getTransport().bpm.value=80;
    let synth:any;
    if(inst.synthType==='membrane'){synth=new Tone.MembraneSynth().toDestination();}
    else if(inst.synthType==='pluck'){synth=new Tone.PluckSynth().toDestination();}
    else if(inst.synthType==='poly'){synth=new Tone.PolySynth().toDestination(); synth.set({envelope:inst.envelope,volume:-6});}
    else{synth=new Tone.Synth().toDestination(); synth.set({envelope:inst.envelope,volume:-6});}

    const notes=inst.demoNotes;
    if(inst.demoPattern==='chord'||inst.demoPattern==='drone'||inst.demoPattern==='pad'){
      try{synth.triggerAttackRelease(inst.synthType==='poly'?notes:notes[0],'2n');}catch{}
      setTimeout(()=>{try{synth.dispose();}catch{} setPlayingId(null);},2500);
      return;
    }
    let i=0;
    const next=()=>{
      if(i>=notes.length){setTimeout(()=>{try{synth.dispose();}catch{} setPlayingId(null);},600);return;}
      try{
        if(inst.synthType==='membrane'||(synth instanceof Tone.MembraneSynth)){synth.triggerAttackRelease(notes[i],'8n');}
        else if(inst.synthType==='pluck'){(synth as Tone.PluckSynth).triggerAttack(notes[i]);}
        else{synth.triggerAttackRelease(notes[i],'8n');}
      }catch{}
      i++; setTimeout(next,320);
    };
    next();
  };

  return (
    <div className="instruments-page">
      <div className="inst-hero">
        <Volume2 size={28}/>
        <div>
          <h1>Instruments Library</h1>
          <p>35 instruments — Western &amp; Indian, with live demo, VST &amp; dataset info</p>
        </div>
      </div>
      <div className="inst-categories">
        {(Object.keys(CATEGORY_LABELS) as Category[]).map(cat=>(
          <button key={cat} className={`inst-cat-btn ${activeCategory===cat?'active':''}`} onClick={()=>setActiveCategory(cat)}>
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>
      <div className="inst-layout">
        <div className="inst-grid">
          {filtered.map(inst=>(
            <div key={inst.id} className={`inst-card ${inst.tradition} ${selectedInst?.id===inst.id?'selected':''}`}
              onClick={()=>setSelectedInst(selectedInst?.id===inst.id?null:inst)}>
              <div className="inst-card-top">
                <span className="inst-emoji">{inst.emoji}</span>
                <span className={`inst-tradition-badge ${inst.tradition}`}>{inst.tradition}</span>
              </div>
              <div className="inst-name">{inst.name}</div>
              <div className="inst-desc-short">{inst.description.split('—')[0]}</div>
              <div className="inst-actions">
                <button className={`inst-play-btn ${playingId===inst.id?'playing':''}`}
                  onClick={e=>{e.stopPropagation();playDemo(inst);}}>
                  {playingId===inst.id?<><Square size={11}/> Stop</>:<><Play size={11}/> Demo</>}
                </button>
                <button className="inst-info-btn" onClick={e=>{e.stopPropagation();setSelectedInst(selectedInst?.id===inst.id?null:inst);}}>
                  <Info size={11}/>
                </button>
              </div>
            </div>
          ))}
        </div>
        {selectedInst&&(
          <div className="inst-detail">
            <div className="inst-detail-header">
              <span className="inst-detail-emoji">{selectedInst.emoji}</span>
              <div>
                <div className="inst-detail-name">{selectedInst.name}</div>
                <span className={`inst-tradition-badge ${selectedInst.tradition}`}>{selectedInst.tradition}</span>
              </div>
            </div>
            <p className="inst-detail-desc">{selectedInst.description}</p>
            <div className="inst-detail-section"><div className="ids-label">🎛️ VST</div><div className="ids-value">{selectedInst.vst}</div></div>
            <div className="inst-detail-section"><div className="ids-label">📦 Dataset</div><div className="ids-value">{selectedInst.dataset}</div></div>
            <div className="inst-detail-section">
              <div className="ids-label">🔊 Envelope</div>
              <div className="ids-env">
                {Object.entries(selectedInst.envelope).map(([k,v])=>(
                  <div key={k} className="env-item">
                    <span className="env-key">{k.toUpperCase()}</span>
                    <div className="env-bar-wrap"><div className="env-bar" style={{width:`${Math.min(v*50,100)}%`}}/></div>
                    <span className="env-val">{v}s</span>
                  </div>
                ))}
              </div>
            </div>
            <button className={`inst-play-big ${playingId===selectedInst.id?'playing':''}`} onClick={()=>playDemo(selectedInst)}>
              {playingId===selectedInst.id?<><Square size={15}/> Stop</>:<><Play size={15}/> Play Demo</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
