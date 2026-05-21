import React, { useState } from 'react';
import './App.css';
import GeneratorPage    from './pages/GeneratorPage';
import LibraryPage      from './pages/LibraryPage';
import SplitterPage     from './pages/SplitterPage';
import AuthPage         from './pages/AuthPage';
import TheoryPage       from './pages/TheoryPage';
import MixerPage        from './pages/MixerPage';
import InstrumentsPage  from './pages/InstrumentsPage';
import ArrangementPage  from './pages/ArrangementPage';
import AIResourcesPage  from './pages/AIResourcesPage';
// DatasetPage is intentionally NOT imported — datasets are invisible to users
// They silently power generation through promptEngine.ts + musicEngine.ts
import { AuthProvider, useAuth } from './context/AuthContext';
import { logOut } from './firebase/firebaseConfig';
import { Music2, Library, Scissors, LogOut, BookOpen, Sliders, Volume2, Layers, Brain, ChevronDown } from 'lucide-react';
import type { GeneratedTrack } from './engine/musicEngine';

// Datasets page removed from Page type — completely hidden from navigation
type Page = 'generator'|'library'|'splitter'|'mixer'|'arrangement'|'instruments'|'theory'|'ai-resources';

function AppInner() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('generator');
  const [library, setLibrary] = useState<GeneratedTrack[]>([]);
  const [splitterTrack, setSplitterTrack] = useState<GeneratedTrack|null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="app-loading-icon-wrap"><Music2 size={32} color="#fff"/></div>
        <div className="app-loading-bars">
          {[...Array(7)].map((_,i)=><div key={i} className="app-loading-bar" style={{animationDelay:`${i*0.09}s`}}/>)}
        </div>
        <div className="app-loading-text">Jubal Music</div>
        <div className="app-loading-sub">Music with Mission</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  const addToLibrary   = (t:GeneratedTrack) => setLibrary(p=>[t,...p]);
  const removeFromLib  = (id:string)        => setLibrary(p=>p.filter(t=>t.id!==id));
  const openSplitter   = (t:GeneratedTrack) => { setSplitterTrack(t); setCurrentPage('splitter'); };

  // ── 8 visible pages — Datasets is GONE from nav ──
  const navItems: {id:Page;label:string;icon:React.ReactNode}[] = [
    {id:'generator',    label:'Compose',      icon:<Music2 size={14}/>},
    {id:'library',      label:'Library',      icon:<Library size={14}/>},
    {id:'splitter',     label:'Splitter',     icon:<Scissors size={14}/>},
    {id:'mixer',        label:'Mix & Master', icon:<Sliders size={14}/>},
    {id:'arrangement',  label:'Arrange',      icon:<Layers size={14}/>},
    {id:'instruments',  label:'Instruments',  icon:<Volume2 size={14}/>},
    {id:'theory',       label:'Theory',       icon:<BookOpen size={14}/>},
    {id:'ai-resources', label:'AI Resources', icon:<Brain size={14}/>},
  ];

  const initials = user.displayName
    ? user.displayName.split(' ').map((n:string)=>n[0]).join('').toUpperCase().slice(0,2)
    : user.email?.[0].toUpperCase() ?? 'U';

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo-icon"><Music2 size={18} color="#fff"/></div>
          <div className="brand-text">
            <span className="brand-name">Jubal</span>
            <span className="brand-tagline">Music with Mission</span>
          </div>
        </div>

        <nav className="app-nav">
          {navItems.map(item=>(
            <button
              key={item.id}
              className={`nav-btn ${currentPage===item.id?'active':''}`}
              onClick={()=>setCurrentPage(item.id)}
            >
              {item.icon}<span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="header-right">
          <div className="track-count"><span>{library.length}</span> tracks</div>
          <div className="user-menu-wrap">
            <button className="user-menu-btn" onClick={()=>setShowUserMenu(v=>!v)}>
              <div className="user-avatar">{initials}</div>
              <span className="user-name">{user.displayName||user.email?.split('@')[0]}</span>
              <ChevronDown size={13}/>
            </button>
            {showUserMenu&&(
              <>
                <div className="user-menu-backdrop" onClick={()=>setShowUserMenu(false)}/>
                <div className="user-menu-dropdown">
                  <div className="user-menu-info">
                    <div className="user-menu-avatar">{initials}</div>
                    <div>
                      <div className="user-menu-name">{user.displayName||'User'}</div>
                      <div className="user-menu-email">{user.email}</div>
                    </div>
                  </div>
                  <div className="user-menu-divider"/>
                  <button className="user-menu-item logout"
                    onClick={async()=>{setShowUserMenu(false);await logOut();}}>
                    <LogOut size={14}/><span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {currentPage==='generator'   && <GeneratorPage   onAddToLibrary={addToLibrary}/>}
        {currentPage==='library'     && <LibraryPage     tracks={library} onRemove={removeFromLib} onSplit={openSplitter}/>}
        {currentPage==='splitter'    && <SplitterPage    track={splitterTrack} allTracks={library} onSelectTrack={setSplitterTrack}/>}
        {currentPage==='mixer'       && <MixerPage/>}
        {currentPage==='arrangement' && <ArrangementPage/>}
        {currentPage==='instruments' && <InstrumentsPage/>}
        {currentPage==='theory'      && <TheoryPage/>}
        {currentPage==='ai-resources'&& <AIResourcesPage/>}
        {/* DatasetPage intentionally removed — datasets power generation silently */}
      </main>
    </div>
  );
}

export default function App() {
  return <AuthProvider><AppInner/></AuthProvider>;
}
