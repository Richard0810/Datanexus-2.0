"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, ServerCrash, BookOpen, Filter, Lightbulb, GraduationCap, Globe } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  query: z.string().min(5, "Describe mejor lo que buscas (mínimo 5 caracteres)."),
});

type AcademicSearchFormData = z.infer<typeof formSchema>;

interface SearchResult {
  title: string;
  snippet: string;
  source: string;
}

interface AcademicSearchOutput {
  results: SearchResult[];
  refinements: string[];
  expertTip: string;
}

export function AcademicSearchForm() {
  const [searchResult, setSearchResult] = useState<AcademicSearchOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AcademicSearchFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit: SubmitHandler<AcademicSearchFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSearchResult(null);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            flowId: 'naturalLanguageAcademicSearchFlow',
            input: data 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "No se pudo conectar con el motor de búsqueda.");
      }

      const result: AcademicSearchOutput = await response.json();
      setSearchResult(result);

    } catch (e: any) {
      console.error(e);
      setError(e.message || "Ocurrió un error al procesar la búsqueda. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold text-slate-700">Consulta de Investigación</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Ej: Impacto del pensamiento computacional en el desarrollo cognitivo de niños de primaria."
                    {...field}
                    rows={4}
                    className="text-base rounded-2xl bg-slate-50 focus:bg-white transition-all shadow-inner border-slate-200"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isLoading} 
            className="w-full sm:w-auto h-12 px-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Consultando IA...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Realizar Búsqueda Asistida
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6 rounded-2xl bg-red-50 border-none text-red-900">
            <ServerCrash className="h-5 w-5" />
            <AlertTitle className="font-bold">Error en la Búsqueda</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Form>

      {searchResult && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Card className="rounded-2xl border-none shadow-md bg-amber-50">
                <CardHeader className="pb-3">
                   <CardTitle className="text-sm font-black uppercase text-amber-700 tracking-widest flex items-center gap-2">
                     <Lightbulb className="h-4 w-4" /> Tip del Bibliotecario
                   </CardTitle>
                </CardHeader>
                <CardContent>
                   <p className="text-sm text-amber-900 leading-relaxed italic">{searchResult.expertTip}</p>
                </CardContent>
             </Card>

             <Card className="rounded-2xl border-none shadow-md bg-blue-50">
                <CardHeader className="pb-3">
                   <CardTitle className="text-sm font-black uppercase text-blue-700 tracking-widest flex items-center gap-2">
                     <Filter className="h-4 w-4" /> Refinamiento de Búsqueda
                   </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                   {searchResult.refinements.map((ref, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-white text-blue-800 border-blue-100 py-1 px-3">
                        {ref}
                      </Badge>
                   ))}
                </CardContent>
             </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-headline font-bold flex items-center gap-2 px-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              Materiales Académicos Recomendados
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {searchResult.results.map((item, index) => (
                <Card key={index} className="group hover:border-primary/40 transition-all border-slate-100 shadow-sm rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px] font-bold">
                              <Globe className="h-3 w-3 mr-1" /> {item.source}
                            </Badge>
                         </div>
                         <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{item.title}</h4>
                         <p className="text-sm text-slate-600 leading-relaxed">{item.snippet}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-primary/5 transition-colors">
                        <BookOpen className="h-6 w-6 text-slate-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <Separator className="bg-slate-100" />
          
          <div className="text-center py-4">
             <p className="text-[10px] uppercase font-black text-slate-300 tracking-[0.2em]">DataNexus Intelligence Retrieval Engine • Gemini 3.5 Flash</p>
          </div>
        </div>
      )}
    </div>
  );
}
