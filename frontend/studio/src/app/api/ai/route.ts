
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core';

// 1. Importa la configuración central de Genkit. 
//    Este archivo se encarga de crear la instancia 'ai' y configurar los plugins.
import '@/ai/genkit';

// 2. Importa los archivos de flujo.
//    Al importarlos, se registran automáticamente en la instancia 'ai' creada en el paso 1.
import '@/ai/pico';
// Si tienes otros flujos, impórtalos aquí también.
// import '@/ai/otro-flujo';

export async function POST(req: NextRequest) {
  const { flowId, input } = await req.json();

  if (!flowId) {
    return NextResponse.json({ error: 'flowId es requerido' }, { status: 400 });
  }

  console.log(`[API] Recibida solicitud para ejecutar el flujo: ${flowId}`);

  try {
    // 'run' encontrará el flujo por su 'flowId' porque fue registrado al importar los archivos arriba.
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
