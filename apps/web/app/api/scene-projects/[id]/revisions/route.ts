import { NextResponse } from 'next/server';
import { sceneSchema } from '@command-center/ai-renderer';
import { AuthenticationError, requireUser } from '../../../../../core/auth';
import { createSceneRevision, getSceneProject } from '../../../../../domain/scene-projects/scene-project.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const project = await getSceneProject(user.id, id);
    return project ? NextResponse.json({ revisions: project.revisions }) : NextResponse.json({ error: 'Project not found' }, { status: 404 });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const body = (await request.json()) as { scene?: unknown; source?: string };
    const revision = await createSceneRevision(user.id, id, sceneSchema.parse(body.scene), body.source);
    return revision ? NextResponse.json({ revision }, { status: 201 }) : NextResponse.json({ error: 'Project not found' }, { status: 404 });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status });
  }
}
