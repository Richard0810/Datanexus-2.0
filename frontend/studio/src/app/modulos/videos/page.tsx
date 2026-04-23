
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft, PlusCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface VideoResource {
  _id?: string;
  titulo: string;
  descripcion: string;
  url: string;
  unidad: string;
  tipo: string;
}

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/educational-resources");
      // Filtramos solo los que son tipo video
      const videoResources = response.data.filter((res: any) => res.tipo === "video");
      setVideos(videoResources);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleSeedVideos = async () => {
    setIsSeeding(true);
    const initialVideos = [
      {
        titulo: "Concepto de base de datos",
        descripcion: "Introducción fundamental a qué es una base de datos y su importancia.",
        url: "https://youtu.be/6S8A-1jBD5Y?si=O0abKswmjJXojEKM",
        unidad: "Unidad 1",
        tipo: "video",
        formato: "YouTube"
      },
      {
        titulo: "Cómo funcionan los operadores booleanos",
        descripcion: "Aprende a usar AND, OR y NOT para mejorar tus búsquedas académicas.",
        url: "https://youtu.be/k4kq_QxTU8Q?si=qPrLRJxeFjutINX5",
        unidad: "Unidad 2",
        tipo: "video",
        formato: "YouTube"
      }
    ];

    try {
      for (const video of initialVideos) {
        await api.post("/educational-resources", video);
      }
      toast({
        title: "Videos registrados",
        description: "Los tutoriales se han guardado correctamente en la base de datos.",
      });
      fetchVideos();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron guardar los videos.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Función para convertir links de youtube (largos o cortos) a formato embed para iframes
  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // Si ya es un link de embed, lo devolvemos tal cual
    if (url.includes("youtube.com/embed/")) return url;

    let videoId = "";
    
    if (url.includes("youtu.be/")) {
      // Formato corto: https://youtu.be/ID?params
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("v=")) {
      // Formato largo: https://www.youtube.com/watch?v=ID
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
          <h1 className="text-3xl font-headline flex items-center gap-2">
            <Video className="h-8 w-8 text-primary" />
            Tutoriales en Video
          </h1>
        </div>
        
        {videos.length === 0 && !loading && (
          <Button onClick={handleSeedVideos} disabled={isSeeding} className="bg-accent hover:bg-accent/90">
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
            Cargar Videos Iniciales
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando tutoriales...</p>
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {videos.map((video, index) => (
            <Card key={video._id || index} className="overflow-hidden shadow-md">
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={getEmbedUrl(video.url)}
                  title={video.titulo}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2 py-1 rounded">
                    {video.unidad}
                  </span>
                </div>
                <CardTitle>{video.titulo}</CardTitle>
                <CardDescription>{video.descripcion}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CardContent className="space-y-4">
            <Video className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">No hay videos registrados</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Haz clic en el botón superior para registrar los videos de las unidades 1 y 2 en tu base de datos de MongoDB.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
