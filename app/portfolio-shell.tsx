'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowUpRight,
  Braces,
  BrainCircuit,
  Code2,
  Download,
  GraduationCap,
  Layers3,
  Mail,
  MapPin,
  Palette,
  Send,
  Sparkles,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const featuredProjects = [
  { title: 'Personal Portfolio', category: 'Web', year: '2026', text: 'A responsive home for my work, background, and growing set of skills.', tags: ['Next.js', 'TypeScript', 'UI'], image: '/portfolio-preview.png', imageAlt: 'Muhammad Naurez Khan portfolio website' },
  { title: 'Math Department Website', category: 'Web', year: '2026', text: 'A responsive department website for presenting academic information and useful resources clearly.', tags: ['HTML', 'CSS', 'JavaScript'], image: '/math-department-preview.png', imageAlt: 'Department of Mathematics website' },
  { title: 'Blog Website', category: 'Web', year: '2026', text: 'A personal blog for sharing ideas, lessons, and notes in progress.', tags: ['HTML', 'CSS', 'JavaScript'], image: '/blog-preview.png', imageAlt: 'Muhammad Naurez Khan blog website' },
];

type StoredProject = {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
};

export function PortfolioShell() {
  const [storedProjects, setStoredProjects] = useState<StoredProject[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/projects')
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { projects: StoredProject[] }) => {
        if (!cancelled) setStoredProjects(data.projects);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const subject = String(formData.get('subject') ?? 'Portfolio enquiry');
    const message = String(formData.get('message') ?? '');
    const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;

    window.location.href = `mailto:dev.naurez@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <main className="portfolio-page">
      <a className="skip-link" href="#portfolio-content">Skip to content</a>
      <div className="confetti dot-a" /><div className="confetti dot-b" /><div className="confetti dot-c" />

      <div className="portfolio-shell">
        <aside className="profile-sidebar">
          <div className="avatar-wrap">
            <img src="/naurez.jpg" alt="Muhammad Naurez Khan" width="3000" height="4000" />
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
            <button type="button" title="Add LinkedIn link" aria-label="LinkedIn link not added"><ArrowUpRight size={17} /></button>
            <a href="mailto:dev.naurez@gmail.com" title="Email Muhammad" aria-label="Email Muhammad"><Mail size={17} /></a>
          </div>
        </aside>

        <section className="content-panel" id="portfolio-content">
          <Tabs defaultValue="about" className="site-tabs">
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
              <div className="timeline">
                <TimelineItem year="Completed" title="Intermediate in Computer Science">Foundational study in computing, mathematics, and problem solving.</TimelineItem>
                <TimelineItem year="Current" title="Bachelor’s in Artificial Intelligence">Developing a deeper understanding of intelligent systems and computer science.</TimelineItem>
              </div>

              <TimelineTitle icon={Sparkles}>Experience &amp; Growth</TimelineTitle>
              <div className="timeline">
                <TimelineItem year="Ongoing" title="Learning Web Development">Building practical projects with HTML, CSS, JavaScript, and modern web tools.</TimelineItem>
                <TimelineItem year="2026" title="Personal Portfolio">Designed and developed this portfolio as a responsive, evolving record of my work.</TimelineItem>
                <TimelineItem year="2026" title="Blog Website">Created a personal blog to document ideas and lessons in progress.</TimelineItem>
                <TimelineItem year="2026" title="Math Department Attendance Portal">Built a department portal for managing attendance and supporting academic workflows.</TimelineItem>
              </div>
              <Button type="button" variant="outline" className="cv-button" disabled><Download size={16} /> CV file not added</Button>
            </TabsContent>

            <TabsContent value="portfolio" className="tab-content">
              <SectionTitle>Portfolio</SectionTitle>
              <div className="portfolio-grid">
                {[
                  ...storedProjects.map((project) => ({ title: project.title, category: 'Project', year: new Date().getFullYear().toString(), text: project.description, tags: [] as string[], image: project.imageUrl, imageAlt: project.imageAlt, key: `stored-${project.id}` })),
                  ...featuredProjects.map((project) => ({ ...project, key: `featured-${project.title}` })),
                ].map((project, index) => (
                  <article className="portfolio-card" key={project.key}>
                    {project.image ? (
                      <div className="project-preview project-image-wrap">

                        <img className={project.image.includes('math-department') ? 'logo-preview' : undefined} src={project.image} alt={project.imageAlt} />
                      </div>
                    ) : (
                      <div className={`project-preview preview-${index % 2}`} aria-hidden="true">
                        <div className="window-bar"><i /><i /><i /></div>
                        <div className="window-content"><small>MNK / {project.category}</small><strong>{project.title}</strong><span /><span /></div>
                      </div>
                    )}
                    <div className="project-info"><p>{project.category} · {project.year}</p><h3>{project.title}</h3><span>{project.text}</span><ul>{project.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
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
                  <Button type="submit" className="send-button"><Send size={16} /> Send message</Button>
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
