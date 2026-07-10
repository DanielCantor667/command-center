import { sceneSchema, type Scene } from '@command-center/ai-renderer';
import { buildSystemPrompt } from './prompt';
import type { ScenePromptClient } from './scene-prompt-client';

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  return fenced?.[1] ?? trimmed;
}

export async function generateScene(prompt: string, client: ScenePromptClient): Promise<Scene> {
  const raw = await client.generate(`${buildSystemPrompt()}\n\nUser request: ${prompt}`);
  const json = JSON.parse(stripCodeFences(raw));
  return sceneSchema.parse(json);
}
