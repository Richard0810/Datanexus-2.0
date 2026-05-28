import { NextRequest, NextResponse } from 'next/server';

// 1. Importa la configuración central de Genkit. 
import '@/ai/genkit';

// 2. Importa el flujo DIRECTAMENTE como función (Genkit v1 recomienda este enfoque)
import { picoQuestionFlow } from '@/ai/pico';

export async function POST(req: NextRequest) {
  try {
    const { flowId, input } = await req.json();

    if (!flowId) {
      return NextResponse.json({ error: 'flowId es requerido' }, { status: 400 });
    }

    console.log(`[API] Recibida solicitud para ejecutar el flujo: ${flowId}`);

    // Validación y ejecución directa del flujo solicitado
    if (flowId === 'picoQuestionFlow') {
      const output = await picoQuestionFlow(input);
      return NextResponse.json(output);
    }

    // Si tuvieras otros flujos, los agregarías aquí con un else if
    
    return NextResponse.json(
      { error: `El flujo '${flowId}' no está registrado en el controlador de la API.` },
      { status: 404 }
    );

  } catch (error: any) {
    console.error(`[API ERROR] Fallo al ejecutar el flujo de IA:`, error);
    return NextResponse.json(
      { error: `Error interno de IA: ${error.message}` },
      { status: 500 }
    );
  }
}
