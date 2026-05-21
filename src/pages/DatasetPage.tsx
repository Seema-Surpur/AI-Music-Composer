import React, { useState } from 'react';
import { Database, Download, ExternalLink, Search, Music2 } from 'lucide-react';

interface Dataset {
  name:string; type:string; size:string; desc:string;
  url:string; license:string; format:string; tradition:string;
}

const DATASETS:Dataset[] = [
  {name:'MAESTRO Dataset',              type:'piano', size:'200+ hours',    desc:'High-quality piano MIDI + audio pairs. Professional recordings from International Piano Competition. Best for expressive piano AI.',   url:'https://magenta.tensorflow.org/datasets/maestro',            license:'CC BY-NC-SA',format:'MIDI + WAV',tradition:'Western'},
  {name:'Lakh MIDI Dataset (LMD)',      type:'midi',  size:'178,000 files', desc:'Largest public MIDI dataset. Matched to Million Song Dataset. Contains pop, rock, classical, jazz across all genres.',               url:'https://colinraffel.com/projects/lmd/',                       license:'Open',       format:'MIDI',      tradition:'Western'},
  {name:'Groove MIDI Dataset',          type:'drums', size:'13.6 hours',    desc:'Real human drum performances recorded on electronic drum kit. Essential for realistic non-robotic rhythm generation.',                url:'https://magenta.tensorflow.org/datasets/groove',             license:'CC BY 4.0',  format:'MIDI + WAV',tradition:'Western'},
  {name:'GiantMIDI-Piano',              type:'piano', size:'10,854 files',  desc:'Piano solo MIDI transcriptions of real recordings across 2,786 classical composers. Great for classical style AI.',                   url:'https://github.com/bytedance/GiantMIDI-Piano',               license:'CC BY 4.0',  format:'MIDI',      tradition:'Western'},
  {name:'NSynth Dataset',               type:'audio', size:'300,000 notes', desc:'Single instrument note audio from Google Magenta. 1006 instruments, 4 seconds each. Used for timbre modeling.',                       url:'https://magenta.tensorflow.org/datasets/nsynth',             license:'CC BY 4.0',  format:'WAV',       tradition:'Western'},
  {name:'FMA (Free Music Archive)',     type:'audio', size:'106,000 tracks',desc:'High-quality MP3s across 16 genres. Full, medium, small subsets. Best free audio dataset for genre classification.',                  url:'https://github.com/mdeff/fma',                               license:'CC',         format:'MP3',       tradition:'Western'},
  {name:'MusicNet',                     type:'audio', size:'330 recordings',desc:'Classical music + MIDI + note annotations aligned. Piano, violin, chamber music for supervised learning.',                            url:'https://zenodo.org/record/5120004',                          license:'CC BY 4.0',  format:'WAV + MIDI',tradition:'Western'},
  {name:'AudioSet (Google)',            type:'audio', size:'2M clips',      desc:'Ontology of 632 audio classes. 10-second YouTube clips. Includes music, instruments, genres for classification.',                     url:'https://research.google.com/audioset/',                      license:'CC BY 4.0',  format:'Audio',     tradition:'Both'},
  {name:'Hindustani Music Dataset',     type:'midi',  size:'5,000 files',   desc:'MIDI transcriptions of Hindustani raag performances across multiple raags and taals. Essential for North Indian AI.',                  url:'https://compmusic.upf.edu/hindustani-music',                 license:'Research',   format:'MIDI+Audio',tradition:'Indian'},
  {name:'Carnatic Music (CompMusic)',   type:'midi',  size:'3,000 files',   desc:'Carnatic concert recordings with annotations for raag, taal, and melodic phrases. Best South Indian dataset.',                       url:'https://compmusic.upf.edu/carnatic-music',                   license:'Research',   format:'Audio+Meta',tradition:'Indian'},
  {name:'Saraga Indian Classical',      type:'audio', size:'168 concerts',  desc:'Hindustani & Carnatic audio with raag, taal, performer metadata. Gold standard for Indian music AI research.',                       url:'https://mtg.upf.edu/download/datasets/saraga',               license:'CC BY-NC',   format:'MP3',       tradition:'Indian'},
  {name:'IIT Bombay Hindi Songs',       type:'audio', size:'2,000+ songs',  desc:'Hindi film songs with lyrics, chords, and metadata. Best Bollywood corpus available for AI research.',                               url:'https://www.iitb.ac.in/',                                    license:'Research',   format:'MP3',       tradition:'Indian'},
  {name:'Million Song Dataset (MSD)',   type:'lyrics',size:'1M songs',      desc:'Song metadata including lyrics from musiXmatch. Covers western pop, rock, country, R&B.',                                           url:'https://millionsongdataset.com/',                             license:'Research',   format:'Text+JSON', tradition:'Western'},
  {name:'musiXmatch Lyrics',           type:'lyrics',size:'237,662 songs', desc:'Bag-of-words lyric representations matched to MSD. Most widely used lyric dataset in academic research.',                            url:'https://musixmatch.com/research',                            license:'Research',   format:'Text',      tradition:'Western'},
  {name:'Hindi Lyrics Dataset',        type:'lyrics',size:'50,000 songs',  desc:'Hindi film song lyrics with transliteration and meaning annotations. Essential for Bollywood AI.',                                   url:'https://www.kaggle.com/datasets',                            license:'CC',         format:'Text',      tradition:'Indian'},
  {name:'MusicCaps (Google)',          type:'ai',    size:'5,521 clips',   desc:'Human-labeled 10-second music clips with detailed captions. Used to train Google\'s MusicLM model.',                                 url:'https://google-research.github.io/seanet/musiccaps/examples/',license:'CC BY-SA',  format:'Audio+Text',tradition:'Western'},
  {name:'Suno AI Samples',            type:'ai',    size:'Community',     desc:'AI-generated music from Suno v3/v4. Community-shared prompts and outputs for research.',                                              url:'https://suno.com',                                           license:'Suno Terms', format:'MP3',       tradition:'Both'},
  {name:'MusicGen Training Data',     type:'ai',    size:'20,000 hours',  desc:'Meta\'s MusicGen training corpus — licensed music for AI training. Powers the best open-source music gen model.',                   url:'https://ai.honu.io/papers/musicgen/',                        license:'Proprietary',format:'Audio',     tradition:'Western'},
];

