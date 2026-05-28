
"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, PlusCircle, Pencil, Trash2, Upload, ClipboardList, FileQuestion, Layers, X, Trophy, FileText, Video, History, Save, Download, FileUp, Bold, Italic, Underline, CheckCircle2, GraduationCap as GradeIcon, BookOpen, Link as LinkIcon, ExternalLink, Monitor
} from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const modulesData = {
  "1": { title: "Módulo 1: Fundamentos de Bases de Datos e Investigación", objective: "Comprender los conceptos básicos de bases de datos y su importancia en la investigación académica." },
  "2": { title: "Módulo 2: Acceso e Identificación de Recursos", objective: "Aprender a acceder a las bases de datos institucionales." },
  "3": { title: "Módulo 3: Navegación y Búsqueda Básica", objective: "Realizar búsquedas simples en bases de datos." },
  "4": { title: "Módulo 4: Estrategias de Búsqueda Avanzada", objective: "Aplicar técnicas avanzadas para mejorar resultados de búsqueda." },
  "5": { title: "Módulo 5: Inteligencia Artificial en la Búsqueda", objective: "Utilizar herramientas de IA para optimizar la búsqueda académica." },
  "6": { title: "Módulo 6: Gestión de la Información", objective: "Organizar y almacenar información recuperada." },
  "7": { title: "Módulo 7: Evaluación y Selección de Fuentes", objective: "Evaluación de la calidad de la información académica." },
  "8": { title: "Módulo 8: Ética y Uso Responsable de la Información", objective: "Aplicar principios éticos en el uso de información." },
  "9": { title: "Módulo 9: Aplicación Práctica en Investigación", objective: "Integrar todos los conocimientos en un ejercicio completo." }
};

interface Resource { _id?: any; titulo: string; descripcion: string; url: string; unidad: string; tipo: string; formato: string; }
interface Activity { _id?: any; titulo: string; descripcion: string; tipo: string; criterios_evaluacion: string; moduloId: string; archivoUrl?: string; }
interface Question { id: string; texto: string; tipo: 'opcion-multiple'; opciones: string[]; respuestaCorrecta: string; }
interface Assessment { _id?: any; titulo: string; descripcion: string; moduloId: string; preguntas: Question[]; }
interface Submission { _id: string; usuarioNombre: string; usuarioEmail: string; tipoEnvio: string; tituloContenido: string; detalleEnvio: string; puntaje: number; estado: string; recomendaciones?: string; createdAt: string; moduloId: string; }

const getObjectId = (item: any): string => {
  if (!item) return '';
  if (item._id) {
    if (typeof item._id === 'string') return item._id;
    if (typeof item._id === 'object') return item._id.$oid || item._id.toString();
  }
  return '';
};

const resourceTypes = [
  { id: 'video', label: 'Video', icon: Video },
  { id: 'guia', label: 'Guía', icon: FileText },
  { id: 'articulo', label: 'Artículo', icon: BookOpen },
  { id: 'otro', label: 'Otro', icon: LinkIcon },
];

