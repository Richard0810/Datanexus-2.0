
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
  Circle
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
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  
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
    if (currentQuestion.tipo === 'opcion-multiple' && currentQuestion.opciones.some(o => !o)) {
      toast({ title: "Atención", description: "Todas las opciones deben tener texto.", variant: "destructive" });
      return;
    }
    if (currentQuestion.tipo !== 'escrita' && !currentQuestion.respuestaCorrecta) {
      toast({ title: "Atención", description: "Debes marcar la respuesta correcta.", variant: "destructive" });
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
          <Button asChild variant="ghost" size="icon"><Link href="/modulos"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <h1 className="text-3xl font-headline">{moduleInfo.title}</h1>
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
          <div className="flex justify-between items-center"><h2 className="text-xl font-headline">Materiales de Estudio</h2><Button onClick={() => { setEditingResource(null); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso</Button></div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {resources.map((res) => (
                <Card key={res._id} className="overflow-hidden group relative">
                   <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
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
                      <Button asChild variant="outline" size="sm"><a href={res.url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Abrir</a></Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay recursos en este módulo.</p>}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center"><h2 className="text-xl font-headline">Actividades Prácticas</h2><Button onClick={() => { setEditingActivity(null); setIsActivityDialogOpen(true); }} size="sm" className="bg-accent hover:bg-accent/90"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad</Button></div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : activities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.map((act) => (
                <Card key={act._id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{act.tipo.toUpperCase()}</Badge>
                      <div className="flex gap-2">
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
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
                        <div className="flex items-center gap-2 overflow-hidden"><LinkIcon className="h-4 w-4 text-primary shrink-0" /><span className="text-xs truncate text-muted-foreground">Material adjunto</span></div>
                        <Button asChild variant="link" size="sm" className="h-auto p-0 text-primary"><a href={act.archivoUrl} target="_blank" rel="noopener noreferrer">Ver recurso</a></Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0"><Button variant="outline" className="w-full"><Upload className="mr-2 h-4 w-4" /> Subir Entrega</Button></CardFooter>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay actividades asignadas.</p>}
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center"><h2 className="text-xl font-headline">Evaluaciones y Quizzes</h2><Button onClick={() => { setEditingAssessment(null); setViewMode('edit'); setIsAssessmentDialogOpen(true); }} size="sm" variant="default"><PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación</Button></div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : assessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {assessments.map((ass) => (
                <Card key={ass._id} className="hover:border-primary transition-colors cursor-pointer group relative">
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async (e) => { e.stopPropagation(); await api.delete(`/assessments/${ass._id}`); fetchData(); }}><Trash2 className="h-4 w-4" /></Button>
                   </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                    <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent><div className="flex items-center gap-2 text-sm text-muted-foreground"><HelpCircle className="h-4 w-4" /> {ass.preguntas.length} Preguntas</div></CardContent>
                  <CardFooter><Button className="w-full" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('preview'); setIsAssessmentDialogOpen(true); }}>Realizar Evaluación</Button></CardFooter>
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
            <div className="grid gap-2"><Label>Material Adjunto (URL Drive/Gamma)</Label><Input placeholder="URL..." value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Actividad"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assessment Dialog */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-2xl">{editingAssessment ? "Gestionar" : "Crear"} Evaluación</DialogTitle>
              <div className="flex gap-2">
                <Button variant={viewMode === 'edit' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('edit')}><Settings2 className="mr-2 h-4 w-4" /> Editor</Button>
                <Button variant={viewMode === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('preview')}><Eye className="mr-2 h-4 w-4" /> Previsualizar</Button>
              </div>
            </div>
          </DialogHeader>

          {viewMode === 'edit' ? (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2"><Label>Título</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div>
                 <div className="grid gap-2"><Label>Descripción</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div>
              </div>
              
              <Separator />
              
              <div className="p-4 border rounded-xl bg-muted/20 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-primary"><PlusCircle className="h-5 w-5" /> Nueva Pregunta</h3>
                <div className="grid gap-2">
                  <Label>Enunciado</Label>
                  <Input value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} placeholder="Ej: ¿Qué es una base de datos relacional?" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Tipo de Pregunta</Label>
                    <Select value={currentQuestion.tipo} onValueChange={(v: any) => setCurrentQuestion({...currentQuestion, tipo: v, opciones: v === 'opcion-multiple' ? ["", ""] : [], respuestaCorrecta: ""})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opcion-multiple">Opción Múltiple</SelectItem>
                        <SelectItem value="verdadero-falso">Verdadero o Falso</SelectItem>
                        <SelectItem value="escrita">Respuesta Escrita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {currentQuestion.tipo === 'opcion-multiple' && (
                  <div className="space-y-3">
                    <Label>Opciones de respuesta (Marca la correcta)</Label>
                    <RadioGroup value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
                      <div className="space-y-2">
                        {currentQuestion.opciones.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <RadioGroupItem value={opt} id={`opt-${idx}`} disabled={!opt} />
                            <Input 
                              placeholder={`Opción ${idx + 1}`} 
                              value={opt} 
                              onChange={e => {
                                const newOpts = [...currentQuestion.opciones];
                                newOpts[idx] = e.target.value;
                                setCurrentQuestion({...currentQuestion, opciones: newOpts});
                              }}
                              className="flex-1"
                            />
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)} disabled={currentQuestion.opciones.length <= 2}><X className="h-4 w-4" /></Button>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                    <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Opción</Button>
                  </div>
                )}

                {currentQuestion.tipo === 'verdadero-falso' && (
                  <div className="grid gap-2">
                    <Label>Respuesta Correcta</Label>
                    <Select value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
                      <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                      <SelectContent><SelectItem value="Verdadero">Verdadero</SelectItem><SelectItem value="Falso">Falso</SelectItem></SelectContent>
                    </Select>
                  </div>
                )}

                <Button variant="secondary" onClick={handleAddQuestion} className="w-full font-bold">Añadir Pregunta a la Evaluación</Button>
              </div>

              <div className="space-y-3">
                 <h3 className="font-bold flex items-center gap-2">Preguntas Añadidas <Badge variant="secondary">{assessmentForm.preguntas.length}</Badge></h3>
                 <div className="space-y-2">
                   {assessmentForm.preguntas.map((q, idx) => (
                     <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-background shadow-sm">
                       <div className="flex items-center gap-3">
                         <span className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                         <div>
                           <p className="text-sm font-medium">{q.texto}</p>
                           <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px] h-4">{q.tipo.replace('-', ' ')}</Badge>
                              {q.respuestaCorrecta && <Badge variant="secondary" className="text-[10px] h-4 bg-green-100 text-green-700">Correcta: {q.respuestaCorrecta}</Badge>}
                           </div>
                         </div>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => setAssessmentForm({...assessmentForm, preguntas: assessmentForm.preguntas.filter(p => p.id !== q.id)})}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                     </div>
                   ))}
                 </div>
              </div>
              <DialogFooter><Button onClick={handleSaveAssessment} disabled={isProcessing} className="w-full">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Evaluación Completa"}</Button></DialogFooter>
            </div>
          ) : (
            /* Modo Previsualización */
            <div className="py-6 space-y-8">
              <div className="border-b pb-4">
                <h2 className="text-xl font-bold">{assessmentForm.titulo || "Evaluación sin título"}</h2>
                <p className="text-muted-foreground">{assessmentForm.descripcion || "Sin descripción."}</p>
              </div>

              {assessmentForm.preguntas.length === 0 ? (
                <div className="text-center py-20 bg-muted/10 border rounded-xl border-dashed">
                  <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground italic">No has añadido ninguna pregunta todavía.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {assessmentForm.preguntas.map((q, idx) => (
                    <Card key={q.id} className="border-none shadow-none">
                      <CardHeader className="p-0 mb-4">
                        <div className="flex items-start gap-3">
                          <span className="mt-1 flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{idx + 1}</span>
                          <h4 className="text-lg font-medium">{q.texto}</h4>
                        </div>
                      </CardHeader>
                      <CardContent className="p-0 pl-11">
                        {q.tipo === 'opcion-multiple' && (
                          <RadioGroup className="space-y-3">
                            {q.opciones.map((opt, i) => (
                              <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                                <RadioGroupItem value={opt} id={`q-${idx}-opt-${i}`} />
                                <Label htmlFor={`q-${idx}-opt-${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        {q.tipo === 'verdadero-falso' && (
                          <div className="flex gap-4">
                            <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700">Verdadero</Button>
                            <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-500 hover:text-red-700">Falso</Button>
                          </div>
                        )}
                        {q.tipo === 'escrita' && (
                          <Textarea placeholder="Escribe tu respuesta aquí..." className="min-h-[120px] resize-none" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  <div className="p-6 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                    <div>
                      <p className="font-bold">¡Has terminado la previsualización!</p>
                      <p className="text-sm text-muted-foreground">Esta es la vista que verán tus alumnos.</p>
                    </div>
                    <Button onClick={() => setViewMode('edit')}>Volver al Editor</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
