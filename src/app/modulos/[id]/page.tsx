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
  MessageSquare,
  GraduationCap as GradeIcon,
  Save,
  Send,
  FileCheck
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Separator } from "@/components/ui/separator";

const modulesData = {
  "1": { title: "Módulo 1: Fundamentos", objective: "Conceptos básicos de bases de datos e investigación." },
  "2": { title: "Módulo 2: Acceso", objective: "Identificación de recursos institucionales." },
  "3": { title: "Módulo 3: Navegación", objective: "Búsqueda básica en bases de datos." },
  "4": { title: "Módulo 4: Estrategias", objective: "Búsqueda avanzada y operadores booleanos." },
  "5": { title: "Módulo 5: Inteligencia Artificial", objective: "Uso de IA para optimizar búsquedas." },
  "6": { title: "Módulo 6: Gestión", objective: "Organización y almacenamiento de información." },
  "7": { title: "Módulo 7: Evaluación", objective: "Selección de fuentes de calidad." },
  "8": { title: "Módulo 8: Ética", objective: "Uso responsable y principios éticos." },
  "9": { title: "Módulo 9: Aplicación", objective: "Ejercicio integrador final." }
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
  _id: any;
  usuarioNombre: string;
  usuarioEmail: string;
  tipoEnvio: string;
  moduloId: string;
  tituloContenido: string;
  detalleEnvio: string;
  puntaje?: number;
  estado: string;
  recomendaciones?: string;
  createdAt?: string;
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const userRole = (user?.role || '').trim().toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrador';
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('preview');
  
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'recurso' | 'actividad' | 'evaluacion' } | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");
  const [submitText, setSubmitText] = useState("");
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });

  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const [resourceForm, setResourceForm] = useState<Resource>({
    titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL"
  });

  const [activityForm, setActivityForm] = useState<Activity>({
    titulo: "", descripcion: "", tipo: "tarea", criterios_evaluacion: "", moduloId: id
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

  const base64ToBlobUrl = (dataUri: string) => {
    try {
      const parts = dataUri.split(',');
      if (parts.length < 2) return null;
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
      const b64Data = parts[1];
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) byteNumbers[i] = slice.charCodeAt(i);
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      return URL.createObjectURL(new Blob(byteArrays, { type: mime }));
    } catch (e) { return null; }
  };

  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string' || !url.startsWith("http")) return null;
    if (url.includes("drive.google.com")) {
      if (url.includes("/view")) return url.split("/view")[0] + "/preview";
      if (url.includes("/edit")) return url.split("/edit")[0] + "/preview";
      return url;
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let vId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return vId ? `https://www.youtube.com/embed/${vId}` : url;
    }
    return url;
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
      
      const filteredSubs = subResponse.data.filter((sub: any) => 
        String(sub.moduloId) === String(id) && (isAdmin ? true : sub.usuarioEmail === user?.email)
      );
      setSubmissions(filteredSubs);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [id, user]);

  useEffect(() => {
    Object.values(pdfUrls).forEach(url => URL.revokeObjectURL(url));
    const newUrls: Record<string, string> = {};
    resources.forEach(res => {
      const isBase64 = res.url?.startsWith('data:');
      const isPdf = isBase64 && (res.url.includes('pdf') || res.formato?.toLowerCase() === 'pdf');
      if (isPdf) {
        const blobUrl = base64ToBlobUrl(res.url);
        if (blobUrl) newUrls[getObjectId(res)] = blobUrl;
      }
    });
    setPdfUrls(newUrls);
    return () => Object.values(newUrls).forEach(url => URL.revokeObjectURL(url));
  }, [resources]);

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
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
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

  const handleSubmitWork = async () => {
    if (!submitText) return;
    setIsProcessing(true);
    try {
      const payload = {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email || "",
        tipoEnvio: "actividad",
        moduloId: id,
        tituloContenido: selectedActivity?.titulo || "Tarea",
        detalleEnvio: submitText,
        estado: "enviado"
      };
      await api.post("/performance-reports", payload);
      toast({ title: "Trabajo enviado" });
      setIsSubmitDialogOpen(false);
      setSubmitText("");
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
      toast({ title: "Evaluación enviada" });
      fetchData();
    } catch (e) {
      toast({ title: "Error al registrar", variant: "destructive" });
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    
    if (gradingForm.puntaje > 5) {
      toast({ title: "Puntaje inválido", description: "El máximo es 5.0", variant: "destructive" });
      return;
    }
    if (gradingForm.puntaje < 0) {
      toast({ title: "Puntaje inválido", description: "El mínimo es 0.0", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const subId = getObjectId(selectedSubmission);
      await api.patch(`/performance-reports/${subId}`, {
        puntaje: gradingForm.puntaje,
        recomendaciones: gradingForm.recomendaciones,
        estado: "calificado"
      });
      toast({ title: "Calificación registrada" });
      setIsGradingDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error al calificar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSubmissionDetail = (detail: string) => {
    try {
      const parsed = JSON.parse(detail);
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-4">
            {parsed.map((item: any, idx) => (
              <div key={idx} className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                <p className="text-xs font-bold text-primary mb-1 uppercase">{item.pregunta || 'Pregunta'}</p>
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
          <h1 className="text-3xl font-headline font-bold">{moduleInfo.title}</h1>
        </div>
      </div>

      <Tabs defaultValue="recursos" className="w-full">
        <TabsList className={cn("grid w-full mb-8", isAdmin ? "md:w-[640px] grid-cols-4" : "md:w-[480px] grid-cols-3")}>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          {isAdmin && <TabsTrigger value="seguimiento" className="text-accent font-bold">Seguimiento</TabsTrigger>}
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setSourceTab("url"); setIsResourceDialogOpen(true); }} size="sm" className="bg-primary"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso</Button>}
          </div>
          <div className="grid grid-cols-1 gap-8">
            {resources.map((res) => {
              const resId = getObjectId(res);
              const embedUrl = getEmbedUrl(res.url);
              const isBase64 = res.url?.startsWith('data:');
              const isPdf = isBase64 && (res.url.includes('pdf') || res.formato?.toLowerCase() === 'pdf');
              const isVideo = isBase64 && res.url.includes('video/');

              return (
                <Card key={resId} className="overflow-hidden shadow-md relative group">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white shadow-lg" onClick={() => { setEditingResource(res); setResourceForm({...res}); setSourceTab(res.url?.startsWith('data:') ? "file" : "url"); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8 shadow-lg" onClick={() => { setItemToDelete({ id: resId, type: 'recurso' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                       <Badge variant="outline" className="uppercase">{res.tipo}</Badge>
                       <Button size="sm" className="bg-slate-900" onClick={() => handleViewFull(res)}>Ver Pantalla Completa</Button>
                    </div>
                    <CardTitle>{res.titulo}</CardTitle>
                    <CardDescription>{res.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {embedUrl ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner"><iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen /></div>
                    ) : isPdf ? (
                      <div className="aspect-video rounded-xl overflow-hidden border bg-background"><iframe src={pdfUrls[resId]} className="w-full h-full border-0" /></div>
                    ) : isVideo ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-black"><video controls className="w-full h-full"><source src={res.url} /></video></div>
                    ) : (
                      <div className="p-12 text-center border rounded-xl bg-muted/20"><FileCode className="h-12 w-12 mx-auto mb-2 opacity-20" /><Button variant="link" onClick={() => handleViewFull(res)}>Abrir Recurso Externo</Button></div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Actividades Prácticas</h2>
            {isAdmin && <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "tarea", criterios_evaluacion: "", moduloId: id }); setIsActivityDialogOpen(true); }} size="sm" className="bg-primary"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Actividad</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => {
              const actId = getObjectId(act);
              return (
                <Card key={actId} className="shadow-md border-l-4 border-l-primary relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setEditingActivity(act); setActivityForm({...act}); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => { setItemToDelete({ id: actId, type: 'actividad' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader><Badge className="w-fit mb-2">{act.tipo.toUpperCase()}</Badge><CardTitle>{act.titulo}</CardTitle><CardDescription>{act.descripcion}</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm bg-muted/30 p-4 rounded-lg"><p className="font-bold mb-1">Criterios:</p><p className="text-muted-foreground">{act.criterios_evaluacion || "No especificados"}</p></div>
                    {!isAdmin && <Button className="w-full" onClick={() => { setSelectedActivity(act); setIsSubmitDialogOpen(true); }}><Send className="mr-2 h-4 w-4" /> Enviar Trabajo</Button>}
                  </CardContent>
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
                <Card key={assId} className="shadow-md hover:border-primary transition-all cursor-pointer relative group" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setViewMode(isAdmin ? 'edit' : 'preview'); setUserAnswers({}); setShowFeedback(false); setIsAssessmentDialogOpen(true); }}>
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 z-10">
                      <Button variant="secondary" size="icon" className="h-7 w-7 bg-blue-600 text-white" onClick={(e) => { e.stopPropagation(); setEditingAssessment(ass); setAssessmentForm(ass); setViewMode('edit'); setIsAssessmentDialogOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="secondary" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: assId, type: 'evaluacion' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  )}
                  <CardHeader><CardTitle className="text-lg">{ass.titulo}</CardTitle><CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription></CardHeader>
                  <CardFooter><Button variant="outline" className="w-full">Entrar</Button></CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento" className="space-y-6">
            <Card className="shadow-sm overflow-hidden">
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
                  {submissions.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((sub) => {
                    const subId = getObjectId(sub);
                    return (
                      <TableRow key={subId}>
                        <TableCell className="font-medium text-xs"><div>{sub.usuarioNombre}</div><div className="text-[10px] text-muted-foreground">{sub.usuarioEmail}</div></TableCell>
                        <TableCell className="max-w-[200px] truncate text-xs font-semibold">{sub.tituloContenido}</TableCell>
                        <TableCell>
                          {sub.puntaje !== undefined ? (
                            <span className={cn("font-bold", sub.puntaje >= 3.5 ? "text-green-600" : "text-amber-600")}>{Number(sub.puntaje).toFixed(1)}/5.0</span>
                          ) : '—'}
                        </TableCell>
                        <TableCell><Badge variant={sub.estado === "calificado" ? "default" : "secondary"} className="text-[10px]">{sub.estado.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => { setSelectedSubmission(sub); setGradingForm({ puntaje: sub.puntaje || 0, recomendaciones: sub.recomendaciones || "" }); setIsGradingDialogOpen(true); }}><FileCheck className="mr-2 h-4 w-4" /> Calificar</Button></TableCell>
                      </TableRow>
                    );
                  })}
                  {submissions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-10 italic text-muted-foreground">No hay envíos registrados.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* DIÁLOGOS DE REVISIÓN Y GESTIÓN */}
      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader><DialogTitle>Revisión de Entrega</DialogTitle><DialogDescription>Estudiante: {selectedSubmission?.usuarioNombre}</DialogDescription></DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2 py-4 space-y-6">
            <div className="space-y-2"><Label className="text-xs uppercase font-bold text-primary">Respuesta enviada</Label>{selectedSubmission && formatSubmissionDetail(selectedSubmission.detalleEnvio)}</div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Puntaje (0-5)</Label>
                <Input type="number" step="0.1" min="0" max="5" value={gradingForm.puntaje} onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value)})} />
                <p className="text-[10px] text-muted-foreground">Máximo permitido: 5.0</p>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Retroalimentación</Label>
                <Textarea placeholder="Observaciones..." value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} rows={3} />
              </div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>Cancelar</Button><Button onClick={handleGradeSubmission} disabled={isProcessing}>Guardar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGOS DE EDICIÓN (RECURSOS, ACTIVIDADES, EVALUACIONES) */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingResource ? 'Editar' : 'Nuevo'} Recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Tabs value={sourceTab} onValueChange={(v:any) => setSourceTab(v)}>
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="url">URL</TabsTrigger><TabsTrigger value="file">Archivo</TabsTrigger></TabsList>
                <TabsContent value="url" className="pt-2"><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." /></TabsContent>
                <TabsContent value="file" className="pt-2">
                   <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('resFile')?.click()}>
                    <input id="resFile" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                    {uploadedFile ? <p className="text-sm font-bold">{uploadedFile.name}</p> : <><Upload className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Soporta PDF, Videos y Office</p></>}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing}>Guardar Recurso</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ELIMINAR SEGURO */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Esta acción es permanente e irreversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-white hover:bg-destructive/90">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>Enviar Tarea</DialogTitle></DialogHeader><div className="py-4"><Textarea placeholder="Pega el enlace o escribe tu respuesta aquí..." value={submitText} onChange={e => setSubmitText(e.target.value)} rows={8} /></div><DialogFooter><Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>Cancelar</Button><Button onClick={handleSubmitWork} disabled={isProcessing}>Enviar</Button></DialogFooter></DialogContent>
      </Dialog>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
           {viewMode === 'edit' ? (
             <div className="space-y-6 py-4">
                <DialogHeader><DialogTitle>Gestor de Evaluación</DialogTitle></DialogHeader>
                <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label>Título</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div><div className="grid gap-2"><Label>Descripción</Label><Input value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div></div>
                <div className="p-4 border rounded-xl bg-muted/20 space-y-4">
                  <h3 className="font-bold text-primary">Añadir Pregunta</h3>
                  <div className="grid gap-2"><Label>Enunciado</Label><Input value={currentQuestion.texto} onChange={e => setCurrentQuestion({...currentQuestion, texto: e.target.value})} /></div>
                  <div className="grid gap-2">
                    <Label>Tipo</Label>
                    <Select value={currentQuestion.tipo} onValueChange={(v: any) => setCurrentQuestion({...currentQuestion, tipo: v, opciones: v === 'opcion-multiple' ? ["Opción A", "Opción B"] : [], respuestaCorrecta: ""})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="opcion-multiple">Opción Múltiple</SelectItem><SelectItem value="verdadero-falso">Verdadero/Falso</SelectItem><SelectItem value="escrita">Abierta</SelectItem></SelectContent>
                    </Select>
                  </div>
                  {currentQuestion.tipo === 'opcion-multiple' && (
                    <div className="space-y-2">
                       {currentQuestion.opciones.map((opt, i) => (
                         <div key={i} className="flex items-center gap-2"><RadioGroupItem checked={currentQuestion.respuestaCorrecta === opt} onClick={() => setCurrentQuestion({...currentQuestion, respuestaCorrecta: opt})} value={opt} /><Input value={opt} onChange={e => { const n = [...currentQuestion.opciones]; n[i] = e.target.value; setCurrentQuestion({...currentQuestion, opciones: n}); }} /></div>
                       ))}
                    </div>
                  )}
                  <Button variant="default" className="w-full" onClick={() => { if(!currentQuestion.texto) return; setAssessmentForm({...assessmentForm, preguntas: [...assessmentForm.preguntas, currentQuestion]}); setCurrentQuestion({id: Math.random().toString(36).substr(2,9), texto:"", tipo:"opcion-multiple", opciones:["A","B"], respuestaCorrecta:""}); }}>Añadir Pregunta</Button>
                </div>
                <DialogFooter><Button onClick={handleSaveAssessment} className="w-full">Guardar Evaluación Completa</Button></DialogFooter>
             </div>
           ) : (
             <div className="py-4 space-y-6">
                <DialogHeader><DialogTitle className="text-2xl">{assessmentForm.titulo}</DialogTitle></DialogHeader>
                {assessmentForm.preguntas.map((q, idx) => (
                  <div key={q.id} className="space-y-4">
                    <p className="text-lg font-bold">{idx + 1}. {q.texto}</p>
                    {q.tipo === 'opcion-multiple' && <RadioGroup value={userAnswers[q.id]} onValueChange={v => !showFeedback && setUserAnswers({...userAnswers, [q.id]: v})} className="space-y-2">{q.opciones.map((opt, i) => <div key={i} className={cn("flex items-center space-x-3 p-3 border rounded-xl", showFeedback && q.respuestaCorrecta === opt ? "bg-green-100 border-green-500" : "hover:bg-muted/50")}><RadioGroupItem value={opt} id={`q${idx}o${i}`} disabled={showFeedback} /><Label htmlFor={`q${idx}o${i}`} className="flex-1 cursor-pointer">{opt}</Label></div>)}</RadioGroup>}
                    {q.tipo === 'escrita' && <Textarea placeholder="Escribe aquí..." value={userAnswers[q.id] || ""} onChange={e => !showFeedback && setUserAnswers({...userAnswers, [q.id]: e.target.value})} disabled={showFeedback} rows={4} />}
                  </div>
                ))}
                {!showFeedback && <Button className="w-full h-12 font-bold" onClick={handleGradeAssessment}>Finalizar y Enviar</Button>}
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
