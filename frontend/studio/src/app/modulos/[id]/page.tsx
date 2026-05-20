
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
  ShieldCheck,
  History,
  MessageSquare
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Submission {
  _id: string;
  usuarioNombre: string;
  usuarioEmail: string;
  tipoEnvio: string;
  tituloContenido: string;
  detalleEnvio: string;
  puntaje: number;
  estado: string;
  createdAt: string;
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'administrador';
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activitySubmissionText, setActivitySubmissionText] = useState("");
  
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

      if (isAdmin) {
        const subResponse = await api.get("/performance-reports");
        setSubmissions(subResponse.data.filter((sub: any) => sub.moduloId === id));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  const handleSaveResource = async () => {
    if (!resourceForm.titulo || !resourceForm.url) return;
    setIsProcessing(true);
    try {
      if (editingResource?._id) await api.patch(`/educational-resources/${editingResource._id}`, resourceForm);
      else await api.post("/educational-resources", resourceForm);
      setIsResourceDialogOpen(false);
      fetchData();
      toast({ title: "Recurso guardado" });
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
      toast({ title: "Actividad guardada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity || !activitySubmissionText) return;
    setIsProcessing(true);
    try {
      await api.post("/performance-reports", {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        tipoEnvio: "actividad",
        moduloId: id,
        tituloContenido: selectedActivity.titulo,
        detalleEnvio: activitySubmissionText,
        estado: "enviado"
      });
      setIsSubmitActivityOpen(false);
      setActivitySubmissionText("");
      toast({ title: "Actividad enviada con éxito", description: "El docente revisará tu entrega pronto." });
      if (isAdmin) fetchData();
    } catch (error) {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGradeAssessment = async () => {
    let correctCount = 0;
    const autoGradableQuestions = assessmentForm.preguntas.filter(q => q.tipo !== 'escrita');
    autoGradableQuestions.forEach(q => {
      if (userAnswers[q.id] === q.respuestaCorrecta) correctCount++;
    });
    
    const finalScore = { correct: correctCount, total: autoGradableQuestions.length };
    setScore(finalScore);
    setShowFeedback(true);

    // Guardar resultado siempre para seguimiento
    try {
      await api.post("/performance-reports", {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        tipoEnvio: "evaluacion",
        moduloId: id,
        tituloContenido: assessmentForm.titulo,
        detalleEnvio: JSON.stringify(userAnswers),
        puntaje: autoGradableQuestions.length > 0 ? (correctCount / autoGradableQuestions.length) * 10 : 0,
        estado: "completado"
      });
      toast({ title: "Evaluación enviada", description: "Tus respuestas han sido registradas." });
      if (isAdmin) fetchData();
    } catch (e) {
      console.error("Error saving assessment result:", e);
      toast({ title: "Error al registrar", variant: "destructive" });
    }
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
      toast({ title: "Evaluación guardada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
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
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");
    if (url.includes("docs.google.com/presentation/d/")) {
      const match = url.match(/\/d\/(.+?)(\/|$)/);
      return match ? `https://docs.google.com/presentation/d/${match[1]}/embed` : url;
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
        <TabsList className={cn("grid w-full mb-8", isAdmin ? "grid-cols-4 md:w-[600px]" : "grid-cols-3 md:w-[450px]")}>
          <TabsTrigger value="recursos" className="flex items-center gap-2"><Layers className="h-4 w-4" /> Recursos</TabsTrigger>
          <TabsTrigger value="actividades" className="flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones" className="flex items-center gap-2"><FileQuestion className="h-4 w-4" /> Evaluaciones</TabsTrigger>
          {isAdmin && <TabsTrigger value="seguimiento" className="flex items-center gap-2 text-accent"><History className="h-4 w-4" /> Seguimiento</TabsTrigger>}
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && (
              <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setIsResourceDialogOpen(true); }} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
              </Button>
            )}
          </div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => (
                <Card key={res._id} className="overflow-hidden group relative shadow-md">
                   {isAdmin && (
                     <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={async () => { if(confirm('¿Seguro?')) { await api.delete(`/educational-resources/${res._id}`); fetchData(); } }} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                   )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {res.tipo === "video" ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                      <Badge variant="outline" className="uppercase">{res.tipo}</Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{res.titulo}</CardTitle>
                    <CardDescription className="text-base mb-6">{res.descripcion}</CardDescription>
                    <div className="rounded-xl overflow-hidden border bg-black aspect-video w-full mb-4 shadow-inner">
                      <iframe src={getEmbedUrl(res.url)} className="w-full h-full border-0" allowFullScreen />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-10 text-muted-foreground italic">No hay recursos disponibles.</p>}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Actividades Prácticas</h2>
            {isAdmin && (
              <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); setIsActivityDialogOpen(true); }} size="sm" className="bg-accent hover:bg-accent/90">
                <PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => (
              <Card key={act._id} className="flex flex-col shadow-sm border-t-4 border-t-accent/50 group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">{act.tipo.toUpperCase()}</Badge>
                    {isAdmin && (
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={async () => { if(confirm('¿Seguro?')) { await api.delete(`/activities/${act._id}`); fetchData(); } }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                  <CardTitle className="mt-2">{act.titulo}</CardTitle>
                  <CardDescription>{act.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <Separator />
                  <p className="text-sm"><strong>Criterios:</strong> {act.criterios_evaluacion}</p>
                </CardContent>
                <CardFooter>
                  {!isAdmin && <Button variant="default" className="w-full bg-accent hover:bg-accent/90" onClick={() => { setSelectedActivity(act); setIsSubmitActivityOpen(true); }}><Upload className="mr-2 h-4 w-4" /> Entregar Tarea</Button>}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setViewMode('edit'); setIsAssessmentDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((ass) => (
              <Card key={ass._id} className="hover:border-primary transition-all cursor-pointer group shadow-md relative" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode(isAdmin ? 'edit' : 'preview'); handleResetPreview(); setIsAssessmentDialogOpen(true); }}>
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button variant="secondary" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="secondary" size="icon" className="h-7 w-7 text-destructive" onClick={async (e) => { e.stopPropagation(); if(confirm('¿Seguro?')) { await api.delete(`/assessments/${ass._id}`); fetchData(); } }}><Trash2 className="h-3 w-3" /></Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                  <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                </CardHeader>
                <CardContent><div className="text-sm text-muted-foreground flex items-center gap-2"><HelpCircle className="h-4 w-4" /> {ass.preguntas.length} Preguntas</div></CardContent>
                <CardFooter><Button className="w-full" variant="outline">Entrar</Button></CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-accent" /> Panel de Revisión</CardTitle>
                <CardDescription>Revisa los envíos y resultados de tus estudiantes para este módulo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contenido</TableHead>
                      <TableHead>Puntaje</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="font-medium">{sub.usuarioNombre}</TableCell>
                        <TableCell><Badge variant="outline">{sub.tipoEnvio.toUpperCase()}</Badge></TableCell>
                        <TableCell>{sub.tituloContenido}</TableCell>
                        <TableCell>{sub.puntaje !== undefined ? <Badge className={cn("px-2", sub.puntaje >= 7 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>{sub.puntaje.toFixed(1)}/10</Badge> : "N/A"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            let detail = sub.detalleEnvio;
                            try {
                              const parsed = JSON.parse(detail);
                              detail = Object.entries(parsed).map(([k, v]) => `P:${k} -> R:${v}`).join('\n');
                            } catch(e) {}
                            alert(`Envío de ${sub.usuarioNombre}:\n\n${detail}`);
                          }}>Ver Detalle</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">Aún no hay envíos registrados.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Diálogos de Edición y Envío */}
      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Entregar: {selectedActivity?.titulo}</DialogTitle><DialogDescription>Pega el enlace de tu trabajo (Drive, Gamma, etc.) o escribe tu respuesta.</DialogDescription></DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea placeholder="Escribe aquí tu respuesta o enlace..." value={activitySubmissionText} onChange={e => setActivitySubmissionText(e.target.value)} rows={6} />
          </div>
          <DialogFooter><Button onClick={handleSubmitActivity} disabled={isProcessing} className="w-full">{isProcessing ? <Loader2 className="animate-spin" /> : "Enviar Entrega"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingResource ? "Editar" : "Nuevo"} Recurso</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} /></div>
            <div className="grid gap-2"><Label>URL</Label><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tipo</Label>
                <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="video">Video</SelectItem><SelectItem value="guia">Guía</SelectItem><SelectItem value="articulo">Artículo</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Formato</Label><Input value={resourceForm.formato} onChange={e => setResourceForm({...resourceForm, formato: e.target.value})} /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing} className="w-full">Guardar Recurso</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingActivity ? "Editar" : "Nueva"} Actividad</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Instrucciones</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} rows={4}/></div>
            <div className="grid gap-2"><Label>Criterios de Evaluación</Label><Input value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value})} /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing} className="w-full">Guardar Actividad</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <DialogTitle className="text-2xl font-headline">{viewMode === 'edit' ? 'Gestor de Examen' : 'Evaluación'}</DialogTitle>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant={viewMode === 'edit' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('edit')}><Settings2 className="mr-2 h-4 w-4" /> Editar</Button>
                  <Button variant={viewMode === 'preview' ? 'default' : 'outline'} size="sm" onClick={() => { setViewMode('preview'); handleResetPreview(); }}><Eye className="mr-2 h-4 w-4" /> Previsualizar</Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {viewMode === 'edit' ? (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-2"><Label>Título</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div>
                 <div className="grid gap-2"><Label>Descripción</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div>
              </div>
              <Separator />
              <div className="p-5 border rounded-2xl bg-muted/20 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-primary"><PlusCircle className="h-5 w-5" /> Nueva Pregunta</h3>
                <div className="grid gap-2"><Label>Enunciado</Label><Input value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} /></div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={currentQuestion.tipo} onValueChange={(v: any) => setCurrentQuestion({...currentQuestion, tipo: v, opciones: v === 'opcion-multiple' ? ["Opción A", "Opción B"] : [], respuestaCorrecta: ""})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="opcion-multiple">Opción Múltiple</SelectItem><SelectItem value="verdadero-falso">Verdadero o Falso</SelectItem><SelectItem value="escrita">Abierta</SelectItem></SelectContent>
                  </Select>
                </div>
                {currentQuestion.tipo === 'opcion-multiple' && (
                  <div className="space-y-3">
                    <RadioGroup value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
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
                    </RadioGroup>
                    <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full">Agregar Opción</Button>
                  </div>
                )}
                {currentQuestion.tipo === 'verdadero-falso' && (
                  <div className="space-y-3">
                    <Label>Respuesta Correcta</Label>
                    <RadioGroup value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})}>
                      <div className="flex items-center gap-2"><RadioGroupItem value="Verdadero" /><Label>Verdadero</Label></div>
                      <div className="flex items-center gap-2"><RadioGroupItem value="Falso" /><Label>Falso</Label></div>
                    </RadioGroup>
                  </div>
                )}
                <Button variant="default" onClick={handleAddQuestion} className="w-full">Agregar Pregunta</Button>
              </div>

              {assessmentForm.preguntas.length > 0 && (
                <div className="space-y-2">
                  <Label>Preguntas actualizadas ({assessmentForm.preguntas.length})</Label>
                  <div className="space-y-2">
                    {assessmentForm.preguntas.map((q, i) => (
                      <div key={q.id} className="flex items-center justify-between p-2 border rounded text-sm">
                        <span>{i+1}. {q.texto} ({q.tipo})</span>
                        <Button variant="ghost" size="icon" onClick={() => setAssessmentForm({...assessmentForm, preguntas: assessmentForm.preguntas.filter(item => item.id !== q.id)})}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter><Button onClick={handleSaveAssessment} disabled={isProcessing} className="w-full">Guardar Evaluación Completa</Button></DialogFooter>
            </div>
          ) : (
            <div className="py-6 space-y-8">
              <div className="border-b pb-6">
                 <h2 className="text-2xl font-bold text-primary">{assessmentForm.titulo}</h2>
                 <p className="text-muted-foreground">{assessmentForm.descripcion}</p>
                 {score && <div className="mt-4 p-4 bg-primary/10 rounded-xl flex items-center justify-between"><span className="font-bold">Resultado:</span><Badge className="text-lg px-4">{score.correct} / {score.total}</Badge></div>}
              </div>
              {assessmentForm.preguntas.map((q, idx) => (
                <div key={q.id} className="space-y-4">
                  <p className="text-lg font-bold">{idx + 1}. {q.texto}</p>
                  <div className="pl-4">
                    {q.tipo === 'opcion-multiple' && (
                      <RadioGroup value={userAnswers[q.id]} onValueChange={v => !showFeedback && setUserAnswers({...userAnswers, [q.id]: v})} className="space-y-2">
                        {q.opciones.map((opt, i) => (
                          <div key={i} className={cn("flex items-center space-x-3 p-3 border rounded-xl", 
                            showFeedback && q.respuestaCorrecta === opt ? "bg-green-100 border-green-500" : 
                            showFeedback && userAnswers[q.id] === opt && q.respuestaCorrecta !== opt ? "bg-red-100 border-red-500" : "hover:bg-muted/50")}>
                            <RadioGroupItem value={opt} id={`q${idx}o${i}`} disabled={showFeedback} />
                            <Label htmlFor={`q${idx}o${i}`} className="flex-1 cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {q.tipo === 'verdadero-falso' && (
                      <div className="flex gap-4">
                         {['Verdadero', 'Falso'].map(val => (
                           <Button key={val} variant={userAnswers[q.id] === val ? 'default' : 'outline'} className={cn("flex-1", showFeedback && q.respuestaCorrecta === val ? "bg-green-500 text-white" : showFeedback && userAnswers[q.id] === val ? "bg-red-500 text-white" : "")} onClick={() => !showFeedback && setUserAnswers({...userAnswers, [q.id]: val})} disabled={showFeedback}>{val}</Button>
                         ))}
                      </div>
                    )}
                    {q.tipo === 'escrita' && (
                      <Textarea 
                        placeholder="Escribe tu respuesta aquí..." 
                        value={userAnswers[q.id] || ""} 
                        onChange={e => !showFeedback && setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                        disabled={showFeedback}
                        rows={4}
                      />
                    )}
                  </div>
                </div>
              ))}
              {!showFeedback ? <Button className="w-full h-12 font-bold" onClick={handleGradeAssessment}>Finalizar y Enviar Evaluación</Button> : <Button variant="outline" className="w-full h-12" onClick={handleResetPreview}>Reintentar (Simulado)</Button>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
