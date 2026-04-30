
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, Layers, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const modules = [
  {
    id: "1",
    title: "Módulo 1: Fundamentos de Búsqueda",
    description: "Conceptos básicos de bases de datos, palabras clave y el poder de los operadores booleanos.",
    icon: GraduationCap,
    imageSrc: "https://picsum.photos/seed/mod1/600/400",
    aiHint: "online education",
    topics: ["Bases de datos", "Operadores Booleanos", "Estrategias iniciales"]
  },
  {
    id: "2",
    title: "Módulo 2: Metodología Avanzada",
    description: "Domina el modelo PRISMA y técnicas de filtrado para revisiones sistemáticas de alta calidad.",
    icon: Layers,
    imageSrc: "https://picsum.photos/seed/mod2/600/400",
    aiHint: "science research",
    topics: ["Modelo PRISMA", "Criterios de inclusión", "Diagramas de flujo"]
  },
  {
    id: "3",
    title: "Módulo 3: Ética y Futuro con IA",
    description: "Cómo usar la Inteligencia Artificial de forma ética y efectiva en tu proceso de investigación.",
    icon: BookOpen,
    imageSrc: "https://picsum.photos/seed/mod3/600/400",
    aiHint: "ethics robot",
    topics: ["IA Generativa", "Ética académica", "Integridad científica"]
  }
];

export default function ModulosPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Ruta de Aprendizaje</CardTitle>
          <CardDescription className="text-lg">Explora los módulos diseñados para potenciar tus competencias informacionales paso a paso.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
            <div className="relative h-48 w-full">
              <Image
                src={module.imageSrc}
                alt={module.title}
                fill
                style={{ objectFit: 'cover' }}
                data-ai-hint={module.aiHint}
              />
              <div className="absolute top-2 right-2">
                <div className="bg-background/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                  <module.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="text-xl">{module.title}</CardTitle>
              <CardDescription className="min-h-[60px]">{module.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Lo que aprenderás:</p>
                <ul className="text-sm space-y-1">
                  {module.topics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-accent" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
            <CardContent className="pt-0">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href={`/modulos/${module.id}`}>
                  Comenzar Módulo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
