import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, GraduationCap, LayoutDashboard, Menu, MessageSquare, UserRound, X, LogOut, RefreshCw, LockKeyhole, ShieldCheck, Search, Filter, Clock3, Check, XCircle, UserCheck, Send } from 'lucide-react';
import './styles.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1').replace(/\/$/, '');
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
  const [curriculum, setCurriculum] = React.useState([]);
  const [curriculumError, setCurriculumError] = React.useState('');
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

  React.useEffect(() => {
    if (tab !== 'learning') return;
    let active = true;
    api('/academic/subjects').then(data => { if (active) setCurriculum(Array.isArray(data) ? data : []); }).catch(err => { if (active) setCurriculumError(err.message); });
    return () => { active = false; };
  }, [tab]);

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
        {tab==='learning' && <div className="formPanel"><span className="eyebrow">ACADEMIC CURRICULUM</span><h1>Your learning space</h1><p>Explore the live PRAXIS subject structure. Lecture videos, notes and practice questions will be attached to these topics in upcoming milestones.</p>{curriculumError && <div className="errorBox" role="alert">{curriculumError}</div>}<div className="applicationHistory"><div className="panelTitle"><h2>Subjects and topics</h2><button className="refreshButton" onClick={()=>api('/academic/subjects').then(data=>setCurriculum(Array.isArray(data)?data:[])).catch(err=>setCurriculumError(err.message))}><RefreshCw size={14}/> Refresh</button></div>{curriculum.length===0?<p className="emptyState">No curriculum has been published yet. The academic team will add verified subjects and topics here.</p>:curriculum.map(subject=><details className="academicSubject" key={subject.id}><summary><b>{subject.name}</b><span>{subject.units?.length||0} units</span></summary>{(subject.units||[]).map(unit=><details className="academicUnit" key={unit.id}><summary>{unit.title}<span>{unit.chapters?.length||0} chapters</span></summary>{(unit.chapters||[]).map(chapter=><details className="academicChapter" key={chapter.id}><summary>{chapter.title}<span>{chapter.topics?.length||0} topics</span></summary><ul>{(chapter.topics||[]).map(topic=><li key={topic.id}>{topic.title}</li>)}</ul></details>)}</details>)}</details>)}</div></div>}
      </div>
    </section>
  </div>;
}


