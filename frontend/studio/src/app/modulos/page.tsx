
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Filter, MessageSquare, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const modules = [
  {
    id: "videos",
    title: "Tutoriales en Video",
    description: "Aprende con nuestros tutoriales interactivos en video sobre bases de datos y operadores booleanos.",
    icon: Video,
    imageSrc: "https://picsum.photos/seed/video1/600/400",
    aiHint: "online education",
    detailsLink: "/modulos/videos"
  },
  {
    id: "guias",
    title: "Guías PDF Detalladas",
    description: "Consulta guías completas en formato PDF para profundizar tus conocimientos.",
    icon: BookOpen,
    imageSrc: "https://picsum.photos/seed/guide1/600/400",
    aiHint: "library books",
    detailsLink: "/modulos/guias"
  },
  {
    id: "prisma",
    title: "Modelo PRISMA",
    description: "Domina la metodología PRISMA para revisiones sistemáticas.",
    icon: Filter,
    imageSrc: "https://picsum.photos/seed/prisma1/600/400",
    aiHint: "science research",
    detailsLink: "/modulos/prisma"
  },
  {
    id: "etica-ia",
    title: "Ética y Uso de IA en Investigación",
    description: "Reflexiona sobre las implicaciones éticas del uso de IA en la academia.",
    icon: MessageSquare,
    imageSrc: "https://picsum.photos/seed/ethics1/600/400",
    aiHint: "ethics robot",
    detailsLink: "/modulos/etica-ia"
  }
];

export default function ModulosPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Módulos de Aprendizaje</CardTitle>
          <CardDescription>Explora nuestros módulos diseñados para potenciar tus competencias informacionales.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-48 w-full">
              <Image
                src={module.imageSrc}
                alt={module.title}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={module.aiHint}
              />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center text-xl gap-2">
                <module.icon className="h-6 w-6 text-primary" />
                {module.title}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Link href={module.detailsLink} className="text-sm font-medium text-primary hover:underline">
                Acceder al módulo &rarr;
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
       <p className="text-center text-muted-foreground mt-8">
        Más módulos estarán disponibles próximamente.
      </p>
    </div>
  );
}
