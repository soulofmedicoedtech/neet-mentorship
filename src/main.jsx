import React from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Menu, ShieldCheck, Users, X } from 'lucide-react';
import './styles.css';

const programs = [
  { title: 'NEET PG Mentorship', text: 'Structured guidance, accountability and a practical preparation roadmap.' },
  { title: 'Personal Study Plan', text: 'Build a realistic plan around your college schedule and preparation stage.' },
  { title: 'Progress Tracking', text: 'Keep goals, milestones and mentor feedback in one student dashboard.' },
];

function App() {
  const [open, setOpen] = React.useState(false);
  return <div className="app">
    <header className="nav">
      <div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div>
      <nav className={open ? 'navLinks open' : 'navLinks'}>
        <a href="#programs" onClick={() => setOpen(false)}>Programs</a><a href="#how" onClick={() => setOpen(false)}>How it works</a><a href="#about" onClick={() => setOpen(false)}>About</a>
        <button className="login" onClick={() => alert('Student login will be connected in the next build.')}>Student Login</button>
      </nav>
      <button className="menu" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X/> : <Menu/>}</button>
    </header>

    <main>
      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow"><ShieldCheck size={16}/> MEDICAL STUDENT MENTORSHIP</div>
          <h1>Prepare with <span>clarity.</span><br/>Progress with purpose.</h1>
          <p>A focused mentorship platform for medical students preparing for NEET PG — with structured guidance, study planning and measurable progress.</p>
          <div className="actions"><button className="primary" onClick={() => document.getElementById('programs').scrollIntoView({behavior:'smooth'})}>Explore mentorship <ArrowRight size={18}/></button><a className="secondary" href="#how">How it works</a></div>
          <div className="trust"><CheckCircle2 size={18}/><span>Built for MBBS students • Mentor-led • Goal focused</span></div>
        </div>
        <div className="heroCard"><div className="cardTop"><div><small>YOUR PREPARATION</small><h3>One plan. Every milestone.</h3></div><GraduationCap size={30}/></div><div className="progress"><div><span>Study roadmap</span><b>75%</b></div><div className="bar"><i style={{width:'75%'}}/></div></div><div className="miniGrid"><div><BookOpen/><strong>Subjects</strong><span>Organised</span></div><div><Users/><strong>Mentor</strong><span>Assigned</span></div></div></div>
      </section>

      <section id="programs" className="section"><div className="sectionHead"><span>WHAT YOU GET</span><h2>Everything you need to stay on track.</h2></div><div className="programGrid">{programs.map((p,i)=><article className="program" key={p.title}><div className="number">0{i+1}</div><h3>{p.title}</h3><p>{p.text}</p><a href="#how">Learn more <ArrowRight size={15}/></a></article>)}</div></section>
      <section id="how" className="how"><div><span>HOW IT WORKS</span><h2>From application to action.</h2></div><div className="steps"><div><b>01</b><h3>Apply</h3><p>Tell us about your preparation stage and goals.</p></div><div><b>02</b><h3>Get matched</h3><p>Connect with the right mentorship pathway.</p></div><div><b>03</b><h3>Execute</h3><p>Follow your plan, review progress and improve.</p></div></div></section>
      <section id="about" className="cta"><h2>Your NEET PG journey deserves a system.</h2><p>PRAXIS-MBBS is being built to make medical preparation more structured, accountable and student-focused.</p><button className="primary" onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>Start your journey <ArrowRight size={18}/></button></section>
    </main>
    <footer><div className="brand"><span className="brandMark">P</span><span>PRAXIS<span className="accent">-MBBS</span></span></div><span>Powered by SOUL OF MEDICO</span><span>© 2026 PRAXIS-MBBS</span></footer>
  </div>
}

createRoot(document.getElementById('root')).render(<App />);