function AdminPortal({ session, onLogout, onOpenAcademic }) {
  const [items, setItems] = React.useState([]);
  const [filter, setFilter] = React.useState('ALL');
  const [search, setSearch] = React.useState('');
  const [busyId, setBusyId] = React.useState('');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [mentors, setMentors] = React.useState([]);
  const token = session.accessToken;
  const load = React.useCallback(async () => {
    setError('');
    try {
      const query = filter === 'ALL' ? '' : `?status=${encodeURIComponent(filter)}`;
      const data = await api(`/admin/mentorship-applications${query}`, { token });
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); }
  }, [filter, token]);
  React.useEffect(() => { load(); }, [load]);
  React.useEffect(() => { api('/admin/mentorship-applications/mentors', { token }).then(setMentors).catch(err => setError(err.message)); }, [token]);
  async function assignMentor(id, mentorUserId) {
    if (!mentorUserId) return;
    setBusyId(id); setError(''); setNotice('');
    try {
      const updated = await api(`/admin/mentorship-applications/${id}/assignment`, { token, method:'PATCH', body:JSON.stringify({ mentorUserId }) });
      setItems(rows => rows.map(row => row.id === id ? { ...row, assignedMentor: updated.assignedMentor, assignedMentorId: updated.assignedMentorId } : row));
      setNotice(`Mentor assigned to application ${id.slice(0,8)}.`);
    } catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  }
  async function updateStatus(id, status) {
    setBusyId(id); setError(''); setNotice('');
    try {
      const updated = await api(`/admin/mentorship-applications/${id}`, { token, method:'PATCH', body:JSON.stringify({ status }) });
      setItems(rows => rows.map(row => row.id === id ? updated : row));
      setNotice(`Application status updated to ${status.replace('_',' ')}.`);
    } catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  }
  const filtered = items.filter(item => {
    const q = search.trim().toLowerCase();
    const student = item.studentProfile?.user || {};
    return !q || [student.displayName,student.email,item.goal,item.studentProfile?.college?.name].some(v => (v || '').toLowerCase().includes(q));
  });
  return <div className="adminShell">
    <aside className="adminSide"><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><div className="adminSideLabel">ADMINISTRATION</div><div className="adminNav active"><ShieldCheck size={17}/> Mentorship review</div><div className="adminSideBottom"><b>{session.user?.name || 'Administrator'}</b><small>{(session.user?.roles || []).join(' · ')}</small><button onClick={onLogout}><LogOut size={15}/> Sign out</button></div></aside>
    <main className="adminMain"><header className="adminHeader"><div><span className="eyebrow">ADMIN WORKSPACE</span><h1>Mentorship applications</h1><p>Review and update student requests. All status changes are audit logged.</p></div><div className="adminHeaderActions"><button className="refreshButton" onClick={onOpenAcademic}><BookOpen size={14}/> Curriculum CMS</button><button className="refreshButton" onClick={load}><RefreshCw size={14}/> Refresh</button></div></header>
      {error && <div className="errorBox">{error}</div>}{notice && <div className="notice"><CheckCircle2 size={16}/>{notice}</div>}
      <div className="adminStats"><div><span>LOADED APPLICATIONS</span><b>{items.length}</b></div><div><span>PENDING REVIEW</span><b>{items.filter(x=>x.status==='PENDING').length}</b></div><div><span>APPROVED</span><b>{items.filter(x=>x.status==='APPROVED').length}</b></div></div>
      <section className="adminTablePanel"><div className="adminToolbar"><div className="adminSearch"><Search size={16}/><input placeholder="Search student, college or goal" value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="adminFilter"><Filter size={15}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="ALL">All statuses</option><option>PENDING</option><option>UNDER_REVIEW</option><option>APPROVED</option><option>DECLINED</option><option>WITHDRAWN</option></select></div></div>
      {filtered.length===0?<div className="adminEmpty"><ClipboardList size={28}/><b>No applications found</b><span>New student applications will appear here.</span></div>:<div className="adminApplicationList">{filtered.map(item=>{const student=item.studentProfile?.user || {};const p=item.studentProfile || {};return <article className="adminApplication" key={item.id}><div className="adminApplicant"><div className="adminAvatar">{(student.displayName || 'S').slice(0,1).toUpperCase()}</div><div><b>{student.displayName || 'Student'}</b><small>{student.email || 'No email'} · {p.professionalYear || 'Year not set'}</small><small>{p.college?.name || 'College not selected'}{p.college?.state? ` · ${p.college.state}`:''}</small></div><span className={`adminStatus status-${item.status.toLowerCase()}`}>{item.status.replace('_',' ')}</span></div><div className="adminGoal"><b>Preparation goal</b><p>{item.goal}</p>{item.challenge && <><b>Current challenge</b><p>{item.challenge}</p></>}{item.preferredContact && <small>Preferred contact: {item.preferredContact}</small>}{item.mentorReviewNote && <><b>Mentor recommendation</b><p>{item.mentorReviewNote}</p></>}</div><div className="adminAssignment"><UserCheck size={15}/><span>{item.assignedMentor ? `Assigned: ${item.assignedMentor.displayName}` : 'No mentor assigned'}</span><select aria-label="Assign mentor" value={item.assignedMentorId || ''} disabled={busyId===item.id || !['PENDING','UNDER_REVIEW'].includes(item.status)} onChange={e=>assignMentor(item.id,e.target.value)}><option value="">{mentors.length ? 'Assign a mentor…' : 'No eligible mentors'}</option>{mentors.map(m=><option key={m.id} value={m.id}>{m.displayName} · {m.email}</option>)}</select></div><div className="adminApplicationFooter"><small>Submitted {new Date(item.createdAt).toLocaleString()}</small><div>{item.status==='PENDING' && <button disabled={busyId===item.id} onClick={()=>updateStatus(item.id,'UNDER_REVIEW')}><Clock3 size={14}/> Start review</button>}{item.status!=='APPROVED' && item.status!=='DECLINED' && <button className="approveAction" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,'APPROVED')}><Check size={14}/> Approve</button>}{item.status!=='DECLINED' && item.status!=='APPROVED' && <button className="declineAction" disabled={busyId===item.id} onClick={()=>updateStatus(item.id,'DECLINED')}><XCircle size={14}/> Decline</button>}</div></div></article>})}</div>}
      </section><p className="adminFootnote">Access is restricted to SUPER_ADMIN, ADMIN and ACADEMIC_ADMIN roles. Mentors can view only applications assigned to their own account.</p>
    </main>
  </div>;
}


