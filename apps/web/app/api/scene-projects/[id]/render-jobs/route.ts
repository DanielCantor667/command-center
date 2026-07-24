import { NextResponse } from 'next/server';
import { AuthenticationError, requireUser } from '../../../../../core/auth';
import { createRenderJob } from '../../../../../domain/scene-projects/scene-project.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { revisionId?: string };
    const job = await createRenderJob(user.id, id, body.revisionId);
    return job ? NextResponse.json({ job }, { status: 202 }) : NextResponse.json({ error: 'Project or revision not found' }, { status: 404 });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status });
  }
}
