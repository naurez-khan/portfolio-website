'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ImagePlus, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type SubmitState = { type: 'idle' | 'success' | 'error'; message: string };

export function AdminProjectForm() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: 'idle', message: '' });

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    setFileName(file?.name ?? '');
    setSubmitState({ type: 'idle', message: '' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setSubmitState({ type: 'idle', message: '' });

    const form = event.currentTarget;
    try {
      const response = await fetch('/api/projects', { method: 'POST', body: new FormData(form) });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? 'The project could not be saved.');

      form.reset();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setFileName('');
      setSubmitState({ type: 'success', message: 'Project published to your portfolio.' });
    } catch (error) {
      setSubmitState({ type: 'error', message: error instanceof Error ? error.message : 'The project could not be saved.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <a href="/" className="admin-back"><ArrowLeft size={17} /> Portfolio</a>
          <span className="admin-badge">Owner workspace</span>
        </header>

        <section className="admin-intro">
          <p>Portfolio manager</p>
          <h1>Add a new project</h1>
          <span>Upload a project image and add the details visitors should see.</span>
        </section>

        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-fields">
            <div className="admin-field">
              <Label htmlFor="project-title">Project title</Label>
              <Input id="project-title" name="title" required maxLength={100} placeholder="e.g. Attendance Portal" />
            </div>

            <div className="admin-field">
              <div className="admin-label-row"><Label htmlFor="project-description">Description</Label><span>Up to 1,200 characters</span></div>
              <Textarea id="project-description" name="description" required maxLength={1200} rows={8} placeholder="What did you build, and what problem does it solve?" />
            </div>

            <div className="admin-actions">
              <Button type="submit" className="admin-submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="admin-spinner" /> : <Upload />}
                {isSaving ? 'Publishing…' : 'Publish project'}
              </Button>
              <p>Your project will appear at the top of the Portfolio section.</p>
            </div>

            {submitState.type !== 'idle' && (
              <div className={`admin-message ${submitState.type}`} role="status">
                {submitState.type === 'success' && <CheckCircle2 size={18} />}
                {submitState.message}
              </div>
            )}
          </div>

          <div className="admin-image-field">
            <Label htmlFor="project-image">Project image</Label>
            <label className={`admin-dropzone ${previewUrl ? 'has-image' : ''}`} htmlFor="project-image">
              {previewUrl ? <img src={previewUrl} alt="Selected project preview" /> : <><ImagePlus size={34} /><strong>Choose an image</strong><span>JPG, PNG, WebP, or GIF · max 5 MB</span></>}
              {previewUrl && <span className="admin-change-image">Choose a different image</span>}
            </label>
            <Input id="project-image" className="admin-file-input" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required onChange={handleImageChange} />
            {fileName && <p className="admin-file-name">{fileName}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
