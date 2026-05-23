"use client";

import { useEffect, useState, use, useRef } from "react";
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
  MessageSquare,
  GraduationCap as GradeIcon,
  Save,
  Link2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Download,
  FileUp,
  AlertCircle,
  Plus,
  PlayCircle,
  BookOpen,
  Monitor,
  Database,
  MoreHorizontal
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
  _id?: any;
  id?: string;
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

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  
  const userRole = user?.role?.trim().toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrador';
  
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
  const [isDeleteResourceDialogOpen, setIsDeleteResourceDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isViewOwnSubmissionOpen, setIsViewOwnSubmissionOpen] = useState(false);
  
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string } | null>(null);
  
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);

  // Nuevos estados para recursos con archivos
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");
  const [isDragging, setIsDragging] = useState(false);
  
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

  const getResourceId = (res: any) => {
    if (!res) return '';
    if (res._id) {
      if (typeof res._id === 'string') return res._id;
      if (typeof res._id === 'object') {
        if (res._id.$oid) return res._id.$oid;
        if (typeof res._id.toString === 'function') return res._id.toString();
      }
    }
    return res.id || '';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse, subResponse] = await Promise.all([
        api.get("/educational-resources"),
        api.get("/activities"),
        api.get("/assessments"),
        api.get("/performance-reports")
      ]);
      
      setResources(resResponse.data.filter((res: any) => res.unidad === `Módulo ${id}`));
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
  }, [id, user]);

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
    if (sourceTab === "url" && !resourceForm.url && !uploadedFile) return;
    setIsProcessing(true);

    try {
      const resourceId = getResourceId(editingResource);

      if (uploadedFile && sourceTab === "file") {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        formData.append("titulo", resourceForm.titulo);
        formData.append("descripcion", resourceForm.descripcion);
        formData.append("unidad", resourceForm.unidad);
        formData.append("tipo", resourceForm.tipo);
        formData.append("formato", uploadedFile.name.split(".").pop() || "file");

        if (resourceId) {
          await api.patch(`/educational-resources/${resourceId}`, formData);
        } else {
          await api.post("/educational-resources", formData);
        }
      } else {
        if (resourceId) {
          await api.patch(`/educational-resources/${resourceId}`, resourceForm);
        } else {
          await api.post("/educational-resources", resourceForm);
        }
      }

      setIsResourceDialogOpen(false);
      setUploadedFile(null);
      setSourceTab("url");
      fetchData();
      toast({ title: "Recurso guardado" });
    } catch (error) {
      toast({ title: "Error al guardar el recurso", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const confirmDeleteResource = async () => {
    if (!resourceToDelete) return;
    const resourceId = getResourceId(resourceToDelete);
    
    setIsProcessing(true);
    try {
      await api.delete(`/educational-resources/${resourceId}`);
      toast({ title: "Recurso eliminado correctamente" });
      setIsDeleteResourceDialogOpen(false);
      setResourceToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar recurso:", error);
      toast({ title: "Error al intentar eliminar el recurso", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!activityForm.titulo) return;
    setIsProcessing(true);
    try {
      const activityId = getResourceId(editingActivity);
      if (activityId) {
        await api.patch(`/activities/${activityId}`, activityForm);
      } else {
        await api.post("/activities", activityForm);
      }
      setIsActivityDialogOpen(false);
      fetchData();
      toast({ title: "Actividad guardada" });
    } catch (error) {
      toast({ title: "Error al guardar la actividad", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenEditSubmission = (sub: Submission, act: Activity) => {
    setSelectedActivity(act);
    setEditingSubmissionId(sub._id);
    setIsSubmitActivityOpen(true);
    
    setTimeout(() => {
        try {
            if (!sub.detalleEnvio) return;
            const parsed = JSON.parse(sub.detalleEnvio);
            if (editorRef.current) editorRef.current.innerHTML = parsed.text || "";
            if (parsed.file) setAttachedFile(parsed.file);
            else setAttachedFile(null);
        } catch (e) {
            console.error("Error al cargar entrega para editar", e);
        }
    }, 100);
  };

  const handleDeleteSubmission = async (subId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar tu entrega? Esta acción no se puede deshacer.")) return;
    setIsProcessing(true);
    try {
        await api.delete(`/performance-reports/${subId}`);
        toast({ title: "Entrega eliminada con éxito" });
        fetchData();
    } catch (error) {
        toast({ title: "Error al eliminar la entrega", variant: "destructive" });
    } finally {
        setIsProcessing(false);
    }
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity) return;
    const richText = editorRef.current?.innerHTML || "";
    if (!richText && !attachedFile) {
        toast({ title: "Atención", description: "Debes escribir algo o adjuntar un archivo.", variant: "destructive" });
        return;
    }

    setIsProcessing(true);
    try {
      const submissionData = {
        text: richText,
        file: attachedFile
      };

      const payload = {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        moduloId: id,
        tipoEnvio: "actividad",
        tituloContenido: selectedActivity.titulo,
        detalleEnvio: JSON.stringify(submissionData),
        estado: "enviado"
      };

      if (editingSubmissionId) {
        await api.patch(`/performance-reports/${editingSubmissionId}`, payload);
        toast({ title: "Entrega actualizada con éxito" });
      } else {
        await api.post("/performance-reports", payload);
        toast({ title: "Actividad enviada con éxito" });
      }

      setIsSubmitActivityOpen(false);
      setEditingSubmissionId(null);
      setAttachedFile(null);
      if (editorRef.current) editorRef.current.innerHTML = "";
      fetchData();
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
    
    const detailWithQuestions = assessmentForm.preguntas.map(q => ({
      pregunta: q.texto,
      respuesta: userAnswers[q.id] || "(Sin respuesta)"
    }));

    const rawScore = autoGradableQuestions.length > 0 ? (correctCount / autoGradableQuestions.length) * 5 : 0;
    const finalScoreValue = Math.min(5, Math.max(0, rawScore));

    const finalScoreObj = { correct: correctCount, total: autoGradableQuestions.length };
    setScore(finalScoreObj);
    setShowFeedback(true);

    try {
      await api.post("/performance-reports", {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        moduloId: String(id),
        tipoEnvio: "evaluacion",
        tituloContenido: assessmentForm.titulo,
        detalleEnvio: JSON.stringify(detailWithQuestions),
        puntaje: finalScoreValue,
        estado: "enviado"
      });
      toast({ title: "Evaluación enviada", description: "Tus respuestas han sido registradas." });
      fetchData();
    } catch (e) {
      console.error("Error saving assessment result:", e);
      toast({ title: "Error al registrar", variant: "destructive" });
    }
  };

  const handleOpenGrading = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradingForm({ 
      puntaje: sub.puntaje || 0, 
      recomendaciones: sub.recomendaciones || "" 
    });
    setIsGradingDialogOpen(true);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    const clampedScore = Math.min(5, Math.max(0, Number(gradingForm.puntaje) || 0));
    setIsProcessing(true);
    try {
      await api.patch(`/performance-reports/${selectedSubmission._id}`, {
        ...gradingForm,
        puntaje: clampedScore,
        estado: "calificado"
      });
      setIsGradingDialogOpen(false);
      fetchData();
      toast({ title: "Calificación guardada" });
    } catch (error) {
      toast({ title: "Error al calificar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.texto) {
      toast({ title: "Atención", description: "Escribe el enunciado.", variant: "destructive" });
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
      opciones: [...currentQuestion.opciones, `Opción ${currentQuestion.opciones.length + 1}`]
    });
  };

  const handleRemoveOption = (index: number) => {
    const newOpts = [...currentQuestion.opciones];
    newOpts.splice(index, 1);
    setCurrentQuestion({ ...currentQuestion, opciones: newOpts });
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo || assessmentForm.preguntas.length === 0) return;
    setIsProcessing(true);
    try {
      const assessmentId = getResourceId(editingAssessment);
      if (assessmentId) await api.patch(`/assessments/${assessmentId}`, assessmentForm);
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
    if (!url || typeof url !== 'string' || !url.startsWith("http")) return null;
    
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
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/(.+?)(\/|$)/);
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    if (url.includes("docs.google.com/document/d/")) {
      const match = url.match(/\/d\/(.+?)(\/|$)/);
      return match ? `https://docs.google.com/document/d/${match[1]}/preview` : url;
    }
    
    return url;
  };

  const formatSubmissionDetail = (detail: string) => {
    try {
      if (!detail) return null;
      const parsed = JSON.parse(detail);
      if (parsed.text !== undefined) {
          return (
              <div className="space-y-6">
                  <div className="p-5 border rounded-xl bg-background shadow-sm">
                      <p className="text-xs font-bold text-muted-foreground uppercase mb-4">Texto de la Entrega:</p>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parsed.text }} />
                  </div>
                  {parsed.file && (
                      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl">
                          <div className="flex items-center gap-3">
                              <FileText className="h-8 w-8 text-primary" />
                              <div>
                                  <p className="font-bold text-sm">{parsed.file.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">Archivo Adjunto</p>
                              </div>
                          </div>
                          <Button asChild variant="outline" size="sm">
                              <a href={parsed.file.data} download={parsed.file.name}>
                                  <Download className="mr-2 h-4 w-4" /> Descargar
                              </a>
                          </Button>
                      </div>
                  )}
              </div>
          );
      }
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-4">
            {parsed.map((item: any, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                <p className="text-sm font-bold text-primary mb-1">
                  {item.pregunta || `Pregunta ${idx + 1}`}
                </p>
                <p className="text-sm">{String(item.respuesta)}</p>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {
        console.error("Error parsing submission detail", e);
    }
    return <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">{detail}</div>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon"><Link href="/modulos"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline">
                <span className="text-slate-900 font-bold">Data</span><span className="text-primary font-bold">nexus</span> | {moduleInfo.title}
              </h1>
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
              <Button onClick={() => { 
                setEditingResource(null); 
                setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); 
                setUploadedFile(null);
                setSourceTab("url");
                setIsResourceDialogOpen(true); 
              }} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso
              </Button>
            )}
          </div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => {
                const resourceId = getResourceId(res);
                const embedUrl = getEmbedUrl(res.url);
                return (
                  <Card key={resourceId} className="overflow-hidden group relative shadow-md">
                    {isAdmin && (
                      <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => { 
                              setEditingResource(res); 
                              setResourceForm(res); 
                              setSourceTab(res.url ? "url" : "file");
                              setIsResourceDialogOpen(true); 
                            }} className="cursor-pointer">
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onSelect={() => {
                                setResourceToDelete(res);
                                setIsDeleteResourceDialogOpen(true);
                              }} 
                              className="text-destructive cursor-pointer"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                    <CardHeader className="p-6 pb-0">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          {res.tipo === "video" ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                          <Badge variant="outline" className="uppercase">{res.tipo}</Badge>
                        </div>
                        <Button asChild variant="default" size="sm" className="h-8 bg-slate-900 hover:bg-slate-800 text-white font-bold">
                          <a href={res.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-3 w-3" />
                            Ver en ventana completa
                          </a>
                        </Button>
                      </div>
                      <CardTitle className="text-2xl mb-2">{res.titulo}</CardTitle>
                      <CardDescription className="text-base mb-4">{res.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      {embedUrl ? (
                        <div className="rounded-xl overflow-hidden border bg-black w-full shadow-inner aspect-video">
                          <iframe 
                            src={embedUrl} 
                            className="w-full h-full border-0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" 
                            allowFullScreen 
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border bg-muted w-full flex items-center justify-center p-12 aspect-video">
                          <ExternalLink className="h-12 w-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
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
            {activities.map((act) => {
              const userSub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
              const activityId = getResourceId(act);
              
              return (
                <Card key={activityId} className="flex flex-col shadow-sm border-t-4 border-t-accent/50 group">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex gap-2">
                        <Badge variant="secondary">{act.tipo.toUpperCase()}</Badge>
                        {userSub && (
                          <Badge variant="default" className={cn(userSub.estado === 'calificado' ? 'bg-green-500' : 'bg-blue-500')}>
                            {userSub.estado === 'calificado' ? 'CALIFICADO' : 'ENTREGADO'}
                          </Badge>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 text-destructive" 
                             onClick={async () => { 
                               if(window.confirm('¿Seguro?')) { 
                                 await api.delete(`/activities/${activityId}`); 
                                 fetchData(); 
                               } 
                             }}
                           >
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </div>
                      )}
                    </div>
                    <CardTitle className="mt-2">{act.titulo}</CardTitle>
                    <CardDescription>{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <Separator />
                    <p className="text-sm"><strong>Criterios:</strong> {act.criterios_evaluacion}</p>
                    {act.archivoUrl && (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href={act.archivoUrl} target="_blank" rel="noopener noreferrer">
                          <Link2 className="mr-2 h-4 w-4" /> Ver Material Adjunto
                        </a>
                      </Button>
                    )}
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    {!isAdmin && !userSub && (
                      <Button variant="default" className="w-full bg-accent hover:bg-accent/90" onClick={() => { setSelectedActivity(act); setEditingSubmissionId(null); setAttachedFile(null); setIsSubmitActivityOpen(true); }}><Upload className="mr-2 h-4 w-4" /> Entregar Tarea</Button>
                    )}
                    {!isAdmin && userSub && (
                      <div className="grid grid-cols-3 gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => { setSelectedSubmission(userSub); setIsViewOwnSubmissionOpen(true); }}><Eye className="mr-2 h-4 w-4" /> Ver</Button>
                        <Button variant="outline" size="sm" disabled={userSub.estado === 'calificado'} onClick={() => handleOpenEditSubmission(userSub, act)}><Pencil className="mr-2 h-4 w-4" /> Editar</Button>
                        <Button variant="outline" size="sm" className="text-destructive" disabled={userSub.estado === 'calificado'} onClick={() => handleDeleteSubmission(userSub._id)}><Trash2 className="mr-2 h-4 w-4" /> Borrar</Button>
                      </div>
                    )}
                    {userSub?.recomendaciones && (
                      <div className="w-full p-3 bg-muted rounded-lg border-l-4 border-primary mt-2">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Retroalimentación:</p>
                        <p className="text-xs italic">"{userSub.recomendaciones}"</p>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setViewMode('edit'); setIsAssessmentDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((ass) => {
              const userSub = submissions.find(s => s.tituloContenido === ass.titulo && s.usuarioEmail === user?.email);
              const assessmentId = getResourceId(ass);
              
              return (
                <Card key={assessmentId} className="hover:border-primary transition-all cursor-pointer group shadow-md relative" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode(isAdmin ? 'edit' : 'preview'); handleResetPreview(); setIsAssessmentDialogOpen(true); }}>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <Button variant="secondary" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="secondary" size="icon" className="h-7 w-7 text-destructive" onClick={async (e) => { e.stopPropagation(); if(window.confirm('¿Seguro?')) { await api.delete(`/assessments/${assessmentId}`); fetchData(); } }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-center mb-1">
                        <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                        {userSub && <Badge className="bg-green-500">Realizado</Badge>}
                    </div>
                    <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2"><HelpCircle className="h-4 w-4" /> {ass.preguntas.length} Preguntas</div>
                    {userSub && userSub.puntaje !== undefined && (
                        <div className="text-xs font-bold text-primary">Calificación: {Number(userSub.puntaje).toFixed(1)}/5</div>
                    )}
                  </CardContent>
                  <CardFooter><Button className="w-full" variant={userSub ? "secondary" : "default"}>{userSub ? "Ver Resultados" : "Entrar"}</Button></CardFooter>
                </Card>
              );
            })}
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
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...submissions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{sub.usuarioNombre}</span>
                            <span className="text-[10px] text-muted-foreground">{sub.usuarioEmail}</span>
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
                          <Badge variant={sub.estado === "calificado" ? "default" : "secondary"} className="text-[10px]">
                            {sub.estado.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-8"
                            onClick={() => handleOpenGrading(sub)}
                          >
                            <GradeIcon className="mr-1 h-3 w-3" />
                            {sub.estado === "calificado" ? "Revisar" : "Calificar"}
                          </Button>
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

      <Dialog open={isDeleteResourceDialogOpen} onOpenChange={setIsDeleteResourceDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              ¿Estás seguro de eliminar este recurso?
            </DialogTitle>
            <DialogDescription className="py-2">
              Esta acción eliminará permanentemente el recurso <strong>{resourceToDelete?.titulo}</strong> de la base de datos de DataNexus. No se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDeleteResourceDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteResource} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Eliminar Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GradeIcon className="h-5 w-5 text-primary" />
              Revisión de Entrega
            </DialogTitle>
            <DialogDescription>
              Viendo el trabajo de <strong>{selectedSubmission?.usuarioNombre}</strong> para "{selectedSubmission?.tituloContenido}"
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase text-muted-foreground">Contenido de la Entrega</Label>
              {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3">
                <Label htmlFor="puntaje" className="flex items-center gap-2">
                  Puntaje (0-5)
                  <Trophy className="h-3 w-3 text-yellow-500" />
                </Label>
                <input 
                  id="puntaje"
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={gradingForm.puntaje}
                  onChange={e => {
                    const val = Number(e.target.value);
                    if (val <= 5) setGradingForm({...gradingForm, puntaje: val});
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="recomendaciones">Recomendaciones y Retroalimentación</Label>
                <Textarea 
                  id="recomendaciones"
                  placeholder="Escribe tus observaciones para el estudiante..."
                  value={gradingForm.recomendaciones}
                  onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})}
                  rows={4}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>Cerrar</Button>
            {isAdmin && (
                <Button onClick={handleSaveGrade} disabled={isProcessing} className="bg-primary">
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Calificación
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOwnSubmissionOpen} onOpenChange={setIsViewOwnSubmissionOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Mi Entrega</DialogTitle>
            <DialogDescription>Material enviado para "{selectedSubmission?.tituloContenido}"</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">
            {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
            {selectedSubmission?.estado === 'calificado' && (
                <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                    <p className="font-bold text-primary mb-2 flex items-center gap-2"><Trophy className="h-4 w-4"/> Calificación: {selectedSubmission.puntaje}/5</p>
                    {selectedSubmission.recomendaciones && (
                        <p className="text-sm italic">"{selectedSubmission.recomendaciones}"</p>
                    )}
                </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOwnSubmissionOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingSubmissionId ? "Editar Entrega" : "Realizar Entrega"}: {selectedActivity?.titulo}</DialogTitle>
            <DialogDescription>
                {editingSubmissionId ? "Modifica tu respuesta anterior." : "Completa tu respuesta y adjunta un archivo si es necesario."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            <div className="space-y-3">
                <Label>Respuesta Escrita</Label>
                <div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                    <div className="bg-muted p-1 border-b flex flex-wrap gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')}><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')}><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')}><Underline className="h-4 w-4" /></Button>
                        <Separator orientation="vertical" className="h-8 mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
                    </div>
                    <div 
                        ref={editorRef}
                        contentEditable
                        className="p-4 min-h-[250px] bg-background outline-none prose prose-sm max-w-none"
                        placeholder="Escribe tu entrega aquí..."
                    />
                </div>
            </div>
            <div className="space-y-3">
                <Label>Adjuntar Documento (PDF, Word, Imágenes)</Label>
                <div className={cn(
                    "relative border-2 border-dashed rounded-xl p-6 transition-all",
                    attachedFile ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50"
                )}>
                    <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                        {attachedFile ? (
                            <>
                                <CheckCircle2 className="h-8 w-8 text-primary mb-2" />
                                <p className="font-bold text-sm">{attachedFile.name}</p>
                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }} className="mt-2 text-destructive">Quitar archivo</Button>
                            </>
                        ) : (
                            <>
                                <FileUp className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm font-medium">Arrastra o haz clic para subir un archivo</p>
                                <p className="text-xs text-muted-foreground mt-1">Soportado: PDF, DOCX, JPG, PNG (Max 5MB)</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsSubmitActivityOpen(false); setEditingSubmissionId(null); }}>Cancelar</Button>
            <Button onClick={handleSubmitActivity} disabled={isProcessing} className="bg-primary px-8">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                {editingSubmissionId ? "Actualizar Entrega" : "Finalizar Entrega"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isResourceDialogOpen}
        onOpenChange={(open) => {
          setIsResourceDialogOpen(open);
          if (!open) {
            setUploadedFile(null);
            setSourceTab("url");
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-2xl">
          <div className="bg-[#1a2744] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <DialogTitle className="text-white text-base font-medium">
                  {editingResource ? "Editar recurso" : "Nuevo recurso"}
                </DialogTitle>
                <p className="text-slate-400 text-xs mt-0.5">
                  Módulo {id}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Título <span className="text-red-500">*</span>
              </Label>
              <Input
                value={resourceForm.titulo}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, titulo: e.target.value })
                }
                placeholder="Ej: Introducción a SQL"
                maxLength={80}
                className="focus-visible:ring-blue-500"
              />
              <span className="text-xs text-muted-foreground text-right">
                {resourceForm.titulo.length}/80
              </span>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Descripción
              </Label>
              <Textarea
                value={resourceForm.descripcion}
                onChange={(e) =>
                  setResourceForm({ ...resourceForm, descripcion: e.target.value })
                }
                placeholder="Breve descripción del recurso..."
                className="resize-none min-h-[80px] focus-visible:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Tipo de recurso
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "video", label: "Video", icon: PlayCircle },
                  { value: "guia", label: "Guía", icon: BookOpen },
                  { value: "articulo", label: "Artículo", icon: FileText },
                  { value: "presentacion", label: "Presentación", icon: Monitor },
                  { value: "dataset", label: "Dataset", icon: Database },
                  { value: "otro", label: "Otro", icon: MoreHorizontal },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setResourceForm({ ...resourceForm, tipo: value })
                    }
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-sm
                      ${
                        resourceForm.tipo === value
                          ? "border-blue-500 bg-blue-500/10 text-blue-600"
                          : "border-border bg-muted/40 text-muted-foreground hover:border-blue-400 hover:bg-blue-500/5"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Fuente del recurso
              </Label>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <button
                  type="button"
                  onClick={() => setSourceTab("url")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all
                    ${sourceTab === "url"
                      ? "bg-background text-blue-600 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  URL externa
                </button>
                <button
                  type="button"
                  onClick={() => setSourceTab("file")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all
                    ${sourceTab === "file"
                      ? "bg-background text-blue-600 shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                    }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir archivo
                </button>
              </div>

              {sourceTab === "url" ? (
                <Input
                  value={resourceForm.url}
                  onChange={(e) =>
                    setResourceForm({ ...resourceForm, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="focus-visible:ring-blue-500"
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files[0];
                      if (file) setUploadedFile(file);
                    }}
                    onClick={() => document.getElementById("fileInput")?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                      ${isDragging
                        ? "border-blue-500 bg-blue-500/5"
                        : "border-border hover:border-blue-400 hover:bg-blue-500/5"
                      }`}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.png,.jpg,.jpeg,.zip"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setUploadedFile(file);
                      }}
                    />
                    <Upload className="w-7 h-7 text-blue-500" />
                    <p className="text-sm text-muted-foreground text-center">
                      Arrastra tu archivo aquí o{" "}
                      <span className="text-blue-500 font-medium">selecciona uno</span>
                    </p>
                    <span className="text-xs text-muted-foreground">
                      PDF, Word, PPT, Excel, MP4, imágenes · máx. 50 MB
                    </span>
                  </div>

                  {uploadedFile && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
                      <div className="w-8 h-8 rounded-md bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{uploadedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFile(null)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-t flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsResourceDialogOpen(false)}
              className="flex-shrink-0"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveResource}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar recurso
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
