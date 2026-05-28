
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
  FileQuestion,
  Pencil,
  Trash2,
  PlusCircle
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import api from "@/lib/api";
import { useSearch } from "@/context/SearchContext";
import { EditModuleModal } from "./components/EditModuleModal";

const modulesMetadata = [
  { id: "1", icon: Database, imageSrc: "https://picsum.photos/seed/dn-mod1-db/600/400", aiHint: "database technology", color: "bg-blue-500" },
  { id: "2", icon: GraduationCap, imageSrc: "https://picsum.photos/seed/dn-mod2-library/600/400", aiHint: "digital library", color: "bg-green-500" },
  { id: "3", icon: SearchIcon, imageSrc: "https://picsum.photos/seed/dn-mod3-search/600/400", aiHint: "web browser", color: "bg-purple-500" },
  { id: "4", icon: PlayCircle, imageSrc: "https://picsum.photos/seed/dn-mod4-boolean/600/400", aiHint: "boolean logic", color: "bg-yellow-500" },
  { id: "5", icon: BrainCircuit, imageSrc: "https://picsum.photos/seed/dn-mod5-ai/600/400", aiHint: "ai robot", color: "bg-violet-500" },
  { id: "6", icon: BookMarked, imageSrc: "https://picsum.photos/seed/dn-mod6-manage/600/400", aiHint: "data organization", color: "bg-emerald-500" },
  { id: "7", icon: CheckSquare, imageSrc: "https://picsum.photos/seed/dn-mod7-eval/600/400", aiHint: "source evaluation", color: "bg-sky-500" },
  { id: "8", icon: ShieldCheck, imageSrc: "https://picsum.photos/seed/dn-mod8-ethics/600/400", aiHint: "ethics law", color: "bg-orange-500" },
  { id: "9", icon: BookOpen, imageSrc: "https://picsum.photos/seed/dn-mod9-app/600/400", aiHint: "academic research", color: "bg-indigo-600" }
];

const seedData = [
  { id: "1", titulo: "Módulo 1: Fundamentos de Bases de Datos e Investigación", descripcion: "Comprender los conceptos básicos de bases de datos y su importancia en la investigación académica.", nivel_dificultad: 1, estado: "Activo", url: "/modulos/1", duracion: 60, imageUrl: "https://picsum.photos/seed/dn-mod1-db/600/400" },
  { id: "2", titulo: "Módulo 2: Acceso e Identificación de Recursos", descripcion: "Aprender a acceder a las bases de datos institucionales.", nivel_dificultad: 2, estado: "Activo", url: "/modulos/2", duracion: 60, imageUrl: "https://picsum.photos/seed/dn-mod2-library/600/400" },
  { id: "3", titulo: "Módulo 3: Navegación y Búsqueda Básica", descripcion: "Realizar búsquedas simples en bases de datos.", nivel_dificultad: 3, estado: "Activo", url: "/modulos/3", duracion: 45, imageUrl: "https://picsum.photos/seed/dn-mod3-search/600/400" },
  { id: "4", titulo: "Módulo 4: Estrategias de Búsqueda Avanzada", descripcion: "Aplicar técnicas avanzadas para mejorar resultados de búsqueda.", nivel_dificultad: 4, estado: "Activo", url: "/modulos/4", duracion: 75, imageUrl: "https://picsum.photos/seed/dn-mod4-boolean/600/400" },
  { id: "5", titulo: "Módulo 5: Inteligencia Artificial en la Búsqueda", descripcion: "Utilizar herramientas de IA para optimizar la búsqueda académica.", nivel_dificultad: 5, estado: "Activo", url: "/modulos/5", duracion: 90, imageUrl: "https://picsum.photos/seed/dn-mod5-ai/600/400" },
  { id: "6", titulo: "Módulo 6: Gestión de la Información", descripcion: "Organizar y almacenar información recuperada.", nivel_dificultad: 6, estado: "Activo", url: "/modulos/6", duracion: 60, imageUrl: "https://picsum.photos/seed/dn-mod6-manage/600/400" },
  { id: "7", titulo: "Módulo 7: Evaluación y Selección de Fuentes", descripcion: "Evaluar la calidad de la información académica.", nivel_dificultad: 7, estado: "Activo", url: "/modulos/7", duracion: 75, imageUrl: "https://picsum.photos/seed/dn-mod7-eval/600/400" },
  { id: "8", titulo: "Módulo 8: Ética y Uso Responsable de la Información", descripcion: "Aplicar principios éticos en el uso de información.", nivel_dificultad: 8, estado: "Activo", url: "/modulos/8", duracion: 60, imageUrl: "https://picsum.photos/seed/dn-mod8-ethics/600/400" },
  { id: "9", titulo: "Módulo 9: Aplicación Práctica en Investigación", descripcion: "Integrar todos los conocimientos en un ejercicio completo.", nivel_dificultad: 9, estado: "Activo", url: "/modulos/9", duracion: 120, imageUrl: "https://picsum.photos/seed/dn-mod9-app/600/400" }
];

