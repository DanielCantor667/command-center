'use client';

import { useEffect, useState } from 'react';
import { Button, Stack, Typography } from '@command-center/ui';
import type { UseBoundStore, StoreApi } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../../../core/supabase';
import { createCloudProject, deleteCloudProject, getCloudRenderJob, listCloudProjects, listCloudRevisions, requestCloudRender, saveCloudRevision, type CloudProjectSummary, type CloudRenderJob, type CloudRevision } from '../lib/scene-cloud';
import type { SceneEditorState } from '../store/types';

export interface SceneGalleryProps {
  useStore: UseBoundStore<StoreApi<SceneEditorState>>;
}

export function SceneGallery({ useStore }: SceneGalleryProps) {
  const loadScene = useStore((state) => state.loadScene);
  const scene = useStore((state) => state.scene);
  const [projects, setProjects] = useState<CloudProjectSummary[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Sin guardar');
  const [busy, setBusy] = useState(false);
  const [renderJob, setRenderJob] = useState<CloudRenderJob | null>(null);
  const [revisions, setRevisions] = useState<CloudRevision[]>([]);

  const refresh = async () => setProjects(await listCloudProjects());

  useEffect(() => {
    const client = getSupabaseBrowserClient();
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) void refresh().catch((error: unknown) => setStatus(error instanceof Error ? error.message : 'No se pudieron cargar proyectos.'));
    else setProjects([]);
  }, [session]);

  const authenticate = async (mode: 'sign-in' | 'sign-up') => {
    setBusy(true);
    const client = getSupabaseBrowserClient();
    const result = mode === 'sign-in'
      ? await client.auth.signInWithPassword({ email, password })
      : await client.auth.signUp({ email, password });
    setStatus(result.error ? result.error.message : mode === 'sign-up' && !result.data.session ? 'Revisa tu correo para confirmar la cuenta.' : 'Sesión iniciada.');
    setBusy(false);
  };

  const saveProject = async () => {
    setBusy(true);
    setStatus('Guardando…');
    try {
      let projectId = activeProjectId;
      if (projectId) await saveCloudRevision(projectId, scene);
      else {
        const project = await createCloudProject(scene);
        projectId = project.id;
        setActiveProjectId(projectId);
      }
      await refresh();
      if (projectId) setRevisions(await listCloudRevisions(projectId));
      setStatus('Guardado en Supabase');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo guardar.');
    } finally {
      setBusy(false);
    }
  };

  const renderProject = async () => {
    if (!activeProjectId) return;
    setBusy(true);
    try {
      const queued = await requestCloudRender(activeProjectId);
      setRenderJob(queued);
      setStatus('Render en cola. Ejecuta pnpm --filter @command-center/web render:worker.');
      const interval = window.setInterval(() => {
        void getCloudRenderJob(queued.id).then((job) => {
          setRenderJob(job);
          if (job.status === 'completed' || job.status === 'failed') {
            window.clearInterval(interval);
            setStatus(job.status === 'completed' ? 'Render completado.' : job.error ?? 'Render fallido.');
          }
        });
      }, 2000);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'No se pudo solicitar el render.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <aside aria-label="Proyectos de escenas" className="w-full rounded-lg border border-slate-700 bg-slate-950 p-4 lg:w-72">
      <Typography variant="title">Scene Projects</Typography>
      {!session ? (
        <Stack direction="vertical" gap="xs" className="mt-3">
          <input aria-label="Correo" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="correo@ejemplo.com" className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white" />
          <input aria-label="Contraseña" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-white" />
          <Stack direction="horizontal" gap="xs">
            <Button size="sm" loading={busy} onClick={() => void authenticate('sign-in')}>Entrar</Button>
            <Button size="sm" variant="secondary" disabled={busy} onClick={() => void authenticate('sign-up')}>Crear cuenta</Button>
          </Stack>
        </Stack>
      ) : (
        <Stack direction="vertical" gap="xs" className="mt-3">
          <Button size="sm" loading={busy} onClick={() => void saveProject()}>{activeProjectId ? 'Nueva revisión' : 'Guardar proyecto'}</Button>
          <Button size="sm" variant="secondary" disabled={!activeProjectId || busy} onClick={() => void renderProject()}>Renderizar</Button>
          <Button size="sm" variant="secondary" onClick={() => void getSupabaseBrowserClient().auth.signOut()}>Cerrar sesión</Button>
        </Stack>
      )}
      <Typography variant="caption" color="muted">{status}</Typography>
      {renderJob?.status === 'completed' && (
        <Stack direction="horizontal" gap="xs">
          {renderJob.pngPath && <a className="text-xs text-blue-400 underline" href={renderJob.pngPath} target="_blank" rel="noreferrer">PNG</a>}
          {renderJob.glbPath && <a className="text-xs text-blue-400 underline" href={renderJob.glbPath} download>GLB</a>}
        </Stack>
      )}
      {session && projects.length === 0 ? <Typography variant="body-small" color="muted">Guarda esta escena para crear tu primer proyecto.</Typography> : (
        <Stack direction="vertical" gap="xs" className="mt-3 max-h-48 overflow-y-auto pr-1">
          {projects.map((project) => (
            <div key={project.id} className="rounded border border-slate-800 p-2">
              <Typography variant="body-small">{project.name}</Typography>
              <Typography variant="caption" color="muted">{project.revisionCount} revisión(es)</Typography>
              <Stack direction="horizontal" gap="xs" className="mt-2">
                <Button variant="secondary" size="sm" onClick={() => { loadScene(project.scene); setActiveProjectId(project.id); setStatus('Proyecto abierto'); void listCloudRevisions(project.id).then(setRevisions); }}>Abrir</Button>
                <Button variant="danger" size="sm" onClick={() => void deleteCloudProject(project.id).then(async () => { if (activeProjectId === project.id) { setActiveProjectId(null); setRevisions([]); } await refresh(); })}>Eliminar</Button>
              </Stack>
            </div>
          ))}
        </Stack>
      )}
      {activeProjectId && revisions.length > 0 && (
        <Stack direction="vertical" gap="xs" className="mt-3 border-t border-slate-800 pt-3">
          <Typography variant="caption" color="muted">Historial</Typography>
          <Stack direction="horizontal" gap="xs" wrap>
            {revisions.map((revision) => (
              <Button key={revision.id} size="sm" variant="secondary" onClick={() => { loadScene(revision.scene); setStatus(`Revisión ${revision.revisionNumber} abierta`); }}>
                v{revision.revisionNumber}
              </Button>
            ))}
          </Stack>
        </Stack>
      )}
    </aside>
  );
}
