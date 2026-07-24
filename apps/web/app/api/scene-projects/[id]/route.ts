import { NextResponse } from 'next/server';
import { AuthenticationError, requireUser } from '../../../../core/auth';
import { deleteSceneProject, getSceneProject } from '../../../../domain/scene-projects/scene-project.service';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const project = await getSceneProject(user.id, id);
    return project ? NextResponse.json({ project }) : NextResponse.json({ error: 'Project not found' }, { status: 404 });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await requireUser(request);
    const { id } = await context.params;
    const result = await deleteSceneProject(user.id, id);
    return result.count ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: 'Project not found' }, { status: 404 });
  } catch (error) {
    const status = error instanceof AuthenticationError ? 401 : 400;
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status });
  }
}
