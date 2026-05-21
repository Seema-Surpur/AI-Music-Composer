import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Music2 } from 'lucide-react';
import { ALL_MAJOR_SCALES, ALL_MINOR_SCALES } from '../engine/musicEngine';

type Tab = 'scales' | 'chords' | 'progressions' | 'indian';

function Accordion({ title, children, accent }: { title: string; children: React.ReactNode; accent?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`accordion ${open?'open':''}`} style={accent?{'--acc':accent} as any:{}}>
      <button className="accordion-header" onClick={()=>setOpen(v=>!v)}>
        <span>{title}</span>
        {open?<ChevronUp size={16}/>:<ChevronDown size={16}/>}
      </button>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

const ALL_KEYS = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

// Major chords: root + M3(4st) + P5(7st)
const MAJOR_CHORDS = ALL_KEYS.map(k => {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const idx = notes.indexOf(k);
  return { key:k, notes:[k, notes[(idx+4)%12], notes[(idx+7)%12]], formula:'1–3–5' };
});

// Minor chords: root + m3(3st) + P5(7st)
const MINOR_CHORDS = ALL_KEYS.map(k => {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const idx = notes.indexOf(k);
  return { key:`${k}m`, notes:[k, notes[(idx+3)%12], notes[(idx+7)%12]], formula:'1–♭3–5' };
});

// Sharp major chords
const SHARP_MAJOR = ALL_KEYS.filter(k=>k.includes('#')).map(k => {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const idx = notes.indexOf(k);
  return { key:`${k} Maj`, notes:[k, notes[(idx+4)%12], notes[(idx+7)%12]], formula:'1–3–5' };
});

// Sharp minor chords
const SHARP_MINOR = ALL_KEYS.filter(k=>k.includes('#')).map(k => {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const idx = notes.indexOf(k);
  return { key:`${k}m`, notes:[k, notes[(idx+3)%12], notes[(idx+7)%12]], formula:'1–♭3–5' };
});

const RAAGS = [
  {name:'Yaman',      time:'Evening',  emo:'Romantic',   swara:'Sa Re Ga Ma♯ Pa Dha Ni Sa', style:'Hindustani'},
  {name:'Bhairavi',   time:'Morning',  emo:'Pathos',     swara:'Sa Re♭ Ga♭ Ma Pa Dha♭ Ni♭ Sa', style:'Both'},
  {name:'Bhupali',    time:'Evening',  emo:'Joy',        swara:'Sa Re Ga Pa Dha Sa', style:'Hindustani'},
  {name:'Darbari',    time:'Night',    emo:'Majesty',    swara:'Sa Re Ga♭ Ma Pa Dha♭ Ni♭ Sa', style:'Hindustani'},
  {name:'Bhairav',    time:'Dawn',     emo:'Serenity',   swara:'Sa Re♭ Ga Ma Pa Dha♭ Ni Sa', style:'Both'},
  {name:'Kafi',       time:'Midnight', emo:'Energy',     swara:'Sa Re Ga♭ Ma Pa Dha Ni♭ Sa', style:'Hindustani'},
  {name:'Shankarabharanam',time:'Noon',emo:'Grandeur',   swara:'Sa Ri Ga Ma Pa Dha Ni Sa', style:'Carnatic'},
  {name:'Kalyani',    time:'Evening',  emo:'Happiness',  swara:'Sa Ri Ga Ma♯ Pa Dha Ni Sa', style:'Carnatic'},
  {name:'Todi',       time:'Morning',  emo:'Bhakti',     swara:'Sa Re♭ Ga♭ Ma♯ Pa Dha♭ Ni Sa', style:'Hindustani'},
  {name:'Bilawal',    time:'Morning',  emo:'Joy, Peace', swara:'Sa Re Ga Ma Pa Dha Ni Sa', style:'Hindustani'},
  {name:'Durga',      time:'Night',    emo:'Power',      swara:'Sa Re Ma Pa Dha Sa', style:'Both'},
  {name:'Hansadhwani',time:'Evening',  emo:'Delight',    swara:'Sa Ri Ga Pa Ni Sa', style:'Carnatic'},
];

const TAALS = [
  {name:'Teentaal',beats:16,structure:'4+4+4+4',style:'Hindustani',common:true},
  {name:'Ektaal',  beats:12,structure:'2+2+2+2+2+2',style:'Hindustani',common:true},
  {name:'Jhaptaal',beats:10,structure:'2+3+2+3',style:'Hindustani',common:false},
  {name:'Rupak',   beats:7, structure:'3+2+2',style:'Hindustani',common:false},
  {name:'Adi Taal',beats:8, structure:'4+2+2',style:'Carnatic',common:true},
  {name:'Rupaka',  beats:6, structure:'3+3',style:'Carnatic',common:true},
  {name:'Misra Chapu',beats:7,structure:'3+2+2',style:'Carnatic',common:false},
  {name:'Khanda Chapu',beats:5,structure:'2+3',style:'Carnatic',common:false},
];

export default function TheoryPage() {
  const [tab, setTab] = useState<Tab>('scales');
  const [scaleMode, setScaleMode] = useState<'major'|'minor'>('major');
  const [selectedKey, setSelectedKey] = useState<string>('C');

  const displayScale = scaleMode==='major'
    ? ALL_MAJOR_SCALES[selectedKey]
    : ALL_MINOR_SCALES[`${selectedKey}m`];

  return (
    <div className="theory-page">
      <div className="theory-hero">
        <BookOpen size={28}/>
        <div>
          <h1>Music Theory</h1>
          <p>Complete Western &amp; Indian theory — all 24 scales, chords, raags &amp; taals</p>
        </div>
      </div>

      <div className="theory-tabs">
        {([['scales','🎼 All Scales'],['chords','🎹 All Chords'],['progressions','🔗 Progressions'],['indian','🪘 Indian Theory']] as [Tab,string][]).map(([id,label])=>(
          <button key={id} className={`theory-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {/* ── SCALES TAB ── */}
      {tab==='scales' && (
        <div className="theory-content">
          <div className="scale-explorer">
            <div className="scale-mode-toggle">
              <button className={`scale-mode-btn ${scaleMode==='major'?'active':''}`} onClick={()=>setScaleMode('major')}>Major Scales</button>
              <button className={`scale-mode-btn ${scaleMode==='minor'?'active':''}`} onClick={()=>setScaleMode('minor')}>Minor Scales</button>
            </div>
            <div className="key-selector">
              {ALL_KEYS.map(k=>(
                <button key={k} className={`key-btn ${selectedKey===k?'active':''} ${k.includes('#')?'sharp-key':''}`} onClick={()=>setSelectedKey(k)}>{k}</button>
              ))}
            </div>
            {displayScale && (
              <div className="scale-display">
                <div className="scale-display-title">
                  {selectedKey}{scaleMode==='minor'?'m':''} {scaleMode==='major'?'Major':'Minor'} Scale
                  <span className="scale-formula-badge">{scaleMode==='major'?'W-W-H-W-W-W-H':'W-H-W-W-H-W-W'}</span>
                </div>
                <div className="scale-notes-big">
                  {displayScale.map((note,i)=>(
                    <div key={i} className={`scale-note-block ${note.includes('#')?'sharp':'natural'} ${i===0||i===displayScale.length-1?'root':''}`}>
                      <span className="snb-degree">{['1','2','3','4','5','6','7','1'][i]}</span>
                      <span className="snb-note">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="theory-section-title">All {scaleMode==='major'?'Major':'Minor'} Scales — Quick Reference</div>
          <div className="all-scales-grid">
            {(scaleMode==='major' ? Object.entries(ALL_MAJOR_SCALES) : Object.entries(ALL_MINOR_SCALES)).map(([key,notes])=>(
              <div key={key} className={`scale-ref-card ${scaleMode}`} onClick={()=>setSelectedKey(key.replace('m',''))}>
                <div className="src-key">{key}</div>
                <div className="src-notes">{notes.map((n,i)=>(
                  <span key={i} className={n.includes('#')||n.includes('♭')?'acc':'nat'}>{i<notes.length-1?n:''}</span>
                ))}</div>
              </div>
            ))}
          </div>

          <Accordion title="Intervals — Half Steps & Whole Steps">
            <div className="theory-table-wrap"><table className="theory-table">
              <thead><tr><th>Interval</th><th>Semitones</th><th>Example</th><th>Sound</th></tr></thead>
              <tbody>
                {[['Half Step','1','C→C#','Smallest'],['Whole Step','2','C→D','Two semitones'],
                  ['Minor 3rd','3','C→E♭','Sad feel'],['Major 3rd','4','C→E','Happy feel'],
                  ['Perfect 4th','5','C→F','Open, stable'],['Perfect 5th','7','C→G','Strong, powerful'],
                  ['Minor 7th','10','C→B♭','Jazzy'],['Octave','12','C→C','Same note higher']].map(r=>(
                  <tr key={r[0]}><td>{r[0]}</td><td><strong>{r[1]}</strong></td><td>{r[2]}</td><td>{r[3]}</td></tr>
                ))}
              </tbody>
            </table></div>
          </Accordion>
        </div>
      )}

      {/* ── CHORDS TAB ── */}
      {tab==='chords' && (
        <div className="theory-content">
          <Accordion title="All Major Chords — Formula: 1–3–5">
            <p className="theory-p">Root + Major 3rd (4 semitones) + Perfect 5th (7 semitones)</p>
            <div className="chord-cards">
              {MAJOR_CHORDS.map(c=>(
                <div key={c.key} className="chord-card major-chord">
                  <div className="chord-key">{c.key}</div>
                  <div className="chord-notes">{c.notes.join('–')}</div>
                  <div className="chord-formula">1–3–5</div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="All Minor Chords — Formula: 1–♭3–5">
            <p className="theory-p">Root + Minor 3rd (3 semitones) + Perfect 5th (7 semitones)</p>
            <div className="chord-cards">
              {MINOR_CHORDS.map(c=>(
                <div key={c.key} className="chord-card minor-chord">
                  <div className="chord-key">{c.key}</div>
                  <div className="chord-notes">{c.notes.join('–')}</div>
                  <div className="chord-formula">1–♭3–5</div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Sharp Major Chords — 1–3–5">
            <div className="chord-cards">
              {SHARP_MAJOR.map(c=>(
                <div key={c.key} className="chord-card sharp-chord">
                  <div className="chord-key">{c.key}</div>
                  <div className="chord-notes">{c.notes.join('–')}</div>
                  <div className="chord-formula">1–3–5</div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Sharp Minor Chords — 1–♭3–5">
            <div className="chord-cards">
              {SHARP_MINOR.map(c=>(
                <div key={c.key} className="chord-card sharp-minor-chord">
                  <div className="chord-key">{c.key}</div>
                  <div className="chord-notes">{c.notes.join('–')}</div>
                  <div className="chord-formula">1–♭3–5</div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Diatonic Chord Names">
            <div className="theory-table-wrap"><table className="theory-table">
              <thead><tr><th>Degree</th><th>Name</th><th>In C Major</th><th>Quality</th></tr></thead>
              <tbody>{[['I','Tonic','C','Major'],['ii','Supertonic','Dm','Minor'],['iii','Mediant','Em','Minor'],
                ['IV','Subdominant','F','Major'],['V','Dominant','G','Major'],['vi','Submediant','Am','Minor'],
                ['vii°','Leading Tone','Bdim','Diminished']].map(r=>(
                <tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td></tr>
              ))}</tbody>
            </table></div>
          </Accordion>
        </div>
      )}

      {/* ── PROGRESSIONS TAB ── */}
      {tab==='progressions' && (
        <div className="theory-content">
          <Accordion title="Common Major Key Progressions">
            <div className="progression-cards">
              {[{name:'I–IV–V',ex:'C–F–G',feel:'Classic & resolved'},
                {name:'I–vi–IV–V',ex:'C–Am–F–G',feel:'Pop anthem'},
                {name:'ii–V–I',ex:'Dm–G–C',feel:'Jazz cadence'},
                {name:'I–V–vi–IV',ex:'C–G–Am–F',feel:'Emotional & modern'},
                {name:'I–IV–I–V',ex:'C–F–C–G',feel:'Blues base'},
                {name:'I–iii–IV–V',ex:'C–Em–F–G',feel:'Cinematic rise'},
              ].map(p=>(
                <div key={p.name} className="prog-card">
                  <div className="prog-name">{p.name}</div>
                  <div className="prog-example">{p.ex}</div>
                  <div className="prog-feel">{p.feel}</div>
                </div>
              ))}
            </div>
          </Accordion>
          <Accordion title="Common Minor Key Progressions">
            <div className="progression-cards">
              {[{name:'i–VI–VII',ex:'Am–F–G',feel:'Rock minor'},
                {name:'i–iv–VII',ex:'Am–Dm–G',feel:'Dramatic'},
                {name:'i–VI–III–VII',ex:'Am–F–C–G',feel:'Epic & cinematic'},
                {name:'i–iv–v',ex:'Am–Dm–Em',feel:'Classical minor'},
                {name:'ii°–v–i',ex:'Bm7♭5–E7–Am',feel:'Jazz minor'},
                {name:'i–VII–VI–VII',ex:'Am–G–F–G',feel:'Andalusian cadence'},
              ].map(p=>(
                <div key={p.name} className="prog-card minor-prog">
                  <div className="prog-name">{p.name}</div>
                  <div className="prog-example">{p.ex}</div>
                  <div className="prog-feel">{p.feel}</div>
                </div>
              ))}
            </div>
          </Accordion>
          <Accordion title="Finger Numbers (Piano)">
            <div className="finger-chart">
              {[['L5','L4','L3','L2','L1'],['R1','R2','R3','R4','R5']].map((hand,hi)=>(
                <div key={hi} className="finger-row">
                  {hand.map((f,fi)=>(
                    <div key={fi} className={`finger-box ${f.startsWith('R')?'right':'left'}`}>
                      <span className="finger-num">{f[1]}</span>
                      <span className="finger-hand">{f[0]==='R'?'R':'L'}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="finger-note">Thumb = 1, Index = 2, Middle = 3, Ring = 4, Pinky = 5</div>
            </div>
          </Accordion>
        </div>
      )}

      {/* ── INDIAN THEORY TAB ── */}
      {tab==='indian' && (
        <div className="theory-content">
          <Accordion title="Swaras — The Seven Notes">
            <div className="swara-grid">
              {[['Sa','Shadja','C','Fixed'],['Re','Rishabh','D','Komal/Shuddha'],
                ['Ga','Gandhar','E','Komal/Shuddha'],['Ma','Madhyam','F','Shuddha/Tivra'],
                ['Pa','Pancham','G','Fixed'],['Dha','Dhaivat','A','Komal/Shuddha'],
                ['Ni','Nishad','B','Komal/Shuddha']].map(s=>(
                <div key={s[0]} className="swara-card">
                  <div className="swara-abbr">{s[0]}</div>
                  <div className="swara-full">{s[1]}</div>
                  <div className="swara-western">{s[2]}</div>
                  <div className="swara-note">{s[3]}</div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Raags — Complete Reference (12 Raags)">
            <p className="theory-p">Each raag is a complete melodic personality — rules of ascent (Arohana), descent (Avarohana), characteristic phrases (Pakad), and emotional essence (Rasa).</p>
            <div className="raag-cards">
              {RAAGS.map(r=>(
                <div key={r.name} className="raag-card">
                  <div className="raag-header"><span className="raag-name">{r.name}</span><span className="raag-style">{r.style}</span></div>
                  <div className="raag-swara">{r.swara}</div>
                  <div className="raag-meta"><span className="raag-time">🕐 {r.time}</span><span className="raag-emotion">💫 {r.emo}</span></div>
                </div>
              ))}
            </div>
          </Accordion>

          <Accordion title="Taals — Rhythmic Cycles (8 Taals)">
            <div className="theory-table-wrap"><table className="theory-table">
              <thead><tr><th>Taal</th><th>Beats</th><th>Structure</th><th>Style</th></tr></thead>
              <tbody>{TAALS.map(t=>(
                <tr key={t.name}><td><strong>{t.name}</strong></td><td>{t.beats}</td><td><code>{t.structure}</code></td><td>{t.style}</td></tr>
              ))}</tbody>
            </table></div>
          </Accordion>

          <Accordion title="Carnatic vs Hindustani">
            <div className="theory-table-wrap"><table className="theory-table">
              <thead><tr><th>Aspect</th><th>Hindustani</th><th>Carnatic</th></tr></thead>
              <tbody>{[['Origin','North India','South India'],['Raag system','~500 raags','72 Melakarta'],
                ['Rhythm','Teentaal (16 beats)','Adi Taal (8 beats)'],
                ['Instruments','Sitar, Sarod, Tabla','Veena, Mridangam, Violin'],
                ['Improvisation','Heavy (Alap)','Structured (Alapana)'],
                ['Devotion','Mixed','Primarily devotional']].map((r,i)=>(
                <tr key={i}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td></tr>
              ))}</tbody>
            </table></div>
          </Accordion>

          <Accordion title="Alankars — Scale Exercises">
            <div className="alankar-list">
              {[{n:'1',p:'Sa Re Ga Ma | Pa Dha Ni Sa',d:'Ascending (Arohana)'},
                {n:'2',p:'Sa Ni Dha Pa | Ma Ga Re Sa',d:'Descending (Avarohana)'},
                {n:'3',p:'Sa Re Ga | Re Ga Ma | Ga Ma Pa…',d:'Groups of 3'},
                {n:'4',p:'Sa Re Ga Ma | Re Ga Ma Pa | Ga Ma Pa Dha…',d:'Groups of 4'},
                {n:'5',p:'Sa Re | Sa Ga | Sa Ma | Sa Pa | Sa Dha | Sa Ni | Sa Sa',d:'Jumps from Sa'},
              ].map(a=>(
                <div key={a.n} className="alankar-item">
                  <span className="alankar-num">{a.n}</span>
                  <div><div className="alankar-pattern">{a.p}</div><div className="alankar-dir">{a.d}</div></div>
                </div>
              ))}
            </div>
          </Accordion>
        </div>
      )}
    </div>
  );
}
