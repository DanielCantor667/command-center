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
    <Stack direction="vertical" gap="md" className="min-h-0">
      <div>
        <Typography variant="heading-xl" color="primary">3D OFFICE LAB</Typography>
        <Typography variant="body" color="secondary">Planifica una oficina y ajusta sus activos directamente en la escena.</Typography>
      </div>
      <Stack direction="horizontal" gap="sm" wrap align="end" className="rounded-lg border border-slate-700 bg-slate-950 p-4">
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Personas
          <input aria-label="Personas" type="number" min="1" max="120" value={occupants} onChange={(event) => setOccupants(Math.max(1, Number(event.target.value) || 1))} className="w-28 rounded border border-slate-600 bg-slate-900 px-3 py-2 text-white" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-300">
          Estilo
          <select aria-label="Estilo" value={style} onChange={(event) => setStyle(event.target.value as StyleId)} className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-white">
            {STYLE_IDS.map((id) => <option key={id} value={id}>{getStyle(id).label}</option>)}
          </select>
        </label>
        <label className="flex min-w-56 flex-1 flex-col gap-1 text-sm text-slate-300">
          Instrucción opcional para IA
          <input aria-label="Instrucción opcional para IA" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ej.: ambiente cálido para recibir clientes" className="rounded border border-slate-600 bg-slate-900 px-3 py-2 text-white" />
        </label>
        <Button loading={isGenerating} onClick={generate}>Generar escena</Button>
        <Typography variant="body-small" color="muted">{source} · {plan.presetId} · {plan.estimatedAreaSqm || '—'} m² · {plan.scene.objects.length} activos</Typography>
      </Stack>
      <SceneEditor key={plan.scene.id} scene={plan.scene} />
    </Stack>
  );
}
