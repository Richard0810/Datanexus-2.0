"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicSearchForm } from "./AcademicSearchForm";
import { PicoPecoForm } from "./PicoPecoForm";
import { BrainCircuit, Lightbulb } from "lucide-react";

export function HerramientasIAPageContent() {
  return (
    <Tabs defaultValue="academic-search" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="academic-search">
          <BrainCircuit className="mr-2 h-5 w-5" /> Búsqueda Académica Asistida
        </TabsTrigger>
        <TabsTrigger value="pico-peco" id="pico-peco">
          <Lightbulb className="mr-2 h-5 w-5" /> Formular Pregunta PICO/PECO
        </TabsTrigger>
      </TabsList>
      <TabsContent value="academic-search">
        <Card>
          <CardHeader>
            <CardTitle>Búsqueda Académica Asistida por IA</CardTitle>
            <CardDescription>
              Realiza búsquedas en bases de datos académicas utilizando lenguaje natural.
              La IA te ayudará a refinar tus consultas y encontrar material relevante.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AcademicSearchForm />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="pico-peco">
        <Card>
          <CardHeader>
            <CardTitle>Formulación de Preguntas PICO/PECO</CardTitle>
            <CardDescription>
              Define claramente tu pregunta de investigación utilizando el formato PICO o PECO.
              Esto te ayudará a enfocar tu búsqueda y seleccionar estudios relevantes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PicoPecoForm />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
