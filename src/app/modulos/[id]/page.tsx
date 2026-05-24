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
  MoreVertical,
  Upload,
  ClipboardList,
  FileQuestion,
  Layers,
  HelpCircle,
  Eye,
  Settings2,
  X,
  Trophy,
  FileText,
  Video,
  History,
  MessageSquare,
  GraduationCap as GradeIcon,
  Save,
  FileCode,
  Download,
  FileUp,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CheckSquare,
  ExternalLink,
  Link2
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
  "7": { title: "Módulo 7: Evaluación y Selección de Fuentes", objective: "Evaluar la calidad de la información académica." },
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
  
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isViewOwnSubmissionOpen, setIsViewOwnSubmissionOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'recurso' | 'actividad' | 'evaluacion' } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });
  
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string } | null>(null);
  
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
    if (!resourceForm.titulo || !resourceForm.url) return;
    setIsProcessing(true);
    try {
      const resourceId = getObjectId(editingResource);
      if (resourceId) {
        await api.patch(`/educational-resources/${resourceId}`, resourceForm);
      } else {
        await api.post("/educational-resources", resourceForm);
      }
      setIsResourceDialogOpen(false);
      fetchData();
      toast({ title: "Recurso guardado" });
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
    if (!confirm("¿Estás seguro de que deseas eliminar tu entrega? Esta acción no se puede deshacer.")) return;
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
        tipoEnvio: "actividad",
        moduloId: id,
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
        tipoEnvio: "evaluacion",
        moduloId: String(id),
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
    
    if (gradingForm.puntaje > 5) {
      toast({ title: "Puntaje inválido", description: "La calificación máxima permitida es 5.", variant: "destructive" });
      return;
    }
    if (gradingForm.puntaje < 0) {
      toast({ title: "Puntaje inválido", description: "La calificación mínima permitida es 0.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const clampedScore = Math.min(5, Math.max(0, gradingForm.puntaje));
      
      await api.patch(`/performance-reports/${selectedSubmission._id}`, {
        ...gradingForm,
        puntaje: clampedScore,
        estado: "calificado"
      });
      setIsGradingDialogOpen(false);
      fetchData();
      toast({ title: "Calificación guardada", description: "El estudiante podrá ver su nota pronto." });
    } catch (error) {
      toast({ title: "Error al calificar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
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
      const endpoint = itemToDelete.type === 'recurso' ? 'educational-resources' : itemToDelete.type === 'actividad' ? 'activities' : 'assessments';
      await api.delete(`/${endpoint}/${itemToDelete.id}`);
      toast({ title: "Eliminado con éxito" });
      fetchData();
    } catch (error) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
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
    if (url.includes("drive.google.com/file/d/")) {
      const match = url.match(/\/d\/(.+?)(\/|$)/);
      return match ? `https://drive.google.com/file/d/${match[1]}/preview` : url;
    }
    return url;
  };

  const handleViewFull = (res: Resource) => {
    const url = res.url;
    if (!url) return;
    window.open(url, '_blank');
  };

  const formatSubmissionDetail = (detail: string) => {
    try {
      const parsed = JSON.parse(detail);
      
      // Formato de actividad con texto enriquecido y archivo
      if (parsed.text !== undefined) {
          return (
              <div className="space-y-6">
                  <div className="p-5 border rounded-xl bg-background shadow-sm">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase mb-4 tracking-widest">Respuesta del Estudiante:</p>
                      <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: parsed.text }} />
                  </div>
                  {parsed.file && (
                      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3">
                              <div className="p-3 bg-white rounded-lg shadow-inner">
                                <FileText className="h-8 w-8 text-primary" />
                              </div>
                              <div>
                                  <p className="font-bold text-sm">{parsed.file.name}</p>
                                  <p className="text-[10px] text-muted-foreground uppercase">Documento adjunto para calificar</p>
                              </div>
                          </div>
                          <Button asChild variant="default" className="bg-slate-900" size="sm">
                              <a href={parsed.file.data} download={parsed.file.name}>
                                  <Download className="mr-2 h-4 w-4" /> Descargar
                              </a>
                          </Button>
                      </div>
                  )}
              </div>
          );
      }
      
      // Formato de evaluación (Array de preguntas y respuestas)
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-4">
            {parsed.map((item: any, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                <p className="text-sm font-bold text-primary mb-1">{item.pregunta || `Pregunta ${idx + 1}`}</p>
                <p className="text-sm">{String(item.respuesta)}</p>
              </div>
            ))}
          </div>
        );
      }
    } catch (e) {}
    return <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">{detail}</div>;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon"><Link href="/modulos"><ArrowLeft className="h-5 w-5" /></Link></Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-headline font-bold">{moduleInfo.title}</h1>
              {isAdmin && <Badge className="bg-primary/20 text-primary border-primary/30">Modo Docente</Badge>}
            </div>
            <p className="text-muted-foreground mt-1 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" />{moduleInfo.objective}</p>
          </div>
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
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
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
                      <div className="flex justify-between items-start mb-2">
                         <div className="flex items-center gap-2">
                           {res.tipo === "video" ? <Video className="h-4 w-4 text-red-500" /> : <FileText className="h-4 w-4 text-blue-500" />}
                           <Badge variant="outline" className="uppercase">{res.tipo}</Badge>
                         </div>
                         <Button size="sm" className="bg-slate-900 text-white" onClick={() => handleViewFull(res)}>Ver Pantalla Completa</Button>
                      </div>
                      <CardTitle className="text-2xl">{res.titulo}</CardTitle>
                      <CardDescription className="text-base">{res.descripcion}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner">
                        <iframe 
                          src={getEmbedUrl(res.url)} 
                          className="w-full h-full border-0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                          allowFullScreen 
                        />
                      </div>
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
              const actId = getObjectId(act);
              const userSub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
              
              return (
                <Card key={actId} className="flex flex-col shadow-md border-t-4 border-t-accent/50 group relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                       <Button variant="default" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 text-white shadow-lg rounded-full" onClick={() => { setItemToDelete({ id: actId, type: 'actividad' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
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
                    </div>
                    <CardTitle className="mt-2">{act.titulo}</CardTitle>
                    <CardDescription>{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <Separator />
                    <p className="text-sm"><strong>Criterios:</strong> {act.criterios_evaluacion}</p>
                    {act.archivoUrl && (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href={getEmbedUrl(act.archivoUrl)} target="_blank" rel="noopener noreferrer">
                          <Link2 className="mr-2 h-4 w-4" /> Ver Material de Referencia
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
                        <Button variant="outline" size="sm" onClick={() => { setSelectedSubmission(userSub); setIsViewOwnSubmissionOpen(true); }}><Eye className="mr-1 h-3 w-3" /> Ver</Button>
                        <Button variant="outline" size="sm" disabled={userSub.estado === 'calificado'} onClick={() => handleOpenEditSubmission(userSub, act)}><Pencil className="mr-1 h-3 w-3" /> Editar</Button>
                        <Button variant="outline" size="sm" className="text-destructive" disabled={userSub.estado === 'calificado'} onClick={() => handleDeleteSubmission(userSub._id)}><Trash2 className="mr-1 h-3 w-3" /> Borrar</Button>
                      </div>
                    )}
                    {userSub?.recomendaciones && (
                      <div className="w-full p-3 bg-muted rounded-lg border-l-4 border-primary mt-2">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Docente:</p>
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
              const assId = getObjectId(ass);
              const userSub = submissions.find(s => s.tituloContenido === ass.titulo && s.usuarioEmail === user?.email);
              
              return (
                <Card key={assId} className="hover:border-primary transition-all cursor-pointer group shadow-md relative" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode(isAdmin ? 'edit' : 'preview'); handleResetPreview(); setIsAssessmentDialogOpen(true); }}>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-full shadow-md" onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: assId, type: 'evaluacion' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
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
                    <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2"><HelpCircle className="h-4 w-4" /> {ass.preguntas?.length || 0} Preguntas</div>
                    {userSub && userSub.puntaje !== undefined && (
                        <div className="text-xs font-bold text-primary">Nota Final: {Number(userSub.puntaje).toFixed(1)}/5.0</div>
                    )}
                  </CardContent>
                  <CardFooter><Button className="w-full" variant={userSub ? "secondary" : "default"}>{userSub ? "Ver Resultados" : "Empezar Test"}</Button></CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento" className="space-y-6">
            <Card className="shadow-md overflow-hidden border-none rounded-2xl">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Panel de Seguimiento</CardTitle>
                <CardDescription>Revisa y califica el desempeño de tus estudiantes en este módulo.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="px-6">Estudiante</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Contenido</TableHead>
                      <TableHead>Puntaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right px-6">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sub) => (
                      <TableRow key={sub._id} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="px-6 font-medium">
                          <div className="flex flex-col">
                            <span className="font-bold">{sub.usuarioNombre}</span>
                            <span className="text-[10px] text-muted-foreground">{sub.usuarioEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-[10px]">{sub.tipoEnvio.toUpperCase()}</Badge></TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs font-semibold">{sub.tituloContenido}</TableCell>
                        <TableCell>
                          {sub.puntaje !== undefined ? (
                             <Badge className={cn("px-2 font-bold", Number(sub.puntaje) >= 3.5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                               {Number(sub.puntaje).toFixed(1)} / 5.0
                             </Badge>
                          ) : <span className="text-slate-300 italic text-[10px]">Pendiente</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={sub.estado === "calificado" ? "default" : "secondary"} className="text-[10px]">
                            {sub.estado.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right px-6">
                          <Button variant="outline" size="sm" onClick={() => handleOpenGrading(sub)}>
                            <GradeIcon className="mr-2 h-4 w-4" /> {sub.estado === "calificado" ? "Ver" : "Calificar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">No hay registros de envíos para este módulo.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GradeIcon className="h-5 w-5 text-primary" /> Revisión Pedagógica</DialogTitle>
            <DialogDescription>Calificando a: <strong>{selectedSubmission?.usuarioNombre}</strong></DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-primary tracking-widest">Contenido de la Entrega:</Label>
              {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-3">
                <Label htmlFor="puntaje" className="flex items-center gap-2 font-bold">Puntaje (0-5.0) <Trophy className="h-3 w-3 text-amber-500" /></Label>
                <Input id="puntaje" type="number" min={0} max={5} step={0.1} value={gradingForm.puntaje} onChange={e => { const val = Number(e.target.value); if (val <= 5) setGradingForm({...gradingForm, puntaje: val}); }} className="rounded-xl h-12 text-lg font-bold" />
                <p className="text-[10px] text-muted-foreground italic">Nota: 3.5 es el mínimo aprobatorio.</p>
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label htmlFor="recomendaciones" className="font-bold">Observaciones y Retroalimentación</Label>
                <Textarea id="recomendaciones" placeholder="Escribe aquí tus recomendaciones para el estudiante..." value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} rows={4} className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)} className="rounded-xl">Cancelar</Button>
            {isAdmin && (
                <Button onClick={handleSaveGrade} disabled={isProcessing} className="bg-primary px-8 rounded-xl font-bold shadow-lg shadow-primary/20">
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Calificación
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOwnSubmissionOpen} onOpenChange={setIsViewOwnSubmissionOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Mi Entrega Registrada</DialogTitle><DialogDescription>Visualización del material enviado para "{selectedSubmission?.tituloContenido}"</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-y-auto py-4">{selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}</div>
          <DialogFooter><Button variant="outline" onClick={() => setIsViewOwnSubmissionOpen(false)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl font-headline">{editingSubmissionId ? "Actualizar Mi Entrega" : "Realizar Entrega de Tarea"}</DialogTitle>
            <DialogDescription>Completa el desarrollo de tu actividad. Puedes usar el editor para formatear tu respuesta o adjuntar un archivo local.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-8">
            <div className="space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Desarrollo Escrito (Texto Enriquecido)</Label>
                <div className="border rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all">
                    <div className="bg-slate-50 p-2 border-b flex flex-wrap gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('bold')}><Bold className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('italic')}><Italic className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('underline')}><Underline className="h-4 w-4" /></Button>
                        <Separator orientation="vertical" className="h-6 mx-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyLeft')}><AlignLeft className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyCenter')}><AlignCenter className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => execCommand('justifyRight')}><AlignRight className="h-4 w-4" /></Button>
                    </div>
                    <div ref={editorRef} contentEditable className="p-6 min-h-[300px] bg-background outline-none prose prose-sm max-w-none" />
                </div>
            </div>
            <div className="space-y-4">
                <Label className="text-sm font-bold flex items-center gap-2"><FileUp className="h-4 w-4 text-primary" /> Adjuntar Documento de Respaldo</Label>
                <div className={cn("relative border-2 border-dashed rounded-2xl p-10 transition-all text-center", attachedFile ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50")}>
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center">
                        {attachedFile ? (
                            <>
                                <CheckSquare className="h-12 w-12 text-green-500 mb-3" />
                                <p className="font-bold text-slate-800">{attachedFile.name}</p>
                                <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); setAttachedFile(null); }} className="text-destructive mt-2">Eliminar archivo seleccionado</Button>
                            </>
                        ) : (
                            <>
                                <Upload className="h-12 w-12 text-slate-300 mb-3" />
                                <p className="text-sm font-bold text-slate-600">Haz clic o arrastra un archivo aquí</p>
                                <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest">PDF, Word, JPG, PNG (Hasta 50MB)</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => { setIsSubmitActivityOpen(false); setEditingSubmissionId(null); }} className="rounded-xl h-12 px-6">Cancelar</Button>
            <Button onClick={handleSubmitActivity} disabled={isProcessing} className="bg-primary rounded-xl h-12 px-10 font-bold shadow-lg shadow-primary/30">
                {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                {editingSubmissionId ? "Actualizar Mi Tarea" : "Enviar Tarea Final"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-headline">Gestionar Recurso</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2"><Label>Título del Material</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} className="rounded-xl h-11" /></div>
            <div className="grid gap-2"><Label>Descripción Pedagógica</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} className="rounded-xl" rows={3} /></div>
            <div className="grid gap-2"><Label>URL de la Fuente (YouTube, Drive, Gamma)</Label><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} className="rounded-xl h-11" placeholder="https://..." /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2"><Label>Tipo</Label>
                <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                  <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="video">🎥 Video Tutorial</SelectItem><SelectItem value="guia">📖 Guía de Estudio</SelectItem><SelectItem value="articulo">📝 Artículo Académico</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="grid gap-2"><Label>Formato</Label><Input value={resourceForm.formato} onChange={e => setResourceForm({...resourceForm, formato: e.target.value})} className="rounded-xl h-11" /></div>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Cambios en MongoDB"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader><DialogTitle className="text-2xl font-headline">Configurar Actividad</DialogTitle></DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2"><Label>Nombre de la Actividad</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} className="rounded-xl h-11" /></div>
            <div className="grid gap-2"><Label>Instrucciones Paso a Paso</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} rows={4} className="rounded-xl" /></div>
            <div className="grid gap-2"><Label>Criterios de Evaluación (Rúbrica)</Label><Input value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value})} className="rounded-xl h-11" /></div>
            <div className="grid gap-2"><Label>URL de Apoyo (Opcional)</Label><Input placeholder="Enlace a plantilla o lectura previa..." value={activityForm.archivoUrl} onChange={e => setActivityForm({...activityForm, archivoUrl: e.target.value})} className="rounded-xl h-11" /></div>
          </div>
          <DialogFooter><Button onClick={handleSaveActivity} disabled={isProcessing} className="w-full h-12 rounded-xl font-bold">Publicar Actividad</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[2rem]">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8 mb-4">
              <DialogTitle className="text-2xl font-headline">{viewMode === 'edit' ? 'Diseñador de Exámenes' : 'Realizar Evaluación'}</DialogTitle>
              {isAdmin && (
                <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
                  <Button variant={viewMode === 'edit' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('edit')} className="rounded-xl"><Settings2 className="mr-2 h-4 w-4" /> Editor</Button>
                  <Button variant={viewMode === 'preview' ? 'default' : 'ghost'} size="sm" onClick={() => { setViewMode('preview'); handleResetPreview(); }} className="rounded-xl"><Eye className="mr-2 h-4 w-4" /> Vista Previa</Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {viewMode === 'edit' ? (
            <div className="grid gap-8 py-4">
              <div className="grid grid-cols-2 gap-6">
                 <div className="grid gap-2"><Label>Título del Test</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} className="rounded-xl" /></div>
                 <div className="grid gap-2"><Label>Objetivo del Examen</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} className="rounded-xl" /></div>
              </div>
              <Separator />
              <div className="p-6 border rounded-[2rem] bg-slate-50 space-y-6">
                <h3 className="font-bold flex items-center gap-2 text-primary text-lg"><PlusCircle className="h-6 w-6" /> Construir Pregunta</h3>
                <div className="grid gap-2"><Label>Enunciado de la Pregunta</Label><Input value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} className="rounded-xl h-11" /></div>
                <div className="grid gap-2">
                  <Label>Tipo de Respuesta</Label>
                  <Select value={currentQuestion.tipo} onValueChange={(v: any) => setCurrentQuestion({...currentQuestion, tipo: v, opciones: v === 'opcion-multiple' ? ["Opción A", "Opción B"] : [], respuestaCorrecta: ""})}>
                    <SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="opcion-multiple">🔘 Selección Múltiple</SelectItem><SelectItem value="verdadero-falso">⚖️ Verdadero o Falso</SelectItem><SelectItem value="escrita">✍️ Respuesta Abierta</SelectItem></SelectContent>
                  </Select>
                </div>
                {currentQuestion.tipo === 'opcion-multiple' && (
                  <div className="space-y-4 pt-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Opciones y Respuesta Correcta:</Label>
                    <RadioGroup value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})} className="space-y-3">
                      {currentQuestion.opciones.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-white p-2 border rounded-xl shadow-sm">
                          <RadioGroupItem value={opt} />
                          <Input value={opt} onChange={e => { const newOpts = [...currentQuestion.opciones]; newOpts[idx] = e.target.value; setCurrentQuestion({...currentQuestion, opciones: newOpts}); }} className="border-none focus-visible:ring-0 shadow-none h-8" />
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)} disabled={currentQuestion.opciones.length <= 2} className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </RadioGroup>
                    <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full rounded-xl border-dashed">+ Añadir otra opción</Button>
                  </div>
                )}
                {currentQuestion.tipo === 'verdadero-falso' && (
                  <div className="space-y-4 pt-2">
                    <Label className="text-xs uppercase tracking-widest text-muted-foreground">Selecciona la Verdad:</Label>
                    <RadioGroup value={currentQuestion.respuestaCorrecta} onValueChange={v => setCurrentQuestion({...currentQuestion, respuestaCorrecta: v})} className="flex gap-6">
                      <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-xl"><RadioGroupItem value="Verdadero" id="v" /><Label htmlFor="v" className="cursor-pointer">Verdadero</Label></div>
                      <div className="flex items-center gap-2 bg-white px-4 py-2 border rounded-xl"><RadioGroupItem value="Falso" id="f" /><Label htmlFor="f" className="cursor-pointer">Falso</Label></div>
                    </RadioGroup>
                  </div>
                )}
                <Button variant="default" onClick={handleAddQuestion} className="w-full h-11 rounded-xl shadow-md">Insertar Pregunta al Test</Button>
              </div>

              {assessmentForm.preguntas.length > 0 && (
                <div className="space-y-3">
                  <Label className="font-bold">Estructura del Test ({assessmentForm.preguntas.length} items)</Label>
                  <div className="space-y-2">
                    {assessmentForm.preguntas.map((q, i) => (
                      <div key={q.id} className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-sm font-medium"><span className="text-primary font-bold mr-2">{i+1}.</span> {q.texto}</span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[9px] uppercase">{q.tipo.replace('-', ' ')}</Badge>
                            <Button variant="ghost" size="icon" onClick={() => setAssessmentForm({...assessmentForm, preguntas: assessmentForm.preguntas.filter(item => item.id !== q.id)})} className="h-8 w-8 text-destructive hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <DialogFooter className="mt-6"><Button onClick={handleSaveAssessment} disabled={isProcessing} className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">Finalizar y Guardar Examen en MongoDB</Button></DialogFooter>
            </div>
          ) : (
            <div className="py-6 space-y-8">
              <div className="border-b pb-6">
                 <h2 className="text-2xl font-bold text-primary">{assessmentForm.titulo}</h2>
                 <p className="text-muted-foreground leading-relaxed">{assessmentForm.descripcion}</p>
                 {score && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase font-bold text-primary tracking-widest mb-1">Tu Resultado:</p>
                            <p className="text-sm font-medium text-slate-600">Has acertado {score.correct} de {score.total} preguntas automáticas.</p>
                        </div>
                        <Badge className="text-2xl px-6 py-2 rounded-2xl bg-white text-primary border-primary/20 shadow-lg">{Number((score.correct / score.total) * 5 || 0).toFixed(1)} / 5.0</Badge>
                    </div>
                 )}
              </div>
              {assessmentForm.preguntas.map((q, idx) => (
                <div key={q.id} className="space-y-4 p-6 border rounded-2xl bg-slate-50/50">
                  <p className="text-lg font-bold text-slate-800"><span className="text-primary mr-2">{idx + 1}.</span> {q.texto}</p>
                  <div className="pl-8">
                    {q.tipo === 'opcion-multiple' && (
                      <RadioGroup value={userAnswers[q.id]} onValueChange={v => !showFeedback && setUserAnswers({...userAnswers, [q.id]: v})} className="space-y-3">
                        {q.opciones.map((opt, i) => (
                          <div key={i} className={cn("flex items-center space-x-3 p-4 border rounded-2xl bg-white shadow-sm transition-all", 
                            showFeedback && q.respuestaCorrecta === opt ? "bg-green-100 border-green-500 ring-2 ring-green-500/20" : 
                            showFeedback && userAnswers[q.id] === opt && q.respuestaCorrecta !== opt ? "bg-red-100 border-red-500 ring-2 ring-red-500/20" : "hover:border-primary/50 cursor-pointer")}>
                            <RadioGroupItem value={opt} id={`q${idx}o${i}`} disabled={showFeedback} />
                            <Label htmlFor={`q${idx}o${i}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {q.tipo === 'verdadero-falso' && (
                      <div className="flex gap-4">
                         {['Verdadero', 'Falso'].map(val => (
                           <Button key={val} variant={userAnswers[q.id] === val ? 'default' : 'outline'} className={cn("flex-1 h-14 text-lg font-bold rounded-2xl", showFeedback && q.respuestaCorrecta === val ? "bg-green-600 hover:bg-green-700 text-white shadow-lg" : showFeedback && userAnswers[q.id] === val ? "bg-red-600 hover:bg-red-700 text-white shadow-lg" : "")} onClick={() => !showFeedback && setUserAnswers({...userAnswers, [q.id]: val})} disabled={showFeedback}>{val}</Button>
                         ))}
                      </div>
                    )}
                    {q.tipo === 'escrita' && (
                      <div className="space-y-2">
                        <Textarea 
                            placeholder="Escribe aquí tu análisis..." 
                            value={userAnswers[q.id] || ""} 
                            onChange={e => !showFeedback && setUserAnswers({...userAnswers, [q.id]: e.target.value})}
                            disabled={showFeedback}
                            rows={5}
                            className="rounded-2xl p-4 bg-white"
                        />
                        {showFeedback && <p className="text-[10px] text-muted-foreground italic">* Esta respuesta requiere calificación manual del docente.</p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!showFeedback ? (
                <Button className="w-full h-16 font-bold text-xl rounded-3xl shadow-xl shadow-primary/30 transition-all hover:scale-[1.01]" onClick={handleGradeAssessment}>Finalizar Evaluación y Enviar Resultados</Button>
              ) : (
                <Button variant="outline" className="w-full h-12 rounded-2xl" onClick={() => setIsAssessmentDialogOpen(false)}>Cerrar Revisión</Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline">¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">Esta acción borrará permanentemente el {itemToDelete?.type} de la base de datos de MongoDB. No se puede deshacer esta operación.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel disabled={isProcessing} className="rounded-2xl h-12 h-12">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-8" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} Borrar Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

