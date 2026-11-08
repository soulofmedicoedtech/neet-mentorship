import React from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ClipboardList, GraduationCap, LayoutDashboard, Menu, MessageSquare, UserRound, X } from 'lucide-react';
import './styles.css';

const programs = [
  { title: 'NEET PG Mentorship', text: 'Structured guidance, accountability and a practical preparation roadmap.' },
  { title: 'Personal Study Plan', text: 'Build a realistic plan around your college schedule and preparation stage.' },
  { title: 'Progress Tracking', text: 'Keep goals, milestones and mentor feedback in one student dashboard.' },
];

function StudentPortal({ onBack }) {
  const [tab, setTab] = React.useState('overview');
  const [profile, setProfile] = React.useState({ name: 'Medical Student', year: '3rd Professional Part I', college: '', university: 'The Tamil Nadu Dr. M.G.R. Medical University', target: 'NEET PG', language: 'English' });
  const [application, setApplication] = React.useState({ goal: '', challenge: '', preferredContact: '' });
  const [submitted, setSubmitted] = React.useState(false);
  const [notice, setNotice] = React.useState('Preview mode — changes are held in this browser session only.');
  const updateProfile = (key, value) => setProfile(current => ({ ...current, [key]: value }));
  const updateApplication = (key, value) => setApplication(current => ({ ...current, [key]: value }));
  const nav = [{ id:'overview', label:'Overview', icon:LayoutDashboard }, { id:'profile', label:'My profile', icon:UserRound }, { id:'mentorship', label:'Mentorship', icon:ClipboardList }, { id:'learning', label:'Learning', icon:BookOpen }];
  return <div className="portal">
    <aside className="sidebar">
      <div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div>
      <div className="sideCaption">STUDENT SPACE</div>
      {nav.map(item => <button key={item.id} className={tab===item.id?'sideLink active':'sideLink'} onClick={()=>{setTab(item.id);setNotice('Preview mode — changes are held in this browser session only.')}}><item.icon size={18}/>{item.label}</button>)}
      <div className="sideBottom"><div className="avatar">MS</div><div><b>{profile.name || 'Student'}</b><small>Student preview</small></div></div>
    </aside>
    <section className="portalMain">
      <header className="portalTop"><button className="backLink" onClick={onBack}><ArrowLeft size={17}/> Back to PRAXIS</button><span className="previewTag">DEMO PREVIEW</span></header>
      <div className="portalContent">
        <div className="notice"><Activity size={16}/>{notice}</div>
        {tab==='overview' && <>
          <div className="welcome"><div><span className="eyebrow">STUDENT DASHBOARD</span><h1>Welcome, {profile.name.split(' ')[0] || 'Student'}.</h1><p>Your preparation journey, organised in one place.</p></div><div className="welcomeIcon"><GraduationCap size={30}/></div></div>
          <div className="statGrid"><div className="statCard"><span>ACADEMIC YEAR</span><b>{profile.year}</b><small>Update in My profile</small></div><div className="statCard"><span>PREPARATION GOAL</span><b>{profile.target}</b><small>Your selected exam pathway</small></div><div className="statCard"><span>MENTORSHIP</span><b>{submitted?'Application drafted':'Not applied'}</b><small>{submitted?'Preview only — not submitted':'Start with a short application'}</small></div></div>
          <div className="panelGrid"><article className="panel"><div className="panelTitle"><h2>Get started</h2><span>YOUR NEXT STEPS</span></div><button className="taskRow" onClick={()=>setTab('profile')}><UserRound/><span><b>Complete your student profile</b><small>Add your college and academic details</small></span><ArrowRight/></button><button className="taskRow" onClick={()=>setTab('mentorship')}><MessageSquare/><span><b>Explore mentorship</b><small>Tell us what support you are looking for</small></span><ArrowRight/></button></article><article className="panel learningPanel"><BookOpen size={25}/><h2>Learning space</h2><p>Your subject-wise videos, notes, question bank and tests will appear here as those modules are built.</p><button className="textButton" onClick={()=>setTab('learning')}>View learning roadmap <ArrowRight size={16}/></button></article></div>
        </>}
        {tab==='profile' && <div className="formPanel"><span className="eyebrow">YOUR DETAILS</span><h1>Student profile</h1><p>Set up your academic profile and preparation preferences.</p><div className="formGrid">
          <label>Full name<input value={profile.name} onChange={e=>updateProfile('name',e.target.value)} /></label>
          <label>MBBS professional year<select value={profile.year} onChange={e=>updateProfile('year',e.target.value)}>{['1st Professional','2nd Professional','3rd Professional Part I','3rd Professional Part II','Internship','Graduate'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label className="wide">Medical college<input placeholder="Enter your college name" value={profile.college} onChange={e=>updateProfile('college',e.target.value)} /></label>
          <label>University<input value={profile.university} onChange={e=>updateProfile('university',e.target.value)} /></label>
          <label>Preparation goal<select value={profile.target} onChange={e=>updateProfile('target',e.target.value)}>{['NEET PG','INI-CET','MBBS University Exams','NEET PG + INI-CET'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label>Preferred language<select value={profile.language} onChange={e=>updateProfile('language',e.target.value)}>{['English','Tamil','Hindi','Malayalam','Telugu','Kannada'].map(x=><option key={x}>{x}</option>)}</select></label>
        </div><div className="formActions"><span>Preview only. Profile is not saved to an account.</span><button className="primary" onClick={()=>setNotice('Profile preview updated for this session. It has not been saved to the server.')}>Save preview <CheckCircle2 size={17}/></button></div></div>}
        {tab==='mentorship' && <div className="formPanel"><span className="eyebrow">MENTORSHIP PROGRAM</span><h1>{submitted?'Application preview':'Apply for mentorship'}</h1><p>Share your goals and the areas where you would value guidance.</p>{submitted && <div className="statusCard"><CheckCircle2/><div><b>Draft created in this preview</b><span>This is not a real submission. No mentor has been assigned and no data has been sent.</span></div></div>}<div className="formGrid"><label className="wide">What is your main preparation goal?<textarea rows="3" placeholder="For example: build a consistent NEET PG preparation routine..." value={application.goal} onChange={e=>updateApplication('goal',e.target.value)}/></label><label className="wide">What is your biggest current challenge?<textarea rows="3" placeholder="Tell us what you find difficult..." value={application.challenge} onChange={e=>updateApplication('challenge',e.target.value)}/></label><label className="wide">Preferred contact method<input placeholder="Email or phone (optional)" value={application.preferredContact} onChange={e=>updateApplication('preferredContact',e.target.value)}/></label></div><div className="formActions"><span>Demo interaction — backend submission is not enabled.</span><button className="primary" onClick={()=>setSubmitted(true)} disabled={!application.goal.trim()}>Save application preview <ArrowRight size={17}/></button></div></div>}
        {tab==='learning' && <div className="formPanel"><span className="eyebrow">LEARNING ROADMAP</span><h1>Your learning space</h1><p>The student learning modules are planned in phases. No course content is connected in this preview yet.</p><div className="roadmap">{[['Video lessons','Recorded lectures and topic-wise learning'],['Notes library','Lecture notes and subject resources'],['Question bank','Practice MCQs with explanations'],['University preparation','Theory questions and exam-focused revision'],['Tests & analytics','Timed tests and performance insights']].map(([title,desc],i)=><div className="roadmapRow" key={title}><span>0{i+1}</span><div><b>{title}</b><small>{desc}</small></div><span className="planned">PLANNED</span></div>)}</div></div>}
      </div>
    </section>
  </div>;
}

function App() {
  const [portal, setPortal] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  if (portal) return <StudentPortal onBack={()=>setPortal(false)} />;
  return <div className="app">
    <header className="nav"><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><nav className={open?'navLinks open':'navLinks'}><a href="#programs" onClick={()=>setOpen(false)}>Programs</a><a href="#how" onClick={()=>setOpen(false)}>How it works</a><a href="#about" onClick={()=>setOpen(false)}>About</a><button className="login" onClick={()=>setPortal(true)}>Student Portal Preview</button></nav><button className="menu" onClick={()=>setOpen(!open)} aria-label="Menu">{open?<X/>:<Menu/>}</button></header>
    <main><section className="hero"><div className="heroCopy"><div className="eyebrow"><GraduationCap size={16}/> MEDICAL EDUCATION & MENTORSHIP</div><h1>Prepare with <span>clarity.</span><br/>Progress with purpose.</h1><p>A focused platform for medical students preparing for university examinations and postgraduate entrance exams — with structured learning, mentorship and measurable progress.</p><div className="actions"><button className="primary" onClick={()=>setPortal(true)}>Explore student portal <ArrowRight size={18}/></button><a className="secondary" href="#how">How it works</a></div><div className="trust"><CheckCircle2 size={18}/><span>Built for MBBS students • Structured learning • Goal focused</span></div></div><div className="heroCard"><div className="cardTop"><div><small>YOUR PREPARATION</small><h3>One platform. Every milestone.</h3></div><GraduationCap size={30}/></div><div className="progress"><div><span>Learning roadmap</span><b>In development</b></div><div className="bar"><i style={{width:'52%'}}/></div></div><div className="miniGrid"><div><BookOpen/><strong>Study resources</strong><span>Subject organised</span></div><div><MessageSquare/><strong>Mentorship</strong><span>Guidance focused</span></div></div></div></section>
    <section id="programs" className="section"><div className="sectionHead"><span>WHAT PRAXIS IS BUILDING</span><h2>Learning and guidance, built around your journey.</h2></div><div className="programGrid">{programs.map((p,i)=><article className="program" key={p.title}><div className="number">0{i+1}</div><h3>{p.title}</h3><p>{p.text}</p><a href="#how">Learn more <ArrowRight size={15}/></a></article>)}</div></section>
    <section id="how" className="how"><div><span>HOW IT WORKS</span><h2>A clearer path from preparation to progress.</h2></div><div className="steps"><div><b>01</b><h3>Set your goal</h3><p>Tell us your academic stage and examination targets.</p></div><div><b>02</b><h3>Build your plan</h3><p>Organise your learning and mentorship priorities.</p></div><div><b>03</b><h3>Track progress</h3><p>Review milestones and improve your preparation.</p></div></div></section>
    <section id="about" className="cta"><h2>Make every study session count.</h2><p>PRAXIS-MBBS is being built to make medical education more structured, accessible and student-focused.</p><button className="primary" onClick={()=>setPortal(true)}>Open student portal preview <ArrowRight size={18}/></button></section></main>
    <footer><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><span>Powered by SOUL OF MEDICO</span><span>© 2026 PRAXIS-MBBS</span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
