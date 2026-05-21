"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  GraduationCap, 
  Database, 
  Search as SearchIcon, 
  BrainCircuit, 
  BookMarked, 
  CheckSquare, 
  ShieldCheck, 
  PlayCircle,
  ArrowRight,
  Clock,
  BookOpenCheck,
  Loader2,
  FileQuestion
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { useSearch } from "@/context/SearchContext";

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
    icon: SearchIcon,
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
  const { searchQuery, setSearchQuery } = useSearch();

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoading(true);
        const [resResponse, actResponse, assResponse] = await Promise.all([
          api.get("/educational-resources"),
          api.get("/activities"),
          api.get("/assessments")
        ]);

        const counts: Record<string, number> = {};
        initialModules.forEach(m => counts[m.id] = 0);

        resResponse.data.forEach((r: any) => {
          const modId = r.unidad?.replace("Módulo ", "");
          if (counts[modId] !== undefined) counts[modId]++;
        });

        actResponse.data.forEach((a: any) => {
          if (counts[String(a.moduloId)] !== undefined) counts[String(a.moduloId)]++;
        });

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

  const filteredModules = useMemo(() => {
    if (!searchQuery) return initialModules;
    
    const normalize = (str: string) => 
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const normalizedQuery = normalize(searchQuery);
    
    return initialModules.filter(module => {
      const normalizedTitle = normalize(module.title);
      const normalizedObjective = normalize(module.objective);
      const normalizedId = normalize(module.id);
      
      return (
        normalizedTitle.includes(normalizedQuery) || 
        normalizedId.includes(normalizedQuery) ||
        normalizedObjective.includes(normalizedQuery)
      );
    });
  }, [searchQuery]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl">
          <BookOpenCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-headline">Módulos de Aprendizaje</h1>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `Resultados para "${searchQuery}"` 
              : "Explora nuestra ruta de formación y desarrolla tus habilidades investigativas."}
          </p>
        </div>
      </div>

      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModules.map((module) => (
            <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-500 border-none group rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50">
              <div className="relative h-56 w-full p-4">
                <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                  <Image
                    src={module.imageSrc}
                    alt={module.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    data-ai-hint={module.aiHint}
                    className="group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  
                  <div className={`absolute top-4 left-4 ${module.color} p-3 rounded-2xl shadow-lg shadow-black/20 text-white`}>
                    <module.icon className="h-6 w-6" />
                  </div>

                  <div className="absolute top-4 right-4">
                    <Badge className={`${
                      module.difficulty === 'Básico' ? 'bg-emerald-500' : 
                      module.difficulty === 'Intermedio' ? 'bg-amber-500' : 'bg-blue-600'
                    } border-none text-[11px] font-bold px-4 py-1.5 rounded-2xl shadow-lg`}>
                      {module.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              <CardHeader className="pt-2 pb-0 px-8">
                <CardTitle className="text-xl font-headline leading-tight line-clamp-2 min-h-[3.5rem]">
                  {module.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2 mt-2 leading-relaxed">
                  {module.objective}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pt-8 pb-4 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
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
                <Progress value={0} className="h-2 bg-slate-100 rounded-full" />
              </CardContent>

              <CardContent className="px-8 pb-8 pt-0 mt-auto">
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 text-base font-bold transition-all hover:translate-y-[-2px]">
                  <Link href={`/modulos/${module.id}`} className="flex items-center justify-center gap-2">
                    Comenzar módulo <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200">
          <FileQuestion className="h-20 w-20 text-slate-200 mb-6" />
          <h3 className="text-2xl font-headline font-bold text-slate-800">No encontramos coincidencias</h3>
          <p className="text-muted-foreground mt-2 text-lg">Intenta con otros términos o números de módulo.</p>
          <Button variant="outline" className="mt-8 rounded-2xl px-8 h-12 text-base" onClick={() => setSearchQuery('')}>
            Ver todos los módulos
          </Button>
        </div>
      )}
    </div>
  );
}
