
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowLeft, PlusCircle, Loader2, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface GuideResource {
  _id?: string;
  titulo: string;
  descripcion: string;
  url: string;
  unidad: string;
  tipo: string;
  formato: string;
}

export default function GuiasPage() {
  const [guides, setGuides] = useState<GuideResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const response = await api.get("/educational-resources");
      // Filtramos solo los que son tipo guia
      const guideResources = response.data.filter((res: any) => res.tipo === "guia");
      setGuides(guideResources);
    } catch (error) {
      console.error("Error fetching guides:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleSeedGuides = async () => {
    setIsSeeding(true);
    const initialGuides = [
      {
        titulo: "Maestros de la Búsqueda: Operadores Booleanos",
        descripcion: "Una guía interactiva completa sobre cómo dominar los operadores AND, OR y NOT en tus investigaciones.",
        url: "https://gamma.app/docs/Maestros-de-la-Busqueda-8a9kvdc2sqn4klr",
        unidad: "Unidad 1",
        tipo: "guia",
        formato: "Web/Interactivo"
      }
    ];

    try {
      for (const guide of initialGuides) {
        await api.post("/educational-resources", guide);
      }
      toast({
        title: "Guía registrada",
        description: "El material de estudio se ha guardado correctamente en la base de datos.",
      });
      fetchGuides();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar las guías.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/modulos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-headline flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Guías Detalladas
          </h1>
        </div>
        
        {guides.length === 0 && !loading && (
          <Button onClick={handleSeedGuides} disabled={isSeeding} className="bg-accent hover:bg-accent/90">
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Cargar Guías Iniciales
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando guías...</p>
        </div>
      ) : guides.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.map((guide, index) => (
            <Card key={guide._id || index} className="flex flex-col shadow-md border-t-4 border-t-primary">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                    {guide.unidad}
                  </span>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl">{guide.titulo}</CardTitle>
                <CardDescription className="line-clamp-3">{guide.descripcion}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-sm text-muted-foreground">
                  <strong>Formato:</strong> {guide.formato}
                </div>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <a href={guide.url} target="_blank" rel="noopener noreferrer">
                    Abrir Guía <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CardContent className="space-y-4">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">No hay guías registradas</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Haz clic en el botón superior para registrar la guía de Operadores Booleanos en tu base de datos.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