function MentorPortal({ session, onLogout, onOpenAcademic }) {
  const [items, setItems] = React.useState([]);
  const [notes, setNotes] = React.useState({});
  const [busyId, setBusyId] = React.useState('');
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const token = session.accessToken;
  const load = React.useCallback(async () => {
    setError('');
    try { const data = await api('/mentors/me/mentorship-applications', { token }); setItems(Array.isArray(data) ? data : []); }
    catch (err) { setError(err.message); }
  }, [token]);
  React.useEffect(() => { load(); }, [load]);
  async function submitReview(id) {
    const reviewNote = (notes[id] || '').trim();
    if (reviewNote.length < 20) { setError('Please enter at least 20 characters for your recommendation.'); return; }
    setBusyId(id); setError(''); setNotice('');
    try {
      const updated = await api(`/mentors/me/mentorship-applications/${id}/review`, { token, method:'PATCH', body:JSON.stringify({ reviewNote }) });
      setItems(rows => rows.map(row => row.id === id ? { ...row, mentorReviewNote: updated.mentorReviewNote } : row));
      setNotice('Your recommendation has been securely submitted.');
    } catch (err) { setError(err.message); }
    finally { setBusyId(''); }
  }
  return <div className="adminShell">
    <aside className="adminSide"><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><div className="adminSideLabel">MENTOR WORKSPACE</div><div className="adminNav active"><UserCheck size={17}/> Assigned students</div><div className="adminSideBottom"><b>{session.user?.name || 'Mentor'}</b><small>FACULTY</small><button onClick={onLogout}><LogOut size={15}/> Sign out</button></div></aside>
    <main className="adminMain"><header className="adminHeader"><div><span className="eyebrow">MENTOR WORKSPACE</span><h1>My assigned students</h1><p>Only applications assigned to your account are visible here.</p></div><button className="refreshButton" onClick={load}><RefreshCw size={14}/> Refresh</button></header>
      {error && <div className="errorBox">{error}</div>}{notice && <div className="notice"><CheckCircle2 size={16}/>{notice}</div>}
      <div className="adminStats"><div><span>ASSIGNED APPLICATIONS</span><b>{items.length}</b></div><div><span>AWAITING REVIEW</span><b>{items.filter(x=>!x.mentorReviewNote).length}</b></div><div><span>RECOMMENDATIONS SUBMITTED</span><b>{items.filter(x=>!!x.mentorReviewNote).length}</b></div></div>
      <section className="adminTablePanel">{items.length===0?<div className="adminEmpty"><ClipboardList size={28}/><b>No assigned applications</b><span>Applications assigned to you by an administrator will appear here.</span></div>:items.map(item=><article className="adminApplication" key={item.id}><div className="adminApplicant"><div className="adminAvatar">{(item.studentProfile?.user?.displayName || 'S').slice(0,1).toUpperCase()}</div><div><b>{item.studentProfile?.user?.displayName || 'Student'}</b><small>{item.studentProfile?.user?.email || 'No email'} · {item.studentProfile?.professionalYear || 'Year not set'}</small><small>{item.studentProfile?.college?.name || 'College not selected'} · {item.studentProfile?.university || ''}</small></div><span className={`adminStatus status-${item.status.toLowerCase()}`}>{item.status.replace('_',' ')}</span></div><div className="adminGoal"><b>Student preparation goal</b><p>{item.goal}</p>{item.challenge && <><b>Current challenge</b><p>{item.challenge}</p></>}{item.mentorReviewNote && <><b>Your submitted recommendation</b><p>{item.mentorReviewNote}</p></>}</div>{['PENDING','UNDER_REVIEW'].includes(item.status) && <div className="mentorReviewForm"><label>Mentor recommendation / guidance<textarea rows="4" minLength="20" maxLength="2000" placeholder="Write actionable guidance, next steps and preparation recommendations (20–2000 characters)." value={notes[item.id] ?? item.mentorReviewNote ?? ''} onChange={e=>setNotes(v=>({...v,[item.id]:e.target.value}))}/></label><button disabled={busyId===item.id || (notes[item.id] ?? item.mentorReviewNote ?? '').trim().length<20} onClick={()=>submitReview(item.id)}><Send size={14}/> Submit recommendation</button></div>}<div className="adminApplicationFooter"><small>Assigned {item.assignedAt ? new Date(item.assignedAt).toLocaleString() : 'date unavailable'}</small></div></article>)}</section>
      <p className="adminFootnote">Mentors can submit recommendations but cannot approve, decline, reassign or access unassigned student applications. Final application decisions remain with administrators.</p>
    </main>
  </div>;
}


