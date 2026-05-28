"use client";
import React from 'react';

import { useEffect, useState, use, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Loader2, 
  PlusCircle, 
  Pencil, 
  Trash2,
  ClipboardList,
  FileQuestion,
  Layers,
  FileText,
  Video,
  History,
  Save,
  Download,
  PlayCircle,
  BookOpen,
  Link as LinkIcon,
  ExternalLink,
  Presentation, 
  FileUp,
  Trophy
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const isPrezi = tipo?.toLowerCase() === 'prezi' || (url && url.includes('prezi.com'));
  const isEmbeddable = tipo?.toLowerCase() === 'video' || (url && (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('gamma.app') || url.includes('docs.google.com/presentation')));

  useEffect(() => {
    if (url && url.startsWith('data:')) {
      try {
        const parts = url.split(',');
        const mime = parts[0].match(/:(.*?);/)?.[1] || '';
        const byteString = atob(parts[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) { ia[i] = byteString.charCodeAt(i); }
        const blob = new Blob([ab], { type: mime });
        const newUrl = URL.createObjectURL(blob);
        setBlobUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
      } catch (e) { console.error("Error al procesar archivo local:", e); }
    }
    return undefined;
  }, [url]);

  if (isPrezi) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0B172E] text-white p-8 text-center rounded-xl">
        <div className="w-16 h-16 bg-[#00A6D6] rounded-full flex items-center justify-center text-3xl font-bold mb-4">P</div>
        <h3 className="text-xl font-bold mb-2">Presentación Prezi</h3>
        <Button asChild style={{ backgroundColor: '#00A6D6', color: 'white' }} className="rounded-lg font-bold">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" /> Abrir en Prezi
          </a>
        </Button>
        <p className="text-xs text-slate-400 mt-4">Se abre en una nueva pestaña por políticas de seguridad del navegador.</p>
      </div>
    );
  }

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");
    if (url.includes("docs.google.com/presentation")) {
        const match = url.match(/\\/d\\/(.+?)(\\/|$)/);
        if (match) return `https://docs.google.com/presentation/d/${match[1]}/embed`;
    }
    return url;
  };

  const finalUrl = blobUrl || (isEmbeddable ? getEmbedUrl(url) : null);

  if (!finalUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-muted-foreground p-8 text-center">
        <FileText className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest mb-4">Material de Estudio</p>
        <div className="flex gap-2">
           <Button asChild variant="outline" size="sm" className="rounded-xl font-bold bg-white">
            <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4" /> Ver Externo</a>
          </Button>
          {url && url.startsWith('data:') && (
            <Button asChild variant="default" size="sm" className="rounded-xl font-bold">
              <a href={url} download={title}><Download className="mr-2 h-4 w-4" /> Descargar</a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <iframe src={finalUrl} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      <div className="absolute bottom-4 right-4 z-30">
        <Button asChild size="sm" variant="secondary" className="rounded-full shadow-lg opacity-80 hover:opacity-100">
          <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4 mr-2" /> Ventana Nueva</a>
        </Button>
      </div>
    </div>
  );
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const userRole = (user?.role || '').trim().toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrador';
  
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");

  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  
  const { toast } = useToast();
  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const [resourceForm, setResourceForm] = useState<Resource>({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "video", formato: "URL" });
  const [activityForm, setActivityForm] = useState<Activity>({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" });
  const [assessmentForm, setAssessmentForm] = useState<Assessment>({ titulo: "", descripcion: "", moduloId: id, preguntas: [] });
  const [submissionForm, setSubmissionForm] = useState({ detalleEnvio: "", archivoUrl: "" });

  useEffect(() => {
    if (resourceForm.url.includes('prezi.com')) {
      setResourceForm(prevForm => ({ ...prevForm, tipo: 'prezi' }));
    }
  }, [resourceForm.url]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse, subResponse] = await Promise.all([
        api.get("/educational-resources"),
        api.get("/activities"),
        api.get("/assessments"),
        api.get("/performance-reports")
      ]);
      
      setResources(resResponse.data.filter((res: any) => res.unidad === `Módulo ${id}` || res.unidad === `Unidad ${id}` || res.unidad === id));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === String(id)));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === String(id)));
      setSubmissions(subResponse.data.filter((sub: any) => String(sub.moduloId) === String(id) && (isAdmin || sub.usuarioEmail === user?.email)));
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error al cargar los datos", description: "No se pudo obtener la información del módulo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) { fetchData(); } }, [id, user, isAdmin]);

  const handleSaveResource = async () => {
    if (!resourceForm.titulo) return;
    setIsProcessing(true);
    try {
      const resourceId = getObjectId(editingResource);
      let payload: any = { ...resourceForm };
      let headers = {};

      if (sourceTab === "file" && uploadedFile) {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        Object.entries(resourceForm).forEach(([key, value]) => formData.append(key, String(value)));
        formData.append("formato", uploadedFile.name.split('.').pop() || 'file');
        payload = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      if (resourceId) {
        await api.patch(`/educational-resources/${resourceId}`, payload, { headers });
      } else {
        await api.post("/educational-resources", payload, { headers });
      }

      setIsResourceDialogOpen(false);
      fetchData();
      toast({ title: "Recurso guardado con éxito" });
    } catch (error) {
      toast({ title: "Error al guardar el recurso", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleSaveActivity = async () => {
    if (!activityForm.titulo) return;
    setIsProcessing(true);
    try {
      const activityId = getObjectId(editingActivity);
      if (activityId) {
        await api.patch(`/activities/${activityId}`, activityForm);
      } else {
        await api.post("/activities", activityForm);
      }
      setIsActivityDialogOpen(false);
      fetchData();
      toast({ title: "Actividad guardada con éxito" });
    } catch (error) {
      toast({ title: "Error al guardar la actividad", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo) return;
    setIsProcessing(true);
    try {
      const assessmentId = getObjectId(editingAssessment);
      if (assessmentId) {
        await api.patch(`/assessments/${assessmentId}`, assessmentForm);
      } else {
        await api.post("/assessments", assessmentForm);
      }
      setIsAssessmentDialogOpen(false);
      fetchData();
      toast({ title: "Evaluación guardada con éxito" });
    } catch (error) {
      toast({ title: "Error al guardar la evaluación", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity || !submissionForm.detalleEnvio) return;
    setIsProcessing(true);
    try {
        const payload = {
            usuarioId: user?._id,
            usuarioNombre: user?.name,
            usuarioEmail: user?.email,
            tipoEnvio: 'actividad',
            tituloContenido: selectedActivity.titulo,
            detalleEnvio: submissionForm.detalleEnvio,
            moduloId: id,
            actividadId: getObjectId(selectedActivity),
        };
        await api.post('/performance-reports', payload);
        setIsSubmitActivityOpen(false);
        fetchData();
        toast({ title: "Actividad entregada con éxito" });
    } catch (error) {
        toast({ title: "Error al entregar la actividad", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const { id: deleteId, type } = itemToDelete;
      await api.delete(`/${type}s/${deleteId}`); // Note: assumes plural endpoints e.g. /activities/:id
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchData();
      toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} eliminado con éxito` });
    } catch (error) {
      const typeName = itemToDelete?.type === 'educational-resource' ? 'recurso' : itemToDelete?.type;
      toast({ title: `Error al eliminar el ${typeName}`, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
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
          <TabsTrigger value="recursos" className="flex items-center gap-2 font-bold h-12"><Layers className="h-4 w-4" /> Recursos</TabsTrigger>
          <TabsTrigger value="actividades" className="flex items-center gap-2 font-bold h-12"><ClipboardList className="h-4 w-4" /> Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones" className="flex items-center gap-2 font-bold h-12"><FileQuestion className="h-4 w-4" /> Evaluaciones</TabsTrigger>
          {isAdmin && <TabsTrigger value="seguimiento" className="flex items-center gap-2 text-accent font-bold h-12"><History className="h-4 w-4" /> Seguimiento</TabsTrigger>}
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && (
              <Button onClick={() => {
                  setEditingResource(null);
                  setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "video", formato: "URL" });
                  setSourceTab("url");
                  setUploadedFile(null);
                  setIsResourceDialogOpen(true);
              }} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
              </Button>
            )}
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground animate-pulse">Cargando materiales...</p></div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => {
                const resId = getObjectId(res);
                const typeInfo = resourceTypes.find(t => t.id === res.tipo.toLowerCase()) || { icon: LinkIcon };
                return (
                  <Card key={resId} className="overflow-hidden group relative shadow-md">
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <Button variant="default" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 text-white shadow-lg rounded-full" onClick={() => { setItemToDelete({ id: resId, type: 'educational-resource' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                         {React.createElement(typeInfo.icon, { className: "h-4 w-4 text-primary" })}
                        <Badge variant="outline" className="uppercase tracking-widest text-[9px] font-bold">{res.tipo}</Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold">{res.titulo}</CardTitle>
                      <CardDescription>{res.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner">
                        <ResourcePreview url={res.url} title={res.titulo} tipo={res.tipo} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20"><Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground italic">No hay recursos disponibles para este módulo.</p></div>
          )}
        </TabsContent>
        
        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Actividades Formativas</h2>
            {isAdmin && (
              <Button onClick={() => { setIsActivityDialogOpen(true); setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); }} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Actividad
              </Button>
            )}
          </div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground animate-pulse">Cargando actividades...</p></div>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((act) => {
                const actId = getObjectId(act);
                return (
                  <Card key={actId}>
                    <CardHeader>
                      <CardTitle>{act.titulo}</CardTitle>
                      <CardDescription>{act.descripcion}</CardDescription>
                       {act.archivoUrl && (
                        <Button asChild variant="link" className="p-0 h-auto justify-start">
                           <a href={act.archivoUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-2 h-4 w-4"/> Ver documento adjunto</a>
                        </Button>
                      )}
                    </CardHeader>
                    <CardFooter className="flex justify-between">
                       <Button size="sm" onClick={() => { setSelectedActivity(act); setSubmissionForm({ detalleEnvio: "", archivoUrl: "" }); setIsSubmitActivityOpen(true); }}><PlayCircle className="mr-2 h-4 w-4" /> Realizar Entrega</Button>
                       {isAdmin && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
                          <Button variant="destructive" size="sm" onClick={() => { setItemToDelete({ id: actId, type: 'activity' }); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20"><ClipboardList className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground italic">No hay actividades disponibles.</p></div>
          )}
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-headline">Evaluaciones Calificadas</h2>
                 {isAdmin && (
                    <Button onClick={() => { setIsAssessmentDialogOpen(true); setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); }} size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" /> Añadir Evaluación
                    </Button>
                )}
            </div>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4"><Loader2 className="h-10 w-10 animate-spin text-primary" /><p className="text-muted-foreground animate-pulse">Cargando evaluaciones...</p></div>
            ) : assessments.length > 0 ? (
                <div className="space-y-4">
                    {assessments.map((ass) => {
                       const assId = getObjectId(ass);
                        return (
                        <Card key={assId}>
                            <CardHeader>
                                <CardTitle>{ass.titulo}</CardTitle>
                                <CardDescription>{ass.descripcion}</CardDescription>
                            </CardHeader>
                            <CardFooter className="flex justify-between">
                                <Button size="sm"><Trophy className="mr-2 h-4 w-4" /> Realizar Evaluación</Button>
                                {isAdmin && (
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setIsAssessmentDialogOpen(true); }}><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
                                        <Button variant="destructive" size="sm" onClick={() => { setItemToDelete({ id: assId, type: 'assessment' }); setIsDeleteDialogOpen(true); }}><Trash2 className="mr-2 h-4 w-4" /> Eliminar</Button>
                                    </div>
                                )}\
                            </CardFooter>
                        </Card>
                    )}
                    )}
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20"><FileQuestion className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" /><p className="text-muted-foreground italic">No hay evaluaciones disponibles.</p></div>
            )}
        </TabsContent>
      </Tabs>

      {/* DIALOGS */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[650px] p-0 bg-[#1C1C1C] border-none text-white overflow-hidden rounded-2xl">
            <DialogHeader className="bg-blue-600 px-6 py-4">
              <DialogTitle className="text-xl font-bold text-white">{editingResource ? "Editar Recurso" : "Nuevo Recurso"}</DialogTitle>
              <DialogDescription className="text-blue-200">Módulo {id}</DialogDescription>
            </DialogHeader>
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-gray-400">Título *</Label>
                <Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} className="bg-gray-800 border-gray-700 rounded-lg h-12"/>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase text-gray-400">Descripción</Label>
                <Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} className="bg-gray-800 border-gray-700 rounded-lg" rows={3}/>
              </div>
              <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase text-gray-400">Tipo de Recurso</Label>
                  <div className="grid grid-cols-3 gap-3">
                      {resourceTypes.map(type => (
                          <Button key={type.id} variant="outline" onClick={() => setResourceForm({...resourceForm, tipo: type.id})} className={`h-14 flex flex-col gap-1.5 justify-center items-center rounded-lg transition-all ${resourceForm.tipo === type.id ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`}>
                              <type.icon className="h-5 w-5" />
                              <span className="text-xs font-bold">{type.label}</span>
                          </Button>
                      ))}
                  </div>
              </div>
              <div className="space-y-3">
                  <Label className="font-bold text-xs uppercase text-gray-400">Fuente del Recurso</Label>
                  <Tabs value={sourceTab} onValueChange={(value) => setSourceTab(value as "url" | "file")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="url">URL Externa</TabsTrigger>
                          <TabsTrigger value="file">Subir Archivo</TabsTrigger>
                      </TabsList>
                      <TabsContent value="url">
                          <Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value, formato: 'URL' })} placeholder="https://..." className="bg-gray-800 border-gray-700 rounded-lg h-12 mt-2"/>
                      </TabsContent>
                      <TabsContent value="file">
                          <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 mt-2" onClick={() => document.getElementById('resFile')?.click()}>
                              <input id="resFile" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)}/>
                              <FileUp className="h-8 w-8 mx-auto text-gray-500 mb-2"/>
                              <p className="text-sm font-medium text-gray-300">{uploadedFile ? uploadedFile.name : "Selecciona o arrastra un archivo"}</p>
                          </div>
                      </TabsContent>
                  </Tabs>
              </div>
            </div>
            <DialogFooter className="p-4 bg-gray-900/50 border-t border-gray-700">
              <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveResource} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <Save className="mr-2"/>} Guardar Recurso
              </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                  <Input placeholder="Título" value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value })} />
                  <Textarea placeholder="Descripción" value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value })} />
                  <Textarea placeholder="Criterios de Evaluación" value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value })} />
                  <Input placeholder="URL de Archivo Adjunto (Opcional)" value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value })} />
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsActivityDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveActivity} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="animate-spin" /> : 'Guardar'}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
          <DialogContent className="max-w-3xl">
              <DialogHeader>
                  <DialogTitle>{editingAssessment ? 'Editar Evaluación' : 'Nueva Evaluación'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                  <Input placeholder="Título" value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value })} />
                  <Textarea placeholder="Descripción" value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value })} />
                  <h3 className="font-bold mt-4">Preguntas</h3>
                  {assessmentForm.preguntas.map((q, i) => (
                      <div key={i} className="p-4 border rounded-lg space-y-2">
                          <Label>Pregunta {i+1}</Label>
                          <Input value={q.texto} onChange={e => {
                              const newPreguntas = [...assessmentForm.preguntas];
                              newPreguntas[i].texto = e.target.value;
                              setAssessmentForm({...assessmentForm, preguntas: newPreguntas});
                          }} />
                          {/* More fields for question type, options, etc. can be added here */}
                      </div>
                  ))}
                   <Button variant="outline" size="sm" onClick={() => setAssessmentForm({...assessmentForm, preguntas: [...assessmentForm.preguntas, {id: Date.now().toString(), texto: '', tipo: 'escrita', opciones: [], respuestaCorrecta: ''}]})}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Añadir Pregunta
                  </Button>
              </div>
              <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsAssessmentDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveAssessment} disabled={isProcessing}>
                       {isProcessing ? <Loader2 className="animate-spin" /> : 'Guardar'}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Entregar Actividad: {selectedActivity?.titulo}</DialogTitle>
                  <DialogDescription>{selectedActivity?.descripcion}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <Textarea placeholder="Escribe tu respuesta o un enlace a tu trabajo aquí." value={submissionForm.detalleEnvio} onChange={e => setSubmissionForm({...submissionForm, detalleEnvio: e.target.value})} rows={5} />
              </div>
               <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsSubmitActivityOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSubmitActivity} disabled={isProcessing}>
                       {isProcessing ? <Loader2 className="animate-spin" /> : 'Entregar'}
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el elemento seleccionado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
