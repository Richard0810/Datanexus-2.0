
"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, ArrowLeft, Loader2, Video, FileText, ExternalLink, PlusCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const modulesData = {
  "1": { title: "Módulo 1: Fundamentos de Bases de Datos e Investigación", objective: "Comprender los conceptos básicos de bases de datos y su importancia en la investigación académica." },
  "2": { title: "Módulo 2: Acceso e Identificación de Recursos", objective: "Aprender a acceder a las bases de datos institucionales." },
  "3": { title: "Módulo 3: Navegación y Búsqueda Básica", objective: "Realizar búsquedas simples en bases de datos." },
  "4": { title: "Módulo 4: Estrategias de Búsqueda Avanzada", objective: "Aplicar técnicas avanzadas para mejorar resultados de búsqueda." },
  "5": { title: "Módulo 5: Inteligencia Artificial en la Búsqueda", objective: "Utilizar herramientas de IA para optimizar la búsqueda académica." },
  "6": { title: "Módulo 6: Gestión de la Información", objective: "Organizar y almacenar información recuperada." },
  "7": { title: "Módulo 7: Evaluación y Selección de Fuentes", objective: "Evaluar la calidad de la información académica." },
  "8": { title: "Módulo 8: Ética y Uso Responsable de la Información", objective: "Aplicar principios éticos en el uso de información." },
  "9": { title: "Módulo 9: Aplicación Práctica en Investigación", objective: "Integrar todos los conocimientos en un ejercicio completo." }
};

interface Resource {
  _id?: string;
  titulo: string;
  descripcion: string;
  url: string;
  unidad: string;
  tipo: string;
  formato: string;
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get("/educational-resources");
      // Filtramos por el nombre del módulo
      const filtered = response.data.filter((res: any) => 
        res.unidad === `Módulo ${id}`
      );
      setResources(filtered);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [id]);

  const handleSeedResources = async () => {
    setIsSeeding(true);
    let initialData: any[] = [];
    
    if (id === "1") {
      initialData = [
        {
          titulo: "Concepto de base de datos",
          descripcion: "Introducción fundamental a qué es una base de datos y su importancia.",
          url: "https://youtu.be/6S8A-1jBD5Y?si=O0abKswmjJXojEKM",
          unidad: `Módulo 1`,
          tipo: "video",
          formato: "YouTube"
        },
        {
          titulo: "Guía: Maestros de la Búsqueda",
          descripcion: "Guía interactiva sobre fundamentos y operadores bibliográficos.",
          url: "https://gamma.app/docs/Maestros-de-la-Busqueda-8a9kvdc2sqn4klr",
          unidad: `Módulo 1`,
          tipo: "guia",
          formato: "Web/Interactivo"
        }
      ];
    } else if (id === "4") {
      initialData = [
        {
          titulo: "Cómo funcionan los operadores booleanos",
          descripcion: "Aprende a usar AND, OR y NOT para mejorar tus búsquedas académicas de forma avanzada.",
          url: "https://youtu.be/k4kq_QxTU8Q?si=qPrLRJxeFjutINX5",
          unidad: `Módulo 4`,
          tipo: "video",
          formato: "YouTube"
        }
      ];
    }

    try {
      if (initialData.length === 0) {
        toast({
          title: "Próximamente",
          description: "Aún no hay materiales preconfigurados para este módulo.",
        });
        return;
      }

      for (const item of initialData) {
        await api.post("/educational-resources", item);
      }
      toast({
        title: "Recursos cargados",
        description: `Se han añadido los materiales al Módulo ${id}.`,
      });
      fetchResources();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los recursos.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com/embed/")) return url;
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
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
          <div>
            <h1 className="text-3xl font-headline">{moduleInfo.title}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {moduleInfo.objective}
            </p>
          </div>
        </div>
        
        {resources.length === 0 && !loading && (id === "1" || id === "4") && (
          <Button onClick={handleSeedResources} disabled={isSeeding} className="bg-accent hover:bg-accent/90">
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Cargar Materiales
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando materiales...</p>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {resources.map((res, index) => (
            <Card key={res._id || index} className="overflow-hidden shadow-md">
              <div className="flex flex-col md:flex-row">
                {res.tipo === "video" && (
                  <div className="md:w-1/2 aspect-video bg-black">
                    <iframe
                      src={getEmbedUrl(res.url)}
                      title={res.titulo}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className={res.tipo === "video" ? "md:w-1/2 p-6 flex flex-col" : "w-full p-6 flex flex-col"}>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={res.tipo === "video" ? "default" : "secondary"} className="flex gap-1 items-center">
                      {res.tipo === "video" ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      {res.tipo.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{res.titulo}</CardTitle>
                  <CardDescription className="text-base mb-6">{res.descripcion}</CardDescription>
                  <div className="mt-auto">
                    {res.tipo === "guia" && (
                      <Button asChild className="w-full md:w-auto">
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          Abrir Recurso <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CardContent className="space-y-4">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">Este módulo aún no tiene materiales registrados</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {(id === "1" || id === "4")
                ? "Usa el botón superior para cargar el contenido diseñado para este módulo." 
                : "Estamos preparando el material educativo para este módulo. ¡Vuelve pronto!"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
