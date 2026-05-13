"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  MoreVertical,
  Link as LinkIcon,
  Upload,
  ClipboardList,
  FileQuestion,
  Layers,
  HelpCircle,
  Eye,
  Settings2,
  X,
  Check,
  Circle,
  RotateCcw,
  Trophy,
  FileText,
  Video,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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

interface Activity {
  _id?: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  criterios_evaluacion: string;
  moduloId: string;
  archivoUrl?: string;
}

interface Question {
  id: string;
  texto: string;
  tipo: 'opcion-multiple' | 'verdadero-falso' | 'escrita';
  opciones: string[];
  respuestaCorrecta: string;
}

interface Assessment {
  _id?: string;
  titulo: string;
  descripcion: string;
  moduloId: string;
  preguntas: Question[];
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  
  const { toast } = useToast();
  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const [resourceForm, setResourceForm] = useState<Resource>({
    titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL"
  });

  const [activityForm, setActivityForm] = useState<Activity>({
    titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: ""
  });

  const [assessmentForm, setAssessmentForm] = useState<Assessment>({
    titulo: "", descripcion: "", moduloId: id, preguntas: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Math.random().toString(36).substr(2, 9),
    texto: "",
    tipo: "opcion-multiple",
    opciones: ["Opción A", "Opción B"],
    respuestaCorrecta: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse] = await Promise.all([
        api.get("/educational-resources"),
        api.get("/activities"),
        api.get("/assessments")
      ]);
      setResources(resResponse.data.filter((res: any) => res.unidad === `Módulo ${id}`));
      setActivities(actResponse.data.filter((act: any) => act.moduloId === id));
      setAssessments(assResponse.data.filter((ass: any) => ass.moduloId === id));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSaveResource = async () => {
    if (!resourceForm.titulo || !resourceForm.url) return;
    setIsProcessing(true);
    try {
      if (editingResource?._id) await api.patch(`/educational-resources/${editingResource._id}`, resourceForm);
      else await api.post("/educational-resources", resourceForm);
      setIsResourceDialogOpen(false);
      fetchData();
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSaveActivity = async () => {
    if (!activityForm.titulo) return;
    setIsProcessing(true);
    try {
      if (editingActivity?._id) await api.patch(`/activities/${editingActivity._id}`, activityForm);
      else await api.post("/activities", activityForm);
      setIsActivityDialogOpen(false);
      fetchData();
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.texto) {
      toast({ title: "Atención", description: "Escribe el enunciado de la pregunta.", variant: "destructive" });
      return;
    }
    setAssessmentForm({
      ...assessmentForm,
      preguntas: [...assessmentForm.preguntas, currentQuestion]
    });
    setCurrentQuestion({
      id: Math.random().toString(36).substr(2, 9),
      texto: "",
      tipo: "opcion-multiple",
      opciones: ["Opción A", "Opción B"],
      respuestaCorrecta: ""
    });
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      opciones: [...currentQuestion.opciones, `Opción ${String.fromCharCode(65 + currentQuestion.opciones.length)}`]
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = currentQuestion.opciones.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, opciones: newOptions });
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo || assessmentForm.preguntas.length === 0) return;
    setIsProcessing(true);
    try {
      if (editingAssessment?._id) await api.patch(`/assessments/${editingAssessment._id}`, assessmentForm);
      else await api.post("/assessments", assessmentForm);
      setIsAssessmentDialogOpen(false);
      fetchData();
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleGradePreview = () => {
    let correctCount = 0;
    const autoGradableQuestions = assessmentForm.preguntas.filter(q => q.tipo !== 'escrita');
    autoGradableQuestions.forEach(q => {
      if (userAnswers[q.id] === q.respuestaCorrecta) correctCount++;
    });
    setScore({ correct: correctCount, total: autoGradableQuestions.length });
    setShowFeedback(true);
  };

  const handleResetPreview = () => {
    setUserAnswers({});
    setShowFeedback(false);
    setScore(null);
  };

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return "";
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    if (url.includes("gamma.app/docs/")) {
      return url.replace("gamma.app/docs/", "gamma.app/embed/");
    }

    if (url.includes("docs.google.com/presentation/d/")) {
      const fileIdMatch = url.match(/\/d\/(.+?)(\/|$)/);
      if (fileIdMatch) {
        return `https://docs.google.com/presentation/d/${fileIdMatch[1]}/embed?start=false&loop=false&delayms=3000`;
      }
    }

    if (url.includes("drive.google.com/file/d/")) {
      const fileIdMatch = url.match(/\/d\/(.+?)(\/|$)/);
      if (fileIdMatch) {
        return `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
      }
    }

    return url;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon"><Link href="/modulos"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline">{moduleInfo.title}</h1>
              {isAdmin && <Badge className="bg-primary/20 text-primary border-primary/30">Modo Docente</Badge>}
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{moduleInfo.objective}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recursos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px] mb-8">
          <TabsTrigger value="recursos" className="flex items-center gap-2"><Layers className="h-4 w-4" /> Recursos</TabsTrigger>
          <TabsTrigger value="actividades" className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones" className="flex items-center gap-2"><FileQuestion className="h-4 w-4" /> Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && (
              <Button onClick={() => { setEditingResource(null); setIsResourceDialogOpen(true); }} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
              </Button>
            )}
          </div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => (
                <Card key={res._id} className="overflow-hidden group relative shadow-md hover:shadow-lg transition-shadow">
                   {isAdmin && (
                     <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => { await api.delete(`/educational-resources/${res._id}`); fetchData(); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                   )}
                  <div className="flex flex-col">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {res.tipo === "video" ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                        <Badge variant="outline" className="uppercase">{res.tipo}</Badge>
                      </div>
                      <CardTitle className="text-2xl mb-2">{res.titulo}</CardTitle>
                      <CardDescription className="text-base mb-6">{res.descripcion}</CardDescription>
                      
                      <div className="rounded-xl overflow-hidden border bg-black aspect-video w-full mb-4">
                        <iframe 
                          src={getEmbedUrl(res.url)} 
                          className="w-full h-full border-0" 
                          allowFullScreen 
                          title={res.titulo}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button asChild variant="ghost" size="sm" className="text-primary"><a href={res.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Abrir en ventana externa</a></Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay recursos en este módulo.</p>}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Actividades Prácticas</h2>
            {isAdmin && (
              <Button onClick={() => { setEditingActivity(null); setIsActivityDialogOpen(true); }} size="sm" className="bg-accent hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad
              </Button>
            )}
          </div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act) => (
                <Card key={act._id} className="flex flex-col shadow-sm border-t-4 border-t-accent/50 group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{act.tipo.toUpperCase()}</Badge>
                      {isAdmin && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => { await api.delete(`/activities/${act._id}`); fetchData(); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                    <CardTitle className="mt-2">{act.titulo}</CardTitle>
                    <CardDescription className="text-base">{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <Separator />
                    <div>
                      <p className="text-sm font-semibold text-primary mb-1">Criterios de Evaluación:</p>
                      <p className="text-sm text-muted-foreground">{act.criterios_evaluacion}</p>
                    </div>
                    {act.archivoUrl && (
                      <div className="p-4 border rounded-xl bg-primary/5 flex items-center justify-between gap-3 border-primary/20">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <LinkIcon className="h-5 w-5 text-primary shrink-0" />
                          <div className="overflow-hidden">
                             <p className="text-xs font-bold text-primary truncate">Material de referencia</p>
                             <p className="text-[10px] text-muted-foreground truncate">{act.archivoUrl}</p>
                          </div>
                        </div>
                        <Button asChild variant="outline" size="sm" className="h-8 text-xs shrink-0"><a href={act.archivoUrl} target="_blank" rel="noopener noreferrer">Abrir link</a></Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0"><Button variant="default" className="w-full bg-accent hover:bg-accent/90"><Upload className="mr-2 h-4 w-4" /> Subir Entrega</Button></CardFooter>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay actividades asignadas.</p>}
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones y Quizzes</h2>
            {isAdmin && (
              <Button onClick={() => { setEditingAssessment(null); setViewMode('edit'); handleResetPreview(); setIsAssessmentDialogOpen(true); }} size="sm" variant="default">
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación
              </Button>
            )}
          </div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : assessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assessments.map((ass) => (
                <Card key={ass._id} className="hover:border-primary transition-colors cursor-pointer group relative shadow-md">
                   {isAdmin && (
                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); handleResetPreview(); setIsAssessmentDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async (e) => { e.stopPropagation(); await api.delete(`/assessments/${ass._id}`); fetchData(); }}><Trash2 className="h-4 w-4" /></Button>
                     </div>
                   )}
                  <CardHeader>
                    <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                    <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground"><HelpCircle className="h-4 w-4 text-primary" /> {ass.preguntas.length} Preguntas</div></CardContent>
                  <CardFooter><Button className="w-full" variant="outline" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('preview'); handleResetPreview(); setIsAssessmentDialogOpen(true); }}>Comenzar Test</Button></CardFooter>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay evaluaciones configuradas.</p>}
        </TabsContent>
      </Tabs>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle className="text-2xl font-headline">{editingResource ? "Editar" : "Nuevo"} Recurso Educativo</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} placeholder="Ej: Guía de Operadores Booleanos" /></div>
            <div className="grid gap-2"><Label>Descripción Corta</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} placeholder="Describe de qué trata este material..." /></div>
            <div className="grid gap-2"><Label>Enlace (Link)</Label><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="Pega el link de YouTube, Gamma o Drive..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Tipo de Recurso</Label>
                <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="video">Video Tutorial</SelectItem><SelectItem value="guia">Guía Interactiva</SelectItem><SelectItem value="articulo">Artículo / PDF</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Formato</Label><Input value={resourceForm.formato} onChange={e => setResourceForm({...resourceForm, formato: e.target.value})} placeholder="Ej: MP4, Gamma App, Web" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing} className="w-full">{isProcessing ? <Loader2 className="animate-spin" /> : "Publicar Recurso"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingActivity ? "Editar" : "Nueva"} Actividad Práctica</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Instrucciones Detalladas</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} rows={5}/></div>
            <div className="grid gap-2"><Label>Criterios de Evaluación</Label><Input value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Material de Referencia (Link Drive/Gamma)</Label><Input placeholder="Pega el link aquí..." value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing} className="w-full">{isProcessing ? <Loader2 className="animate-spin" /> : "Crear Actividad"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-2xl font-headline">
                {viewMode === 'edit' ? 'Gestor de Evaluaciones' : 'Realizar Evaluación'}
              </DialogTitle>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant={viewMode === 'edit' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('edit')}><Settings2 className="mr-2 h-4 w-4" /> Configurar</Button>
                  <Button variant={viewMode === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => { setViewMode('preview'); handleResetPreview(); }}><Eye className="mr-2 h-4 w-4" /> Vista Previa</Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {viewMode === 'edit' && isAdmin ? (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2"><Label>Nombre del Examen</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div>
                 <div className="grid gap-2"><Label>Breve Introducción</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div>
              </div>
              <Separator />
              <div className="p-5 border rounded-2xl bg-muted/20 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-primary"><PlusCircle className="h-5 w-5" /> Añadir Pregunta</h3>
                <div className="grid gap-2"><Label>Enunciado</Label><Input value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} /></div>
                <div className="grid gap-2">
                  <Label>Tipo de Respuesta</Label>
                  <Select value={currentQuestion.tipo} onValueChange={(v: any) => setCurrentQuestion({...currentQuestion, tipo: v, opciones: v === 'opcion-multiple' ? ["Opción A", "Opción B"] : [], respuestaCorrecta: ""})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="opcion-multiple">Opción Múltiple</SelectItem><SelectItem value="verdadero-falso">Verdadero o Falso</SelectItem><SelectItem value="escrita">Respuesta Abierta</SelectItem></SelectContent>
                  </Select>
                </div>
                {currentQuestion.tipo === 'opcion-multiple' && (
                  <div className="space-y-3">
                    <Label className="text-xs text-muted-foreground uppercase">Opciones (Marca el círculo de la correcta)</Label>
                    <RadioGroup value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
                      <div className="space-y-2">
                        {currentQuestion.opciones.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <RadioGroupItem value={opt} />
                            <Input value={opt} onChange={e => {
                                const newOpts = [...currentQuestion.opciones];
                                newOpts[idx] = e.target.value;
                                setCurrentQuestion({...currentQuestion, opciones: newOpts});
                            }} className="flex-1" />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)} disabled={currentQuestion.opciones.length <= 2}><X className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full border-dashed"><PlusCircle className="mr-2 h-4 w-4" /> Agregar Opción</Button>
                  </div>
                )}
                {currentQuestion.tipo === 'verdadero-falso' && (
                  <div className="grid gap-2">
                    <Label>Respuesta Correcta</Label>
                    <Select value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="Verdadero">Verdadero</SelectItem><SelectItem value="Falso">Falso</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}
                <Button variant="default" onClick={handleAddQuestion} className="w-full shadow-lg">Confirmar Pregunta</Button>
              </div>
              <div className="space-y-3">
                 <h3 className="font-bold">Lista de Preguntas ({assessmentForm.preguntas.length})</h3>
                 <div className="space-y-2">
                   {assessmentForm.preguntas.map((q, idx) => (
                     <div key={q.id} className="flex items-center justify-between p-3 border rounded-xl bg-background shadow-sm">
                       <div className="flex items-center gap-3">
                         <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center font-bold">{idx + 1}</Badge>
                         <p className="text-sm font-medium">{q.texto}</p>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => setAssessmentForm({...assessmentForm, preguntas: assessmentForm.preguntas.filter(p => p.id !== q.id)})}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                     </div>
                   ))}
                 </div>
              </div>
              <DialogFooter><Button onClick={handleSaveAssessment} disabled={isProcessing} className="w-full font-bold h-12">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Evaluación"}</Button></DialogFooter>
            </div>
          ) : (
            <div className="py-6 space-y-8">
              <div className="border-b pb-6">
                 <h2 className="text-2xl font-bold text-primary">{assessmentForm.titulo}</h2>
                 <p className="text-muted-foreground">{assessmentForm.descripcion}</p>
                 {score && <div className="mt-4 p-4 bg-primary/10 rounded-xl flex items-center justify-between"><span className="font-bold flex items-center gap-2"><Trophy className="h-5 w-5 text-primary" /> Resultados:</span><Badge className="text-lg px-4">{score.correct} / {score.total}</Badge></div>}
              </div>
              {assessmentForm.preguntas.map((q, idx) => (
                <div key={q.id} className="space-y-4">
                  <p className="text-lg font-bold flex gap-3"><span className="text-primary">{idx + 1}.</span> {q.texto}</p>
                  <div className="pl-8">
                    {q.tipo === 'opcion-multiple' && (
                      <RadioGroup value={userAnswers[q.id]} onValueChange={v => !showFeedback && setUserAnswers({...userAnswers, [q.id]: v})} className="space-y-2">
                        {q.opciones.map((opt, i) => (
                          <div key={i} className={cn("flex items-center space-x-3 p-3 border rounded-xl transition-colors", 
                            showFeedback && q.respuestaCorrecta === opt ? "bg-green-100 border-green-500" : 
                            showFeedback && userAnswers[q.id] === opt && q.respuestaCorrecta !== opt ? "bg-red-100 border-red-500" : "hover:bg-muted/50")}>
                            <RadioGroupItem value={opt} id={`q${idx}o${i}`} disabled={showFeedback} />
                            <Label htmlFor={`q${idx}o${i}`} className="flex-1 flex items-center justify-between cursor-pointer">{opt} {showFeedback && q.respuestaCorrecta === opt && <Check className="h-4 w-4 text-green-600"/>}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {q.tipo === 'verdadero-falso' && (
                      <div className="flex gap-4">
                         {['Verdadero', 'Falso'].map(val => (
                           <Button key={val} variant={userAnswers[q.id] === val ? 'default' : 'outline'} className="flex-1" onClick={() => !showFeedback && setUserAnswers({...userAnswers, [q.id]: val})} disabled={showFeedback}>{val}</Button>
                         ))}
                      </div>
                    )}
                    {q.tipo === 'escrita' && <Textarea placeholder="Tu respuesta..." value={userAnswers[q.id] || ""} onChange={e => !showFeedback && setUserAnswers({...userAnswers, [q.id]: e.target.value})} disabled={showFeedback} />}
                  </div>
                </div>
              ))}
              <div className="pt-6 border-t flex gap-4">
                {!showFeedback ? <Button className="flex-1 h-12 font-bold" onClick={handleGradePreview}>Finalizar y Calificar</Button> : <Button variant="outline" className="flex-1 h-12" onClick={handleResetPreview}><RotateCcw className="mr-2 h-4 w-4" /> Reintentar</Button>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
