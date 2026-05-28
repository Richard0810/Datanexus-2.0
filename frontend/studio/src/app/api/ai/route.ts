import { ai } from '@/ai/genkit';
import { NextRequest, NextResponse } from 'next/server';

// Este endpoint maneja todas las llamadas a los flujos de Genkit
export async function POST(req: NextRequest) {
  const { flowId, input } = await req.json();

  if (!ai.registry[flowId]) {
    return NextResponse.json({ error: `Flow ${flowId} not found` }, { status: 404 });
  }

  try {
    const flow = ai.registry[flowId];
    const result = await flow.invoke(input);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`Error invoking flow ${flowId}:`, error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
