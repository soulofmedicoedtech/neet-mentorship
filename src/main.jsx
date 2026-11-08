import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, GraduationCap, LayoutDashboard, Menu, MessageSquare, UserRound, X, LogOut, RefreshCw, LockKeyhole } from 'lucide-react';
import './styles.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\\/$/, '');
const years = ['1st Professional', '2nd Professional', '3rd Professional Part I', '3rd Professional Part II', 'Internship', 'Graduate'];
const exams = ['NEET PG', 'INI-CET', 'MBBS University Exams'];
const languages = ['English', 'Tamil', 'Hindi', 'Malayalam', 'Telugu', 'Kannada'];

async function api(path, { token, ...options } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(' ') : data?.message;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return data;
}

function AuthPanel({ onAuthenticated, onPreview }) {
  const [mode, setMode] = React.useState('login');
  const [form, setForm] = React.useState({ fullName: '', email: '', password: '' });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const change = (key, value) => setForm(v => ({ ...v, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const payload = mode === 'register'
        ? { fullName: form.fullName.trim(), email: form.email.trim(), password: form.password }
        : { email: form.email.trim(), password: form.password };
      const result = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(payload) });
      onAuthenticated(result);
    } catch (err) { setError(err.message || 'Unable to connect. Check the API server and try again.'); }
    finally { setBusy(false); }
  }
  return <div className="authWrap"><div className="authPanel">
    <div className="authIcon"><LockKeyhole size={23}/></div>
    <span className="eyebrow">STUDENT ACCOUNT</span>
    <h1>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h1>
    <p>{mode === 'login' ? 'Sign in to access your PRAXIS student space.' : 'Register to begin your medical learning journey.'}</p>
    <div className="authTabs"><button className={mode==='login'?'selected':''} onClick={()=>{setMode('login');setError('')}}>Sign in</button><button className={mode==='register'?'selected':''} onClick={()=>{setMode('register');setError('')}}>Create account</button></div>
    <form onSubmit={submit} className="authForm">
      {mode==='register' && <label>Full name<input required minLength="2" maxLength="100" autoComplete="name" value={form.fullName} onChange={e=>change('fullName',e.target.value)} placeholder="Your full name"/></label>}
      <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={e=>change('email',e.target.value)} placeholder="you@example.com"/></label>
      <label>Password<input required type="password" autoComplete={mode==='login'?'current-password':'new-password'} minLength={mode==='register'?12:1} maxLength="128" value={form.password} onChange={e=>change('password',e.target.value)} placeholder={mode==='register'?'At least 12 characters':'Your password'}/></label>
      {mode==='register' && <small className="passwordHint">Use at least 12 characters with uppercase, lowercase, number and symbol.</small>}
      {error && <div className="errorBox" role="alert">{error}</div>}
      <button className="primary authSubmit" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in':'Create student account'} <ArrowRight size={17}/></button>
    </form>
    <div className="authFoot">API: <code>{API_BASE}</code></div>
    <button className="previewLink" onClick={onPreview}>Continue with demo preview instead</button>
    <p className="securityNote">Development authentication only. Do not use a password you use on another service.</p>
  </div></div>;
}

