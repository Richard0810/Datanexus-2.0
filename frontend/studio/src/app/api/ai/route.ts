import { NextRequest, NextResponse } from 'next/server';
import '@/ai/genkit';
import { picoQuestionFlow } from '@/ai/pico';
import { referenceFormatterFlow } from '@/ai/references';
import { naturalLanguageAcademicSearchFlow } from '@/ai/flows/ai-assisted-academic-search';

export async function POST(req: NextRequest) {
  try {
    const { flowId, input } = await req.json();

    if (!flowId) {
      return NextResponse.json({ error: 'flowId es requerido' }, { status: 400 });
    }

    console.log(`[API] Ejecutando flujo: ${flowId}`);

    if (flowId === 'picoQuestionFlow') {
      const output = await picoQuestionFlow(input);
      return NextResponse.json(output);
    }

    if (flowId === 'referenceFormatterFlow') {
      const output = await referenceFormatterFlow(input);
      return NextResponse.json(output);
    }

    if (flowId === 'naturalLanguageAcademicSearchFlow') {
      const output = await naturalLanguageAcademicSearchFlow(input);
      return NextResponse.json(output);
    }

    return NextResponse.json(
      { error: `El flujo '${flowId}' no está registrado en el router de la API.` },
      { status: 404 }
    );

  } catch (error: any) {
    console.error(`[API ERROR]`, error);
    return NextResponse.json(
      { error: `Error interno de IA: ${error.message}` },
      { status: 500 }
    );
  }
}
