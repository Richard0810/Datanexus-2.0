"use client";

import { useEffect, useState, use, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Loader2, 
  PlusCircle, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  Upload,
  ClipboardList,
  FileQuestion,
  Layers,
  X,
  Trophy,
  FileText,
  Video,
  History,
  GraduationCap as GradeIcon,
  Save,
  Download,
  Plus,
  PlayCircle,
  BookOpen,
  Monitor,
  Database,
  Link as LinkIcon,
  CheckSquare,
  ExternalLink
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface Resource {
  _id?: any;
  titulo: string;
  descripcion: string;
  url: string;
  unidad: string;
  tipo: string;
  formato: string;
}

interface Activity {
  _id?: any;
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
  _id?: any;
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
  recomendaciones?: string;
  createdAt: string;
  moduloId: string;
}

const getObjectId = (item: any): string => {
  if (!item) return '';
  if (item._id) {
    if (typeof item._id === 'string') return item._id;
    if (typeof item._id === 'object') return item._id.$oid || item._id.toString();
  }
  return '';
};

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
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mime });
        const newUrl = URL.createObjectURL(blob);
        setBlobUrl(newUrl);
        return () => URL.revokeObjectURL(newUrl);
      } catch (e) {
        console.error("Error al procesar archivo local:", e);
      }
    }
    return undefined;
  }, [url]);

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return null;
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let videoId = "";
      if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
      else if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");
    
    if (url.includes("docs.google.com") || url.includes("drive.google.com")) {
      if (url.includes("/edit") || url.includes("/view")) {
        return url.replace(/\/edit.*$/, "/preview").replace(/\/view.*$/, "/preview");
      }
      if (url.includes("/d/")) {
        const match = url.match(/\/d\/(.+?)(\/|$)/);
        if (match) return `https://docs.google.com/presentation/d/${match[1]}/embed`;
      }
    }

    return url;
  };

  const finalUrl = blobUrl || getEmbedUrl(url);

  if (!finalUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-muted-foreground p-8 text-center">
        <FileText className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-xs font-bold uppercase tracking-widest mb-4">Material de Estudio</p>
        <div className="flex gap-2">
           <Button asChild variant="outline" size="sm" className="rounded-xl font-bold bg-white">
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Ver Externo
            </a>
          </Button>
          {url && url.startsWith('data:') && (
            <Button asChild variant="default" size="sm" className="rounded-xl font-bold">
              <a href={url} download={title}>
                <Download className="mr-2 h-4 w-4" /> Descargar
              </a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <iframe 
        src={finalUrl} 
        className="w-full h-full border-0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen 
      />
      <div className="absolute bottom-4 right-4 z-30">
        <Button asChild size="sm" variant="secondary" className="rounded-full shadow-lg opacity-80 hover:opacity-100">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" /> Ventana Nueva
          </a>
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
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'recurso' | 'actividad' | 'evaluacion' | 'entrega' } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string } | null>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse, subResponse] = await Promise.all([
        api.get("/educational-resources"),
        api.get("/activities"),
        api.get("/assessments"),
        api.get("/performance-reports")
      ]);
      
      setResources(resResponse.data.filter((res: any) => 
        res.unidad === `Módulo ${id}` || 
        res.unidad === `Unidad ${id}` || 
        res.unidad === id
      ));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === String(id)));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === String(id)));

      const filteredSubmissions = subResponse.data.filter((sub: any) => 
        String(sub.moduloId) === String(id) && 
        (isAdmin || sub.usuarioEmail === user?.email)
      );
      setSubmissions(filteredSubmissions);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [id, user, isAdmin]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFile({
          name: file.name,
          data: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveResource = async () => {
    if (!resourceForm.titulo) return;
    setIsProcessing(true);

    try {
      const resourceId = getObjectId(editingResource);
      if (uploadedFile && sourceTab === "file") {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("titulo", resourceForm.titulo);
        formData.append("descripcion", resourceForm.descripcion);
        formData.append("unidad", resourceForm.unidad);
        formData.append("tipo", resourceForm.tipo);
        formData.append("formato", uploadedFile.name.split(".").pop() || "file");
        if (resourceId) await api.patch(`/educational-resources/${resourceId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        else await api.post("/educational-resources", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        if (resourceId) await api.patch(`/educational-resources/${resourceId}`, resourceForm);
        else await api.post("/educational-resources", resourceForm);
      }
      setIsResourceDialogOpen(false);
      fetchData();
      toast({ title: "Recurso guardado" });
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!activityForm.titulo) return;
    setIsProcessing(true);
    try {
      const activityId = getObjectId(editingActivity);
      if (activityId) await api.patch(`/activities/${activityId}`, activityForm);
      else await api.post("/activities", activityForm);
      setIsActivityDialogOpen(false);
      fetchData();
      toast({ title: "Actividad guardada" });
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity) return;
    const richText = editorRef.current?.innerHTML || "";
    setIsProcessing(true);
    try {
      const payload = {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        tipoEnvio: "actividad",
        moduloId: id,
        tituloContenido: selectedActivity.titulo,
        detalleEnvio: JSON.stringify({ text: richText, file: attachedFile }),
        estado: "enviado"
      };
      if (editingSubmissionId) await api.patch(`/performance-reports/${editingSubmissionId}`, payload);
      else await api.post("/performance-reports", payload);
      setIsSubmitActivityOpen(false);
      fetchData();
      toast({ title: "Entrega enviada" });
    } catch (error) {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradingForm({ puntaje: sub.puntaje || 0, recomendaciones: sub.recomendaciones || "" });
    setIsGradingDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    const subId = getObjectId(selectedSubmission);
    try {
      await api.patch(`/performance-reports/${subId}`, {
        ...gradingForm,
        estado: "calificado"
      });
      setIsGradingDialogOpen(false);
      fetchData();
      toast({ title: "Calificación guardada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo) return;
    setIsProcessing(true);
    try {
      const assessmentId = getObjectId(editingAssessment);
      if (assessmentId) await api.patch(`/assessments/${assessmentId}`, assessmentForm);
      else await api.post("/assessments", assessmentForm);
      setIsAssessmentDialogOpen(false);
      fetchData();
      toast({ title: "Evaluación guardada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const endpoint = itemToDelete.type === 'recurso' ? 'educational-resources' : itemToDelete.type === 'actividad' ? 'activities' : itemToDelete.type === 'evaluacion' ? 'assessments' : 'performance-reports';
      await api.delete(`/${endpoint}/${itemToDelete.id}`);
      fetchData();
      toast({ title: "Eliminado con éxito" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); setIsDeleteDialogOpen(false); }
  };

  const formatSubmissionDetail = (detail: string) => {
    try {
      const parsed = JSON.parse(detail);
      if (parsed.text !== undefined) {
          return (
              <div className="space-y-6">
                  <div className="p-5 border rounded-xl bg-background shadow-sm">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-widest">Respuesta del Estudiante:</p>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parsed.text }} />
                  </div>
                  {parsed.file && (
                      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                  <p className="font-bold text-sm">{parsed.file.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Documento adjunto</p>
                              </div>
                          </div>
                          <Button asChild variant="default" size="sm" className="bg-slate-900">
                              <a href={parsed.file.data} download={parsed.file.name}>
                                  <Download className="mr-2 h-4 w-4" /> Descargar
                              </a>
                          </Button>
                      </div>
                  )}
              </div>
          );
      }
    } catch (e) {}
    return <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">{detail}</div>;
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
          <TabsTrigger value="recursos" className="flex items-center gap-2 font-bold h-12"><Layers className="h-4 w-4" /> Recursos</TabsTrigger>
          <TabsTrigger value="actividades" className="flex items-center gap-2 font-bold h-12"><ClipboardList className="h-4 w-4" /> Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones" className="flex items-center gap-2 font-bold h-12"><FileQuestion className="h-4 w-4" /> Evaluaciones</TabsTrigger>
          {isAdmin && <TabsTrigger value="seguimiento" className="flex items-center gap-2 text-accent font-bold h-12"><History className="h-4 w-4" /> Seguimiento</TabsTrigger>}
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
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Cargando materiales...</p>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => {
                const resId = getObjectId(res);
                return (
                  <Card key={resId} className="overflow-hidden group relative shadow-md">
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <Button variant="default" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 text-white shadow-lg rounded-full" onClick={() => { setItemToDelete({ id: resId, type: 'recurso' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {res.tipo === "video" ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                        <Badge variant="outline" className="uppercase tracking-widest text-[9px] font-bold">{res.tipo}</Badge>
                      </div>
                      <CardTitle className="text-2xl font-bold">{res.titulo}</CardTitle>
                      <CardDescription>{res.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner">
                        <ResourcePreview url={res.url} title={res.titulo} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
               <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
               <p className="text-muted-foreground italic">No hay recursos disponibles para este módulo.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => {
              const actId = getObjectId(act);
              const userSub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
              return (
                <Card key={actId} className="flex flex-col shadow-md relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                       <Button variant="default" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 text-white shadow-lg rounded-full" onClick={() => { setItemToDelete({ id: actId, type: 'actividad' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2 uppercase text-[9px] font-bold">{act.tipo}</Badge>
                    <CardTitle className="text-xl font-bold">{act.titulo}</CardTitle>
                    <CardDescription>{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    {!isAdmin && !userSub && <Button className="w-full font-bold h-11" onClick={() => { setSelectedActivity(act); setIsSubmitActivityOpen(true); }}><Upload className="mr-2 h-4 w-4"/> Entregar Tarea</Button>}
                    {userSub && <Badge className="bg-green-500 font-bold uppercase py-2 px-4 w-full justify-center">Entregado</Badge>}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((ass) => {
               const assId = getObjectId(ass);
               const userSub = submissions.find(s => s.tituloContenido === ass.titulo);
               return (
                 <Card key={assId} className="cursor-pointer hover:border-primary transition-all shadow-md relative" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('preview'); setIsAssessmentDialogOpen(true); }}>
                   {isAdmin && (
                     <div className="absolute top-2 right-2 flex gap-1 z-10">
                        <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3 w-3"/></Button>
                        <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-full" onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: assId, type: 'evaluacion' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3"/></Button>
                     </div>
                   )}
                   <CardHeader>
                      <CardTitle className="text-lg font-bold">{ass.titulo}</CardTitle>
                      <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                   </CardHeader>
                   <CardFooter><Button variant={userSub ? "outline" : "default"} className="w-full font-bold">{userSub ? "Ver Resultado" : "Realizar Test"}</Button></CardFooter>
                 </Card>
               );
            })}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento">
            <Card className="shadow-md overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="px-6 font-bold uppercase tracking-widest text-[10px]">Estudiante</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px]">Contenido</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px]">Puntaje</TableHead>
                      <TableHead className="font-bold uppercase tracking-widest text-[10px]">Estado</TableHead>
                      <TableHead className="text-right px-6 font-bold uppercase tracking-widest text-[10px]">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="px-6"><strong>{sub.usuarioNombre}</strong><br/><span className="text-[10px]">{sub.usuarioEmail}</span></TableCell>
                        <TableCell className="text-xs font-medium">{sub.tituloContenido}</TableCell>
                        <TableCell><Badge className="bg-primary/10 text-primary">{sub.puntaje}/5.0</Badge></TableCell>
                        <TableCell><Badge variant={sub.estado === 'calificado' ? 'default' : 'secondary'} className="text-[10px] font-bold">{sub.estado.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-right px-6"><Button size="sm" variant="outline" onClick={() => handleOpenGrading(sub)}><GradeIcon className="h-4 w-4 mr-2"/> Calificar</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
          <div className="bg-[#1a2744] px-6 py-5 flex items-center justify-between text-white">
            <DialogTitle>{editingResource ? "Editar Recurso" : "Añadir Recurso"}</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsResourceDialogOpen(false)}><X className="h-4 w-4"/></Button>
          </div>
          <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
            <div className="space-y-2">
              <Label>Título del Recurso</Label>
              <Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} className="rounded-xl"/>
            </div>
            <div className="space-y-2">
              <Label>Descripción</Label>
              <Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} className="rounded-xl"/>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Recurso</Label>
              <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="guia">Guía / Documento</SelectItem>
                  <SelectItem value="video">Video Tutorial</SelectItem>
                  <SelectItem value="enlace">Enlace Externo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs value={sourceTab} onValueChange={(v: any) => setSourceTab(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="url">URL Externa</TabsTrigger>
                <TabsTrigger value="file">Subir Archivo</TabsTrigger>
              </TabsList>
              <TabsContent value="url">
                <Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." className="rounded-xl"/>
              </TabsContent>
              <TabsContent value="file">
                 <div className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer" onClick={() => document.getElementById('resFile')?.click()}>
                    <input id="resFile" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)}/>
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2"/>
                    <p className="text-sm font-medium">{uploadedFile ? uploadedFile.name : "Selecciona o arrastra un archivo (PDF, MP4, PNG)"}</p>
                 </div>
              </TabsContent>
            </Tabs>
          </div>
          <div className="p-6 border-t flex gap-2">
            <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)} className="flex-1 h-12 rounded-xl">Cancelar</Button>
            <Button onClick={handleSaveResource} disabled={isProcessing} className="flex-1 h-12 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white">
              {isProcessing ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>} Guardar Recurso
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col rounded-2xl">
          <DialogHeader><DialogTitle>Realizar Entrega</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="border rounded-2xl overflow-hidden">
               <div className="bg-muted p-2 border-b flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => execCommand('bold')}><Layers className="h-4 w-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => execCommand('italic')}><Layers className="h-4 w-4"/></Button>
               </div>
               <div ref={editorRef} contentEditable className="p-5 min-h-[200px] outline-none prose prose-sm max-w-none"/>
            </div>
            <div className="border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer" onClick={() => document.getElementById('subFile')?.click()}>
               <input id="subFile" type="file" className="hidden" onChange={handleFileChange}/>
               {attachedFile ? <div className="flex items-center justify-center gap-2 text-primary font-bold"><CheckCircle2 className="h-5 w-5"/> {attachedFile.name}</div> : <p className="text-sm text-muted-foreground">Adjuntar archivo opcional (PDF, Imágenes)</p>}
            </div>
          </div>
          <DialogFooter className="p-4 border-t">
            <Button variant="outline" onClick={() => setIsSubmitActivityOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleSubmitActivity} disabled={isProcessing} className="bg-primary px-8 rounded-xl font-bold">{isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4"/>} Enviar Entrega</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-2xl">
          <DialogHeader><DialogTitle>Calificar Entrega</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto px-1">
             <div className="p-4 bg-muted rounded-xl">{selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}</div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Puntaje (0-5.0)</Label><Input type="number" step="0.1" min="0" max="5" value={gradingForm.puntaje} onChange={e => setGradingForm({...gradingForm, puntaje: Number(e.target.value)})}/></div>
                <div className="space-y-2"><Label>Comentarios</Label><Textarea value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})}/></div>
             </div>
          </div>
          <DialogFooter><Button onClick={handleSaveGrade} disabled={isProcessing} className="w-full font-bold h-12 rounded-xl">Guardar Calificación</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Se borrará permanentemente de MongoDB. Esta acción no se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white rounded-xl">Eliminar Definitivamente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}