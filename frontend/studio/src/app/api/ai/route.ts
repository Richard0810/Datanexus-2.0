
import { NextRequest, NextResponse } from 'next/server';
import { run } from '@genkit-ai/core/experimental';

// Importar la configuración de la IA (esto inicializa Genkit y los plugins)
import '@/ai/genkit';

// IMPORTANTE: Importar todos los flujos que esta API debe poder ejecutar
import '@/ai/pico';
// Si en el futuro creas más flujos, impórtalos aquí también
// import '@/ai/otro-flujo';

export async function POST(req: NextRequest) {
  // Extraer el ID del flujo y los datos de entrada del cuerpo de la solicitud
  const { flowId, input } = await req.json();

  // Validar que se proporcionó un ID de flujo
  if (!flowId) {
    return NextResponse.json({ error: 'flowId es requerido' }, { status: 400 });
  }

  console.log(`[API] Recibida solicitud para ejecutar el flujo: ${flowId}`);

  try {
    // Ejecutar el flujo de Genkit por su ID con los datos de entrada
    const output = await run(flowId, input);

    // Devolver la salida del flujo como respuesta
    return NextResponse.json(output);

  } catch (error: any) {
    // Manejar errores, como un flujo no encontrado o errores durante la ejecución
    console.error(`[API] Error al ejecutar el flujo ${flowId}:`, error);
    return NextResponse.json(
      { error: `Error al ejecutar el flujo: ${error.message}` },
      { status: 500 }
    );
  }
}
