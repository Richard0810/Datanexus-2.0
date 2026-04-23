"use client";

import { useState, type FormEvent } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Search, ServerCrash } from "lucide-react";
import { naturalLanguageAcademicSearch, type NaturalLanguageAcademicSearchInput, type NaturalLanguageAcademicSearchOutput } from "@/ai/flows/ai-assisted-academic-search";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  query: z.string().min(10, "La consulta debe tener al menos 10 caracteres."),
});

type AcademicSearchFormData = z.infer<typeof formSchema>;

export function AcademicSearchForm() {
  const [searchResult, setSearchResult] = useState<NaturalLanguageAcademicSearchOutput | null>(null);
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
      const result = await naturalLanguageAcademicSearch(data as NaturalLanguageAcademicSearchInput);
      setSearchResult(result);
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al procesar la búsqueda. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="searchQuery" className="text-lg">Tu consulta de búsqueda</FormLabel>
              <FormControl>
                <Textarea
                  id="searchQuery"
                  placeholder="Ej: ¿Cuáles son los efectos del aprendizaje basado en proyectos en el rendimiento estudiantil universitario?"
                  {...field}
                  rows={4}
                  className="text-base"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Realizar Búsqueda
            </>
          )}
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <ServerCrash className="h-4 w-4" />
          <AlertTitle>Error en la Búsqueda</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {searchResult && (
        <Card className="mt-6 shadow-md">
          <CardHeader>
            <CardTitle>Resultados de la Búsqueda Asistida por IA</CardTitle>
            <CardDescription>
              Estos son los materiales de investigación que la IA considera relevantes para tu consulta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResult.results && searchResult.results.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5">
                {searchResult.results.map((item, index) => (
                  <li key={index} className="text-base">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No se encontraron resultados para tu consulta.</p>
            )}
          </CardContent>
        </Card>
      )}
    </Form>
  );
}
