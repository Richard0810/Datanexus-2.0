
"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  Video, 
  FileText, 
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
  Type,
  CheckCircle
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
  DialogTrigger,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
  opciones?: string[];
  respuestaCorrecta?: string;
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // States for Dialogs
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  
  const { toast } = useToast();

  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  // Form States
  const [resourceForm, setResourceForm] = useState<Resource>({
    titulo: "",
    descripcion: "",
    url: "",
    unidad: `Módulo ${id}`,
    tipo: "guia",
    formato: "URL"
  });

  const [activityForm, setActivityForm] = useState<Activity>({
    titulo: "",
    descripcion: "",
    tipo: "individual",
    criterios_evaluacion: "",
    moduloId: id,
    archivoUrl: ""
  });

  const [assessmentForm, setAssessmentForm] = useState<Assessment>({
    titulo: "",
    descripcion: "",
    moduloId: id,
    preguntas: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Math.random().toString(36).substr(2, 9),
    texto: "",
    tipo: "opcion-multiple",
    opciones: ["", ""],
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

  // Resource Handlers
  const handleOpenResourceDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setResourceForm(resource);
    } else {
      setEditingResource(null);
      setResourceForm({
        titulo: "",
        descripcion: "",
        url: "",
        unidad: `Módulo ${id}`,
        tipo: "guia",
        formato: "URL"
      });
    }
    setIsResourceDialogOpen(true);
  };

  const handleSaveResource = async () => {
    if (!resourceForm.titulo || !resourceForm.url) {
      toast({ title: "Campos requeridos", description: "El título y la URL/Archivo son obligatorios.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      if (editingResource?._id) {
        await api.patch(`/educational-resources/${editingResource._id}`, resourceForm);
        toast({ title: "Recurso actualizado" });
      } else {
        await api.post("/educational-resources", resourceForm);
        toast({ title: "Recurso creado" });
      }
      setIsResourceDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Activity Handlers
  const handleOpenActivityDialog = (activity?: Activity) => {
    if (activity) {
      setEditingActivity(activity);
      setActivityForm(activity);
    } else {
      setEditingActivity(null);
      setActivityForm({
        titulo: "",
        descripcion: "",
        tipo: "individual",
        criterios_evaluacion: "",
        moduloId: id,
        archivoUrl: ""
      });
    }
    setIsActivityDialogOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!activityForm.titulo || !activityForm.descripcion) {
      toast({ title: "Campos requeridos", description: "Título y descripción son obligatorios.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      if (editingActivity?._id) {
        await api.patch(`/activities/${editingActivity._id}`, activityForm);
        toast({ title: "Actividad actualizada" });
      } else {
        await api.post("/activities", activityForm);
        toast({ title: "Actividad creada" });
      }
      setIsActivityDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  // Assessment Handlers
  const handleOpenAssessmentDialog = (assessment?: Assessment) => {
    if (assessment) {
      setEditingAssessment(assessment);
      setAssessmentForm(assessment);
    } else {
      setEditingAssessment(null);
      setAssessmentForm({
        titulo: "",
        descripcion: "",
        moduloId: id,
        preguntas: []
      });
    }
    setIsAssessmentDialogOpen(true);
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.texto) return;
    setAssessmentForm({
      ...assessmentForm,
      preguntas: [...assessmentForm.preguntas, currentQuestion]
    });
    setCurrentQuestion({
      id: Math.random().toString(36).substr(2, 9),
      texto: "",
      tipo: "opcion-multiple",
      opciones: ["", ""],
      respuestaCorrecta: ""
    });
  };

  const handleRemoveQuestion = (qId: string) => {
    setAssessmentForm({
      ...assessmentForm,
      preguntas: assessmentForm.preguntas.filter(q => q.id !== qId)
    });
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo || assessmentForm.preguntas.length === 0) {
      toast({ title: "Campos requeridos", description: "Añade un título y al menos una pregunta.", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      if (editingAssessment?._id) {
        await api.patch(`/assessments/${editingAssessment._id}`, assessmentForm);
        toast({ title: "Evaluación actualizada" });
      } else {
        await api.post("/assessments", assessmentForm);
        toast({ title: "Evaluación creada" });
      }
      setIsAssessmentDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return "";
    let videoId = "";
    if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/modulos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline">{moduleInfo.title}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {moduleInfo.objective}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="recursos" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:w-[400px] mb-8">
          <TabsTrigger value="recursos" className="flex items-center gap-2">
            <Layers className="h-4 w-4" /> Recursos
          </TabsTrigger>
          <TabsTrigger value="actividades" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Actividades
          </TabsTrigger>
          <TabsTrigger value="evaluaciones" className="flex items-center gap-2">
            <FileQuestion className="h-4 w-4" /> Evaluaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            <Button onClick={() => handleOpenResourceDialog()} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
            </Button>
          </div>
          
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {resources.map((res) => (
                <Card key={res._id} className="overflow-hidden group relative">
                   <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenResourceDialog(res)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                        <DropdownMenuItem onClick={async () => { await api.delete(`/educational-resources/${res._id}`); fetchData(); }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col md:flex-row">
                    {res.tipo === "video" && <div className="md:w-1/3 aspect-video bg-black"><iframe src={getEmbedUrl(res.url)} className="w-full h-full" allowFullScreen /></div>}
                    <div className="p-6 flex-1">
                      <Badge className="mb-2">{res.tipo.toUpperCase()}</Badge>
                      <CardTitle className="text-xl mb-2">{res.titulo}</CardTitle>
                      <CardDescription className="mb-4">{res.descripcion}</CardDescription>
                      <Button asChild variant="outline" size="sm">
                        <a href={res.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Abrir</a>
                      </Button>
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
            <Button onClick={() => handleOpenActivityDialog()} size="sm" className="bg-accent hover:bg-accent/90">
              <PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad
            </Button>
          </div>

          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act) => (
                <Card key={act._id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{act.tipo.toUpperCase()}</Badge>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenActivityDialog(act)}><Pencil className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => { await api.delete(`/activities/${act._id}`); fetchData(); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                    <CardTitle className="mt-2">{act.titulo}</CardTitle>
                    <CardDescription>{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Criterios de Evaluación:</p>
                      <p className="text-sm text-muted-foreground">{act.criterios_evaluacion}</p>
                    </div>
                    {act.archivoUrl && (
                      <div className="p-3 border rounded-md bg-muted/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <LinkIcon className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-xs truncate text-muted-foreground">Material adjunto</span>
                        </div>
                        <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary">
                          <a href={act.archivoUrl} target="_blank" rel="noopener noreferrer">Ver recurso</a>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="outline" className="w-full">
                      <Upload className="mr-2 h-4 w-4" /> Subir Entrega
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay actividades asignadas.</p>}
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones y Quizzes</h2>
            <Button onClick={() => handleOpenAssessmentDialog()} size="sm" variant="default">
              <PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación
            </Button>
          </div>

          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : assessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assessments.map((ass) => (
                <Card key={ass._id} className="hover:border-primary transition-colors cursor-pointer" onClick={() => handleOpenAssessmentDialog(ass)}>
                  <CardHeader>
                    <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                    <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <HelpCircle className="h-4 w-4" /> {ass.preguntas.length} Preguntas
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">Realizar Evaluación</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay evaluaciones configuradas.</p>}
        </TabsContent>
      </Tabs>

      {/* Resource Dialog */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingResource ? "Editar" : "Nuevo"} Recurso</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} /></div>
            <div className="grid gap-2"><Label>URL</Label><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} /></div>
            <div className="grid gap-2">
              <Label>Tipo</Label>
              <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="guia">Guía</SelectItem><SelectItem value="articulo">Artículo</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activity Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingActivity ? "Editar" : "Nueva"} Actividad</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título de la Actividad</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Descripción/Instrucciones</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Criterios de Evaluación</Label><Input value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value})} /></div>
            <div className="grid gap-2">
              <Label>Tipo de Actividad</Label>
              <Select value={activityForm.tipo} onValueChange={v => setActivityForm({...activityForm, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="grupal">Grupal</SelectItem><SelectItem value="investigacion">Investigación</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Material Adjunto</Label>
              <div className="flex gap-2">
                <Input placeholder="URL de apoyo..." value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value})} />
                <Button variant="outline" size="icon"><Upload className="h-4 w-4" /></Button>
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Actividad"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingAssessment ? "Editar" : "Nueva"} Evaluación</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2"><Label>Título de Evaluación</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div>
               <div className="grid gap-2"><Label>Descripción</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2"><HelpCircle className="h-5 w-5" /> Configurar Pregunta</h3>
              <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                <div className="grid gap-2">
                  <Label>Pregunta</Label>
                  <Input value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} placeholder="Escribe el enunciado..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Pregunta</Label>
                    <Select value={currentQuestion.tipo} onValueChange={(v: any) => setCurrentQuestion({...currentQuestion, tipo: v, opciones: v === 'opcion-multiple' ? ["", ""] : []})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opcion-multiple">Opción Múltiple</SelectItem>
                        <SelectItem value="verdadero-falso">Verdadero o Falso</SelectItem>
                        <SelectItem value="escrita">Respuesta Escrita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {currentQuestion.tipo === 'opcion-multiple' && (
                    <div className="grid gap-2">
                      <Label>Opciones (Separar por comas)</Label>
                      <Input placeholder="Opción 1, Opción 2..." onChange={e => setCurrentQuestion({...currentQuestion, opciones: e.target.value.split(',').map(s => s.trim())})} />
                    </div>
                  )}
                  {currentQuestion.tipo === 'verdadero-falso' && (
                     <div className="grid gap-2">
                        <Label>Respuesta Correcta</Label>
                        <Select onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
                          <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                          <SelectContent><SelectItem value="Verdadero">Verdadero</SelectItem><SelectItem value="Falso">Falso</SelectItem></SelectContent>
                        </Select>
                     </div>
                  )}
                </div>
                <Button variant="secondary" onClick={handleAddQuestion} className="w-full"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Pregunta a la Lista</Button>
              </div>
            </div>

            <div className="space-y-3">
               <h3 className="font-bold">Preguntas de la Evaluación ({assessmentForm.preguntas.length})</h3>
               {assessmentForm.preguntas.length === 0 ? <p className="text-sm text-muted-foreground italic">No hay preguntas añadidas.</p> : (
                 <div className="space-y-2">
                   {assessmentForm.preguntas.map((q, idx) => (
                     <div key={q.id} className="flex items-center justify-between p-3 border rounded bg-background">
                       <div className="flex items-center gap-3">
                         <Badge variant="outline">{idx + 1}</Badge>
                         <div>
                           <p className="text-sm font-medium">{q.texto}</p>
                           <p className="text-xs text-muted-foreground">{q.tipo}</p>
                         </div>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => handleRemoveQuestion(q.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveAssessment} disabled={isProcessing} className="w-full">
              {isProcessing ? <Loader2 className="animate-spin" /> : "Finalizar y Guardar Evaluación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
