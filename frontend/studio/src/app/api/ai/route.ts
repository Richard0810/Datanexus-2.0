
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core';

// Importa el archivo de configuración central de Genkit.
// Este archivo carga los plugins Y TAMBIÉN los flujos.
import '@/ai/genkit';

export async function POST(req: NextRequest) {
  const { flowId, input } = await req.json();

  if (!flowId) {
    return NextResponse.json({ error: 'flowId es requerido' }, { status: 400 });
  }

  console.log(`[API] Recibida solicitud para ejecutar el flujo: ${flowId}`);

  try {
    const output = await run(flowId, input);
    return NextResponse.json(output);

  } catch (error: any) {
    console.error(`[API] Error al ejecutar el flujo ${flowId}:`, error);
    return NextResponse.json(
      { error: `Error al ejecutar el flujo: ${error.message}` },
      { status: 500 }
    );
  }
}
