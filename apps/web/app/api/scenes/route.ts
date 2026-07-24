import { NextResponse } from 'next/server';
import { AnthropicSceneClient, generateScene } from '@command-center/scene-generator';
import { planOfficeScene } from '@command-center/scene-planner';
import { SPATIAL_RULES, type StyleId } from '@command-center/workplace-design-system';

interface GenerateSceneBody {
  occupants?: number;
  style?: StyleId;
  prompt?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateSceneBody;
  const occupants = body.occupants ?? 12;

  if (!Number.isInteger(occupants) || occupants < 1 || occupants > 500) {
    return NextResponse.json({ error: 'occupants must be an integer between 1 and 500' }, { status: 400 });
  }

  if (body.prompt && process.env.ANTHROPIC_API_KEY) {
    const baseline = planOfficeScene({ occupants, style: body.style });
    const brief = [
      body.prompt,
      `Occupants: ${occupants}`,
      `Style: ${baseline.style}`,
      `Planning preset: ${baseline.presetId}`,
      `Estimated area: ${baseline.estimatedAreaSqm} sqm`,
      `Spatial rules: ${JSON.stringify(SPATIAL_RULES)}`,
      'Return a valid Scene v1 using only assets from the registered catalog.',
    ].join('\n');
    const scene = await generateScene(brief, new AnthropicSceneClient());
    return NextResponse.json({
      source: 'ai',
      scene,
      presetId: baseline.presetId,
      style: baseline.style,
      estimatedAreaSqm: baseline.estimatedAreaSqm,
    });
  }

  const plan = planOfficeScene({ occupants, style: body.style });
  return NextResponse.json({ source: 'planner', ...plan });
}
