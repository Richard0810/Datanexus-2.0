"use client";
import React from 'react';

import { useEffect, useState, use, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, PlusCircle, Pencil, Trash2, Upload, ClipboardList, FileQuestion, Layers, X, Trophy, FileText, Video, History, Save, Download, PlayCircle, BookOpen, Link as LinkIcon, ExternalLink, Presentation, FileUp, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Eye, MessageSquare, GraduationCap as GradeIcon
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

// Interfaces
interface Resource { _id?: any; titulo: string; descripcion: string; url: string; unidad: string; tipo: string; formato: string; }
interface Activity { _id?: any; titulo: string; descripcion: string; tipo: string; criterios_evaluacion: string; moduloId: string; archivoUrl?: string; }
interface Question { id: string; texto: string; tipo: 'opcion-multiple' | 'verdadero-falso' | 'escrita'; opciones: string[]; respuestaCorrecta: string; }
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

function ResourcePreview({ url, title, tipo }: { url: string; title: string, tipo: string }) {
  const isPrezi = tipo?.toLowerCase() === 'prezi' || (url && url.includes('prezi.com'));
  const isEmbeddable = tipo?.toLowerCase() === 'video' || (url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('gamma.app') || url.includes('docs.google.com/presentation')));

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");
    if (url.includes("/presentation/d/")) return url.replace(/\/edit.*|\/view.*$/, '/embed');
    if (url.includes("/document/d/") || url.includes("/file/d/")) return url.replace(/\/edit.*|\/view.*$/, '/preview');
    return url;
  };

  const finalUrl = isEmbeddable ? getEmbedUrl(url) : null;

  if (!finalUrl && !isPrezi) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-muted-foreground p-8 text-center">
        <FileText className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest mb-4">Material de Estudio</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl font-bold bg-white">
          <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Ver Material</a>
        </Button>
      </div>
    );
  }
  if (isPrezi) {
     return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-muted-foreground p-8 text-center">
        <Presentation className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest mb-4">Presentación Prezi</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl font-bold bg-white">
          <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Abrir en Prezi</a>
        </Button>
      </div>
    );
  }
  return <div className="relative w-full h-full"><iframe src={finalUrl ?? undefined} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>;
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const userRole = (user?.role || '').trim().toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrador';
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]); // FOR STUDENT'S OWN SUBMISSIONS
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]); // FOR ADMIN'S TRACKING PANEL
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isViewOwnSubmissionOpen, setIsViewOwnSubmissionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string, name: string } | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [resourceForm, setResourceForm] = useState<Resource>({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "video", formato: "URL" });
  const [activityForm, setActivityForm] = useState<Activity>({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" });
  const [assessmentForm, setAssessmentForm] = useState<Assessment>({ titulo: "", descripcion: "", moduloId: id, preguntas: [] });
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string } | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  
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
      
      const currentModuleId = id;
      setResources(resResponse.data.filter((res: any) => [id, `Módulo ${id}`, `Unidad ${id}`].includes(res.unidad)));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === currentModuleId));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === currentModuleId));

      const allModuleSubmissions = subResponse.data.filter((sub: any) => String(sub.moduloId) === currentModuleId);

      setSubmissions(allModuleSubmissions.filter((sub: any) => sub.usuarioEmail === user?.email));

      if (isAdmin) {
        setAllSubmissions(allModuleSubmissions);
      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error al cargar los datos", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [id, user, isAdmin]);

  const handleSaveResource = async () => {
    if (!resourceForm.titulo) return toast({ title: "El título es obligatorio", variant: "destructive" });
    setIsProcessing(true);
    try {
      const resourceId = getObjectId(editingResource);
      const formData = new FormData();

      if (sourceTab === 'file' && uploadedFile) {
        formData.append('file', uploadedFile);
        Object.entries(resourceForm).forEach(([key, value]) => formData.append(key, value));
        const apiCall = resourceId ? api.patch(`/educational-resources/${resourceId}`, formData, { headers: {'Content-Type': 'multipart/form-data'}}) : api.post("/educational-resources", formData, { headers: {'Content-Type': 'multipart/form-data'}});
        await apiCall;
      } else {
        if (!resourceForm.url) return toast({ title: "La URL es obligatoria", variant: "destructive"});
        const apiCall = resourceId ? api.patch(`/educational-resources/${resourceId}`, resourceForm) : api.post("/educational-resources", resourceForm);
        await apiCall;
      }
      
      setIsResourceDialogOpen(false); setEditingResource(null); setUploadedFile(null);
      fetchData();
      toast({ title: "Recurso guardado con éxito" });
    } catch (error) {
      toast({ title: "Error al guardar el recurso", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };
  
  const handleSaveActivity = async () => {
    if (!activityForm.titulo) return;
    setIsProcessing(true);
    try {
      const activityId = getObjectId(editingActivity);
      const apiCall = activityId ? api.patch(`/activities/${activityId}`, activityForm) : api.post("/activities", activityForm);
      await apiCall;
      
      setIsActivityDialogOpen(false); setEditingActivity(null);
      fetchData();
      toast({ title: "Actividad guardada con éxito" });
    } catch (error) { toast({ title: "Error al guardar la actividad", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo || assessmentForm.preguntas.length === 0) return;
    setIsProcessing(true);
    try {
      const assessmentId = getObjectId(editingAssessment);
      const apiCall = assessmentId ? api.patch(`/assessments/${assessmentId}`, assessmentForm) : api.post("/assessments", assessmentForm);
      await apiCall;
      
      setIsAssessmentDialogOpen(false); setEditingAssessment(null);
      fetchData();
      toast({ title: "Evaluación guardada con éxito" });
    } catch (error) { toast({ title: "Error al guardar la evaluación", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleSubmitActivity = async () => {
    const richText = editorRef.current?.innerHTML || "";
    if (!richText && !attachedFile) return toast({title:"La entrega está vacía", variant:"destructive"});

    setIsProcessing(true);
    try {
        const submissionData = { text: richText, file: attachedFile };
        const payload = {
            usuarioNombre: user?.name || "Estudiante",
            usuarioEmail: user?.email,
            tipoEnvio: "actividad",
            moduloId: id,
            tituloContenido: selectedActivity?.titulo,
            detalleEnvio: JSON.stringify(submissionData),
            estado: "enviado"
        };
        
        if (editingSubmissionId) {
            await api.patch(`/performance-reports/${editingSubmissionId}`, payload);
            toast({ title: "Entrega actualizada" });
        } else {
            await api.post("/performance-reports", payload);
            toast({ title: "Actividad enviada" });
        }

        setIsSubmitActivityOpen(false); setEditingSubmissionId(null); setAttachedFile(null);
        fetchData();
    } catch (e) { toast({ title: "Error al enviar", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    const clampedScore = Math.min(5, Math.max(0, Number(gradingForm.puntaje) || 0));
    setIsProcessing(true);
    try {
      await api.patch(`/performance-reports/${selectedSubmission._id}`, { ...gradingForm, puntaje: clampedScore, estado: "calificado" });
      setIsGradingDialogOpen(false);
      fetchData();
      toast({ title: "Calificación guardada" });
    } catch (error) { toast({ title: "Error al calificar", variant: "destructive" });
    } finally { setIsProcessing(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
        const endpointMap = {
            recurso: 'educational-resources',
            actividad: 'activities',
            evaluacion: 'assessments',
            entrega: 'performance-reports'
        };
        const endpoint = endpointMap[itemToDelete.type as keyof typeof endpointMap];
        await api.delete(`/${endpoint}/${itemToDelete.id}`);
        
        toast({ title: `${itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1)} eliminado` });
        fetchData();
        setIsDeleteDialogOpen(false);
    } catch (error) {
        toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
        setIsProcessing(false);
        setItemToDelete(null);
    }
  };
  
  const openDeleteDialog = (item: {id: string, type: string, name: string}) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };
  
  const formatSubmissionDetail = (detail: string) => {
    try {
      const parsed = JSON.parse(detail);
      if (parsed.text !== undefined || parsed.file) {
        return (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-background">
              <Label className="text-xs uppercase text-muted-foreground">Respuesta escrita</Label>
              <div className="prose prose-sm max-w-none mt-2" dangerouslySetInnerHTML={{ __html: parsed.text || "<p><i>No se incluyó texto.</i></p>" }} />
            </div>
            {parsed.file && (
              <Button asChild variant="outline"><a href={parsed.file.data} download={parsed.file.name}><Download className="mr-2 h-4 w-4"/>Descargar adjunto: {parsed.file.name}</a></Button>
            )}
          </div>
        );
      }
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-3">
            {parsed.map((item: any, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-md">
                <p className="text-xs font-bold text-primary mb-1">{item.pregunta || `Pregunta Antigua`}</p>
                <p className="text-sm">{String(item.respuesta)}</p>
              </div>
            ))}
          </div>
        );
      }
      if(typeof parsed === 'object' && !Array.isArray(parsed)) {
        const parentAssessment = assessments.find(a => a.titulo === selectedSubmission?.tituloContenido);
        return (
            <div className="space-y-3">
                {Object.entries(parsed).map(([qId, answer]) => {
                    const questionText = parentAssessment?.preguntas.find(p => p.id === qId)?.texto;
                    return (
                        <div key={qId} className="p-3 bg-muted rounded-md">
                            <p className="text-xs font-bold text-primary mb-1">{questionText || `Pregunta ID: ${qId}`}</p>
                            <p className="text-sm">{String(answer)}</p>
                        </div>
                    )
                })}
            </div>
        )
      }
    } catch (e) { /* No es JSON, mostrar como texto plano */ }
    return <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">{detail}</div>;
  };

  const resourceTypes = [
      { id: 'video', label: 'Video', icon: Video },
      { id: 'guia', label: 'Guía', icon: FileText },
      { id: 'articulo', label: 'Artículo', icon: BookOpen },
      { id: 'presentacion', label: 'Presentación', icon: Presentation },
      { id: 'prezi', label: 'Prezi', icon: Presentation },
      { id: 'otro', label: 'Otro', icon: LinkIcon },
  ];

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
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && (
              <Button onClick={() => {
                  setEditingResource(null);
                  setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "video", formato: "URL" });
                  setIsResourceDialogOpen(true);
              }} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
              </Button>
            )}
          </div>
          {loading ? <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div> :
          resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {resources.map((res) => {
                const resId = getObjectId(res);
                const typeInfo = resourceTypes.find(t => t.id === res.tipo.toLowerCase()) || { icon: LinkIcon };
                return (
                  <Card key={resId} className="shadow-md">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           {React.createElement(typeInfo.icon, { className: "h-5 w-5 text-primary" })}
                           <CardTitle>{res.titulo}</CardTitle>
                           <Badge variant="outline">{res.tipo}</Badge>
                        </div>
                        {isAdmin && (
                           <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog({ id: resId, type: 'recurso', name: res.titulo })}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        )}
                      </div>
                      <CardDescription>{res.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-lg overflow-hidden bg-black border shadow-inner">
                        <ResourcePreview url={res.url} title={res.titulo} tipo={res.tipo} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : <p className="text-center text-muted-foreground py-10 italic">No hay recursos disponibles.</p>}
        </TabsContent>
        
        <TabsContent value="actividades" className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-headline">Actividades Prácticas</h2>
                {isAdmin && <Button onClick={() => {setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); setIsActivityDialogOpen(true);}} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad</Button>}
            </div>
             {loading ? <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div> :
            activities.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                {activities.map((act) => {
                    const userSub = submissions.find(s => s.tituloContenido === act.titulo);
                    return (
                    <Card key={getObjectId(act)} className="flex flex-col">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle>{act.titulo}</CardTitle>
                                {isAdmin && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog({ id: getObjectId(act), type: 'actividad', name: act.titulo })}><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                )}
                            </div>
                            <CardDescription>{act.descripcion}</CardDescription>
                            {userSub && <Badge className={cn("w-fit mt-2", userSub.estado === 'calificado' ? 'bg-green-600' : 'bg-blue-600')}>{userSub.estado.toUpperCase()}</Badge>}
                        </CardHeader>
                        <CardContent className="flex-1 space-y-2">
                            <p className="text-sm font-semibold">Criterios: <span className="font-normal">{act.criterios_evaluacion}</span></p>
                            {act.archivoUrl && <Button asChild variant="link" className="p-0"><a href={act.archivoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4"/>Ver material adjunto</a></Button>}
                        </CardContent>
                        <CardFooter>
                        {!isAdmin && (
                            !userSub ? (
                                <Button className="w-full" onClick={() => { setSelectedActivity(act); setEditingSubmissionId(null); setAttachedFile(null); if(editorRef.current) editorRef.current.innerHTML = ''; setIsSubmitActivityOpen(true);}}><Upload className="mr-2 h-4 w-4"/>Entregar Tarea</Button>
                            ) : (
                                <div className="w-full grid grid-cols-3 gap-2">
                                    <Button variant="secondary" onClick={() => {setSelectedSubmission(userSub); setIsViewOwnSubmissionOpen(true);}}><Eye className="mr-2 h-4 w-4"/>Ver</Button>
                                    <Button variant="outline" disabled={userSub.estado === 'calificado'} onClick={() => {setSelectedActivity(act); setEditingSubmissionId(userSub._id); setIsSubmitActivityOpen(true);}}><Pencil className="mr-2 h-4 w-4"/>Editar</Button>
                                    <Button variant="destructive" disabled={userSub.estado === 'calificado'} onClick={() => openDeleteDialog({ id: userSub._id, type: 'entrega', name: 'tu entrega' })}><Trash2 className="mr-2 h-4 w-4"/>Borrar</Button>
                                </div>
                            )
                        )}
                        </CardFooter>
                    </Card>
                    );
                })}
                </div>
            ) : <p className="text-center text-muted-foreground py-10 italic">No hay actividades disponibles.</p>}
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setIsAssessmentDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación</Button>}
          </div>
           {loading ? <div className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div> :
            assessments.length > 0 ? (
                 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assessments.map((ass) => {
                        const userSub = submissions.find(s => s.tituloContenido === ass.titulo);
                        return (
                            <Card key={getObjectId(ass)}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>{ass.titulo}</CardTitle>
                                        {isAdmin && (
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setIsAssessmentDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => openDeleteDialog({ id: getObjectId(ass), type: 'evaluacion', name: ass.titulo })}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                    </div>
                                    <CardDescription>{ass.descripcion}</CardDescription>
                                </CardHeader>
                                <CardContent><p className="text-sm text-muted-foreground">{ass.preguntas.length} preguntas</p></CardContent>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setIsAssessmentDialogOpen(true); }}>{userSub ? 'Ver Resultados' : 'Realizar Evaluación'}</Button>
                                </CardFooter>
                            </Card>
                        )
                    })}
                 </div>
            ) : <p className="text-center text-muted-foreground py-10 italic">No hay evaluaciones disponibles.</p>}
        </TabsContent>
        
        {isAdmin && (
        <TabsContent value="seguimiento">
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Panel de Revisión</CardTitle>
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
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSubmissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{sub.usuarioNombre}</span>
                            <span className="text-xs text-muted-foreground">{sub.usuarioEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{sub.tipoEnvio.toUpperCase()}</Badge></TableCell>
                        <TableCell className="max-w-[200px] truncate">{sub.tituloContenido}</TableCell>
                        <TableCell>
                          {sub.puntaje !== undefined ? (
                             <Badge className={cn("px-2", sub.puntaje >= 3.5 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700")}>
                               {Number(sub.puntaje).toFixed(1)}/5
                             </Badge>
                          ) : <span className="text-muted-foreground italic text-xs">Pendiente</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sub.estado === "calificado" ? "default" : "secondary"} className="text-xs">
                            {sub.estado.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setSelectedSubmission(sub);
                                setGradingForm({ puntaje: sub.puntaje || 0, recomendaciones: sub.recomendaciones || "" });
                                setIsGradingDialogOpen(true);
                            }}
                          >
                            <GradeIcon className="mr-1 h-3 w-3" />
                            {sub.estado === "calificado" ? "Revisar" : "Calificar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allSubmissions.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">Aún no hay envíos registrados.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
             </Card>
        </TabsContent>
        )}
      </Tabs>

       {/* --- DIÁLOGOS --- */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{editingResource ? "Editar" : "Nuevo"} Recurso</DialogTitle></DialogHeader>
            <Tabs value={sourceTab} onValueChange={(v) => setSourceTab(v as any)} className="pt-4">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="url">URL Externa</TabsTrigger><TabsTrigger value="file">Subir Archivo</TabsTrigger></TabsList>
                <TabsContent value="url" className="space-y-4 pt-4">
                    <Input placeholder="Título del recurso" value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} />
                    <Textarea placeholder="Descripción" value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} />
                    <Input placeholder="https://..." value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} />
                    <Select value={resourceForm.tipo} onValueChange={(v) => setResourceForm({...resourceForm, tipo: v})}><SelectTrigger><SelectValue placeholder="Tipo de recurso" /></SelectTrigger><SelectContent>{resourceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent></Select>
                </TabsContent>
                <TabsContent value="file" className="space-y-4 pt-4">
                    <Input placeholder="Título del recurso" value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} />
                    <Textarea placeholder="Descripción" value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} />
                    <div className="p-4 text-center border-2 border-dashed rounded-md cursor-pointer" onClick={() => document.getElementById('file-upload')?.click()}>
                        <input type="file" id="file-upload" className="hidden" onChange={(e) => setUploadedFile(e.target.files?.[0] ?? null)} />
                        <FileUp className="mx-auto h-8 w-8 text-muted-foreground"/>
                        <p className="mt-2 text-sm">{uploadedFile ? uploadedFile.name : "Selecciona un archivo"}</p>
                    </div>
                </TabsContent>
            </Tabs>
            <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Recurso"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
          <DialogContent>
              <DialogHeader><DialogTitle>{editingActivity ? 'Editar' : 'Nueva'} Actividad</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                  <Input placeholder="Título" value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value })} />
                  <Textarea placeholder="Descripción/Instrucciones" value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value })} />
                  <Input placeholder="Criterios de Evaluación" value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value })} />
                  <Input placeholder="URL de Archivo Adjunto (Opcional)" value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value })} />
              </div>
              <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing}>{isProcessing?<Loader2 className="animate-spin"/>:'Guardar'}</Button></DialogFooter>
          </DialogContent>
      </Dialog>

       <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader><DialogTitle>Entrega: {selectedActivity?.titulo}</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 py-4">
             <div className="border rounded-lg">
                <div className="flex items-center gap-1 p-1 border-b bg-muted">
                    <Button variant="ghost" size="icon" onClick={() => document.execCommand('bold')}><Bold className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => document.execCommand('italic')}><Italic className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => document.execCommand('underline')}><Underline className="h-4 w-4" /></Button>
                </div>
                <div ref={editorRef} contentEditable className="p-4 min-h-[200px] outline-none prose prose-sm max-w-none"/>
             </div>
             <div>
                <Label>Adjuntar Archivo (opcional)</Label>
                 <div className="mt-2 p-4 text-center border-2 border-dashed rounded-md cursor-pointer" onClick={() => document.getElementById('activity-file-upload')?.click()}>
                    <input type="file" id="activity-file-upload" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => setAttachedFile({ name: file.name, data: event.target?.result as string });
                            reader.readAsDataURL(file);
                        }
                    }} />
                    <FileUp className="mx-auto h-8 w-8 text-muted-foreground"/>
                    <p className="mt-2 text-sm">{attachedFile ? attachedFile.name : "Selecciona un archivo"}</p>
                    {attachedFile && <Button variant="link" size="sm" className="text-destructive" onClick={(e) => {e.stopPropagation(); setAttachedFile(null);}}>Quitar</Button>}
                 </div>
             </div>
          </div>
          <DialogFooter><Button onClick={handleSubmitActivity} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin"/> : 'Enviar Entrega'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
            <DialogHeader><DialogTitle>{editingAssessment ? 'Editar' : 'Realizar'} Evaluación</DialogTitle></Header>
             <div className="py-4">Contenido de la evaluación...</div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader><DialogTitle>Calificar Entrega</DialogTitle><DialogDescription>De: {selectedSubmission?.usuarioNombre}</DialogDescription></DialogHeader>
              <div className="py-4 space-y-4">
                <div>
                    <Label>Entrega</Label>
                    {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Puntaje (0-5)</Label>
                        <Input type="number" max={5} min={0} value={gradingForm.puntaje} onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value)})} />
                    </div>
                    <div>
                        <Label>Recomendaciones</Label>
                        <Textarea value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} />
                    </div>
                </div>
              </div>
              <DialogFooter><Button onClick={handleSaveGrade} disabled={isProcessing}>{isProcessing?<Loader2 className="animate-spin"/>:'Guardar Calificación'}</Button></DialogFooter>
          </DialogContent>
      </Dialog>

       <Dialog open={isViewOwnSubmissionOpen} onOpenChange={setIsViewOwnSubmissionOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>Mi Entrega</DialogTitle></DialogHeader>
             <div className="py-4 space-y-4">
                <div>
                    <Label>Contenido</Label>
                    {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
                </div>
                {selectedSubmission?.estado === 'calificado' && (
                    <div className="p-4 border rounded-lg bg-muted">
                        <p><strong>Puntaje:</strong> {selectedSubmission.puntaje}/5</p>
                        <p><strong>Recomendaciones:</strong> {selectedSubmission.recomendaciones}</p>
                    </div>
                )}
             </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{itemToDelete?.name}". No se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isProcessing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{isProcessing ? <Loader2 className="animate-spin"/> : 'Eliminar'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
