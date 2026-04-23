import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen, Database, Filter, Lightbulb, MessageSquare, PlayCircle, Search, Video } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface QuickAccessItem {
  title: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

interface LearningActivityItem {
  title: string;
  href: string;
  icon: React.ElementType;
  imageSrc?: string;
  imageAlt?: string;
  aiHint?: string;
}

const quickAccessItems: QuickAccessItem[] = [
  { title: "Iniciar búsqueda académica asistida", href: "/herramientas-ia", icon: Search, description: "Usa IA para refinar tus búsquedas." },
  { title: "Formular pregunta PICO/PECO", href: "/herramientas-ia#pico-peco", icon: Lightbulb, description: "Estructura tus preguntas de investigación." },
  { title: "Explorar bases de datos", href: "/simulador", icon: Database, description: "Practica en Google Scholar, SciELO y más." },
  { title: "Aplicar modelo PRISMA", href: "/modulos#prisma", icon: Filter, description: "Aprende a seleccionar estudios sistemáticamente." },
];

const learningActivities: LearningActivityItem[] = [
  { title: "Tutoriales en Video", href: "/modulos#videos", icon: Video, imageSrc: "https://placehold.co/600x400.png", imageAlt: "Video tutoriales", aiHint: "online learning" },
  { title: "Guías PDF Detalladas", href: "/modulos#guias", icon: BookOpen, imageSrc: "https://placehold.co/600x400.png", imageAlt: "Guías PDF", aiHint: "study guide" },
  { title: "Simulaciones de Búsqueda", href: "/simulador", icon: PlayCircle, imageSrc: "https://placehold.co/600x400.png", imageAlt: "Simulaciones", aiHint: "data search" },
  { title: "Ética y Uso de IA", href: "/modulos#etica-ia", icon: MessageSquare, imageSrc: "https://placehold.co/600x400.png", imageAlt: "Ética IA", aiHint: "artificial intelligence" },
];

export default function HomePage() {
  // Placeholder user data
  const userName = "Estudiante";
  const progressLevel = 65; // Example progress percentage

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Bienvenido de nuevo, {userName}!</CardTitle>
          <CardDescription>Tu progreso general en el desarrollo de competencias informacionales.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progressLevel} className="w-full h-3" />
            <span className="text-lg font-semibold text-primary">{progressLevel}%</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">¡Sigue así para alcanzar tus metas académicas!</p>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-headline mb-4">Accesos Directos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item) => (
            <Card key={item.title} className="hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                <item.icon className="h-6 w-6 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={item.href}>
                    Ir ahora <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-headline mb-4">Aprendizaje Activo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningActivities.map((activity) => (
            <Card key={activity.title} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
              {activity.imageSrc && (
                <div className="relative h-48 w-full">
                  <Image
                    src={activity.imageSrc}
                    alt={activity.imageAlt || activity.title}
                    layout="fill"
                    objectFit="cover"
                    data-ai-hint={activity.aiHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <activity.icon className="h-6 w-6 text-primary" />
                  {activity.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full bg-primary hover:bg-primary/90">
                  <Link href={activity.href}>
                    Explorar <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
