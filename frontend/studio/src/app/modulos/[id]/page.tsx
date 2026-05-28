
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
  Bold,
  Italic,
  Underline,
  ExternalLink,
  Monitor,
  Plus,
  SquareCheck,
  Check
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
import { Separator } from "@/components/ui/separator";
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

interface Resource { _id?: any; titulo: string; descripcion: string; url: string; unidad: string; tipo: string; formato: string; }
interface Activity { _id?: any; titulo: string; descripcion: string; tipo: string; criterios_evaluacion: string; moduloId: string; archivoUrl?: string; }
interface Question { id: string; texto: string; tipo: 'opcion-multiple' | 'verdadero-falso'; opciones: string[]; respuestaCorrecta: string; }
interface Assessment { _id?: any; titulo: string; descripcion: string; moduloId: string; preguntas: Question[]; }
interface Submission { _id: string; usuarioNombre: string; usuarioEmail: string; tipoEnvio: string; tituloContenido: string; detalleEnvio: string; puntaje: number; estado: string; recomendaciones?: string; createdAt: string; moduloId: string; }

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
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes("docs.google.com") || url.includes("drive.google.com")) {
        const match = url.match(/\/d\/(.+?)(\/|$|#|\?)/) || url.match(/id=(.+?)(&|$)/);
        if (match) {
            const id = match[1];
            if (url.includes("/presentation")) return `https://docs.google.com/presentation/d/${id}/embed`;
            if (url.includes("/document")) return `https://docs.google.com/document/d/${id}/preview`;
            if (url.includes("/spreadsheets")) return `https://docs.google.com/spreadsheets/d/${id}/preview`;
            return `https://drive.google.com/file/d/${id}/preview`;
        }
    }
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");
    return url;
  };

  const isPrezi = url && url.includes("prezi.com");
  const finalUrl = blobUrl || getEmbedUrl(url);

  if (isPrezi) {
      return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8 text-center">
              <Monitor className="h-16 w-16 mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Presentación de Prezi</h3>
              <p className="text-sm text-slate-400 mb-6 max-w-md">Las presentaciones de Prezi se abren mejor en una ventana externa para garantizar la visualización correcta.</p>
              <Button asChild className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                  <a href={url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" /> Abrir en Pantalla Completa
                  </a>
              </Button>
          </div>
      );
  }

  if (!finalUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 p-8 text-center">
        <FileText className="h-12 w-12 mb-3 opacity-20" />
        <Button asChild variant="outline" className="rounded-xl bg-white shadow-sm"><a href={url} target="_blank">Abrir Recurso Externo</a></Button>
      </div>
    );
  }

  return <iframe src={finalUrl} className="w-full h-full border-0" allowFullScreen />;
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

  const [resourceForm, setResourceForm] = useState<Resource>({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" });
  const [activityForm, setActivityForm] = useState<Activity>({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" });
  const [assessmentForm, setAssessmentForm] = useState<Assessment>({ titulo: "", descripcion: "", moduloId: id, preguntas: [] });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({ id: "", texto: "", tipo: "opcion-multiple", opciones: ["Opción 1", "Opción 2"], respuestaCorrecta: "" });

  const getObjectId = (item: any): string => {
    if (!item) return '';
    if (item._id) {
      if (typeof item._id === 'string') return item._id;
      if (typeof item._id === 'object') return item._id.$oid || item._id.toString();
    }
    return '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse, subResponse] = await Promise.all([
        api.get("/educational-resources").catch(() => ({ data: [] })),
        api.get("/activities").catch(() => ({ data: [] })),
        api.get("/assessments").catch(() => ({ data: [] })),
        api.get("/performance-reports").catch(() => ({ data: [] }))
      ]);
      
      const moduleIdStr = String(id);
      setResources(resResponse.data.filter((res: any) => res.unidad === `Módulo ${moduleIdStr}` || res.unidad === `Unidad ${moduleIdStr}` || String(res.unidad) === moduleIdStr));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === moduleIdStr));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === moduleIdStr));
      setSubmissions(subResponse.data.filter((sub: any) => String(sub.moduloId) === moduleIdStr && (isAdmin || sub.usuarioEmail === user?.email)));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [id, user, isAdmin]);

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
        if (resourceId) await api.patch(`/educational-resources/${resourceId}`, formData);
        else await api.post("/educational-resources", formData);
      } else {
        if (resourceId) await api.patch(`/educational-resources/${resourceId}`, resourceForm);
        else await api.post("/educational-resources", resourceForm);
      }
      setIsResourceDialogOpen(false);
      fetchData();
      toast({ title: "Recurso guardado con éxito" });
    } catch (error) { toast({ title: "Error al guardar recurso", variant: "destructive" }); }
    finally { setIsProcessing(false); }
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
      toast({ title: "Actividad guardada correctamente" });
    } catch (error) { toast({ title: "Error al procesar actividad", variant: "destructive" }); }
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
      toast({ title: "Evaluación actualizada" });
    } catch (error) { toast({ title: "Error al guardar evaluación", variant: "destructive" }); }
    finally { setIsProcessing(false); }
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
        moduloId: String(id),
        tituloContenido: selectedActivity.titulo,
        detalleEnvio: JSON.stringify({ text: richText, file: attachedFile }),
        estado: "enviado"
      };
      if (editingSubmissionId) await api.patch(`/performance-reports/${editingSubmissionId}`, payload);
      else await api.post("/performance-reports", payload);
      setIsSubmitActivityOpen(false);
      fetchData();
      toast({ title: editingSubmissionId ? "Entrega actualizada con éxito" : "Entrega enviada para calificación" });
    } catch (error) { toast({ title: "Error al registrar entrega", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleOpenSubmission = (act: Activity) => {
    const sub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
    setSelectedActivity(act);
    setEditingSubmissionId(sub ? getObjectId(sub) : null);
    setIsSubmitActivityOpen(true);
    setTimeout(() => {
      if (sub && editorRef.current) {
        try {
          const parsed = JSON.parse(sub.detalleEnvio);
          editorRef.current.innerHTML = parsed.text || "";
          setAttachedFile(parsed.file || null);
        } catch (e) { editorRef.current.innerHTML = sub.detalleEnvio; }
      } else if (editorRef.current) {
        editorRef.current.innerHTML = "";
        setAttachedFile(null);
      }
    }, 100);
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradingForm({ puntaje: sub.puntaje || 0, recomendaciones: sub.recomendaciones || "" });
    setIsGradingDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    try {
      await api.patch(`/performance-reports/${getObjectId(selectedSubmission)}`, { ...gradingForm, estado: "calificado" });
      setIsGradingDialogOpen(false);
      fetchData();
      toast({ title: "Calificación registrada satisfactoriamente" });
    } catch (error) { toast({ title: "Error al guardar la nota", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const endpoints = { recurso: 'educational-resources', actividad: 'activities', evaluacion: 'assessments', entrega: 'performance-reports' };
      await api.delete(`/${endpoints[itemToDelete.type]}/${itemToDelete.id}`);
      fetchData();
      setIsDeleteDialogOpen(false);
      toast({ title: "Elemento eliminado permanentemente" });
    } catch (error) { toast({ title: "Error al intentar eliminar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const addAssessmentQuestion = () => {
    if (!currentQuestion.texto || !currentQuestion.respuestaCorrecta) {
      toast({ title: "Debes completar la pregunta y seleccionar la respuesta correcta", variant: "destructive" });
      return;
    }
    setAssessmentForm({ ...assessmentForm, preguntas: [...assessmentForm.preguntas, { ...currentQuestion, id: Math.random().toString(36).substr(2, 9) }] });
    setCurrentQuestion({ id: "", texto: "", tipo: "opcion-multiple", opciones: ["Opción 1", "Opción 2"], respuestaCorrecta: "" });
  };

  const addOptionToCurrentQuestion = () => {
    const nextNum = currentQuestion.opciones.length + 1;
    setCurrentQuestion({
      ...currentQuestion,
      opciones: [...currentQuestion.opciones, `Opción ${nextNum}`]
    });
  };

  const removeOptionFromCurrentQuestion = (idx: number) => {
    if (currentQuestion.opciones.length <= 2) return;
    const newOptions = currentQuestion.opciones.filter((_, i) => i !== idx);
    const wasCorrect = currentQuestion.respuestaCorrecta === currentQuestion.opciones[idx];
    setCurrentQuestion({
      ...currentQuestion,
      opciones: newOptions,
      respuestaCorrecta: wasCorrect ? "" : currentQuestion.respuestaCorrecta
    });
  };

  const formatSubmissionDetail = (detail: string) => {
    if (!detail) return null;
    try {
      if (detail.startsWith('{')) {
        const parsed = JSON.parse(detail);
        return (
          <div className="space-y-4">
            {parsed.text && (
              <div className="p-5 border rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Respuesta del Estudiante:
                </p>
                <div className="prose prose-sm max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: parsed.text }} />
              </div>
            )}
            {parsed.file && (
              <div className="flex items-center justify-between p-5 bg-blue-50/50 border border-blue-100 rounded-2xl group hover:bg-blue-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-blue-900 truncate max-w-[250px]">{parsed.file.name}</p>
                    <p className="text-[9px] text-blue-400 uppercase font-black tracking-tighter">Documento PDF / Imagen</p>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm" className="h-10 rounded-xl bg-white border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300">
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
    return <div className="p-4 bg-muted/50 rounded-2xl text-sm italic">{detail}</div>;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-primary/10"><Link href="/modulos"><ArrowLeft className="h-5 w-5" /></Link></Button>
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">{moduleInfo.title}</h1>
          <p className="text-muted-foreground">{moduleInfo.objective}</p>
        </div>
      </div>

      <Tabs defaultValue="recursos" className="w-full">
        <TabsList className={cn("grid w-full mb-8 h-12 p-1 bg-slate-100/50 rounded-2xl", isAdmin ? "grid-cols-4" : "grid-cols-3")}>
          <TabsTrigger value="recursos" className="rounded-xl data-[state=active]:shadow-md">Recursos</TabsTrigger>
          <TabsTrigger value="actividades" className="rounded-xl data-[state=active]:shadow-md">Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones" className="rounded-xl data-[state=active]:shadow-md">Evaluaciones</TabsTrigger>
          {isAdmin && <TabsTrigger value="seguimiento" className="rounded-xl data-[state=active]:shadow-md">Seguimiento</TabsTrigger>}
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" /> Materiales de Estudio
            </h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setIsResourceDialogOpen(true); }} size="sm" className="rounded-xl"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Recurso</Button>}
          </div>
          <div className="grid grid-cols-1 gap-8">
            {resources.map((res) => (
              <Card key={getObjectId(res)} className="relative shadow-xl border-none overflow-hidden rounded-[2rem] bg-white ring-1 ring-slate-100">
                {isAdmin && (
                  <div className="absolute top-6 right-6 flex gap-2 z-10">
                     <Button size="icon" className="h-10 w-10 bg-white/80 backdrop-blur-sm text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl shadow-sm ring-1 ring-slate-200 transition-all" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                     <Button variant="destructive" size="icon" className="h-10 w-10 rounded-2xl shadow-sm shadow-red-200 transition-all" onClick={() => { setItemToDelete({ id: getObjectId(res), type: 'recurso' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                )}
                <CardHeader className="px-8 pt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="w-fit border-primary/20 text-primary uppercase text-[10px] font-bold px-3 py-1 rounded-full">{res.tipo.toUpperCase()}</Badge>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">• {res.formato}</span>
                  </div>
                  <CardTitle className="text-2xl font-bold leading-tight">{res.titulo}</CardTitle>
                  <CardDescription className="text-base mt-2">{res.descripcion}</CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8 mt-4"><div className="aspect-video rounded-3xl overflow-hidden bg-black border shadow-2xl ring-4 ring-slate-50"><ResourcePreview url={res.url} title={res.titulo} /></div></CardContent>
              </Card>
            ))}
            {resources.length === 0 && !loading && (
              <div className="py-24 text-center border-2 border-dashed rounded-[3rem] bg-slate-50/50">
                <Layers className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Aún no se han añadido recursos a este módulo.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-headline flex items-center gap-2">
               <ClipboardList className="h-5 w-5 text-primary" /> Actividades Prácticas
             </h2>
             {isAdmin && <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); setIsActivityDialogOpen(true); }} size="sm" className="rounded-xl"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((act) => {
              const userSub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
              return (
                <Card key={getObjectId(act)} className="relative flex flex-col shadow-xl border-none rounded-[2.5rem] bg-white group hover:shadow-2xl transition-all duration-500 overflow-hidden ring-1 ring-slate-100">
                   {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="icon" className="h-9 w-9 bg-white/90 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm ring-1 ring-slate-200" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-9 w-9 rounded-xl shadow-sm" onClick={() => { setItemToDelete({ id: getObjectId(act), type: 'actividad' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader className="p-8 pb-4">
                    <Badge variant="secondary" className="w-fit mb-3 bg-primary/5 text-primary border-none text-[9px] font-bold px-4 py-1.5 rounded-full">{act.tipo.toUpperCase()}</Badge>
                    <CardTitle className="text-2xl font-bold leading-tight">{act.titulo}</CardTitle>
                    <CardDescription className="text-sm mt-3 leading-relaxed line-clamp-3">{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-8 pt-0 gap-3 mt-auto">
                    {act.archivoUrl && <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold border-slate-200" asChild><a href={act.archivoUrl} target="_blank"><Download className="mr-2 h-4 w-4" /> Guía PDF</a></Button>}
                    {!isAdmin && (userSub ? <Button variant="secondary" className="flex-[2] h-12 rounded-2xl font-bold bg-green-50 text-green-700 border border-green-100 hover:bg-green-100" onClick={() => handleOpenSubmission(act)}><CheckCircle2 className="mr-2 h-4 w-4" /> Entregado (Editar)</Button> : <Button className="flex-[2] h-12 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => handleOpenSubmission(act)}><Upload className="mr-2 h-4 w-4" /> Entregar Tarea</Button>)}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
           <div className="flex justify-between items-center">
              <h2 className="text-xl font-headline flex items-center gap-2">
                <FileQuestion className="h-5 w-5 text-primary" /> Evaluaciones de Módulo
              </h2>
              {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setIsAssessmentDialogOpen(true); }} size="sm" className="rounded-xl"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Evaluación</Button>}
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {assessments.map((ass) => (
                <Card key={getObjectId(ass)} className="relative flex flex-col shadow-lg border-none rounded-[2rem] bg-white group ring-1 ring-slate-100 overflow-hidden">
                   {isAdmin && (
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Button size="icon" className="h-8 w-8 bg-white/90 text-blue-600 rounded-lg shadow-sm ring-1 ring-slate-200" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                       <Button variant="destructive" size="icon" className="h-8 w-8 rounded-lg shadow-sm" onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: getObjectId(ass), type: 'evaluacion' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  )}
                  <CardHeader className="p-6">
                    <div className="bg-primary/5 h-12 w-12 rounded-2xl flex items-center justify-center mb-4 text-primary"><FileQuestion className="h-6 w-6" /></div>
                    <CardTitle className="text-xl font-bold">{ass.titulo}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2 text-xs">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardFooter className="p-6 pt-0 mt-auto"><Button className="w-full h-11 rounded-xl font-bold bg-slate-900">Comenzar Evaluación</Button></CardFooter>
                </Card>
             ))}
           </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento" className="space-y-6">
            <Card className="shadow-2xl border-none overflow-hidden rounded-[2.5rem] bg-white ring-1 ring-slate-100">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-b-slate-100">
                    <TableHead className="px-8 h-14 font-bold uppercase tracking-widest text-[10px] text-slate-500">Estudiante</TableHead>
                    <TableHead className="h-14 font-bold uppercase tracking-widest text-[10px] text-slate-500">Contenido</TableHead>
                    <TableHead className="h-14 font-bold uppercase tracking-widest text-[10px] text-slate-500">Nota Final</TableHead>
                    <TableHead className="h-14 font-bold uppercase tracking-widest text-[10px] text-slate-500">Estado</TableHead>
                    <TableHead className="text-right px-8 h-14 font-bold uppercase tracking-widest text-[10px] text-slate-500">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={getObjectId(sub)} className="hover:bg-slate-50/50 border-b-slate-50 transition-colors">
                      <TableCell className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{sub.usuarioNombre}</span>
                          <span className="text-[10px] text-slate-400 font-medium tracking-tight">{sub.usuarioEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-slate-600">{sub.tituloContenido}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("rounded-lg px-3 py-1 font-black", Number(sub.puntaje) >= 3.5 ? "border-green-200 text-green-700 bg-green-50" : "border-amber-200 text-amber-700 bg-amber-50")}>
                          {Number(sub.puntaje).toFixed(1)} / 5.0
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("rounded-full px-3 py-0.5 text-[9px] font-bold border-none", sub.estado === 'calificado' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white')}>
                          {sub.estado.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <Button size="sm" variant="ghost" className="rounded-xl h-9 hover:bg-primary/10 text-primary font-bold" onClick={() => handleOpenGrading(sub)}>
                          <GradeIcon className="h-4 w-4 mr-2" /> Calificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-24 text-slate-300 italic">No hay entregas pendientes en este módulo.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden h-auto">
          <div className="bg-slate-50 border-b p-6">
            <DialogTitle className="text-2xl font-headline font-bold">Gestión de Recurso</DialogTitle>
            <DialogDescription>Configura los detalles del material educativo.</DialogDescription>
          </div>
          <div className="p-6 space-y-6">
             <div className="space-y-2"><Label className="font-bold text-slate-700">Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} className="rounded-xl h-11 bg-slate-50/50" /></div>
             <div className="space-y-2"><Label className="font-bold text-slate-700">Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} className="rounded-xl min-h-[80px] bg-slate-50/50" /></div>
             <div className="space-y-2">
                <Label className="font-bold text-slate-700">Tipo de Recurso</Label>
                <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                  <SelectTrigger className="rounded-xl h-11 bg-slate-50/50"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="guia">Guía / Documento</SelectItem>
                    <SelectItem value="video">Video Tutorial</SelectItem>
                    <SelectItem value="articulo">Artículo / Web</SelectItem>
                    <SelectItem value="prezi">Presentación Prezi</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <Tabs value={sourceTab} onValueChange={(v: any) => setSourceTab(v)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl h-10 p-1">
                  <TabsTrigger value="url" className="rounded-lg text-xs">URL Enlace</TabsTrigger>
                  <TabsTrigger value="file" className="rounded-lg text-xs">Subir Archivo</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="pt-2"><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." className="rounded-xl h-11" /></TabsContent>
                <TabsContent value="file" className="pt-2">
                  <div className="border-2 border-dashed p-6 text-center rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors border-slate-200" onClick={() => document.getElementById('res-f')?.click()}>
                    <input id="res-f" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-[10px] font-bold text-slate-500">{uploadedFile ? uploadedFile.name : "Seleccionar PDF, Video o Imagen"}</p>
                  </div>
                </TabsContent>
             </Tabs>
          </div>
          <div className="p-6 pt-0 flex gap-3">
             <Button variant="ghost" onClick={() => setIsResourceDialogOpen(false)} className="h-11 rounded-xl flex-1 font-bold">Cancelar</Button>
             <Button onClick={handleSaveResource} disabled={isProcessing} className="h-11 rounded-xl flex-[2] font-bold bg-primary shadow-lg shadow-primary/20">
               {isProcessing ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />} Guardar Recurso
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem] border-none shadow-2xl">
          <DialogHeader className="p-4"><DialogTitle className="text-2xl font-headline font-bold">{editingActivity ? "Editar" : "Nueva"} Actividad</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2"><Label className="font-bold">Título</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} className="rounded-xl h-11" /></div>
             <div className="space-y-2"><Label className="font-bold">Descripción</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} className="rounded-xl min-h-[100px]" /></div>
             <div className="space-y-2"><Label className="font-bold">Criterios de Evaluación</Label><Textarea value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value})} className="rounded-xl" /></div>
             <div className="space-y-2"><Label className="font-bold">URL Guía PDF (Opcional)</Label><Input value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value})} placeholder="https://..." className="rounded-xl" /></div>
          </div>
          <DialogFooter className="p-4 gap-2">
            <Button variant="ghost" onClick={() => setIsActivityDialogOpen(false)} className="rounded-xl flex-1">Cancelar</Button>
            <Button onClick={handleSaveActivity} disabled={isProcessing} className="rounded-xl flex-[2] font-bold bg-primary">Guardar Actividad</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2rem] border-none shadow-2xl p-0">
          <div className="p-8 bg-slate-50 border-b"><DialogTitle className="text-2xl font-headline font-bold">{editingAssessment ? "Editar" : "Nueva"} Evaluación</DialogTitle></div>
          <div className="p-8 space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2"><Label className="font-bold">Título</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} className="rounded-xl h-12" /></div>
                <div className="space-y-2"><Label className="font-bold">Descripción Corta</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} className="rounded-xl h-12" /></div>
             </div>
             <Separator className="bg-slate-100" />
             <div className="p-6 border rounded-[2rem] bg-slate-50/50 space-y-6">
                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest flex items-center gap-2"><Plus className="h-4 w-4" /> Diseñar Pregunta</h4>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Texto de la pregunta</Label>
                      <Input placeholder="¿Qué es una base de datos relacional?" value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} className="rounded-xl h-12" />
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {currentQuestion.opciones.map((opcion, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                           <div className="flex-1 space-y-1">
                              <div className="flex justify-between items-center px-1">
                                 <Label className="text-[10px] font-bold text-slate-400 uppercase">Opción {String.fromCharCode(65 + idx)}</Label>
                                 {currentQuestion.opciones.length > 2 && (
                                   <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-5 w-5 text-destructive hover:bg-destructive/10" 
                                    onClick={() => removeOptionFromCurrentQuestion(idx)}
                                   >
                                     <X className="h-3 w-3" />
                                   </Button>
                                 )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Input 
                                  value={opcion} 
                                  onChange={e => {
                                    const op = [...currentQuestion.opciones];
                                    op[idx] = e.target.value;
                                    setCurrentQuestion({...currentQuestion, opciones: op});
                                  }} 
                                  className="rounded-xl h-11" 
                                />
                                <Button 
                                  type="button"
                                  variant={currentQuestion.respuestaCorrecta === opcion ? "default" : "outline"}
                                  className={cn(
                                    "h-11 w-11 rounded-xl shrink-0 transition-all",
                                    currentQuestion.respuestaCorrecta === opcion ? "bg-green-600 hover:bg-green-700 text-white" : "border-slate-200 text-slate-300"
                                  )}
                                  onClick={() => setCurrentQuestion({...currentQuestion, respuestaCorrecta: opcion})}
                                  title="Marcar como respuesta correcta"
                                >
                                  {currentQuestion.respuestaCorrecta === opcion ? <CheckCircle2 className="h-6 w-6" /> : <Check className="h-5 w-5 opacity-20" />}
                                </Button>
                              </div>
                           </div>
                        </div>
                      ))}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="w-fit text-[11px] font-black uppercase text-primary hover:bg-primary/10 mt-1" 
                        onClick={addOptionToCurrentQuestion}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Añadir Opción
                      </Button>
                   </div>
                   <Button variant="outline" size="lg" onClick={addAssessmentQuestion} className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-bold h-12 mt-4"><Plus className="h-4 w-4 mr-2" /> Añadir Pregunta al Banco</Button>
                </div>
             </div>
             <div className="space-y-3">
                <Label className="font-bold text-slate-700 flex items-center gap-2"><SquareCheck className="h-4 w-4" /> Banco de Preguntas ({assessmentForm.preguntas.length})</Label>
                <div className="grid grid-cols-1 gap-2">
                  {assessmentForm.preguntas.map((q, i) => (
                    <div key={i} className="text-xs p-4 bg-white ring-1 ring-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-700">P{i+1}: {q.texto}</span>
                        <span className="text-[9px] text-green-600 font-bold uppercase">✓ Correcta: {q.respuestaCorrecta}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-red-50" onClick={() => setAssessmentForm({...assessmentForm, preguntas: assessmentForm.preguntas.filter((_, idx) => idx !== i)}) }><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
             </div>
          </div>
          <div className="p-8 border-t flex gap-3">
            <Button variant="ghost" onClick={() => setIsAssessmentDialogOpen(false)} className="rounded-xl h-12 flex-1">Cancelar</Button>
            <Button onClick={handleSaveAssessment} disabled={isProcessing} className="rounded-xl flex-[2] h-12 font-bold bg-primary shadow-lg shadow-primary/20">Guardar Evaluación</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 bg-slate-50 border-b flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-headline font-bold">Entrega de Actividad</DialogTitle>
              <DialogDescription className="text-primary font-bold mt-1 uppercase text-[10px] tracking-widest">{selectedActivity?.titulo}</DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsSubmitActivityOpen(false)} className="rounded-full"><X className="h-5 w-5" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-3">
               <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Contenido de la respuesta</Label>
               <div className="border rounded-[2rem] overflow-hidden shadow-inner ring-1 ring-slate-200">
                  <div className="bg-slate-50/50 p-2 border-b flex flex-wrap gap-1">
                    <Button variant="ghost" size="icon" onClick={() => document.execCommand('bold')} className="h-9 w-9 rounded-xl"><Bold className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => document.execCommand('italic')} className="h-9 w-9 rounded-xl"><Italic className="h-4 w-4"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => document.execCommand('underline')} className="h-9 w-9 rounded-xl"><Underline className="h-4 w-4"/></Button>
                  </div>
                  <div ref={editorRef} contentEditable className="p-8 min-h-[350px] outline-none prose prose-sm max-w-none bg-white text-slate-800" />
               </div>
            </div>
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Archivo Adjunto (PDF o Imagen)</Label>
              <div className="border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer hover:bg-slate-50 transition-all border-slate-200 group" onClick={() => document.getElementById('subFile')?.click()}>
                <input id="subFile" type="file" className="hidden" onChange={handleFileChange}/>
                {attachedFile ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-green-100 p-4 rounded-2xl text-green-600"><CheckCircle2 className="h-10 w-10"/></div>
                    <span className="font-bold text-green-700">{attachedFile.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-slate-100 p-4 rounded-2xl text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors"><Upload className="h-10 w-10" /></div>
                    <p className="text-sm font-bold text-slate-400">Haz clic para subir un documento soporte</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-8 border-t bg-slate-50/30 flex gap-3">
            <Button variant="ghost" onClick={() => setIsSubmitActivityOpen(false)} className="rounded-2xl h-14 flex-1 font-bold">Cancelar</Button>
            <Button onClick={handleSubmitActivity} disabled={isProcessing} className="bg-primary hover:bg-primary/90 h-14 px-10 rounded-2xl font-bold flex-[2] shadow-xl shadow-primary/20 text-lg">
              {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} 
              {editingSubmissionId ? "Actualizar Mi Entrega" : "Enviar Entrega Final"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
          <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
            <DialogTitle className="text-2xl font-headline flex items-center gap-3">
              <GradeIcon className="h-8 w-8 text-primary" />
              Calificar Entrega
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsGradingDialogOpen(false)} className="text-white/50 hover:text-white rounded-full"><X className="h-5 w-5"/></Button>
          </div>
          <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
             {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
             
             <Separator className="bg-slate-100" />
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Nota del Estudiante (0.0 - 5.0)</Label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="0" 
                    max="5" 
                    className="flex h-16 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-2 text-3xl font-black text-center text-primary focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    value={gradingForm.puntaje} 
                    onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value) || 0})} 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Retroalimentación / Recomendaciones</Label>
                  <Textarea 
                    className="rounded-2xl min-h-[120px] resize-none bg-slate-50 border-2 border-slate-100 focus:border-primary/50 transition-all p-4 text-sm"
                    placeholder="Escribe aquí los comentarios para el estudiante sobre su desempeño..."
                    value={gradingForm.recomendaciones} 
                    onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} 
                  />
                </div>
             </div>
          </div>
          <div className="p-8 border-t bg-slate-50/50 flex gap-3">
            <Button variant="ghost" onClick={() => setIsGradingDialogOpen(false)} className="rounded-2xl h-14 flex-1 font-bold text-slate-500">Volver</Button>
            <Button onClick={handleSaveGrade} disabled={isProcessing} className="flex-[2] h-14 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-lg">
              {isProcessing ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-4 w-4" />}
              Publicar Calificación
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 mt-2">
              Esta acción eliminará el registro permanentemente de la base de datos de MongoDB. No se puede revertir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel className="rounded-xl h-12 flex-1 border-slate-200">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 flex-1 shadow-lg shadow-red-200 font-bold">Sí, Eliminar Definitivamente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
