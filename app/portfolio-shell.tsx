'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Braces,
  BrainCircuit,
  Code2,
  CheckCircle2,
  Download,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  Moon,
  Palette,
  Send,
  Sparkles,
  Sun,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type StoredProject = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  category: string;
  year: number;
  technologies: string[];
  demoUrl: string | null;
  githubUrl: string | null;
  problem: string;
  role: string;
  result: string;
};

export function PortfolioShell() {
  const [storedProjects, setStoredProjects] = useState<StoredProject[]>([]);
  const [activeTab, setActiveTab] = useState('about');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [contactState, setContactState] = useState<{ type:'idle'|'sending'|'success'|'error'; message:string }>({ type:'idle', message:'' });

  useEffect(() => {
    let savedTheme: string | null = null;
    try { savedTheme = localStorage.getItem('portfolio-theme'); } catch { /* Storage may be unavailable in private browsing. */ }
    const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const nextTheme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : preferredTheme;
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    setTheme(nextTheme);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects')
      .then(async (response): Promise<{ projects: StoredProject[] }> => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        if (!cancelled) setStoredProjects(data.projects);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'));
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -36px' });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [storedProjects, activeTab]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactState({ type:'sending', message:'' });
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/contact', { method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify(Object.fromEntries(formData)) });
      const data = (await response.json()) as { message?:string };
      if (!response.ok) throw new Error(data.message ?? 'Your message could not be sent.');
      form.reset(); setContactState({ type:'success', message:data.message ?? 'Thanks — your message has been sent.' });
    } catch (error) { setContactState({ type:'error', message:error instanceof Error ? error.message : 'Your message could not be sent.' }); }
  }

  function toggleTheme() {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    setTheme(nextTheme);
    root.classList.add('theme-switching');
    root.classList.toggle('dark', nextTheme === 'dark');
    try { localStorage.setItem('portfolio-theme', nextTheme); } catch { /* The toggle still works without persistence. */ }
    window.setTimeout(() => root.classList.remove('theme-switching'), 650);
  }

  return (
    <main className="portfolio-page" data-theme={theme}>
      <a className="skip-link" href="#portfolio-content">Skip to content</a>
      <div className="confetti dot-a" /><div className="confetti dot-b" /><div className="confetti dot-c" />

      <div className="portfolio-shell">
        <aside className="profile-sidebar">
          <div className="avatar-wrap">
            <img src="/naurez.webp" alt="Muhammad Naurez Khan" width="600" height="800" />
          </div>
          <h1>Muhammad<br />Naurez Khan</h1>
          <p className="role">Artificial Intelligence student</p>

          <div className="sidebar-details">
            <div><span className="detail-icon peach"><Mail size={17} /></span><p><small>Email</small><strong title="dev.naurez@gmail.com">dev.naurez@gmail.com</strong></p></div>
            <div><span className="detail-icon sky"><MapPin size={17} /></span><p><small>Location</small><strong>Lahore, Pakistan</strong></p></div>
            <div><span className="detail-icon mint"><GraduationCap size={17} /></span><p><small>Study</small><strong>Bachelor’s in AI</strong></p></div>
          </div>

          <div className="social-row" aria-label="Contact and social links">
            <a href="https://github.com/naurez-khan" target="_blank" rel="noreferrer" title="GitHub profile" aria-label="Open Muhammad's GitHub profile"><Code2 size={17} /></a>
            <a href="https://www.linkedin.com/in/muhammad-naurez-khan-40723b40b/" target="_blank" rel="noreferrer" title="LinkedIn profile" aria-label="Open Muhammad's LinkedIn profile"><ArrowUpRight size={17} /></a>
            <a href="mailto:dev.naurez@gmail.com" title="Email Muhammad" aria-label="Email Muhammad"><Mail size={17} /></a>
            <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} aria-pressed={theme === 'dark'} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <Sun className="theme-sun" size={17} /><Moon className="theme-moon" size={17} />
            </button>
          </div>
        </aside>

        <section className="content-panel" id="portfolio-content">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="site-tabs">
            <TabsList className="tab-bar" aria-label="Portfolio sections">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="tab-content">
              <SectionTitle>About Me</SectionTitle>
              <div className="about-copy">
                <p>I’m an Artificial Intelligence student currently pursuing my bachelor’s degree. I’m learning web development by building small, practical projects and improving them one step at a time.</p>
                <p>I care about clear interfaces, useful technology, and understanding the reason behind what I build—not just making something look finished.</p>
              </div>

              <h3 className="subheading">What I’m Doing</h3>
              <div className="service-grid">
                <Service icon={Code2} color="mint" title="Web Development">Responsive websites built with strong HTML, CSS, and JavaScript foundations.</Service>
                <Service icon={Palette} color="sky" title="Interface Design">Clear layouts, thoughtful typography, and simple interactions that feel natural.</Service>
                <Service icon={BrainCircuit} color="pink" title="AI Studies">Learning the foundations of artificial intelligence and exploring useful applications.</Service>
                <Service icon={Sparkles} color="peach" title="Automations">Creating practical workflows that reduce repetitive work and keep simple processes moving.</Service>
              </div>

              <h3 className="subheading">Skills</h3>
              <div className="skill-cloud">
                {['HTML', 'CSS', 'JavaScript', 'Next.js', 'TypeScript', 'Responsive Design', 'Git', 'AI Foundations', 'Research'].map((skill, index) => <span key={skill} className={`skill-${index % 4}`}>{skill}</span>)}
              </div>
            </TabsContent>

            <TabsContent value="resume" className="tab-content">
              <SectionTitle>Resume</SectionTitle>
              <TimelineTitle icon={GraduationCap}>Education</TimelineTitle>
              <div className="timeline reveal-on-scroll motion-timeline">
                <TimelineItem year="Completed" title="Intermediate in Computer Science">Foundational study in computing, mathematics, and problem solving.</TimelineItem>
                <TimelineItem year="Current" title="Bachelor’s in Artificial Intelligence">Developing a deeper understanding of intelligent systems and computer science.</TimelineItem>
              </div>

              <TimelineTitle icon={Sparkles}>Experience &amp; Growth</TimelineTitle>
              <div className="timeline reveal-on-scroll motion-timeline">
                <TimelineItem year="Ongoing" title="Learning Web Development">Building practical projects with HTML, CSS, JavaScript, and modern web tools.</TimelineItem>
                <TimelineItem year="2026" title="Personal Portfolio">Designed and developed this portfolio as a responsive, evolving record of my work.</TimelineItem>
                <TimelineItem year="2026" title="Blog Website">Created a personal blog to document ideas and lessons in progress.</TimelineItem>
                <TimelineItem year="2026" title="Math Department Attendance Portal">Built a department portal for managing attendance and supporting academic workflows.</TimelineItem>
              </div>
              <a className="cv-button" href="/naurez-cv.pdf" download><Download size={16} /> Download CV</a>
            </TabsContent>

            <TabsContent value="portfolio" className="tab-content">
              <SectionTitle>Portfolio</SectionTitle>
              <div className="portfolio-grid">
                {storedProjects.map((project, index) => (
                  <article className="portfolio-card reveal-on-scroll" key={project.id}>
                    {project.imageUrl ? (
                      <div className="project-preview project-image-wrap">

                        <img className={project.imageUrl.includes('math-department') ? 'logo-preview' : undefined} src={project.imageUrl} alt={project.imageAlt} loading="lazy" />
                      </div>
                    ) : (
                      <div className={`project-preview preview-${index % 2}`} aria-hidden="true">
                        <div className="window-bar"><i /><i /><i /></div>
                        <div className="window-content"><small>MNK / {project.category}</small><strong>{project.title}</strong><span /><span /></div>
                      </div>
                    )}
                    <div className="project-info">
                      <p>{project.category} · {project.year}</p><h3>{project.title}</h3>
                      <dl className="project-story"><div><dt>Problem</dt><dd>{project.problem}</dd></div><div><dt>Built</dt><dd>{project.description}</dd></div><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Result</dt><dd>{project.result}</dd></div></dl>
                      <ul>{project.technologies.map((tag) => <li key={tag}>{tag}</li>)}</ul>
                      <div className="project-links">
                        {project.demoUrl ? <a href={project.demoUrl} target={project.demoUrl === '/' ? undefined : '_blank'} rel="noreferrer"><ArrowUpRight size={15}/> Live Demo</a> : <span aria-disabled="true"><ArrowUpRight size={15}/> Demo unavailable</span>}
                        {project.githubUrl ? <a href={project.githubUrl} target="_blank" rel="noreferrer"><Code2 size={15}/> GitHub</a> : <span aria-disabled="true"><Code2 size={15}/> GitHub unavailable</span>}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="contact" className="tab-content">
              <SectionTitle>Contact</SectionTitle>
              <div className="contact-layout">
                <form onSubmit={handleSubmit}>
                  <h3>Contact Form</h3>
                  <div className="form-row"><Input required name="name" aria-label="Full name" placeholder="Full name" /><Input required name="email" type="email" aria-label="Email address" placeholder="Email address" /></div>
                  <Input required name="subject" aria-label="Subject" placeholder="Subject" />
                  <Textarea required name="message" aria-label="Message" placeholder="Your message" rows={6} />
                  <Input className="contact-honeypot" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <Button type="submit" className="send-button" disabled={contactState.type === 'sending'}><Send size={16} /> {contactState.type === 'sending' ? 'Sending…' : 'Send message'}</Button>
                  {contactState.type === 'success' && <p className="contact-status success" role="status"><CheckCircle2 size={18}/> {contactState.message}</p>}
                  {contactState.type === 'error' && <p className="contact-status error" role="alert">{contactState.message}</p>}
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className="section-title"><h2>{children}</h2><i /></div>;
}

function Service({ icon: Icon, color, title, children }: { icon: typeof Braces; color: string; title: string; children: React.ReactNode }) {
  return <article><span className={`service-icon ${color}`}><Icon size={25} /></span><div><h4>{title}</h4><p>{children}</p></div></article>;
}

function TimelineTitle({ icon: Icon, children }: { icon: typeof Layers3; children: React.ReactNode }) {
  return <h3 className="timeline-title"><span><Icon size={19} /></span>{children}</h3>;
}

function TimelineItem({ year, title, children }: { year: string; title: string; children: React.ReactNode }) {
  return <article><i /><div><span>{year}</span><h4>{title}</h4><p>{children}</p></div></article>;
}
