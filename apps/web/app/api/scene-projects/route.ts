import { NextResponse } from 'next/server';
import { sceneSchema } from '@command-center/ai-renderer';
import { AuthenticationError, requireUser } from '../../../core/auth';
import { createSceneProject, listSceneProjects } from '../../../domain/scene-projects/scene-project.service';

export const runtime = 'nodejs';

function errorResponse(error: unknown) {
  if (error instanceof AuthenticationError) return NextResponse.json({ error: error.message }, { status: 401 });
  return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 400 });
}

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    return NextResponse.json({ projects: await listSceneProjects(user.id) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as { name?: string; scene?: unknown; source?: string };
    const scene = sceneSchema.parse(body.scene);
    const project = await createSceneProject(user.id, {
      name: body.name ?? scene.metadata.name ?? scene.id,
      scene,
      source: body.source,
    });
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
