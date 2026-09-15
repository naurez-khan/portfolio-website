'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowUp, CheckCircle2, ImagePlus, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

type Project = { id:number; title:string; description:string; imageUrl:string; imageAlt:string; category:string; year:number; technologies:string[]; demoUrl:string|null; githubUrl:string|null; problem:string; role:string; result:string; position:number };
type Notice = { type:'success'|'error'; message:string } | null;

export function AdminProjectForm({ initialProjects }: { initialProjects:Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function refresh() {
    const projectResponse = await fetch('/api/projects');
    if (projectResponse.ok) setProjects(((await projectResponse.json()) as { projects:Project[] }).projects);
  }

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function chooseImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  function resetEditor(form?: HTMLFormElement) {
    form?.reset(); setEditing(null); setPreviewUrl(null);
  }

  async function submitProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsSaving(true); setNotice(null);
    const form = event.currentTarget;
    try {
      const response = await fetch(editing ? `/api/projects/${editing.id}` : '/api/projects', { method: editing ? 'PUT' : 'POST', body: new FormData(form) });
      const data = (await response.json()) as { message?:string };
      if (!response.ok) throw new Error(data.message ?? 'The project could not be saved.');
      resetEditor(form); await refresh(); setNotice({ type:'success', message: editing ? 'Project updated.' : 'Project published.' });
    } catch (error) { setNotice({ type:'error', message:error instanceof Error ? error.message : 'The project could not be saved.' }); }
    finally { setIsSaving(false); }
  }

  async function removeProject() {
    if (!deleteTarget) return;
    const response = await fetch(`/api/projects/${deleteTarget.id}`, { method:'DELETE' });
    const data = (await response.json()) as { message?:string };
    if (response.ok) { setDeleteTarget(null); if (editing?.id === deleteTarget.id) setEditing(null); await refresh(); setNotice({ type:'success', message:'Project deleted.' }); }
    else setNotice({ type:'error', message:data.message ?? 'The project could not be deleted.' });
  }

  async function moveProject(index:number, direction:-1|1) {
    const next = [...projects]; const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]]; setProjects(next);
    const response = await fetch('/api/projects/reorder', { method:'PATCH', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ ids:next.map((project) => project.id) }) });
    if (!response.ok) { await refresh(); setNotice({ type:'error', message:'The new order could not be saved.' }); }
  }

  const imageSrc = previewUrl ?? editing?.imageUrl;
  return (
    <main className="admin-page"><div className="admin-shell">
      <header className="admin-header"><a href="/" className="admin-back"><ArrowLeft size={17}/> Portfolio</a><div className="admin-header-actions"><span className="admin-badge">Owner workspace</span><form action="/api/admin/logout" method="post"><button className="admin-logout" type="submit">Sign out</button></form></div></header>
      <section className="admin-intro"><p>Portfolio manager</p><h1>{editing ? 'Edit project' : 'Add a project'}</h1><span>Create stronger case studies, update links, and control the order visitors see.</span></section>

      <form className="admin-form" onSubmit={submitProject} key={editing?.id ?? 'new'}>
        <div className="admin-fields">
          <div className="admin-field"><Label htmlFor="title">Project title</Label><Input id="title" name="title" required maxLength={100} defaultValue={editing?.title}/></div>
          <div className="admin-field-grid">
            <div className="admin-field"><Label htmlFor="category">Category</Label><Input id="category" name="category" required maxLength={60} defaultValue={editing?.category ?? 'Web'}/></div>
            <div className="admin-field"><Label htmlFor="year">Year</Label><Input id="year" name="year" required type="number" min={2000} max={2100} defaultValue={editing?.year ?? new Date().getFullYear()}/></div>
          </div>
          <div className="admin-field"><Label htmlFor="technologies">Technologies</Label><Input id="technologies" name="technologies" placeholder="Next.js, TypeScript, Cloudflare" defaultValue={editing?.technologies.join(', ')}/></div>
          <div className="admin-field"><Label htmlFor="problem">The problem</Label><Textarea id="problem" name="problem" required maxLength={1200} rows={3} defaultValue={editing?.problem}/></div>
          <div className="admin-field"><Label htmlFor="description">What you built</Label><Textarea id="description" name="description" required maxLength={1200} rows={4} defaultValue={editing?.description}/></div>
          <div className="admin-field"><Label htmlFor="role">Your role</Label><Input id="role" name="role" required maxLength={160} defaultValue={editing?.role}/></div>
          <div className="admin-field"><Label htmlFor="result">The result</Label><Textarea id="result" name="result" required maxLength={1200} rows={3} defaultValue={editing?.result}/></div>
          <div className="admin-field-grid">
            <div className="admin-field"><Label htmlFor="demoUrl">Live demo URL</Label><Input id="demoUrl" name="demoUrl" type="url" placeholder="https://…" defaultValue={editing?.demoUrl ?? ''}/></div>
            <div className="admin-field"><Label htmlFor="githubUrl">GitHub URL</Label><Input id="githubUrl" name="githubUrl" type="url" placeholder="https://github.com/…" defaultValue={editing?.githubUrl ?? ''}/></div>
          </div>
          <div className="admin-actions"><Button type="submit" className="admin-submit" disabled={isSaving}>{isSaving ? <Loader2 className="admin-spinner"/> : editing ? <Save/> : <Plus/>}{isSaving ? 'Saving…' : editing ? 'Save changes' : 'Publish project'}</Button>{editing && <Button type="button" variant="outline" onClick={() => resetEditor()}><X/> Cancel</Button>}</div>
          {notice && <div className={`admin-message ${notice.type}`} role="status">{notice.type === 'success' && <CheckCircle2 size={18}/>} {notice.message}</div>}
        </div>
        <div className="admin-image-field"><Label htmlFor="image">Project image {editing && '(optional)'}</Label><label className={`admin-dropzone ${imageSrc ? 'has-image' : ''}`} htmlFor="image">{imageSrc ? <img src={imageSrc} alt="Project preview"/> : <><ImagePlus size={34}/><strong>Choose an image</strong><span>JPG, PNG, WebP, or GIF · max 5 MB</span></>} {imageSrc && <span className="admin-change-image">Choose a different image</span>}</label><Input id="image" className="admin-file-input" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required={!editing} onChange={chooseImage}/></div>
      </form>

      <section className="admin-library"><div className="admin-section-heading"><div><p>Published work</p><h2>Projects</h2></div><span>Use arrows to reorder</span></div><div className="admin-project-list">{projects.map((project,index) => <article key={project.id}><img src={project.imageUrl} alt=""/><div><small>{project.category} · {project.year}</small><strong>{project.title}</strong></div><div className="admin-project-actions"><Button size="icon" variant="outline" aria-label={`Move ${project.title} up`} disabled={index===0} onClick={() => moveProject(index,-1)}><ArrowUp/></Button><Button size="icon" variant="outline" aria-label={`Move ${project.title} down`} disabled={index===projects.length-1} onClick={() => moveProject(index,1)}><ArrowDown/></Button><Button size="icon" variant="outline" aria-label={`Edit ${project.title}`} onClick={() => { setEditing(project); setPreviewUrl(null); window.scrollTo({top:0,behavior:'smooth'}); }}><Pencil/></Button><Button size="icon" variant="outline" aria-label={`Delete ${project.title}`} onClick={() => setDeleteTarget(project)}><Trash2/></Button></div></article>)}</div></section>

    </div>

    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete “{deleteTarget?.title}”?</AlertDialogTitle><AlertDialogDescription>This removes the project from your public portfolio. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={removeProject} className="admin-delete-confirm">Delete project</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </main>
  );
}
