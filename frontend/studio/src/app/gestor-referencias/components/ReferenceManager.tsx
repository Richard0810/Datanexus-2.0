"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Wand2, CheckCircle, Copy, Check, ServerCrash, Quote } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  references: z.string().min(5, "Debes ingresar al menos una referencia o datos bibliográficos."),
  targetFormat: z.enum(["APA 7", "Vancouver", "IEEE", "Harvard", "Chicago"], {
    errorMap: () => ({ message: "Debes seleccionar un formato de citación." }),
  }),
});

type ReferenceFormData = z.infer<typeof formSchema>;

interface FormattedResult {
  formattedReferences: string[];
  count: number;
}

export function ReferenceManager() {
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<ReferenceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      references: "",
      targetFormat: "APA 7",
    },
  });

  const onSubmit: SubmitHandler<ReferenceFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            flowId: 'referenceFormatterFlow',
            input: data 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "La respuesta del servidor no fue exitosa.");
      }

      const formattedResult: FormattedResult = await response.json();
      setResult(formattedResult);
      
      toast({
        title: "Referencias Formateadas",
        description: `Se han procesado ${formattedResult.count} referencias con éxito.`,
      });

    } catch (e: any) {
      console.error(e);
      setError(`Error: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({
      title: "Copiado",
      description: "La referencia se ha copiado al portapapeles.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Generador de Citas con IA</CardTitle>
          <CardDescription>Pega datos sueltos, BibTeX o referencias mal formateadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="references"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Contenido Bibliográfico</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Pega aquí tus referencias o datos (Ej: Smith, J. 2023. El impacto de la IA...)"
                        {...field}
                        rows={10}
                        className="text-sm rounded-xl focus:ring-primary/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetFormat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Formato de Salida</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Selecciona un formato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="APA 7">APA 7ma Edición</SelectItem>
                        <SelectItem value="Vancouver">Vancouver</SelectItem>
                        <SelectItem value="IEEE">IEEE</SelectItem>
                        <SelectItem value="Harvard">Harvard</SelectItem>
                        <SelectItem value="Chicago">Chicago</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading} className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando con IA...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Formatear Referencias
                  </>
                )}
              </Button>
            </form>
          </Form>

          {error && (
            <Alert variant="destructive" className="mt-6 rounded-xl">
              <ServerCrash className="h-4 w-4" />
              <AlertTitle>Fallo en el Procesamiento</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {result ? (
          <Card className="shadow-lg border-primary/20 overflow-hidden">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5 text-primary" />
                  Referencias en {form.getValues("targetFormat")}
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {result.formattedReferences.map((ref, index) => (
                <div key={index} className="group relative p-4 bg-muted/50 rounded-xl border border-transparent hover:border-primary/30 transition-all">
                  <p className="text-sm leading-relaxed pr-10">{ref}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border"
                    onClick={() => copyToClipboard(ref, index)}
                  >
                    {copiedIndex === index ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-primary" />
                    )}
                  </Button>
                </div>
              ))}
              <div className="pt-4 flex justify-between items-center text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                <span>Total: {result.count}</span>
                <span className="text-primary">Generado por DataNexus IA</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
            <Quote className="h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-headline font-bold text-slate-400">Sin resultados aún</h3>
            <p className="text-sm text-slate-400 max-w-xs mt-2">Introduce tus referencias a la izquierda para ver la magia de la IA aquí.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
