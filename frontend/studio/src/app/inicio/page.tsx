
'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Database, Lightbulb, PlayCircle, GraduationCap, Search, BrainCircuit, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { api } from '@/lib/api';
import type { Module } from '@/lib/api';

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
  description: string;
  imageUrl: string;
}

const quickAccessItems: QuickAccessItem[] = [
  { title: "Búsqueda Asistida", href: "/herramientas-ia", icon: Search, description: "Usa IA para refinar tus búsquedas académicas." },
  { title: "Pregunta PICO/PECO", href: "/herramientas-ia#pico-peco", icon: Lightbulb, description: "Estructura tus preguntas de investigación." },
  { title: "Simulador de BD", href: "/simulador", icon: Database, description: "Practica en entornos académicos controlados." },
  { title: "IA en Búsqueda", href: "/modulos/5", icon: BrainCircuit, description: "Aprende a optimizar búsquedas con IA." },
];

const iconMap: { [key: string]: React.ElementType } = {
  "Módulo 1: Fundamentos": Database,
  "Módulo 4: Estrategias": PlayCircle,
  "Módulo 5: IA Académica": BrainCircuit,
  "Módulo 8: Ética e IA": ShieldCheck,
};

export default function HomePage() {
  const { user } = useAuth();
  const userName = user?.name || "Estudiante";
  const progressLevel = 35;
  const [learningActivities, setLearningActivities] = useState<LearningActivityItem[]>([]);

  useEffect(() => {
    const fetchHomePageModules = async () => {
      try {
        const response = await api.getModules();
        const allModules: Module[] = response.data;
        
        const requiredModuleTitles = [
          "Módulo 1: Fundamentos",
          "Módulo 4: Estrategias",
          "Módulo 5: IA Académica",
          "Módulo 8: Ética e IA"
        ];

        const homePageModules = allModules
          .filter(module => requiredModuleTitles.includes(module.title))
          .map((module): LearningActivityItem => ({
            title: module.title,
            href: `/modulos/${module.title.split(' ')[1].replace(':', '')}`,
            description: module.description,
            icon: iconMap[module.title] || Lightbulb,
            imageUrl: module.imageUrl,
          }));

        setLearningActivities(homePageModules);
      } catch (error) {
        console.error("Error fetching modules for home page:", error);
      }
    };

    fetchHomePageModules();
  }, []);

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-br from-primary/20 via-background to-accent/20">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">¡Bienvenido de nuevo, {userName}!</CardTitle>
          <CardDescription className="text-lg">Tu camino hacia la maestría informacional está en marcha.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={progressLevel} className="w-full h-3" />
            <span className="text-lg font-bold text-primary">{progressLevel}%</span>
          </div>
        </CardContent>
      </Card>

      <section>
        <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-accent" />
          Herramientas Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickAccessItems.map((item) => (
            <Card key={item.title} className="hover:shadow-xl transition-all duration-300 border-none bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{item.title}</CardTitle>
                <item.icon className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 h-[40px]">{item.description}</p>
                <Button asChild variant="ghost" size="sm" className="w-full text-primary hover:text-primary hover:bg-primary/10">
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
        <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Ruta de Aprendizaje Personalizada
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningActivities.map((activity) => (
            <Card key={activity.title} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none group">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={activity.imageUrl}
                  alt={activity.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">{activity.description}</p>
                </div>
              </div>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-xl font-headline">
                  <activity.icon className="h-6 w-6 text-primary" />
                  {activity.title}
                </CardTitle>
                <Button asChild variant="outline" size="icon" className="rounded-full">
                   <Link href={activity.href}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