function ResourcePreview({ url, title }: { url: string; title: string }) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (url && url.startsWith('data:')) {
      try {
        const parts = url.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || '';
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
        const blob = new Blob([ab], { type: mime });
        const newUrl = URL.createObjectURL(blob);
        setBlobUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
      } catch (e) { console.error(e); }
    }
    return undefined;
  }, [url]);

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return null;

    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    // Gamma
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");

    // Google Drive / Docs / Presentation (SOLUCIÓN "Necesitas acceso")
    if (url.includes("docs.google.com") || url.includes("drive.google.com")) {
        // Soporte para enlaces directos con ID
        const match = url.match(/\/d\/(.+?)(\/|$|#|\?)/) || url.match(/id=(.+?)(&|$)/);
        if (match) {
            const id = match[1];
            if (url.includes("/presentation")) return `https://docs.google.com/presentation/d/${id}/embed`;
            if (url.includes("/document")) return `https://docs.google.com/document/d/${id}/preview`;
            if (url.includes("/spreadsheets")) return `https://docs.google.com/spreadsheets/d/${id}/preview`;
            return `https://drive.google.com/file/d/${id}/preview`;
        }
    }

    return url;
  };

  // UI Especial para Prezi (Siempre fuera de iframe por seguridad)
  if (url && url.includes("prezi.com")) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#050b1f] text-white p-8 text-center rounded-xl">
              <Monitor className="h-16 w-16 mb-4 text-primary animate-pulse" />
              <h3 className="text-xl font-headline font-bold mb-2">Presentación Interactiva</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-xs">Este contenido de Prezi requiere abrirse en una ventana externa para una experiencia completa.</p>
              <Button asChild size="lg" className="rounded-2xl font-bold bg-primary hover:bg-primary/90 px-8 shadow-xl shadow-primary/20">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                      Abrir Presentación <ExternalLink className="ml-2 h-5 w-5" />
                  </a>
              </Button>
          </div>
      );
  }

  const finalUrl = blobUrl || getEmbedUrl(url);

  if (!finalUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-8 text-center">
        <FileText className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm font-bold uppercase mb-4">Material de Estudio</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl bg-white shadow-sm border-slate-200">
            <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Ver Contenido Externo
            </a>
        </Button>
      </div>
    );
  }

  return <iframe src={finalUrl} className="w-full h-full border-0" allowFullScreen />;
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
  
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTakingTest, setIsTakingTest] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'recurso' | 'actividad' | 'evaluacion' | 'entrega', name: string } | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [resourceForm, setResourceForm] = useState<Resource>({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" });
  const [activityForm, setActivityForm] = useState<Activity>({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" });
  const [assessmentForm, setAssessmentForm] = useState<Assessment>({ titulo: "", descripcion: "", moduloId: id, preguntas: [] });
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [assessmentStep, setAssessmentStep] = useState<'intro' | 'test' | 'result'>('intro');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string } | null>(null);
  
  const { toast } = useToast();
  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse, subResponse] = await Promise.all([
        api.get("/educational-resources"),
        api.get("/activities"),
        api.get("/assessments"),
        api.get("/performance-reports")
      ]);
      setResources(resResponse.data.filter((res: any) => res.unidad === `Módulo ${id}` || res.unidad === `Unidad ${id}`));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === id));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === id));
      setSubmissions(subResponse.data.filter((sub: any) => String(sub.moduloId) === id && (isAdmin || sub.usuarioEmail === user?.email)));
    } catch (e) { toast({ title: "Error de carga", variant: "destructive" }); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [id, user, isAdmin]);

  const handleSaveResource = async () => {
    setIsProcessing(true);
    try {
      const resourceId = getObjectId(editingResource);
      if (sourceTab === 'file' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('titulo', resourceForm.titulo);
        formData.append('descripcion', resourceForm.descripcion);
        formData.append('unidad', resourceForm.unidad);
        formData.append('tipo', resourceForm.tipo);
        const apiCall = resourceId ? api.patch(`/educational-resources/${resourceId}`, formData) : api.post("/educational-resources", formData);
        await apiCall;
      } else {
        const apiCall = resourceId ? api.patch(`/educational-resources/${resourceId}`, resourceForm) : api.post("/educational-resources", resourceForm);
        await apiCall;
      }
      setIsResourceDialogOpen(false); fetchData(); toast({ title: "Recurso guardado" });
    } catch (e) { toast({ title: "Error al guardar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSaveActivity = async () => {
    setIsProcessing(true);
    try {
      const activityId = getObjectId(editingActivity);
      const apiCall = activityId ? api.patch(`/activities/${activityId}`, activityForm) : api.post("/activities", activityForm);
      await apiCall;
      setIsActivityDialogOpen(false); fetchData(); toast({ title: "Actividad guardada" });
    } catch (e) { toast({ title: "Error al guardar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSaveAssessment = async () => {
    setIsProcessing(true);
    try {
      const assId = getObjectId(editingAssessment);
      const apiCall = assId ? api.patch(`/assessments/${assId}`, assessmentForm) : api.post("/assessments", assessmentForm);
      await apiCall;
      setIsAssessmentDialogOpen(false); fetchData(); toast({ title: "Evaluación guardada" });
    } catch (e) { toast({ title: "Error al guardar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    try {
      const subId = getObjectId(selectedSubmission);
      await api.patch(`/performance-reports/${subId}`, {
        ...gradingForm,
        estado: "calificado"
      });
      setIsGradingDialogOpen(false); fetchData(); toast({ title: "Calificación guardada" });
    } catch (e) { toast({ title: "Error al calificar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSubmitTask = async () => {
    setIsProcessing(true);
    try {
      await api.post("/performance-reports", {
        usuarioNombre: user?.name,
        usuarioEmail: user?.email,
        tipoEnvio: "actividad",
        moduloId: id,
        tituloContenido: selectedActivity?.titulo,
        detalleEnvio: JSON.stringify({ text: editorRef.current?.innerHTML, file: attachedFile }),
        estado: "enviado",
        puntaje: 0
      });
      setIsSubmitActivityOpen(false); fetchData(); toast({ title: "Tarea enviada con éxito" });
    } catch (e) { toast({ title: "Error al enviar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleFinishAssessment = async () => {
    let correct = 0;
    editingAssessment?.preguntas.forEach(q => { if (userAnswers[q.id] === q.respuestaCorrecta) correct++; });
    const score = (correct / (editingAssessment?.preguntas.length || 1)) * 5;
    setIsProcessing(true);
    try {
      await api.post("/performance-reports", {
        usuarioNombre: user?.name,
        usuarioEmail: user?.email,
        tipoEnvio: "evaluacion",
        moduloId: id,
        tituloContenido: editingAssessment?.titulo,
        detalleEnvio: JSON.stringify(userAnswers),
        puntaje: score,
        estado: "enviado"
      });
      setAssessmentStep('result'); fetchData();
    } catch (e) { toast({ title: "Error al enviar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const endpoints: Record<string, string> = { 'recurso': 'educational-resources', 'actividad': 'activities', 'evaluacion': 'assessments', 'entrega': 'performance-reports' };
      await api.delete(`/${endpoints[itemToDelete.type]}/${itemToDelete.id}`);
      fetchData(); setIsDeleteDialogOpen(false); toast({ title: "Eliminado con éxito" });
    } catch (e) { toast({ title: "Error al eliminar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon"><Link href="/modulos"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-3xl font-headline font-bold">{moduleInfo.title}</h1>
          <p className="text-muted-foreground">{moduleInfo.objective}</p>
        </div>
      </div>

      <Tabs defaultValue="recursos" className="w-full">
        <TabsList className={cn("grid w-full mb-8", isAdmin ? "grid-cols-4" : "grid-cols-3")}>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          {isAdmin && <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>}
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline font-bold">Materiales de Estudio</h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso</Button>}
          </div>
          {loading ? <div className="text-center py-10"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div> :
          resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {resources.map((res) => {
                const resId = getObjectId(res);
                return (
                  <Card key={resId} className="shadow-md overflow-hidden group relative">
                    <CardHeader className="pb-0 flex flex-row justify-between items-start">
                      <div><Badge variant="outline" className="uppercase text-[9px] mb-2">{res.tipo}</Badge><CardTitle className="text-xl">{res.titulo}</CardTitle><CardDescription>{res.descripcion}</CardDescription></div>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setItemToDelete({ id: resId, type: 'recurso', name: res.titulo }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="pt-6"><div className="aspect-video rounded-xl overflow-hidden bg-black shadow-inner"><ResourcePreview url={res.url} title={res.titulo} /></div></CardContent>
                  </Card>
                );
              })}
            </div>
          ) : <p className="text-center py-20 text-muted-foreground italic">No hay recursos disponibles.</p>}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline font-bold">Guía de Actividades</h2>
            {isAdmin && <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); setIsActivityDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => {
              const actId = getObjectId(act);
              return (
                <Card key={actId} className="shadow-md border-l-4 border-l-primary relative">
                  <CardHeader className="flex flex-row justify-between items-start">
                    <div><Badge variant="secondary" className="mb-2 uppercase text-[9px]">{act.tipo}</Badge><CardTitle>{act.titulo}</CardTitle><CardDescription>{act.descripcion}</CardDescription></div>
                    {isAdmin && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setItemToDelete({ id: actId, type: 'actividad', name: act.titulo }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardFooter className="gap-2">
                    {act.archivoUrl && <Button variant="outline" className="flex-1" asChild><a href={act.archivoUrl} target="_blank"><Download className="mr-2 h-4 w-4" /> Guía PDF</a></Button>}
                    {!isAdmin && <Button className="flex-1 font-bold" onClick={() => { setSelectedActivity(act); setIsSubmitActivityOpen(true); }}><Upload className="mr-2 h-4 w-4" /> Entregar Tarea</Button>}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline font-bold">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setIsAssessmentDialogOpen(true); setIsTakingTest(false); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Crear Test</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((ass) => {
              const assId = getObjectId(ass);
              return (
                <Card key={assId} className="hover:border-primary transition-all shadow-md relative">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                      {isAdmin && (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setIsTakingTest(false); setIsAssessmentDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setItemToDelete({ id: assId, type: 'evaluacion', name: ass.titulo }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                    <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full font-bold" onClick={() => { setEditingAssessment(ass); setAssessmentStep('intro'); setIsTakingTest(true); setIsAssessmentDialogOpen(true); }}>Realizar Examen</Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento">
            <Card className="shadow-md overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow><TableHead className="pl-6">Estudiante</TableHead><TableHead>Actividad</TableHead><TableHead>Puntaje</TableHead><TableHead>Estado</TableHead><TableHead className="text-right pr-6">Acción</TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const subId = getObjectId(sub);
                    return (
                      <TableRow key={subId}>
                        <TableCell className="pl-6 font-medium">{sub.usuarioNombre}</TableCell>
                        <TableCell className="text-xs">{sub.tituloContenido}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-primary/5">{sub.puntaje}/5.0</Badge></TableCell>
                        <TableCell><Badge className={cn(sub.estado === 'calificado' ? 'bg-green-600' : 'bg-blue-600')}>{sub.estado.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-right pr-6"><Button size="sm" variant="ghost" onClick={() => { setSelectedSubmission(sub); setGradingForm({ puntaje: sub.puntaje, recomendaciones: sub.recomendaciones || "" }); setIsGradingDialogOpen(true); }}><GradeIcon className="h-4 w-4 mr-2" /> Calificar</Button></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden">
          <div className="bg-[#1a2744] px-6 py-5 text-white flex justify-between items-center"><DialogTitle>{editingResource ? "Editar" : "Añadir"} Recurso</DialogTitle></div>
          <div className="p-6 space-y-6">
            <div className="space-y-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={resourceForm.tipo} onValueChange={(v) => setResourceForm({...resourceForm, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{resourceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Tabs value={sourceTab} onValueChange={(v:any) => setSourceTab(v)}>
               <TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="url">URL</TabsTrigger><TabsTrigger value="file">Archivo</TabsTrigger></TabsList>
               <TabsContent value="url"><Input placeholder="https://..." value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} /></TabsContent>
               <TabsContent value="file">
                  <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('res-up')?.click()}>
                     <input type="file" id="res-up" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                     <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-2" /><p className="text-sm">{uploadedFile ? uploadedFile.name : "Subir PDF o Imagen"}</p>
                  </div>
               </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="p-6 bg-slate-50"><Button onClick={handleSaveResource} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold bg-blue-600">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Recurso"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader><DialogTitle>{editingActivity ? "Editar" : "Crear"} Actividad</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} /></div>
            <div className="space-y-2"><Label>URL de Guía/Plantilla (Opcional)</Label><Input value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value})} placeholder="https://..." /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing} className="w-full font-bold h-12 bg-blue-600">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Actividad"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl">
          {!isTakingTest ? (
            <div className="space-y-6">
               <DialogHeader><DialogTitle>Editor de Evaluación</DialogTitle></DialogHeader>
               <div className="space-y-4">
                  <div className="space-y-2"><Label>Título</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Descripción</Label><Textarea value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div>
                  <Separator />
                  <div className="flex justify-between items-center"><h3 className="font-bold">Preguntas ({assessmentForm.preguntas.length})</h3><Button variant="outline" size="sm" onClick={() => setAssessmentForm({...assessmentForm, preguntas: [...assessmentForm.preguntas, { id: Math.random().toString(), texto: "Nueva Pregunta", tipo: 'opcion-multiple', opciones: ["Opción 1", "Opción 2", "Opción 3", "Opción 4"], respuestaCorrecta: "Opción 1" }]})}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Pregunta</Button></div>
                  <div className="space-y-6">
                    {assessmentForm.preguntas.map((q, idx) => (
                      <div key={q.id} className="p-4 border rounded-2xl bg-muted/20 space-y-4 relative">
                        <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-destructive" onClick={() => { const copy = [...assessmentForm.preguntas]; copy.splice(idx, 1); setAssessmentForm({...assessmentForm, preguntas: copy}); }}><X className="h-4 w-4"/></Button>
                        <div className="space-y-2"><Label>Pregunta {idx + 1}</Label><Input value={q.texto} onChange={e => { const copy = [...assessmentForm.preguntas]; copy[idx].texto = e.target.value; setAssessmentForm({...assessmentForm, preguntas: copy}); }} /></div>
                        <div className="grid grid-cols-2 gap-3">
                           {q.opciones.map((opt, oIdx) => (
                             <div key={oIdx} className="space-y-1"><Label className="text-[10px] uppercase">Opción {oIdx + 1}</Label><Input value={opt} onChange={e => { const copy = [...assessmentForm.preguntas]; copy[idx].opciones[oIdx] = e.target.value; setAssessmentForm({...assessmentForm, preguntas: copy}); }} /></div>
                           ))}
                        </div>
                        <div className="space-y-2">
                          <Label>Respuesta Correcta</Label>
                          <Select value={q.respuestaCorrecta} onValueChange={(v) => { const copy = [...assessmentForm.preguntas]; copy[idx].respuestaCorrecta = v; setAssessmentForm({...assessmentForm, preguntas: copy}); }}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{q.opciones.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
               <DialogFooter><Button onClick={handleSaveAssessment} disabled={isProcessing} className="w-full h-12 font-bold bg-blue-600">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Cambios de Evaluación"}</Button></DialogFooter>
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {assessmentStep === 'intro' && (
                <div className="text-center space-y-6 py-10"><Trophy className="h-20 w-20 mx-auto text-amber-500" /><DialogHeader><DialogTitle className="text-3xl font-headline">{editingAssessment?.titulo}</DialogTitle></DialogHeader><p className="text-muted-foreground text-lg">{editingAssessment?.descripcion}</p><Button className="w-full h-14 text-lg font-bold rounded-2xl" onClick={() => setAssessmentStep('test')}>Iniciar Examen</Button></div>
              )}
              {assessmentStep === 'test' && (
                <div className="space-y-10">
                  {editingAssessment?.preguntas.map((q, idx) => (
                    <div key={q.id} className="space-y-4">
                      <p className="font-bold text-xl">{idx + 1}. {q.texto}</p>
                      <RadioGroup onValueChange={(val) => setUserAnswers({ ...userAnswers, [q.id]: val })} className="grid grid-cols-1 gap-3">
                        {q.opciones.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2 p-4 rounded-2xl border hover:bg-primary/5 transition-all"><RadioGroupItem value={opt} id={`${q.id}-${opt}`} /><Label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer text-lg">{opt}</Label></div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button className="w-full h-14 font-bold text-lg rounded-2xl" onClick={handleFinishAssessment} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : "Finalizar Evaluación"}</Button>
                </div>
              )}
              {assessmentStep === 'result' && (
                 <div className="text-center space-y-6 py-10"><div className="bg-green-100 p-8 rounded-full w-32 h-32 mx-auto flex items-center justify-center"><CheckCircle2 className="h-16 w-16 text-green-600" /></div><h3 className="text-3xl font-bold">¡Excelente Trabajo!</h3><p className="text-muted-foreground text-lg">Tu examen ha sido enviado y registrado correctamente.</p><Button variant="outline" onClick={() => setIsAssessmentDialogOpen(false)} className="w-full h-12 rounded-2xl">Cerrar Ventana</Button></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col rounded-3xl">
          <DialogHeader><DialogTitle>Entrega de Actividad: {selectedActivity?.titulo}</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="border rounded-2xl overflow-hidden shadow-sm">
               <div className="bg-muted p-2 border-b flex gap-1"><Button variant="ghost" size="icon" onClick={() => document.execCommand('bold')}><Bold className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => document.execCommand('italic')}><Italic className="h-4 w-4"/></Button><Button variant="ghost" size="icon" onClick={() => document.execCommand('underline')}><Underline className="h-4 w-4"/></Button></div>
               <div ref={editorRef} contentEditable className="p-5 min-h-[250px] outline-none prose prose-sm max-w-none" />
            </div>
            <div className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-muted/30" onClick={() => document.getElementById('sub-f')?.click()}>
               <input type="file" id="sub-f" className="hidden" onChange={(e) => {
                 const file = e.target.files?.[0];
                 if (file) {
                   const reader = new FileReader();
                   reader.onload = (ev) => setAttachedFile({ name: file.name, data: ev.target?.result as string });
                   reader.readAsDataURL(file);
                 }
               }} />
               {attachedFile ? <div className="flex items-center justify-center gap-2 text-primary font-bold"><CheckCircle2 className="h-5 w-5"/> {attachedFile.name}</div> : <div className="text-muted-foreground"><Upload className="h-8 w-8 mx-auto mb-2" /><p>Adjuntar archivo opcional (Imagen/PDF)</p></div>}
            </div>
          </div>
          <DialogFooter className="p-4 border-t"><Button onClick={handleSubmitTask} disabled={isProcessing} className="w-full h-14 text-lg font-bold rounded-2xl">{isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Tarea"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader><DialogTitle>Calificar Entrega</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
             <div className="p-4 bg-muted/50 rounded-2xl text-sm italic">
                {selectedSubmission?.detalleEnvio.startsWith('{') ? "Contenido interactivo enviado." : selectedSubmission?.detalleEnvio}
             </div>
             <div className="space-y-4">
                <div className="space-y-2"><Label>Nota Final (0.0 - 5.0)</Label><Input type="number" step="0.1" value={gradingForm.puntaje} onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Retroalimentación</Label><Textarea placeholder="Escribe tus observaciones..." value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} /></div>
             </div>
          </div>
          <DialogFooter><Button onClick={handleSaveGrade} disabled={isProcessing} className="w-full h-12 rounded-2xl font-bold bg-blue-600">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Nota"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Se eliminará permanentemente "{itemToDelete?.name}". Esta acción es irreversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white rounded-xl">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