function AcademicPortal({ session, onBack, onLogout }) {
  const [subjects, setSubjects] = React.useState([]);
  const [subjectForm, setSubjectForm] = React.useState({ code:'', name:'', description:'' });
  const [unitForm, setUnitForm] = React.useState({ subjectId:'', title:'' });
  const [chapterForm, setChapterForm] = React.useState({ unitId:'', title:'' });
  const [topicForm, setTopicForm] = React.useState({ chapterId:'', title:'' });
  const [courses, setCourses] = React.useState([]);
  const [facultyCourses, setFacultyCourses] = React.useState([]);
  const [courseForm, setCourseForm] = React.useState({ code:'', title:'', subjectId:'', description:'' });
  const [mentors, setMentors] = React.useState([]);
  const [courseAssignments, setCourseAssignments] = React.useState({});
  const [myLectures, setMyLectures] = React.useState([]);
  const [lectureForm, setLectureForm] = React.useState({ courseId:'', title:'', description:'', videoUrl:'', videoType:'YOUTUBE', durationSec:'' });
  const [resourceForms, setResourceForms] = React.useState({});
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const token = session.accessToken;
  const roleNames = session.user?.roles || [];
  const isAcademicAdmin = roleNames.some(role => ['SUPER_ADMIN','ADMIN','ACADEMIC_ADMIN'].includes(role));
  const isFaculty = roleNames.includes('FACULTY');
  const load = React.useCallback(async () => {
    setError('');
    try {
      const data = await api('/academic/subjects');
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) { setError(err.message); }
  }, []);
  React.useEffect(() => { load(); }, [load]);
  const loadCourses = React.useCallback(async () => {
    try {
      const data = await api('/academic/courses');
      setCourses(Array.isArray(data) ? data : []);
      if (isFaculty) {
        const assigned = await api('/academic/faculty/me/courses', { token });
        setFacultyCourses(Array.isArray(assigned) ? assigned : []);
        const lectures = await api('/academic/faculty/me/lectures', { token });
        setMyLectures(Array.isArray(lectures) ? lectures : []);
      }
    } catch (err) { setError(err.message); }
  }, [isFaculty, token]);
  React.useEffect(() => { loadCourses(); }, [loadCourses]);
  React.useEffect(() => {
    if (isAcademicAdmin) api('/admin/mentorship-applications/mentors', { token }).then(setMentors).catch(err => setError(err.message));
  }, [isAcademicAdmin, token]);
  async function createLecture(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const { courseId, durationSec, ...payload } = lectureForm;
      await api('/academic/courses/'+courseId+'/lectures', { token, method:'POST', body:JSON.stringify({ ...payload, durationSec: durationSec ? Number(durationSec) : undefined }) });
      setLectureForm(v=>({...v,title:'',description:'',videoUrl:'',durationSec:''}));
      await loadCourses(); setNotice('Lecture saved as draft. Add notes/resources, then submit it for academic review.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function createResource(lectureId) {
    const form = resourceForms[lectureId] || {};
    setBusy(true); setError(''); setNotice('');
    try {
      await api('/academic/lectures/'+lectureId+'/resources', { token, method:'POST', body:JSON.stringify(form) });
      setResourceForms(v=>({...v,[lectureId]:{ title:'', type:'PDF', url:'', description:'' }}));
      await loadCourses(); setNotice('Learning resource saved as draft.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function submitLecture(lectureId) {
    setBusy(true); setError(''); setNotice('');
    try { await api('/academic/lectures/'+lectureId+'/submit', { token, method:'POST' }); await loadCourses(); setNotice('Lecture and draft resources submitted for academic review.'); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function createCourse(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      await api('/academic/courses', { token, method:'POST', body:JSON.stringify(courseForm) });
      setCourseForm({ code:'', title:'', subjectId:'', description:'' });
      await loadCourses(); setNotice('Course created and audit logged.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function assignCourseFaculty(courseId) {
    const facultyId = courseAssignments[courseId];
    if (!facultyId) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await api('/academic/courses/'+courseId+'/faculty', { token, method:'POST', body:JSON.stringify({ facultyId }) });
      setNotice('Faculty assigned to course and audit logged.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  const units = subjects.find(x => x.id === unitForm.subjectId)?.units || [];
  const chapters = subjects.flatMap(x => x.units || []).find(x => x.id === chapterForm.unitId)?.chapters || [];
  async function create(path, payload, reset) {
    setBusy(true); setError(''); setNotice('');
    try {
      await api(path, { token, method:'POST', body:JSON.stringify(payload) });
      reset();
      await load();
      setNotice('Curriculum item created and audit logged.');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="adminShell">
    <aside className="adminSide">
      <div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div>
      <div className="adminSideLabel">ACADEMIC CONTENT</div>
      <div className="adminNav active"><BookOpen size={17}/> Curriculum structure</div>
      <div className="adminSideBottom"><b>{session.user?.name || 'Academic editor'}</b><small>{roleNames.join(' · ')}</small><button onClick={onBack}><ArrowLeft size={15}/> Back to workspace</button><button onClick={onLogout}><LogOut size={15}/> Sign out</button></div>
    </aside>
    <main className="adminMain">
      <header className="adminHeader"><div><span className="eyebrow">PHASE 2 · ACADEMIC INFRASTRUCTURE</span><h1>Curriculum manager</h1><p>Build the hierarchy used by courses, lectures, notes, QBank and examinations.</p></div><div className="adminHeaderActions"><button className="refreshButton" onClick={onOpenAcademic}><BookOpen size={14}/> Curriculum CMS</button><button className="refreshButton" onClick={load}><RefreshCw size={14}/> Refresh</button></div></header>
      {error && <div className="errorBox" role="alert">{error}</div>}{notice && <div className="notice"><CheckCircle2 size={16}/>{notice}</div>}
      <section className="academicForms">
        <form className="academicForm" onSubmit={e=>{e.preventDefault();create('/academic/subjects',subjectForm,()=>setSubjectForm({code:'',name:'',description:''}));}}>
          <span className="eyebrow">01 · SUBJECT</span><h2>Create subject</h2>
          <label>Unique code<input required minLength="2" maxLength="30" pattern="[A-Z0-9_-]+" placeholder="ANAT" value={subjectForm.code} onChange={e=>setSubjectForm(v=>({...v,code:e.target.value.toUpperCase()}))}/></label>
          <label>Subject name<input required minLength="2" maxLength="120" placeholder="Anatomy" value={subjectForm.name} onChange={e=>setSubjectForm(v=>({...v,name:e.target.value}))}/></label>
          <label>Description (optional)<textarea maxLength="500" rows="2" value={subjectForm.description} onChange={e=>setSubjectForm(v=>({...v,description:e.target.value}))}/></label>
          <button className="primary" disabled={busy}>Create subject</button>
        </form>
        <form className="academicForm" onSubmit={e=>{e.preventDefault();create('/academic/subjects/'+unitForm.subjectId+'/units',{title:unitForm.title},()=>setUnitForm(v=>({...v,title:''})));}}>
          <span className="eyebrow">02 · UNIT</span><h2>Add unit</h2>
          <label>Parent subject<select required value={unitForm.subjectId} onChange={e=>setUnitForm({subjectId:e.target.value,title:''})}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>
          <label>Unit title<input required minLength="2" maxLength="160" value={unitForm.title} onChange={e=>setUnitForm(v=>({...v,title:e.target.value}))}/></label>
          <button className="primary" disabled={busy || !unitForm.subjectId}>Add unit</button>
        </form>
        <form className="academicForm" onSubmit={e=>{e.preventDefault();create('/academic/units/'+chapterForm.unitId+'/chapters',{title:chapterForm.title},()=>setChapterForm(v=>({...v,title:''})));}}>
          <span className="eyebrow">03 · CHAPTER</span><h2>Add chapter</h2>
          <label>Parent unit<select required value={chapterForm.unitId} onChange={e=>setChapterForm({unitId:e.target.value,title:''})}><option value="">Select unit</option>{subjects.flatMap(s=>(s.units||[]).map(u=>({...u,parent:s.name}))).map(u=><option key={u.id} value={u.id}>{u.parent} · {u.title}</option>)}</select></label>
          <label>Chapter title<input required minLength="2" maxLength="160" value={chapterForm.title} onChange={e=>setChapterForm(v=>({...v,title:e.target.value}))}/></label>
          <button className="primary" disabled={busy || !chapterForm.unitId}>Add chapter</button>
        </form>
        <form className="academicForm" onSubmit={e=>{e.preventDefault();create('/academic/chapters/'+topicForm.chapterId+'/topics',{title:topicForm.title},()=>setTopicForm(v=>({...v,title:''})));}}>
          <span className="eyebrow">04 · TOPIC</span><h2>Add topic</h2>
          <label>Parent chapter<select required value={topicForm.chapterId} onChange={e=>setTopicForm({chapterId:e.target.value,title:''})}><option value="">Select chapter</option>{subjects.flatMap(s=>(s.units||[]).flatMap(u=>(u.chapters||[]).map(ch=>({...ch,parent:s.name+' · '+u.title})))) .map(ch=><option key={ch.id} value={ch.id}>{ch.parent} · {ch.title}</option>)}</select></label>
          <label>Topic title<input required minLength="2" maxLength="160" value={topicForm.title} onChange={e=>setTopicForm(v=>({...v,title:e.target.value}))}/></label>
          <button className="primary" disabled={busy || !topicForm.chapterId}>Add topic</button>
        </form>
      </section>
      {isAcademicAdmin && <section className="academicForms">
        <form className="academicForm" onSubmit={createCourse}>
          <span className="eyebrow">05 · COURSE</span><h2>Create course</h2>
          <label>Course code<input required minLength="2" maxLength="30" pattern="[A-Z0-9_-]+" value={courseForm.code} onChange={e=>setCourseForm(v=>({...v,code:e.target.value.toUpperCase()}))} placeholder="ANAT-CORE"/></label>
          <label>Course title<input required minLength="2" maxLength="160" value={courseForm.title} onChange={e=>setCourseForm(v=>({...v,title:e.target.value}))} placeholder="Anatomy Core Course"/></label>
          <label>Parent subject<select required value={courseForm.subjectId} onChange={e=>setCourseForm(v=>({...v,subjectId:e.target.value}))}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>
          <label>Description<textarea rows="2" maxLength="1000" value={courseForm.description} onChange={e=>setCourseForm(v=>({...v,description:e.target.value}))}/></label>
          <button className="primary" disabled={busy || !subjects.length}>Create course</button>
        </form>
        <div className="academicForm"><span className="eyebrow">06 · FACULTY OWNERSHIP</span><h2>Assign faculty</h2>
          {courses.length===0?<p className="emptyState">Create a course before assigning faculty.</p>:courses.map(course=><div className="applicationItem" key={course.id}><div><b>{course.code} · {course.title}</b><small>{course.subject?.name || 'Subject'}</small><select aria-label={'Faculty for '+course.title} value={courseAssignments[course.id] || ''} onChange={e=>setCourseAssignments(v=>({...v,[course.id]:e.target.value}))}><option value="">Select verified faculty</option>{mentors.map(m=><option key={m.id} value={m.id}>{m.displayName} · {m.email}</option>)}</select></div><button type="button" disabled={busy || !courseAssignments[course.id]} onClick={()=>assignCourseFaculty(course.id)}>Assign</button></div>)}
        </div>
      </section>}
      {isFaculty && <section className="academicForms">
        <form className="academicForm" onSubmit={createLecture}>
          <span className="eyebrow">LECTURE CONTENT</span><h2>Create lecture</h2>
          <label>Assigned course<select required value={lectureForm.courseId} onChange={e=>setLectureForm(v=>({...v,courseId:e.target.value}))}><option value="">Select your assigned course</option>{facultyCourses.map(row=><option key={row.course.id} value={row.course.id}>{row.course.code} · {row.course.title}</option>)}</select></label>
          <label>Lecture title<input required minLength="2" maxLength="180" value={lectureForm.title} onChange={e=>setLectureForm(v=>({...v,title:e.target.value}))}/></label>
          <label>Description<textarea rows="2" maxLength="2000" value={lectureForm.description} onChange={e=>setLectureForm(v=>({...v,description:e.target.value}))}/></label>
          <label>Video URL (YouTube or hosted MP4)<input type="url" placeholder="https://" value={lectureForm.videoUrl} onChange={e=>setLectureForm(v=>({...v,videoUrl:e.target.value}))}/></label>
          <label>Video source<select value={lectureForm.videoType} onChange={e=>setLectureForm(v=>({...v,videoType:e.target.value}))}><option value="YOUTUBE">YouTube</option><option value="MP4">Hosted MP4</option><option value="EXTERNAL">External player URL</option></select></label>
          <label>Duration (seconds)<input type="number" min="1" max="86400" value={lectureForm.durationSec} onChange={e=>setLectureForm(v=>({...v,durationSec:e.target.value}))}/></label>
          <button className="primary" disabled={busy || !facultyCourses.length}>Save lecture draft</button>
        </form>
        <div className="academicForm"><span className="eyebrow">MY CONTENT</span><h2>Lectures and notes</h2>
          {myLectures.length===0?<p className="emptyState">No lecture drafts yet. Create a lecture from an assigned course.</p>:myLectures.map(lecture=><article className="applicationItem" key={lecture.id}>
            <div><b>{lecture.title}</b><small>{lecture.status} · {lecture.videoType || 'No video type'} · {lecture.resources?.length || 0} resources</small>{lecture.reviewNote && <small>Review note: {lecture.reviewNote}</small>}
            {['DRAFT','REJECTED'].includes(lecture.status) && <div className="resourceEditor">
              <input placeholder="Notes/PDF title" value={resourceForms[lecture.id]?.title || ''} onChange={e=>setResourceForms(v=>({...v,[lecture.id]:{...(v[lecture.id]||{type:'PDF',url:'',description:''}),title:e.target.value}}))}/>
              <select value={resourceForms[lecture.id]?.type || 'PDF'} onChange={e=>setResourceForms(v=>({...v,[lecture.id]:{...(v[lecture.id]||{title:'',url:'',description:''}),type:e.target.value}}))}><option value="PDF">PDF notes link</option><option value="EXTERNAL_LINK">External learning link</option></select>
              <input type="url" placeholder="Secure HTTPS resource URL" value={resourceForms[lecture.id]?.url || ''} onChange={e=>setResourceForms(v=>({...v,[lecture.id]:{...(v[lecture.id]||{title:'',type:'PDF',description:''}),url:e.target.value}}))}/>
              <button type="button" disabled={busy || !(resourceForms[lecture.id]?.title||'').trim() || !(resourceForms[lecture.id]?.url||'').trim()} onClick={()=>createResource(lecture.id)}>Add resource</button>
            </div>}</div>
            <div className="applicationActions">{['DRAFT','REJECTED'].includes(lecture.status) && <button type="button" disabled={busy} onClick={()=>submitLecture(lecture.id)}>Submit for review</button>}</div>
          </article>)}
        </div>
      </section>}
      {isFaculty && <section className="academicTreePanel"><div className="academicTreeHeading"><div><span className="eyebrow">FACULTY TEACHING</span><h2>My assigned courses</h2></div><button className="refreshButton" onClick={loadCourses}><RefreshCw size={14}/> Refresh</button></div>
        {facultyCourses.length===0?<p className="emptyState">No courses have been assigned to your faculty account yet.</p>:facultyCourses.map(row=><article className="applicationItem" key={row.course.id}><div><b>{row.course.code} · {row.course.title}</b><small>{row.course.subject?.name || 'Subject'}</small></div></article>)}
      </section>}
      <section className="academicTreePanel"><div className="academicTreeHeading"><div><span className="eyebrow">LIVE DATABASE CATALOGUE</span><h2>Curriculum structure</h2></div><span>{subjects.length} subjects</span></div>
        {subjects.length===0?<div className="adminEmpty"><BookOpen size={28}/><b>No curriculum records yet</b><span>Create a subject to start building the academic catalogue.</span></div>:subjects.map(subject=><details className="academicSubject" key={subject.id} open><summary><b>{subject.code} · {subject.name}</b><span>{subject.units?.length || 0} units</span></summary>{(subject.units||[]).map(unit=><details className="academicUnit" key={unit.id}><summary>{unit.title}<span>{unit.chapters?.length || 0} chapters</span></summary>{(unit.chapters||[]).map(chapter=><details className="academicChapter" key={chapter.id}><summary>{chapter.title}<span>{chapter.topics?.length || 0} topics</span></summary><ul>{(chapter.topics||[]).map(topic=><li key={topic.id}>{topic.title}</li>)}</ul></details>)}</details>)}</details>)}
      </section>
      <p className="adminFootnote">Writes require a verified privileged account and are recorded in the audit log. This milestone creates curriculum structure only; lecture uploads, notes, QBank, publication review and student enrolment are separate upcoming modules.</p>
    </main>
  </div>;
}

function App() {
  const [portal, setPortal] = React.useState(false);
  const [auth, setAuth] = React.useState(false);
  const [session, setSession] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [showAuth, setShowAuth] = React.useState(false);
  const [academicMode, setAcademicMode] = React.useState(false);
  const programs=[{title:'NEET PG Mentorship',text:'Structured guidance, accountability and a practical preparation roadmap.'},{title:'Personal Study Plan',text:'Build a realistic plan around your college schedule and preparation stage.'},{title:'Progress Tracking',text:'Keep goals, milestones and mentor feedback in one student dashboard.'}];
  if(portal && academicMode) return <AcademicPortal session={session} onBack={()=>setAcademicMode(false)} onLogout={()=>{setSession(null);setPortal(false);setAcademicMode(false);setShowAuth(true)}}/>;
  if(portal && (session?.user?.roles || []).includes('FACULTY')) return <MentorPortal session={session} onOpenAcademic={()=>setAcademicMode(true)} onLogout={()=>{setSession(null);setPortal(false);setShowAuth(true)}}/>;
  if(portal && (session?.user?.roles || []).some(role => ['SUPER_ADMIN','ADMIN','ACADEMIC_ADMIN'].includes(role))) return <AdminPortal session={session} onOpenAcademic={()=>setAcademicMode(true)} onLogout={()=>{setSession(null);setPortal(false);setShowAuth(true)}}/>;
  if(portal && (session?.user?.roles || []).includes('CONTENT_MANAGER')) return <AcademicPortal session={session} onBack={()=>setPortal(false)} onLogout={()=>{setSession(null);setPortal(false);setShowAuth(true)}}/>;
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
