'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@command-center/ui';
import { planOfficeScene } from '@command-center/scene-planner';
import { sceneSchema, type Scene } from '@command-center/ai-renderer';
import { STYLE_IDS, getStyle, type StyleId } from '@command-center/workplace-design-system';
import { SceneEditor } from '../scene-viewer';

export function LabModule() {
  const [occupants, setOccupants] = useState(24);
  const [style, setStyle] = useState<StyleId>('tech_startup');
  const [prompt, setPrompt] = useState('');
  const [revision, setRevision] = useState(0);
  const [plan, setPlan] = useState(() => planOfficeScene({ occupants: 24, style: 'tech_startup', id: 'lab-office-0' }));
  const [source, setSource] = useState<'planner' | 'ai'>('planner');
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate() {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ occupants, style, prompt: prompt.trim() || undefined }),
      });
      if (!response.ok) throw new Error('scene generation failed');
      const result = (await response.json()) as { source: 'planner' | 'ai'; scene: Scene; presetId?: string; style?: StyleId; estimatedAreaSqm?: number };
      const scene = sceneSchema.parse({ ...result.scene, id: `lab-office-${revision + 1}` });
      setRevision((value) => value + 1);
      setPlan({
        scene,
        presetId: result.presetId ?? 'ai-generated',
        style: result.style ?? style,
        estimatedAreaSqm: result.estimatedAreaSqm ?? 0,
      });
      setSource(result.source);
    } catch {
      setRevision((value) => value + 1);
      setPlan(planOfficeScene({ occupants, style, id: `lab-office-${revision + 1}` }));
      setSource('planner');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Stack direction="vertical" gap="lg" className="pb-32">
      <header className="relative shrink-0 overflow-hidden rounded-2xl border border-panel-border bg-gradient-to-br from-background-primary via-panel-background to-surface-primary px-24 py-20 shadow-high">
        <div className="absolute -right-64 -top-80 h-192 w-192 rounded-full bg-accent/10 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-16">
          <div>
            <div className="mb-8 flex items-center gap-8 text-xs font-medium uppercase tracking-[0.22em] text-accent">
              <span className="h-8 w-8 rounded-full bg-accent shadow-[0_0_14px_var(--accent)]" />
              Spatial intelligence workspace
            </div>
            <Typography variant="heading-xl" color="primary" className="tracking-tight">3D Office Studio</Typography>
            <Typography variant="body" color="secondary" className="mt-4 max-w-2xl">Diseña, valida y renderiza espacios de trabajo desde un brief hasta un proyecto versionado.</Typography>
          </div>
          <div className="flex flex-wrap gap-8 text-xs">
            <span className="rounded-full border border-panel-border bg-surface-secondary px-12 py-6 text-text-secondary">{plan.presetId.replaceAll('_', ' ')}</span>
            <span className="rounded-full border border-panel-border bg-surface-secondary px-12 py-6 text-text-secondary">{plan.estimatedAreaSqm || '—'} m²</span>
            <span className="rounded-full border border-accent/30 bg-accent/10 px-12 py-6 text-accent">{plan.scene.objects.length} activos</span>
          </div>
        </div>
      </header>
      <section aria-label="Configuración de escena" className="shrink-0 rounded-2xl border border-panel-border bg-panel-background p-16 shadow-medium">
        <div className="grid gap-12 laptop:grid-cols-[140px_210px_minmax(240px,1fr)_auto] laptop:items-end">
          <label className="flex flex-col gap-6 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Personas
            <input aria-label="Personas" type="number" min="1" max="120" value={occupants} onChange={(event) => setOccupants(Math.max(1, Number(event.target.value) || 1))} className="h-44 rounded-xl border border-panel-border bg-surface-secondary px-12 text-base text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-focus-ring/20" />
          </label>
          <label className="flex flex-col gap-6 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Estilo espacial
            <select aria-label="Estilo" value={style} onChange={(event) => setStyle(event.target.value as StyleId)} className="h-44 rounded-xl border border-panel-border bg-surface-secondary px-12 text-sm text-text-primary outline-none transition focus:border-accent focus:ring-2 focus:ring-focus-ring/20">
              {STYLE_IDS.map((id) => <option key={id} value={id}>{getStyle(id).label}</option>)}
            </select>
          </label>
          <label className="flex min-w-0 flex-col gap-6 text-xs font-medium uppercase tracking-wider text-text-secondary">
            Brief opcional para IA
            <input aria-label="Instrucción opcional para IA" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ej.: recepción cálida, zona silenciosa y mucha vegetación" className="h-44 rounded-xl border border-panel-border bg-surface-secondary px-12 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-focus-ring/20" />
          </label>
          <Button loading={isGenerating} onClick={generate} className="h-44 rounded-xl px-20 shadow-medium">Generar layout</Button>
        </div>
        <div className="mt-12 flex items-center justify-between border-t border-divider pt-12">
          <Typography variant="caption" color="muted">Fuente: <span className="text-accent">{source}</span> · escena validada con schema v1</Typography>
          <Typography variant="caption" color="muted">Grid 0.5 m · GLB sincronizados</Typography>
        </div>
      </section>
      <SceneEditor key={plan.scene.id} scene={plan.scene} />
    </Stack>
  );
}