const mapDifficulty = (level: number) => {
  if (level <= 3) return 'Básico';
  if (level <= 6) return 'Intermedio';
  return 'Avanzado';
};

export default function ModulosPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const { searchQuery, setSearchQuery } = useSearch();
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const isAdmin = true;

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/modules');
      const fetchedModules = response.data;

      const enrichedModules = fetchedModules.map((backendModule: any) => {
        const metadata = modulesMetadata.find(m => m.id === backendModule.id) || {};
        const IconComponent = metadata.icon || BookOpen;
        return {
          ...backendModule,
          title: backendModule.titulo,
          objective: backendModule.descripcion,
          imageSrc: backendModule.imageUrl || metadata.imageSrc || 'https://picsum.photos/seed/default/600/400',
          difficulty: mapDifficulty(backendModule.nivel_dificultad),
          icon: IconComponent,
          color: metadata.color || 'bg-gray-500',
          aiHint: metadata.aiHint || 'module image',
        };
      });
      setModules(enrichedModules);
    } catch (error) {
      console.error("Error fetching modules:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // ✅ NUEVA LÓGICA AÑADIDA
  // Este useEffect se ejecuta cada vez que la lista de módulos cambia.
  useEffect(() => {
    // Si no hay módulos, no hay nada que hacer.
    if (modules.length === 0) return;

    const fetchAllLessonCounts = async () => {
      // Usamos Promise.all para hacer todas las peticiones en paralelo, es más eficiente.
      const promises = modules.map(module =>
        api.get(`/modules/${module.id}/lessons`)
          .then(response => ({
            id: module.id,
            count: Array.isArray(response.data) ? response.data.length : 0
          }))
          .catch(error => {
            console.warn(`No se pudo obtener el conteo de lecciones para el módulo ${module.id}:`, error);
            // Si hay un error, asignamos 0 para que no se quede cargando.
            return { id: module.id, count: 0 };
          })
      );

      // Esperamos a que todas las promesas se resuelvan.
      const results = await Promise.all(promises);

      // Creamos un nuevo objeto de conteos a partir de los resultados.
      const newCounts = results.reduce((acc, result) => {
        acc[result.id] = result.count;
        return acc;
      }, {} as Record<string, number>);

      // Actualizamos el estado una sola vez con todos los nuevos conteos.
      setLessonCounts(prevCounts => ({ ...prevCounts, ...newCounts }));
    };

    fetchAllLessonCounts();
  }, [modules]); // La dependencia [modules] es crucial.


  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      for (const moduleData of seedData) {
        await api.post('/modules', moduleData);
      }
      alert('¡Base de datos sembrada! Los 9 módulos iniciales han sido creados.');
      fetchModules(); // Re-fetch modules
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Hubo un error al sembrar la base de datos.");
    } finally {
      setIsSeeding(false);
    }
  };
  
  const handleEdit = (module: any) => {
    setSelectedModule(module);
    setEditModalOpen(true);
  };

  const handleSave = async (updatedModule: any) => {
    try {
      const { _id, ...updateData } = updatedModule;
      const response = await api.patch(`/modules/${_id}`, updateData);
      
      // Update the module in the local state
      setModules(modules.map(m => m._id === _id ? { ...m, ...response.data, imageSrc: response.data.imageUrl } : m));
      alert("Módulo actualizado con éxito");
    } catch (error) {
      console.error("Error updating module:", error);
      alert("Error al actualizar el módulo.");
      throw error;
    }
  };

  const handleDelete = async (moduleId: string) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este módulo?")) {
      try {
        await api.delete(`/modules/${moduleId}`);
        setModules(modules.filter(m => m._id !== moduleId));
        alert("Módulo eliminado con éxito.");
      } catch (error) {
        console.error("Error deleting module:", error);
        alert("Error al eliminar el módulo.");
      }
    }
  };

  const filteredModules = useMemo(() => {
    if (!searchQuery) return modules;
    const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedQuery = normalize(searchQuery);
    return modules.filter(module => {
      const normalizedTitle = normalize(module.title);
      const normalizedObjective = normalize(module.objective);
      const normalizedId = normalize(module.id);
      return (
        normalizedTitle.includes(normalizedQuery) || 
        normalizedId.includes(normalizedQuery) ||
        normalizedObjective.includes(normalizedQuery)
      );
    });
  }, [searchQuery, modules]);

  const renderEmptyState = () => {
    if (loading) return null;

    if (modules.length === 0 && isAdmin) {
      return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200">
          <Database className="h-20 w-20 text-slate-200 mb-6" />
          <h3 className="text-2xl font-headline font-bold text-slate-800">No hay módulos en la base de datos</h3>
          <p className="text-muted-foreground mt-2 text-lg">Puedes sembrar la base de datos con los módulos de inicio.</p>
          <Button disabled={isSeeding} onClick={handleSeedDatabase} className="mt-8 rounded-2xl px-8 h-12 text-base">
            {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-5 w-5" />}
            {isSeeding ? 'Sembrando...' : 'Sembrar Módulos de Inicio'}
          </Button>
        </div>
      );
    }
    
    return (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] shadow-sm border border-dashed border-slate-200">
            <FileQuestion className="h-20 w-20 text-slate-200 mb-6" />
            <h3 className="text-2xl font-headline font-bold text-slate-800">No encontramos coincidencias</h3>
            <p className="text-muted-foreground mt-2 text-lg">Intenta con otros términos o números de módulo.</p>
            <Button variant="outline" className="mt-8 rounded-2xl px-8 h-12 text-base" onClick={() => setSearchQuery('')}>
                Ver todos los módulos
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/10 p-3 rounded-2xl"><BookOpenCheck className="h-8 w-8 text-primary" /></div>
        <div>
          <h1 className="text-3xl font-headline">Módulos de Aprendizaje</h1>
          <p className="text-muted-foreground">{searchQuery ? `Resultados para "${searchQuery}"` : "Explora nuestra ruta de formación y desarrolla tus habilidades investigativas."}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>
      ) : filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModules.map((module) => (
            <Card key={module._id} className="flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-500 border-none group rounded-[2.5rem] bg-white shadow-xl shadow-slate-200/50">
              <div className="relative h-56 w-full p-4">
                <div className="relative h-full w-full overflow-hidden rounded-[2rem]">
                  <Image src={module.imageSrc} alt={module.title} fill style={{ objectFit: 'cover' }} data-ai-hint={module.aiHint} className="group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                  <div className={`absolute top-4 left-4 ${module.color} p-3 rounded-2xl shadow-lg shadow-black/20 text-white`}><module.icon className="h-6 w-6" /></div>
                  <div className="absolute top-4 right-4"><Badge className={`${module.difficulty === 'Básico' ? 'bg-emerald-500' : module.difficulty === 'Intermedio' ? 'bg-amber-500' : 'bg-blue-600'} border-none text-[11px] font-bold px-4 py-1.5 rounded-2xl shadow-lg`}>{module.difficulty}</Badge></div>
                </div>
              </div>
              <CardHeader className="pt-2 pb-0 px-8">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-xl font-headline leading-tight line-clamp-2 min-h-[3.5rem]">{module.title}</CardTitle>
                  {isAdmin && (
                    <div className="flex gap-0">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(module)}><Pencil className="h-5 w-5 text-slate-400 hover:text-primary transition-colors" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(module._id)}><Trash2 className="h-5 w-5 text-slate-400 hover:text-destructive transition-colors" /></Button>
                    </div>
                  )}
                </div>
                <CardDescription className="text-sm line-clamp-2 mt-1 leading-relaxed">{module.objective}</CardDescription>
              </CardHeader>
              <CardContent className="px-8 pt-8 pb-4 space-y-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    {lessonCounts[module.id] === undefined ? <Loader2 className="h-3 w-3 animate-spin" /> : `${lessonCounts[module.id] || 0} lecciones`}
                  </div>
                  <div className="flex items-center gap-1.5 text-primary">0% completado</div>
                </div>
                <Progress value={0} className="h-2 bg-slate-100 rounded-full" />
              </CardContent>
              <CardContent className="px-8 pb-8 pt-0 mt-auto">
                <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 text-base font-bold transition-all hover:translate-y-[-2px]">
                  <Link href={`/modulos/${module.id}`} className="flex items-center justify-center gap-2">Comenzar módulo <ArrowRight className="h-5 w-5" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
      {selectedModule && (
        <EditModuleModal 
            module={selectedModule}
            isOpen={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            onSave={handleSave}
        />
      )}
    </div>
  );
}
