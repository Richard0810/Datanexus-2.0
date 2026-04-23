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
import { Loader2, Lightbulb, ServerCrash } from "lucide-react";
import { formulatePicoPecoQuestion, type FormulatePicoPecoQuestionInput, type FormulatePicoPecoQuestionOutput } from "@/ai/flows/formulate-pico-peco-question";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  topic: z.string().min(5, "El tema debe tener al menos 5 caracteres."),
  population: z.string().min(3, "La población debe tener al menos 3 caracteres."),
  interventionOrExposure: z.string().min(3, "La intervención/exposición debe tener al menos 3 caracteres."),
  comparison: z.string().min(3, "La comparación debe tener al menos 3 caracteres."),
  outcome: z.string().min(3, "El resultado debe tener al menos 3 caracteres."),
  context: z.string().optional(),
});

type PicoPecoFormData = z.infer<typeof formSchema>;

export function PicoPecoForm() {
  const [formulationResult, setFormulationResult] = useState<FormulatePicoPecoQuestionOutput | null>(null);
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

  const onSubmit: SubmitHandler<PicoPecoFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setFormulationResult(null);

    try {
      const result = await formulatePicoPecoQuestion(data);
      setFormulationResult(result);
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al formular las preguntas. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema de Investigación</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Efectividad de la gamificación" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="population"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Población (P)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Estudiantes universitarios" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="interventionOrExposure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Intervención (I) / Exposición (E)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Uso de plataformas educativas gamificadas" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comparison"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comparación (C)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Métodos de enseñanza tradicionales" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resultado (O)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Motivación y rendimiento académico" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
            control={form.control}
            name="context"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contexto (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Ej: En cursos de ingeniería de software durante un semestre." {...field} rows={3}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Formulando...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Formular Preguntas
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error en la Formulación</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {formulationResult && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle>Preguntas Formuladas</CardTitle>
            <CardDescription>
              La IA ha generado las siguientes preguntas PICO y PECO basadas en tu información.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-accent">Pregunta PICO:</h3>
              <p className="text-base">{formulationResult.picoQuestion}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent">Pregunta PECO:</h3>
              <p className="text-base">{formulationResult.pecoQuestion}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </Form>
  );
}
