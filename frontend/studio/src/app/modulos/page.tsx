
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
  ArrowRight 
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const modules = [
  {
    id: "1",
    title: "Módulo 1: Fundamentos de Bases de Datos e Investigación",
    objective: "Comprender los conceptos básicos de bases de datos y su importancia en la investigación académica.",
    icon: Database,
    imageSrc: "https://picsum.photos/seed/mod1/600/400",
    aiHint: "database research",
  },
  {
    id: "2",
    title: "Módulo 2: Acceso e Identificación de Recursos",
    objective: "Aprender a acceder a las bases de datos institucionales.",
    icon: GraduationCap,
    imageSrc: "https://picsum.photos/seed/mod2/600/400",
    aiHint: "library portal",
  },
  {
    id: "3",
    title: "Módulo 3: Navegación y Búsqueda Básica",
    objective: "Realizar búsquedas simples en bases de datos.",
    icon: Search,
    imageSrc: "https://picsum.photos/seed/mod3/600/400",
    aiHint: "web search",
  },
  {
    id: "4",
    title: "Módulo 4: Estrategias de Búsqueda Avanzada",
    objective: "Aplicar técnicas avanzadas para mejorar resultados de búsqueda.",
    icon: PlayCircle,
    imageSrc: "https://picsum.photos/seed/mod4/600/400",
    aiHint: "advanced strategy",
  },
  {
    id: "5",
    title: "Módulo 5: Inteligencia Artificial en la Búsqueda",
    objective: "Utilizar herramientas de IA para optimizar la búsqueda académica.",
    icon: BrainCircuit,
    imageSrc: "https://picsum.photos/seed/mod5/600/400",
    aiHint: "artificial intelligence",
  },
  {
    id: "6",
    title: "Módulo 6: Gestión de la Información",
    objective: "Organizar y almacenar información recuperada.",
    icon: BookMarked,
    imageSrc: "https://picsum.photos/seed/mod6/600/400",
    aiHint: "information management",
  },
  {
    id: "7",
    title: "Módulo 7: Evaluación y Selección de Fuentes",
    objective: "Evaluar la calidad de la información académica.",
    icon: CheckSquare,
    imageSrc: "https://picsum.photos/seed/mod7/600/400",
    aiHint: "quality evaluation",
  },
  {
    id: "8",
    title: "Módulo 8: Ética y Uso Responsable de la Información",
    objective: "Aplicar principios éticos en el uso de información.",
    icon: ShieldCheck,
    imageSrc: "https://picsum.photos/seed/mod8/600/400",
    aiHint: "ethics responsibility",
  },
  {
    id: "9",
    title: "Módulo 9: Aplicación Práctica en Investigación",
    objective: "Integrar todos los conocimientos en un ejercicio completo.",
    icon: BookOpen,
    imageSrc: "https://picsum.photos/seed/mod9/600/400",
    aiHint: "practical research",
  }
];

export default function ModulosPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Ruta de Aprendizaje Académico</CardTitle>
          <CardDescription className="text-lg">Explora los 9 módulos diseñados para potenciar tus competencias informacionales de manera integral.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="flex flex-col overflow-hidden hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary">
            <div className="relative h-40 w-full">
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
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-headline line-clamp-2">{module.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Objetivo:</p>
                <p className="text-sm text-muted-foreground line-clamp-3 italic">
                  "{module.objective}"
                </p>
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
