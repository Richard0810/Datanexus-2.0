"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Lightbulb, ServerCrash, Wand2, Quote, BrainCircuit, Tags } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

// 1. Esquema de validación del formulario (se mantiene igual)
const formSchema = z.object({
  topic: z.string().min(5, "El tema debe tener al menos 5 caracteres.").optional(),
  population: z.string().min(3, "La población debe tener al menos 3 caracteres."),
  interventionOrExposure: z.string().min(3, "La intervención/exposición debe tener al menos 3 caracteres."),
  comparison: z.string().min(3, "La comparación debe tener al menos 3 caracteres."),
  outcome: z.string().min(3, "El resultado debe tener al menos 3 caracteres."),
  context: z.string().optional(),
});

// 2. Tipo de datos del formulario inferido de Zod
type PicoPecoFormData = z.infer<typeof formSchema>;

// 3. Tipo de la respuesta esperada de la IA (coincide con PicoOutputSchema en pico.ts)
interface PicoResponse {
  preguntaPICO: string;
  preguntaPECO: string;
  sugerencia: string;
  keywords: string[];
}

export function PicoPecoForm() {
  const [aiResponse, setAiResponse] = useState<PicoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PicoPecoFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      population: "",
      interventionOrExposure: "",
      comparison: "",
      outcome: "",
      context: "",
    },
  });

  // 4. Nueva función onSubmit que llama al endpoint de Genkit
  const onSubmit: SubmitHandler<PicoPecoFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setAiResponse(null);

    // Mapeo de los nombres del formulario a los esperados por el prompt de la IA
    const flowInput = {
        tema: data.topic,
        poblacion: data.population,
        intervencion: data.interventionOrExposure,
        comparacion: data.comparison,
        resultado: data.outcome,
        contexto: data.context,
    };

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            flowId: 'picoQuestionFlow', // El ID del flujo que creamos
            input: flowInput 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "La respuesta del servidor no fue exitosa.");
      }

      const result: PicoResponse = await response.json();
      setAiResponse(result);

    } catch (e: any) {
      console.error(e);
      setError(`Ocurrió un error al contactar a la IA: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="topic" render={({ field }) => (<FormItem><FormLabel>Tema de Investigación</FormLabel><FormControl><Input placeholder="Ej: Efectividad de la gamificación" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="population" render={({ field }) => (<FormItem><FormLabel>Población (P)</FormLabel><FormControl><Input placeholder="Ej: Estudiantes universitarios" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="interventionOrExposure" render={({ field }) => (<FormItem><FormLabel>Intervención (I) / Exposición (E)</FormLabel><FormControl><Input placeholder="Ej: Uso de plataformas educativas gamificadas" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="comparison" render={({ field }) => (<FormItem><FormLabel>Comparación (C)</FormLabel><FormControl><Input placeholder="Ej: Métodos de enseñanza tradicionales" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="outcome" render={({ field }) => (<FormItem><FormLabel>Resultado (O)</FormLabel><FormControl><Input placeholder="Ej: Motivación y rendimiento académico" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="context" render={({ field }) => (<FormItem><FormLabel>Contexto (Opcional)</FormLabel><FormControl><Textarea placeholder="Ej: En cursos de ingeniería de software durante un semestre." {...field} rows={3}/></FormControl><FormMessage /></FormItem>)} />
        
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
          {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Formulando...</>) : (<><Wand2 className="mr-2 h-4 w-4" /> Formular Preguntas con IA</>)}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-8">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error en la Formulación</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 5. Nueva sección para renderizar la respuesta completa de la IA */}
      {aiResponse && (
        <div className="mt-8 space-y-6 animate-fade-in">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center"><BrainCircuit className="mr-3 text-primary h-6 w-6"/>Preguntas Formuladas por la IA</CardTitle>
              <CardDescription>La inteligencia artificial ha generado las siguientes preguntas basadas en tu información.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-base">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold flex items-center"><Quote className="mr-2 h-4 w-4"/>Pregunta PICO</h4>
                <p className="text-muted-foreground italic">{aiResponse.preguntaPICO}</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold flex items-center"><Quote className="mr-2 h-4 w-4"/>Pregunta PECO</h4>
                <p className="text-muted-foreground italic">{aiResponse.preguntaPECO}</p>
              </div>
            </CardContent>
          </Card>

          <Alert className="border-amber-500/50 text-amber-900 dark:text-amber-200">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <AlertTitle className="font-bold">Sugerencia del Experto</AlertTitle>
            <AlertDescription>{aiResponse.sugerencia}</AlertDescription>
          </Alert>

          <div>
             <h3 className="text-lg font-semibold mb-3 flex items-center"><Tags className="mr-2 h-5 w-5"/>Palabras Clave Sugeridas</h3>
             <div className="flex flex-wrap gap-2">
                {aiResponse.keywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3 cursor-pointer hover:bg-primary/20 transition-colors">{keyword}</Badge>
                ))}
             </div>
          </div>
        </div>
      )}
    </Form>
  );
}