function StudentPortal({ session, onBack, onLogout }) {
  const [tab, setTab] = React.useState('overview');
  const [profile, setProfile] = React.useState({ professionalYear:'', university:'The Tamil Nadu Dr. M.G.R. Medical University', targetExaminations:['NEET PG'], preferredLanguage:'English', collegeId:'', college:null });
  const [collegeSearch, setCollegeSearch] = React.useState('');
  const [colleges, setColleges] = React.useState([]);
  const [applications, setApplications] = React.useState([]);
  const [application, setApplication] = React.useState({ goal:'', challenge:'', preferredContact:'' });
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState('');
  const [error, setError] = React.useState('');
  const [previewProfile, setPreviewProfile] = React.useState({ name:'Medical Student', year:'3rd Professional Part I', college:'', university:'The Tamil Nadu Dr. M.G.R. Medical University', target:'NEET PG', language:'English' });
  const preview = !session?.accessToken;
  const user = session?.user || {};
  const token = session?.accessToken;

  const loadProfile = React.useCallback(async () => {
    if (preview) return;
    const data = await api('/students/me/profile', { token });
    setProfile({
      professionalYear: data.professionalYear || '',
      university: data.university || 'The Tamil Nadu Dr. M.G.R. Medical University',
      targetExaminations: data.targetExaminations || [],
      preferredLanguage: data.preferredLanguage || 'English',
      collegeId: data.collegeId || '',
      college: data.college || null,
    });
    setCollegeSearch(data.college?.name || '');
  }, [preview, token]);

  const loadApplications = React.useCallback(async () => {
    if (preview) return;
    const data = await api('/students/me/mentorship-applications', { token });
    setApplications(Array.isArray(data) ? data : []);
  }, [preview, token]);

  React.useEffect(() => {
    if (preview) return;
    let active = true;
    Promise.all([loadProfile(), loadApplications()])
      .then(() => { if (active) setNotice('Signed in. Your profile and mentorship records are connected to the PRAXIS API.'); })
      .catch(err => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [preview, loadProfile, loadApplications]);

  async function searchColleges(value) {
    setCollegeSearch(value);
    if (!preview && profile.college && value !== profile.college.name) setProfile(v => ({ ...v, collegeId:'', college:null }));
    if (preview || !value.trim()) { setColleges([]); return; }
    try {
      const result = await api(`/colleges?search=${encodeURIComponent(value.trim())}`);
      setColleges(Array.isArray(result) ? result : []);
    } catch (err) { setError(err.message); }
  }

  async function saveProfile(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (preview) {
        setNotice('Preview profile updated in this session only.');
      } else {
        await api('/students/me/profile', { token, method:'PATCH', body:JSON.stringify({
          professionalYear: profile.professionalYear || undefined,
          university: profile.university,
          targetExaminations: profile.targetExaminations,
          preferredLanguage: profile.preferredLanguage,
          ...(profile.collegeId ? { collegeId: profile.collegeId } : {}),
        }) });
        await loadProfile();
        setNotice('Your student profile has been saved to your account.');
      }
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  async function submitApplication(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (preview) {
        setApplications(items => [{ id:`preview-${Date.now()}`, ...application, status:'PREVIEW ONLY', createdAt:new Date().toISOString() }, ...items]);
        setNotice('Preview application saved in this browser session. It was not sent to the server.');
      } else {
        const created = await api('/students/me/mentorship-applications', { token, method:'POST', body:JSON.stringify(application) });
        setApplications(items => [created, ...items]);
        setNotice('Your mentorship application was submitted successfully.');
      }
      setApplication({ goal:'', challenge:'', preferredContact:'' });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  const nav = [{id:'overview',label:'Overview',icon:LayoutDashboard},{id:'profile',label:'My profile',icon:UserRound},{id:'mentorship',label:'Mentorship',icon:ClipboardList},{id:'learning',label:'Learning',icon:BookOpen}];
  const targetLabel = previewProfile.target;
  return <div className="portal">
    <aside className="sidebar">
      <div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div>
      <div className="sideCaption">STUDENT SPACE</div>
      {nav.map(item=><button key={item.id} className={tab===item.id?'sideLink active':'sideLink'} onClick={()=>setTab(item.id)}><item.icon size={18}/>{item.label}</button>)}
      <div className="sideBottom"><div className="avatar">{(user.name || previewProfile.name || 'S').slice(0,2).toUpperCase()}</div><div><b>{user.name || previewProfile.name}</b><small>{preview?'Demo preview':user.email || 'Student account'}</small></div></div>
    </aside>
    <section className="portalMain">
      <header className="portalTop"><button className="backLink" onClick={onBack}><ArrowLeft size={17}/> Back to PRAXIS</button><div className="topActions"><span className={preview?'previewTag':'connectedTag'}>{preview?'DEMO PREVIEW':'API CONNECTED'}</span>{!preview && <button className="logoutButton" onClick={onLogout}><LogOut size={15}/> Sign out</button>}</div></header>
      <div className="portalContent">
        {notice && <div className="notice"><CheckCircle2 size={16}/>{notice}</div>}
        {error && <div className="errorBox portalError" role="alert">{error}<button onClick={()=>setError('')} aria-label="Dismiss error"><X size={15}/></button></div>}
        {tab==='overview' && <>
          <div className="welcome"><div><span className="eyebrow">STUDENT DASHBOARD</span><h1>Welcome, {(user.name || previewProfile.name).split(' ')[0] || 'Student'}.</h1><p>Your preparation journey, organised in one place.</p></div><div className="welcomeIcon"><GraduationCap size={30}/></div></div>
          <div className="statGrid"><div className="statCard"><span>ACADEMIC YEAR</span><b>{preview?previewProfile.year:(profile.professionalYear || 'Not set')}</b><small>Update in My profile</small></div><div className="statCard"><span>PREPARATION GOAL</span><b>{preview?targetLabel:(profile.targetExaminations.join(' + ') || 'Not set')}</b><small>Your selected exam pathway</small></div><div className="statCard"><span>MENTORSHIP</span><b>{applications.length ? applications[0].status : 'Not applied'}</b><small>{applications.length?'Latest application status':'Start with a short application'}</small></div></div>
          <div className="panelGrid"><article className="panel"><div className="panelTitle"><h2>Get started</h2><span>YOUR NEXT STEPS</span></div><button className="taskRow" onClick={()=>setTab('profile')}><UserRound/><span><b>Complete your student profile</b><small>Add your college and academic details</small></span><ArrowRight/></button><button className="taskRow" onClick={()=>setTab('mentorship')}><MessageSquare/><span><b>Explore mentorship</b><small>Tell us what support you are looking for</small></span><ArrowRight/></button></article><article className="panel learningPanel"><BookOpen size={25}/><h2>Learning space</h2><p>Your subject-wise videos, notes, question bank and tests will appear here as those modules are built.</p><button className="textButton" onClick={()=>setTab('learning')}>View learning roadmap <ArrowRight size={16}/></button></article></div>
        </>}
        {tab==='profile' && <div className="formPanel"><span className="eyebrow">YOUR DETAILS</span><h1>Student profile</h1><p>Set up your academic profile and preparation preferences.</p>
          <form onSubmit={saveProfile}><div className="formGrid">
            <label>Full name<input value={user.name || previewProfile.name} readOnly={!!session} onChange={e=>setPreviewProfile(v=>({...v,name:e.target.value}))}/></label>
            <label>MBBS professional year<select value={preview?previewProfile.year:profile.professionalYear} onChange={e=>preview?setPreviewProfile(v=>({...v,year:e.target.value})):setProfile(v=>({...v,professionalYear:e.target.value}))}><option value="">Select year</option>{years.map(x=><option key={x}>{x}</option>)}</select></label>
            <label className="wide">Medical college
              {preview?<input placeholder="College selection requires API connection" value={previewProfile.college} onChange={e=>setPreviewProfile(v=>({...v,college:e.target.value}))}/>:<>
                <input placeholder="Search official college catalogue" value={collegeSearch} onChange={e=>searchColleges(e.target.value)}/>
                {colleges.length>0 && <div className="collegeResults">{colleges.map(c=><button type="button" key={c.id} onClick={()=>{setProfile(v=>({...v,collegeId:c.id,college:c}));setCollegeSearch(c.name);setColleges([])}}><b>{c.name}</b><small>{[c.state,c.university,c.collegeType].filter(Boolean).join(' · ')}</small></button>)}</div>}
                {profile.college && <small className="selectedCollege">Selected: {profile.college.name}</small>}
                {!profile.college && <small className="fieldHint">The catalogue is currently empty until verified college records are imported.</small>}
              </>}
            </label>
            <label>University<input value={preview?previewProfile.university:profile.university} onChange={e=>preview?setPreviewProfile(v=>({...v,university:e.target.value})):setProfile(v=>({...v,university:e.target.value}))}/></label>
            <label>Preparation goals<select multiple value={preview?[previewProfile.target]:profile.targetExaminations} onChange={e=>{const values=Array.from(e.target.selectedOptions,o=>o.value);if(preview)setPreviewProfile(v=>({...v,target:values[0]||'NEET PG'}));else setProfile(v=>({...v,targetExaminations:values}))}}>{exams.map(x=><option key={x}>{x}</option>)}</select><small className="fieldHint">Use Ctrl (Windows) or Command (Mac) to select more than one.</small></label>
            <label>Preferred language<select value={preview?previewProfile.language:profile.preferredLanguage} onChange={e=>preview?setPreviewProfile(v=>({...v,language:e.target.value})):setProfile(v=>({...v,preferredLanguage:e.target.value}))}>{languages.map(x=><option key={x}>{x}</option>)}</select></label>
          </div><div className="formActions"><span>{preview?'Preview only — not saved to an account.':'Changes are saved to your student account.'}</span><button className="primary" disabled={busy}>{busy?'Saving…':'Save profile'} <CheckCircle2 size={17}/></button></div></form>
        </div>}
        {tab==='mentorship' && <div className="formPanel"><span className="eyebrow">MENTORSHIP PROGRAM</span><h1>Apply for mentorship</h1><p>Share your goals and the areas where you would value guidance.</p>
          <form onSubmit={submitApplication}><div className="formGrid">
            <label className="wide">What is your main preparation goal?<textarea required minLength="20" maxLength="2000" rows="3" placeholder="For example: build a consistent NEET PG preparation routine..." value={application.goal} onChange={e=>setApplication(v=>({...v,goal:e.target.value}))}/><small className="fieldHint">At least 20 characters.</small></label>
            <label className="wide">What is your biggest current challenge?<textarea maxLength="2000" rows="3" placeholder="Tell us what you find difficult..." value={application.challenge} onChange={e=>setApplication(v=>({...v,challenge:e.target.value}))}/></label>
            <label className="wide">Preferred contact method<input maxLength="120" placeholder="Optional" value={application.preferredContact} onChange={e=>setApplication(v=>({...v,preferredContact:e.target.value}))}/></label>
          </div><div className="formActions"><span>{preview?'Demo only — no data will be sent.':'Your application will be saved securely against your account.'}</span><button className="primary" disabled={busy || application.goal.trim().length<20}>{busy?'Submitting…':'Submit application'} <ArrowRight size={17}/></button></div></form>
          <div className="applicationHistory"><div className="panelTitle"><h2>My applications</h2><button className="refreshButton" onClick={()=>loadApplications().catch(e=>setError(e.message))} disabled={preview}><RefreshCw size={14}/> Refresh</button></div>
            {applications.length===0?<p className="emptyState">No mentorship applications yet.</p>:applications.map(item=><div className="applicationItem" key={item.id}><div><b>{item.goal}</b><small>{new Date(item.createdAt).toLocaleDateString()} · {item.status}</small></div><span className="statusPill">{item.status}</span></div>)}
          </div>
        </div>}
        {tab==='learning' && <div className="formPanel"><span className="eyebrow">LEARNING ROADMAP</span><h1>Your learning space</h1><p>The student learning modules are planned in phases. No course content is connected in this release yet.</p><div className="roadmap">{[['Video lessons','Recorded lectures and topic-wise learning'],['Notes library','Lecture notes and subject resources'],['Question bank','Practice MCQs with explanations'],['University preparation','Theory questions and exam-focused revision'],['Tests & analytics','Timed tests and performance insights']].map(([title,desc],i)=><div className="roadmapRow" key={title}><span>0{i+1}</span><div><b>{title}</b><small>{desc}</small></div><span className="planned">PLANNED</span></div>)}</div></div>}
      </div>
    </section>
  </div>;
}

function App() {
  const [portal, setPortal] = React.useState(false);
  const [auth, setAuth] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const programs=[{title:'NEET PG Mentorship',text:'Structured guidance, accountability and a practical preparation roadmap.'},{title:'Personal Study Plan',text:'Build a realistic plan around your college schedule and preparation stage.'},{title:'Progress Tracking',text:'Keep goals, milestones and mentor feedback in one student dashboard.'}];
  if(portal) return <StudentPortal session={session} onBack={()=>setPortal(false)} onLogout={()=>{setSession(null);setPortal(false);setShowAuth(true)}}/>;
  if(showAuth) return <AuthPanel onAuthenticated={result=>{setSession(result);setShowAuth(false);setPortal(true)}} onPreview={()=>{setSession(null);setShowAuth(false);setPortal(true)}}/>;
  return <div className="app">
    <header className="nav"><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><nav className={open?'navLinks open':'navLinks'}><a href="#programs" onClick={()=>setOpen(false)}>Programs</a><a href="#how" onClick={()=>setOpen(false)}>How it works</a><a href="#about" onClick={()=>setOpen(false)}>About</a><button className="login" onClick={()=>{setShowAuth(true);setOpen(false)}}>Student sign in</button></nav><button className="menu" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button></header>
    <main><section className="hero"><div className="heroCopy"><div className="eyebrow"><GraduationCap size={16}/> MEDICAL EDUCATION & MENTORSHIP</div><h1>Prepare with <span>clarity.</span><br/>Progress with purpose.</h1><p>A focused platform for medical students preparing for university examinations and postgraduate entrance exams — with structured learning, mentorship and measurable progress.</p><div className="actions"><button className="primary" onClick={()=>setShowAuth(true)}>Student sign in <ArrowRight size={18}/></button><a className="secondary" href="#how">How it works</a></div><div className="trust"><CheckCircle2 size={18}/><span>Built for MBBS students • Structured learning • Goal focused</span></div></div><div className="heroCard"><div className="cardTop"><div><small>YOUR PREPARATION</small><h3>One platform. Every milestone.</h3></div><GraduationCap size={30}/></div><div className="progress"><div><span>Learning roadmap</span><b>In development</b></div><div className="bar"><i style={{width:'52%'}}/></div></div><div className="miniGrid"><div><BookOpen/><strong>Study resources</strong><span>Subject organised</span></div><div><MessageSquare/><strong>Mentorship</strong><span>Guidance focused</span></div></div></div></section>
    <section id="programs" className="section"><div className="sectionHead"><span>WHAT PRAXIS IS BUILDING</span><h2>Learning and guidance, built around your journey.</h2></div><div className="programGrid">{programs.map((p,i)=><article className="program" key={p.title}><div className="number">0{i+1}</div><h3>{p.title}</h3><p>{p.text}</p><a href="#how">Learn more <ArrowRight size={15}/></a></article>)}</div></section>
    <section id="how" className="how"><div><span>HOW IT WORKS</span><h2>A clearer path from preparation to progress.</h2></div><div className="steps"><div><b>01</b><h3>Set your goal</h3><p>Tell us your academic stage and examination targets.</p></div><div><b>02</b><h3>Build your plan</h3><p>Organise your learning and mentorship priorities.</p></div><div><b>03</b><h3>Track progress</h3><p>Review milestones and improve your preparation.</p></div></div></section>
    <section id="about" className="cta"><h2>Make every study session count.</h2><p>PRAXIS-MBBS is being built to make medical education more structured, accessible and student-focused.</p><button className="primary" onClick={()=>setShowAuth(true)}>Open student portal <ArrowRight size={18}/></button></section></main>
    <footer><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><span>Powered by SOUL OF MEDICO</span><span>© 2026 PRAXIS-MBBS</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
