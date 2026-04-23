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
import { Loader2, UploadCloud, CheckCircle, XCircle, ServerCrash } from "lucide-react";
import { exportReferences, type ExportReferencesInput, type ExportReferencesOutput } from "@/ai/flows/export-references-to-zotero-mendeley";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
  references: z.string().min(10, "Debes ingresar al menos una referencia."),
  exportFormat: z.enum(["Zotero", "Mendeley"], {
    errorMap: () => ({ message: "Debes seleccionar un formato de exportación." }),
  }),
});

type ReferenceFormData = z.infer<typeof formSchema>;

export function ReferenceManager() {
  const [exportStatus, setExportStatus] = useState<ExportReferencesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ReferenceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      references: "",
      exportFormat: undefined, // Ensure no default is selected initially
    },
  });

  const onSubmit: SubmitHandler<ReferenceFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setExportStatus(null);

    // Simulate parsing references - in a real app, you'd parse BibTeX/RIS here
    const referencesArray = data.references.split("\n\n").filter(ref => ref.trim() !== "");

    if (referencesArray.length === 0) {
      setError("No se detectaron referencias válidas. Asegúrate de que cada referencia esté separada por una línea en blanco.");
      setIsLoading(false);
      return;
    }

    try {
      const inputData: ExportReferencesInput = {
        references: referencesArray,
        exportFormat: data.exportFormat,
      };
      const result = await exportReferences(inputData);
      setExportStatus(result);
    } catch (e) {
      console.error(e);
      setError("Ocurrió un error al procesar la exportación. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>Exportar Referencias</CardTitle>
        <CardDescription>Pega tus referencias y selecciona el formato de exportación.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="references"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="referencesText" className="text-lg">Referencias (BibTeX/RIS)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="referencesText"
                      placeholder="Pega tus referencias aquí. Separa cada referencia con una línea en blanco."
                      {...field}
                      rows={10}
                      className="text-sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exportFormat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="exportFormatSelect">Formato de Exportación</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger id="exportFormatSelect">
                        <SelectValue placeholder="Selecciona un formato" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Zotero">Zotero</SelectItem>
                      <SelectItem value="Mendeley">Mendeley</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Exportar Referencias
                </>
              )}
            </Button>
          </form>
        </Form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <ServerCrash className="h-4 w-4" />
            <AlertTitle>Error en la Exportación</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {exportStatus && (
          <Alert variant={exportStatus.exportStatus === "success" ? "default" : "destructive"} className="mt-6">
            {exportStatus.exportStatus === "success" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            <AlertTitle>
              {exportStatus.exportStatus === "success" ? "Exportación Exitosa" : "Falló la Exportación"}
            </AlertTitle>
            <AlertDescription>{exportStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
