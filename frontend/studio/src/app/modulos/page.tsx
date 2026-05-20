"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  GraduationCap, 
  Database, 
  Search, 
  BrainCircuit, 
  BookMarked, 
  CheckSquare, 
  ShieldCheck, 
  PlayCircle,
  ArrowRight,
  Clock,
  BookOpenCheck,
  Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";

export const initialModules = [
  {
    id: "1",
    title: "Módulo 1: Fundamentos de Bases de Datos e Investigación",
    objective: "Comprender los conceptos básicos de bases de datos y su importancia en la investigación académica.",
    icon: Database,
    imageSrc: "https://picsum.photos/seed/mod1/600/400",
    aiHint: "database research",
    difficulty: "Básico",
    color: "bg-blue-500"
  },
  {
    id: "2",
    title: "Módulo 2: Acceso e Identificación de Recursos",
    objective: "Aprender a acceder a las bases de datos institucionales.",
    icon: GraduationCap,
    imageSrc: "https://picsum.photos/seed/mod2/600/400",
    aiHint: "library portal",
    difficulty: "Básico",
    color: "bg-green-500"
  },
  {
    id: "3",
    title: "Módulo 3: Navegación y Búsqueda Básica",
    objective: "Realizar búsquedas simples en bases de datos.",
    icon: Search,
    imageSrc: "https://picsum.photos/seed/mod3/600/400",
    aiHint: "web search",
    difficulty: "Básico",
    color: "bg-purple-500"
  },
  {
    id: "4",
    title: "Módulo 4: Estrategias de Búsqueda Avanzada",
    objective: "Aplicar técnicas avanzadas para mejorar resultados de búsqueda.",
    icon: PlayCircle,
    imageSrc: "https://picsum.photos/seed/mod4/600/400",
    aiHint: "advanced strategy",
    difficulty: "Intermedio",
    color: "bg-yellow-500"
  },
  {
    id: "5",
    title: "Módulo 5: Inteligencia Artificial en la Búsqueda",
    objective: "Utilizar herramientas de IA para optimizar la búsqueda académica.",
    icon: BrainCircuit,
    imageSrc: "https://picsum.photos/seed/mod5/600/400",
    aiHint: "artificial intelligence",
    difficulty: "Intermedio",
    color: "bg-violet-500"
  },
  {
    id: "6",
    title: "Módulo 6: Gestión de la Información",
    objective: "Organizar y almacenar información recuperada.",
    icon: BookMarked,
    imageSrc: "https://picsum.photos/seed/mod6/600/400",
    aiHint: "information management",
    difficulty: "Intermedio",
    color: "bg-emerald-500"
  },
  {
    id: "7",
    title: "Módulo 7: Evaluación y Selección de Fuentes",
    objective: "Evaluar la calidad de la información académica.",
    icon: CheckSquare,
    imageSrc: "https://picsum.photos/seed/mod7/600/400",
    aiHint: "quality evaluation",
    difficulty: "Avanzado",
    color: "bg-sky-500"
  },
  {
    id: "8",
    title: "Módulo 8: Ética y Uso Responsable de la Información",
    objective: "Aplicar principios éticos en el uso de información.",
    icon: ShieldCheck,
    imageSrc: "https://picsum.photos/seed/mod8/600/400",
    aiHint: "ethics responsibility",
    difficulty: "Avanzado",
    color: "bg-orange-500"
  },
  {
    id: "9",
    title: "Módulo 9: Aplicación Práctica en Investigación",
    objective: "Integrar todos los conocimientos en un ejercicio completo.",
    icon: BookOpen,
    imageSrc: "https://picsum.photos/seed/mod9/600/400",
    aiHint: "practical research",
    difficulty: "Avanzado",
    color: "bg-indigo-600"
  }
];

export default function ModulosPage() {
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        // Obtenemos todos los recursos para contar por módulo
        const [resResponse, actResponse, assResponse] = await Promise.all([
          api.get("/educational-resources"),
          api.get("/activities"),
          api.get("/assessments")
        ]);

        const counts: Record<string, number> = {};

        // Inicializar counts
        initialModules.forEach(m => counts[m.id] = 0);

        // Contar Recursos (usan "Módulo X" en el campo unidad)
        resResponse.data.forEach((r: any) => {
          const modId = r.unidad?.replace("Módulo ", "");
          if (counts[modId] !== undefined) counts[modId]++;
        });

        // Contar Actividades (usan moduloId numérico)
        actResponse.data.forEach((a: any) => {
          if (counts[String(a.moduloId)] !== undefined) counts[String(a.moduloId)]++;
        });

        // Contar Evaluaciones (usan moduloId numérico)
        assResponse.data.forEach((e: any) => {
          if (counts[String(e.moduloId)] !== undefined) counts[String(e.moduloId)]++;
        });

        setLessonCounts(counts);
      } catch (error) {
        console.error("Error al obtener conteo de lecciones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <BookOpenCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-headline">Módulos de Aprendizaje</h1>
          <p className="text-muted-foreground">Explora nuestra ruta de formación y desarrolla tus habilidades investigativas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {initialModules.map((module) => (
          <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-500 border-none group rounded-[2rem] bg-white">
            <div className="relative h-48 w-full p-4">
              <div className="relative h-full w-full overflow-hidden rounded-3xl">
                <Image
                  src={module.imageSrc}
                  alt={module.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={module.aiHint}
                  className="group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                
                {/* Icon Float */}
                <div className={`absolute top-3 left-3 ${module.color} p-2.5 rounded-2xl shadow-lg shadow-black/20 text-white`}>
                  <module.icon className="h-5 w-5" />
                </div>

                {/* Difficulty Badge */}
                <div className="absolute top-3 right-3">
                  <Badge className={`${
                    module.difficulty === 'Básico' ? 'bg-emerald-500' : 
                    module.difficulty === 'Intermedio' ? 'bg-amber-500' : 'bg-blue-600'
                  } border-none text-[10px] px-3 py-1 rounded-xl shadow-lg`}>
                    {module.difficulty}
                  </Badge>
                </div>
              </div>
            </div>

            <CardHeader className="pt-2 pb-0 px-6">
              <CardTitle className="text-lg font-headline leading-tight line-clamp-2 min-h-[3rem]">
                {module.title}
              </CardTitle>
              <CardDescription className="text-xs line-clamp-2 mt-2 leading-relaxed">
                {module.objective}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-6 pt-6 pb-4 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {loading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    `${lessonCounts[module.id] || 0} lecciones`
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-primary">
                  0% completado
                </div>
              </div>
              <Progress value={0} className="h-1.5 bg-slate-100" />
            </CardContent>

            <CardContent className="px-6 pb-6 pt-0 mt-auto">
              <Button asChild className="w-full h-11 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 text-sm font-bold transition-all hover:translate-y-[-2px]">
                <Link href={`/modulos/${module.id}`} className="flex items-center justify-center gap-2">
                  Comenzar módulo <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
