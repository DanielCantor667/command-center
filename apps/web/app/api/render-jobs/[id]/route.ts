import { NextResponse } from 'next/server';
import { AuthenticationError, requireUser } from '../../../../core/auth';
import { getRenderJob } from '../../../../domain/scene-projects/scene-project.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const job = await getRenderJob(user.id, id);
    return job ? NextResponse.json({ job }) : NextResponse.json({ error: 'Render job not found' }, { status: 404 });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status });
  }
}
