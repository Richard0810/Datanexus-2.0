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
import { Loader2, Wand2, CheckCircle, Copy, Check, ServerCrash, Quote, ClipboardCopy, Trash2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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
  const [isCopyingAll, setIsCopyingAll] = useState(false);
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
      
      if (formattedResult.count === 0) {
        throw new Error("La IA no pudo identificar referencias válidas en el texto proporcionado.");
      }

      setResult(formattedResult);
      
      toast({
        title: "¡Éxito!",
        description: `Se han formateado ${formattedResult.count} referencias correctamente.`,
      });

    } catch (e: any) {
      console.error(e);
      setError(e.message);
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
      description: "Referencia copiada al portapapeles.",
    });
  };

  const copyAll = () => {
    if (!result) return;
    const allText = result.formattedReferences.join('\n\n');
    navigator.clipboard.writeText(allText);
    setIsCopyingAll(true);
    setTimeout(() => setIsCopyingAll(false), 2000);
    toast({
      title: "Copiado Masivo",
      description: "Todas las referencias han sido copiadas.",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card className="shadow-xl border-none rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-2xl">Generador de Citas con IA</CardTitle>
          <CardDescription>Pega datos de BibTeX, RIS o texto desordenado.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="references"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between items-center mb-1">
                       <FormLabel className="font-bold text-slate-700">Contenido Bibliográfico</FormLabel>
                       <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-[10px] uppercase font-bold text-destructive hover:bg-destructive/10"
                        onClick={() => form.setValue("references", "")}
                       >
                         <Trash2 className="h-3 w-3 mr-1" /> Limpiar
                       </Button>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Ej: @article{...} o simplemente 'Smith, J. (2020). Título del libro...'"
                        {...field}
                        rows={12}
                        className="text-sm rounded-2xl bg-slate-50 focus:bg-white transition-colors"
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
                    <FormLabel className="font-bold text-slate-700">Formato Académico</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl h-12 bg-slate-50">
                          <SelectValue placeholder="Selecciona formato" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-xl">
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
              
              <Button type="submit" disabled={isLoading} className="w-full h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 text-lg shadow-lg shadow-primary/20">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando Metadatos...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Formatear con IA
                  </>
                )}
              </Button>
            </form>
          </Form>

          {error && (
            <Alert variant="destructive" className="mt-6 rounded-2xl border-none bg-red-50 text-red-900">
              <ServerCrash className="h-5 w-5" />
              <AlertTitle className="font-bold">Error de Procesamiento</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6 sticky top-24">
        {result && result.formattedReferences.length > 0 ? (
          <Card className="shadow-2xl border-none overflow-hidden rounded-[2rem] bg-white ring-1 ring-primary/5">
            <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3 text-primary">
                  <Quote className="h-6 w-6" />
                  Referencias en {form.getValues("targetFormat")}
                </CardTitle>
                <Button 
                  onClick={copyAll} 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "rounded-xl font-bold transition-all",
                    isCopyingAll ? "bg-green-600 text-white border-green-600" : "bg-white border-primary/20 text-primary hover:bg-primary/5"
                  )}
                >
                  {isCopyingAll ? <Check className="h-4 w-4 mr-2" /> : <ClipboardCopy className="h-4 w-4 mr-2" />}
                  {isCopyingAll ? "¡Copiadas!" : "Copiar Todas"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {result.formattedReferences.map((ref, index) => (
                <div key={index} className="group relative p-5 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-primary/20 hover:bg-white hover:shadow-md transition-all">
                  <p className="text-sm leading-relaxed pr-12 text-slate-800">{ref}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 h-9 w-9 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-sm border border-slate-100"
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
              <div className="pt-6 flex justify-between items-center border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total: {result.count}</span>
                </div>
                <span className="text-[9px] uppercase font-black text-primary/40 tracking-tighter italic">DataNexus Intelligence Engine</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-dashed h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 bg-slate-50/50 rounded-[2rem]">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm mb-6">
              <Quote className="h-16 w-16 text-slate-200" />
            </div>
            <h3 className="text-2xl font-headline font-bold text-slate-400">Panel de Resultados</h3>
            <p className="text-slate-400 max-w-xs mt-3 leading-relaxed">Pega tus datos bibliográficos y presiona el botón para ver las citas formateadas aquí.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
