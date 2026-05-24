
"use client";

import { useEffect, useState, use } from "react";
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
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type
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
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitActivityOpen, setIsSubmitActivityOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'recurso' | 'actividad' | 'evaluacion' } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });
  
  // Estado para la entrega enriquecida
  const [activitySubmission, setActivitySubmission] = useState({
    text: "",
    bold: false,
    italic: false,
    align: "left" as "left" | "center" | "right",
    fontSize: "text-base",
    file: null as File | null
  });
  
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resResponse, actResponse, assResponse] = await Promise.all([
        api.get("/educational-resources"),
        api.get("/activities"),
        api.get("/assessments")
      ]);
      setResources(resResponse.data.filter((res: any) => res.unidad === `Módulo ${id}`));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === String(id)));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === String(id)));

      if (isAdmin) {
        const subResponse = await api.get("/performance-reports");
        const filteredSubmissions = subResponse.data.filter((sub: any) => String(sub.moduloId) === String(id));
        setSubmissions(filteredSubmissions);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [id, user, isAdmin]);

  const handleSaveResource = async () => {
    if (!resourceForm.titulo) return;
    setIsProcessing(true);
    try {
      let payload = { ...resourceForm };
      if (sourceTab === "file" && uploadedFile) {
        payload.url = await fileToBase64(uploadedFile);
        payload.formato = uploadedFile.name.split('.').pop() || 'file';
      }
      const resourceId = getObjectId(editingResource);
      if (resourceId) await api.patch(`/educational-resources/${resourceId}`, payload);
      else await api.post("/educational-resources", payload);
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
      const activityId = getObjectId(editingActivity);
      if (activityId) await api.patch(`/activities/${activityId}`, activityForm);
      else await api.post("/activities", activityForm);
      setIsActivityDialogOpen(false);
      fetchData();
      toast({ title: "Actividad guardada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity || (!activitySubmission.text && !activitySubmission.file)) return;
    setIsProcessing(true);
    try {
      let fileData = "";
      let fileName = "";
      if (activitySubmission.file) {
        fileData = await fileToBase64(activitySubmission.file);
        fileName = activitySubmission.file.name;
      }

      const payload = {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        tipoEnvio: "actividad",
        moduloId: id,
        tituloContenido: selectedActivity.titulo,
        detalleEnvio: JSON.stringify({
          text: activitySubmission.text,
          bold: activitySubmission.bold,
          italic: activitySubmission.italic,
          align: activitySubmission.align,
          fontSize: activitySubmission.fontSize,
          file: fileData,
          fileName: fileName
        }),
        estado: "enviado"
      };

      await api.post("/performance-reports", payload);
      setIsSubmitActivityOpen(false);
      setActivitySubmission({ text: "", bold: false, italic: false, align: "left", fontSize: "text-base", file: null });
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
    
    const detailWithQuestions = assessmentForm.preguntas.map(q => ({
      pregunta: q.texto,
      respuesta: userAnswers[q.id] || "(Sin respuesta)"
    }));

    const rawScore = autoGradableQuestions.length > 0 ? (correctCount / autoGradableQuestions.length) * 5 : 0;
    const finalScoreValue = Math.min(5, Math.max(0, rawScore));

    setScore({ correct: correctCount, total: autoGradableQuestions.length });
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
      if (isAdmin) fetchData();
    } catch (e) {
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
      toast({ title: "Puntaje inválido", description: "La calificación máxima es 5.0", variant: "destructive" });
      return;
    }
    if (gradingForm.puntaje < 0) {
      toast({ title: "Puntaje inválido", description: "La calificación mínima es 0.0", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await api.patch(`/performance-reports/${selectedSubmission._id}`, {
        ...gradingForm,
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
    if (!currentQuestion.texto) return;
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
    if (!url || typeof url !== 'string' || !url.startsWith("http")) return null;
    if (url.includes("drive.google.com")) {
      if (url.includes("/view")) return url.split("/view")[0] + "/preview";
      return url;
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let vId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return vId ? `https://www.youtube.com/embed/${vId}` : url;
    }
    return url;
  };

  const handleViewFull = (res: Resource) => {
    const url = res.url;
    if (!url) return;
    window.open(url, '_blank');
  };

  const formatSubmissionDetail = (detail: string) => {
    if (!detail) return <p className="italic text-muted-foreground">Sin contenido.</p>;

    try {
      const parsed = JSON.parse(detail);
      
      // Caso 1: Es la nueva entrega enriquecida (Actividad)
      if (parsed.text !== undefined || parsed.file !== undefined) {
        return (
          <div className="space-y-6">
            {parsed.text && (
              <div 
                className={cn(
                  "p-4 bg-muted/30 rounded-xl border",
                  parsed.bold && "font-bold",
                  parsed.italic && "italic",
                  parsed.align === "center" && "text-center",
                  parsed.align === "right" && "text-right",
                  parsed.fontSize || "text-base"
                )}
              >
                {parsed.text}
              </div>
            )}

            {parsed.file && (
              <div className="p-4 border rounded-xl bg-slate-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <FileText className="text-primary h-8 w-8" />
                  <div>
                    <p className="text-sm font-bold">{parsed.fileName || "Archivo adjunto"}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Documento de entrega</p>
                  </div>
                </div>
                <Button size="sm" variant="default" className="bg-slate-900" asChild>
                  <a href={parsed.file} download={parsed.fileName || "entrega-datanexus"}>
                    <Download className="mr-2 h-4 w-4" /> Descargar
                  </a>
                </Button>
              </div>
            )}
          </div>
        );
      }

      // Caso 2: Es un array de respuestas (Evaluación)
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-4">
            {parsed.map((item: any, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                <p className="text-sm font-bold text-primary mb-1">{item.pregunta}</p>
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
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setSourceTab("url"); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso</Button>}
          </div>
          {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin" /></div> : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => {
                const resId = getObjectId(res);
                const embedUrl = getEmbedUrl(res.url);
                return (
                  <Card key={resId} className="overflow-hidden group relative shadow-md">
                    {isAdmin && (
                      <div className="absolute top-4 right-4 flex gap-2 z-20">
                        <Button variant="default" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full" onClick={() => { setEditingResource(res); setResourceForm(res); setSourceTab(res.url?.startsWith('data:') ? "file" : "url"); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
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
                      {embedUrl ? (
                        <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner"><iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen /></div>
                      ) : (
                        <div className="p-12 text-center border rounded-xl bg-muted/20"><FileCode className="h-12 w-12 mx-auto mb-2 opacity-20" /><Button variant="link" onClick={() => handleViewFull(res)}>Abrir Recurso</Button></div>
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
            {isAdmin && <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); setIsActivityDialogOpen(true); }} size="sm" className="bg-primary"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => {
              const actId = getObjectId(act);
              return (
                <Card key={actId} className="flex flex-col shadow-md border-t-4 border-t-accent/50 group relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                       <Button variant="default" size="icon" className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 text-white shadow-lg rounded-full" onClick={() => { setItemToDelete({ id: actId, type: 'actividad' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit">{act.tipo.toUpperCase()}</Badge>
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
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setViewMode('edit'); setIsAssessmentDialogOpen(true); }} size="sm" className="bg-primary"><PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((ass) => {
              const assId = getObjectId(ass);
              return (
                <Card key={assId} className="hover:border-primary transition-all cursor-pointer group shadow-md relative" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode(isAdmin ? 'edit' : 'preview'); handleResetPreview(); setIsAssessmentDialogOpen(true); }}>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8 bg-red-600 text-white rounded-full" onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: assId, type: 'evaluacion' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                    <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent><div className="text-sm text-muted-foreground flex items-center gap-2"><HelpCircle className="h-4 w-4" /> {ass.preguntas?.length || 0} Preguntas</div></CardContent>
                  <CardFooter><Button className="w-full" variant="outline">Entrar</Button></CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento" className="space-y-6">
            <Card className="shadow-sm overflow-hidden border-none rounded-2xl">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Panel de Seguimiento</CardTitle>
                <CardDescription>Revisa y califica el desempeño de tus estudiantes.</CardDescription>
              </CardHeader>
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Contenido</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sub) => (
                    <TableRow key={sub._id}>
                      <TableCell className="font-medium text-xs">
                        <div className="font-bold">{sub.usuarioNombre}</div>
                        <div className="text-[10px] text-muted-foreground">{sub.usuarioEmail}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs font-semibold">{sub.tituloContenido}</TableCell>
                      <TableCell>
                        {sub.puntaje !== undefined ? (
                          <Badge className={cn("px-2 font-bold", sub.puntaje >= 3.5 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>{Number(sub.puntaje).toFixed(1)} / 5.0</Badge>
                        ) : <span className="text-slate-300 italic text-[10px]">Pendiente</span>}
                      </TableCell>
                      <TableCell><Badge variant={sub.estado === "calificado" ? "default" : "secondary"} className="text-[10px]">{sub.estado.toUpperCase()}</Badge></TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => handleOpenGrading(sub)}>
                          <GradeIcon className="mr-2 h-4 w-4" /> Calificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {submissions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-20 italic text-muted-foreground">No hay envíos registrados.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><GradeIcon className="h-5 w-5 text-primary" /> Revisión de Entrega</DialogTitle>
            <DialogDescription>Calificando a: <strong>{selectedSubmission?.usuarioNombre}</strong></DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase font-bold text-primary">Contenido Enviado</Label>
              {selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Puntaje (0 - 5.0)</Label>
                <Input type="number" step="0.1" min="0" max="5" value={gradingForm.puntaje} onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value) || 0})} />
                <p className="text-[10px] text-muted-foreground italic">Calificación máxima permitida: 5.0</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Retroalimentación</Label>
                <Textarea placeholder="Observaciones pedagógicas..." value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} rows={4} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveGrade} disabled={isProcessing} className="bg-primary">{isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Guardar Calificación'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubmitActivityOpen} onOpenChange={setIsSubmitActivityOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Entregar: {selectedActivity?.titulo}</DialogTitle>
            <DialogDescription>Completa tu respuesta con formato y adjunta archivos si es necesario.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {/* Barra de herramientas del editor */}
            <div className="space-y-4">
              <Label className="text-sm font-bold flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Desarrollo de la Actividad</Label>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-50 p-2 border-b flex flex-wrap gap-1">
                  <Button 
                    type="button" 
                    variant={activitySubmission.bold ? "default" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setActivitySubmission({...activitySubmission, bold: !activitySubmission.bold})}
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant={activitySubmission.italic ? "default" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setActivitySubmission({...activitySubmission, italic: !activitySubmission.italic})}
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-8" />
                  <Button 
                    type="button" 
                    variant={activitySubmission.align === "left" ? "default" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setActivitySubmission({...activitySubmission, align: "left"})}
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant={activitySubmission.align === "center" ? "default" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setActivitySubmission({...activitySubmission, align: "center"})}
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button 
                    type="button" 
                    variant={activitySubmission.align === "right" ? "default" : "ghost"} 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => setActivitySubmission({...activitySubmission, align: "right"})}
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-8" />
                  <Select 
                    value={activitySubmission.fontSize} 
                    onValueChange={(v) => setActivitySubmission({...activitySubmission, fontSize: v})}
                  >
                    <SelectTrigger className="h-8 w-[120px] bg-transparent border-none">
                      <SelectValue placeholder="Tamaño" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text-xs">Pequeño</SelectItem>
                      <SelectItem value="text-base">Normal</SelectItem>
                      <SelectItem value="text-xl">Grande</SelectItem>
                      <SelectItem value="text-3xl">Título</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea 
                  placeholder="Escribe aquí tu respuesta..." 
                  value={activitySubmission.text} 
                  onChange={e => setActivitySubmission({...activitySubmission, text: e.target.value})} 
                  rows={8}
                  className={cn(
                    "border-none focus-visible:ring-0 rounded-none bg-white",
                    activitySubmission.bold && "font-bold",
                    activitySubmission.italic && "italic",
                    activitySubmission.align === "center" && "text-center",
                    activitySubmission.align === "right" && "text-right",
                    activitySubmission.fontSize
                  )}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <Label className="text-sm font-bold flex items-center gap-2"><FileUp className="h-4 w-4 text-primary" /> Adjuntar archivo (Opcional)</Label>
              <div 
                className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => document.getElementById('submissionFile')?.click()}
              >
                <input 
                  id="submissionFile" 
                  type="file" 
                  className="hidden" 
                  onChange={e => setActivitySubmission({...activitySubmission, file: e.target.files?.[0] || null})} 
                />
                {activitySubmission.file ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckSquare className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-bold">{activitySubmission.file.name}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="h-8 w-8 mx-auto mb-2 opacity-40 text-primary" />
                    <p className="text-xs font-medium">Haz clic o arrastra para subir un documento</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Soporta PDF, Word e Imágenes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmitActivity} disabled={isProcessing} className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
              Finalizar y Enviar Entrega
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>{editingResource ? "Editar" : "Nuevo"} Recurso</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Tabs value={sourceTab} onValueChange={(v:any) => setSourceTab(v)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url">URL</TabsTrigger>
                  <TabsTrigger value="file">Archivo</TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="pt-2"><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." /></TabsContent>
                <TabsContent value="file" className="pt-2">
                  <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('resFile')?.click()}>
                    <input id="resFile" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                    {uploadedFile ? <p className="text-sm font-bold">{uploadedFile.name}</p> : <><Upload className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Soporta PDF, Videos y Office</p></>}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
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
                          <Input value={opt} onChange={e => { const newOpts = [...currentQuestion.opciones]; newOpts[idx] = e.target.value; setCurrentQuestion({...currentQuestion, opciones: newOpts}); }} className="flex-1" />
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
              {assessmentForm.preguntas?.length > 0 && (
                <div className="space-y-2">
                  <Label>Preguntas actualizadas ({assessmentForm.preguntas.length})</Label>
                  <div className="space-y-2">
                    {assessmentForm.preguntas.map((q, i) => (
                      <div key={q.id} className="flex items-center justify-between p-2 border rounded text-sm bg-white shadow-sm">
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
              {assessmentForm.preguntas?.map((q, idx) => (
                <div key={q.id} className="space-y-4 p-4 border rounded-xl bg-slate-50/50">
                  <p className="text-lg font-bold">{idx + 1}. {q.texto}</p>
                  <div className="pl-4">
                    {q.tipo === 'opcion-multiple' && (
                      <RadioGroup value={userAnswers[q.id]} onValueChange={v => !showFeedback && setUserAnswers({...userAnswers, [q.id]: v})} className="space-y-2">
                        {q.opciones.map((opt, i) => (
                          <div key={i} className={cn("flex items-center space-x-3 p-3 border rounded-xl bg-white", 
                            showFeedback && q.respuestaCorrecta === opt ? "bg-green-100 border-green-500 shadow-sm" : 
                            showFeedback && userAnswers[q.id] === opt && q.respuestaCorrecta !== opt ? "bg-red-100 border-red-500 shadow-sm" : "hover:bg-muted/50")}>
                            <RadioGroupItem value={opt} id={`q${idx}o${i}`} disabled={showFeedback} />
                            <Label htmlFor={`q${idx}o${i}`} className="flex-1 cursor-pointer font-medium">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {q.tipo === 'verdadero-falso' && (
                      <div className="flex gap-4">
                         {['Verdadero', 'Falso'].map(val => (
                           <Button key={val} variant={userAnswers[q.id] === val ? 'default' : 'outline'} className={cn("flex-1 h-12 font-bold", showFeedback && q.respuestaCorrecta === val ? "bg-green-600 text-white" : showFeedback && userAnswers[q.id] === val ? "bg-red-600 text-white" : "")} onClick={() => !showFeedback && setUserAnswers({...userAnswers, [q.id]: val})} disabled={showFeedback}>{val}</Button>
                         ))}
                      </div>
                    )}
                    {q.tipo === 'escrita' && (
                      <Textarea placeholder="Escribe tu respuesta aquí..." value={userAnswers[q.id] || ""} onChange={e => !showFeedback && setUserAnswers({...userAnswers, [q.id]: e.target.value})} disabled={showFeedback} rows={6} className="bg-white" />
                    )}
                  </div>
                </div>
              ))}
              {!showFeedback ? <Button className="w-full h-14 font-bold text-lg shadow-lg" onClick={handleGradeAssessment}>Finalizar y Enviar Evaluación</Button> : <Button variant="outline" className="w-full h-12" onClick={handleResetPreview}>Reintentar (Simulado)</Button>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-headline">¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription className="text-base">Esta acción es irreversible. Se eliminará el {itemToDelete?.type} de la base de datos de MongoDB.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing} className="rounded-2xl h-12">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-8" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />} Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