const TYPE_LABELS:Record<string,string>={midi:'🎹 MIDI',piano:'🎼 Piano',drums:'🥁 Drums',audio:'🎵 Audio',lyrics:'📝 Lyrics',ai:'🤖 AI Generated'};
const TYPE_COLORS:Record<string,string>={midi:'ds-midi',piano:'ds-piano',drums:'ds-drums',audio:'ds-audio',lyrics:'ds-lyrics',ai:'ds-ai'};

export default function DatasetPage() {
  const [filter,     setFilter]     = useState('all');
  const [tradition,  setTradition]  = useState('all');
  const [search,     setSearch]     = useState('');

  const filtered=DATASETS.filter(d=>{
    const mt=filter==='all'||d.type===filter;
    const tr=tradition==='all'||d.tradition===tradition||d.tradition==='Both';
    const ms=search===''||d.name.toLowerCase().includes(search.toLowerCase())||d.desc.toLowerCase().includes(search.toLowerCase());
    return mt&&tr&&ms;
  });

  return (
    <div className="dataset-page">
      <div className="dataset-hero">
        <Database size={28}/>
        <div>
          <h1>External Datasets</h1>
          <p>Reference library — 18 datasets for building your own AI music model</p>
        </div>
      </div>

      <div className="ds-inline-note">
        💡 <strong>Jubal already has built-in datasets</strong> — phrases from MAESTRO, Lakh MIDI, Groove MIDI, CompMusic & SARAGA are silently baked in. These external datasets are for <strong>training your own custom model</strong>. See the <em>AI Resources → Built-in Datasets</em> tab for how Jubal uses them.
      </div>

      <div className="dataset-stats">
        {[['🎹','MIDI / Piano','5 datasets'],['🎵','Audio / MP3','4 datasets'],['🥁','Drums','1 dataset'],['📝','Lyrics','3 datasets'],['🤖','AI Generated','3 datasets'],['🇮🇳','Indian','4 datasets']].map(s=>(
          <div key={s[1]} className="ds-stat"><span className="ds-stat-icon">{s[0]}</span><span className="ds-stat-label">{s[1]}</span><span className="ds-stat-count">{s[2]}</span></div>
        ))}
      </div>

      <div className="dataset-filters">
        <div className="ds-search-wrap">
          <Search size={14} className="ds-search-icon"/>
          <input className="ds-search" placeholder="Search datasets…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="ds-filter-group">
          {['all','midi','piano','drums','audio','lyrics','ai'].map(t=>(
            <button key={t} className={`ds-filter-btn ${filter===t?'active':''}`} onClick={()=>setFilter(t)}>
              {t==='all'?'All Types':(TYPE_LABELS[t]||t)}
            </button>
          ))}
        </div>
        <div className="ds-filter-group">
          {['all','Western','Indian','Both'].map(t=>(
            <button key={t} className={`ds-filter-btn tradition-filter ${tradition===t?'active':''}`} onClick={()=>setTradition(t)}>
              {t==='all'?'All Traditions':t}
            </button>
          ))}
        </div>
      </div>

      <div className="dataset-grid">
        {filtered.map(d=>(
          <div key={d.name} className={`dataset-card ${TYPE_COLORS[d.type]||'ds-audio'}`}>
            <div className="dc-header">
              <div className="dc-type-badge">{TYPE_LABELS[d.type]||d.type}</div>
              <div className="dc-tradition">{d.tradition}</div>
            </div>
            <h3 className="dc-name">{d.name}</h3>
            <p className="dc-desc">{d.desc}</p>
            <div className="dc-meta">
              <span className="dc-meta-item">📦 {d.size}</span>
              <span className="dc-meta-item">📄 {d.format}</span>
              <span className="dc-meta-item">⚖️ {d.license}</span>
            </div>
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="dc-link">
              <ExternalLink size={13}/> View Dataset
            </a>
          </div>
        ))}
      </div>
      {filtered.length===0&&<div className="ds-empty"><Music2 size={36}/><p>No datasets match your filters.</p></div>}
    </div>
  );
}
