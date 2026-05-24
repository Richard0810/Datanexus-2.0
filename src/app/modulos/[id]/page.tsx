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
  MoreHorizontal,
  FileCode,
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
  "1": { title: "Módulo 1: Fundamentos", objective: "Conceptos básicos de bases de datos." },
  "2": { title: "Módulo 2: Acceso", objective: "Identificación de recursos institucionales." },
  "3": { title: "Módulo 3: Navegación", objective: "Búsqueda básica." },
  "4": { title: "Módulo 4: Estrategias", objective: "Búsqueda avanzada." },
  "5": { title: "Módulo 5: Inteligencia Artificial", objective: "IA en la búsqueda académica." },
  "6": { title: "Módulo 6: Gestión", objective: "Organización de la información." },
  "7": { title: "Módulo 7: Evaluación", objective: "Selección de fuentes de calidad." },
  "8": { title: "Módulo 8: Ética", objective: "Uso responsable de la información." },
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

interface Assessment {
  _id?: any;
  titulo: string;
  descripcion: string;
  moduloId: string;
  puntuacion?: string;
  criterios_evaluacion?: string;
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
  
  const isAdmin = user?.role === 'admin' || user?.role === 'administrador';
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  
  // Diálogos
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [isAssessmentDialogOpen, setIsAssessmentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  
  // Estados de selección
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: 'recurso' | 'actividad' | 'evaluacion' } | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  // Formularios
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
    titulo: "", descripcion: "", moduloId: id, puntuacion: "5.0", criterios_evaluacion: ""
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
    } catch (e) {
      return null;
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string' || !url.startsWith("http")) return null;
    // Si es Google Drive, convertir /view a /preview para evitar errores de acceso incrustado
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
    if (!assessmentForm.titulo) return;
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
      toast({ title: "Tarea enviada correctamente" });
      setIsSubmitDialogOpen(false);
      setSubmitText("");
      fetchData();
    } catch (error) {
      toast({ title: "Error al enviar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    try {
      const subId = getObjectId(selectedSubmission);
      await api.patch(`/performance-reports/${subId}`, {
        puntaje: gradingForm.puntaje,
        recomendaciones: gradingForm.recomendaciones,
        estado: "calificado"
      });
      toast({ title: "Calificación guardada" });
      setIsGradingDialogOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error al calificar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewFull = (res: Resource) => {
    const url = res.url;
    if (!url) return;
    if (url.startsWith('data:')) {
      const resId = getObjectId(res);
      if (pdfUrls[resId]) {
        window.open(pdfUrls[resId], '_blank');
        return;
      }
      const blobUrl = base64ToBlobUrl(url);
      if (blobUrl) window.open(blobUrl, '_blank');
    } else {
      const embedUrl = getEmbedUrl(url);
      window.open(embedUrl || url, '_blank');
    }
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
        <TabsList className="grid w-full md:w-[600px] grid-cols-4 mb-8">
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setSourceTab("url"); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso</Button>}
          </div>

          <div className="grid grid-cols-1 gap-8">
            {resources.map((res) => {
              const resId = getObjectId(res);
              const embedUrl = getEmbedUrl(res.url);
              const isBase64 = res.url?.startsWith('data:');
              const isPdf = isBase64 && (res.url.includes('pdf') || res.formato?.toLowerCase() === 'pdf');
              const isVideo = isBase64 && res.url.includes('video/');

              return (
                <Card key={resId} className="overflow-hidden shadow-md relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setEditingResource(res); setResourceForm({...res}); setSourceTab(res.url?.startsWith('data:') ? "file" : "url"); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => { setItemToDelete({ id: resId, type: 'recurso' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                       <Badge variant="outline" className="uppercase">{res.tipo}</Badge>
                       <Button size="sm" className="bg-slate-900" onClick={() => handleViewFull(res)}>Ver Completo</Button>
                    </div>
                    <CardTitle>{res.titulo}</CardTitle>
                    <CardDescription>{res.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {embedUrl ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner">
                        <iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen />
                      </div>
                    ) : isPdf ? (
                      <div className="aspect-video rounded-xl overflow-hidden border bg-background">
                        <iframe src={pdfUrls[resId]} className="w-full h-full border-0" />
                      </div>
                    ) : isVideo ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-black">
                        <video controls className="w-full h-full"><source src={res.url} /></video>
                      </div>
                    ) : (
                      <div className="p-12 text-center border rounded-xl bg-muted/20">
                        <FileCode className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <Button variant="link" onClick={() => handleViewFull(res)}>Abrir Recurso Externo</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {resources.length === 0 && <p className="text-center py-10 text-muted-foreground italic">No hay recursos en este módulo.</p>}
          </div>
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Actividades Prácticas</h2>
            {isAdmin && <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "tarea", criterios_evaluacion: "", moduloId: id }); setIsActivityDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Actividad</Button>}
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
                  <CardHeader>
                    <Badge className="w-fit mb-2">{act.tipo.toUpperCase()}</Badge>
                    <CardTitle>{act.titulo}</CardTitle>
                    <CardDescription>{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm bg-muted/30 p-4 rounded-lg">
                      <p className="font-bold mb-1">Criterios de Evaluación:</p>
                      <p className="text-muted-foreground">{act.criterios_evaluacion || "No especificados"}</p>
                    </div>
                    {!isAdmin && (
                      <Button className="w-full" onClick={() => { setSelectedActivity(act); setIsSubmitDialogOpen(true); }}>
                        <Send className="mr-2 h-4 w-4" /> Enviar Tarea
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {activities.length === 0 && <p className="text-center py-10 text-muted-foreground italic col-span-2">No hay actividades para este módulo.</p>}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, puntuacion: "5.0", criterios_evaluacion: "" }); setIsAssessmentDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Evaluación</Button>}
          </div>

          <div className="grid grid-cols-1 gap-6">
            {assessments.map((ass) => {
              const assId = getObjectId(ass);
              return (
                <Card key={assId} className="shadow-md border-l-4 border-l-accent relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button variant="default" size="icon" className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => { setEditingAssessment(ass); setAssessmentForm({...ass}); setIsAssessmentDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => { setItemToDelete({ id: assId, type: 'evaluacion' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{ass.titulo}</CardTitle>
                    <CardDescription>{ass.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Puntuación máxima: <strong>{ass.puntuacion || "5.0"}</strong></p>
                    {!isAdmin && <Button className="bg-accent hover:bg-accent/90">Iniciar Examen</Button>}
                  </CardContent>
                </Card>
              );
            })}
            {assessments.length === 0 && <p className="text-center py-10 text-muted-foreground italic">No hay evaluaciones para este módulo.</p>}
          </div>
        </TabsContent>

        <TabsContent value="seguimiento" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">{isAdmin ? "Entregas Recibidas" : "Mi Seguimiento"}</h2>
          </div>

          <Card className="shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  {isAdmin && <TableHead>Estudiante</TableHead>}
                  <TableHead>Contenido</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Estado</TableHead>
                  {isAdmin && <TableHead className="text-right">Acción</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => {
                  const subId = getObjectId(sub);
                  return (
                    <TableRow key={subId}>
                      <TableCell className="text-xs">{sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '—'}</TableCell>
                      {isAdmin && <TableCell className="font-medium text-xs">{sub.usuarioNombre}</TableCell>}
                      <TableCell className="max-w-[200px] truncate text-xs font-semibold">{sub.tituloContenido}</TableCell>
                      <TableCell>
                        <span className={cn("font-bold", sub.puntaje && sub.puntaje >= 3.5 ? "text-green-600" : "text-amber-600")}>
                          {sub.puntaje !== undefined ? `${sub.puntaje}/5.0` : '—'}
                        </span>
                      </TableCell>
                      <TableCell><Badge variant="secondary" className="text-[10px] uppercase">{sub.estado}</Badge></TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => { setSelectedSubmission(sub); setGradingForm({ puntaje: sub.puntaje || 0, recomendaciones: sub.recomendaciones || "" }); setIsGradingDialogOpen(true); }}>
                            <FileCheck className="mr-2 h-4 w-4" /> Calificar
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {submissions.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">No hay registros de seguimiento para mostrar.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIÁLOGOS DE RECURSOS */}
      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingResource ? 'Editar' : 'Nuevo'} Recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Fuente</Label>
              <Tabs value={sourceTab} onValueChange={(v:any) => setSourceTab(v)}>
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="url">URL</TabsTrigger><TabsTrigger value="file">Archivo</TabsTrigger></TabsList>
                <TabsContent value="url" className="pt-2"><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." /></TabsContent>
                <TabsContent value="file" className="pt-2">
                  <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/50" onClick={() => document.getElementById('resFile')?.click()}>
                    <input id="resFile" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                    {uploadedFile ? <p className="text-sm font-bold">{uploadedFile.name}</p> : <><Upload className="h-8 w-8 mx-auto mb-2 opacity-50" /><p className="text-xs">Soporta PDF, PPTX, DOCX, MP4</p></>}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveResource} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Guardar'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGOS DE ACTIVIDADES */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingActivity ? 'Editar' : 'Nueva'} Actividad</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={activityForm.titulo} onChange={e => setActivityForm({...activityForm, titulo: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={activityForm.descripcion} onChange={e => setActivityForm({...activityForm, descripcion: e.target.value})} /></div>
            <div className="space-y-2"><Label>Criterios de Evaluación</Label><Textarea value={activityForm.criterios_evaluacion} onChange={e => setActivityForm({...activityForm, criterios_evaluacion: e.target.value})} /></div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={activityForm.tipo} onValueChange={v => setActivityForm({...activityForm, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="tarea">Tarea</SelectItem><SelectItem value="foro">Foro</SelectItem><SelectItem value="simulacion">Simulación</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsActivityDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveActivity} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Guardar'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGOS DE EVALUACIONES */}
      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{editingAssessment ? 'Editar' : 'Nueva'} Evaluación</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Título *</Label><Input value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} /></div>
            <div className="space-y-2"><Label>Puntuación Máxima</Label><Input type="number" step="0.1" value={assessmentForm.puntuacion} onChange={e => setAssessmentForm({...assessmentForm, puntuacion: e.target.value})} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsAssessmentDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveAssessment} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Guardar'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO ENVIAR TAREA */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Enviar Actividad</DialogTitle>
            <DialogDescription>{selectedActivity?.titulo}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Respuesta o Enlace</Label>
              <Textarea 
                placeholder="Escribe tu respuesta aquí o pega el enlace a tu trabajo..."
                value={submitText}
                onChange={(e) => setSubmitText(e.target.value)}
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitWork} disabled={isProcessing || !submitText}>
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Send className="mr-2 h-4 w-4" />} Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIÁLOGO CALIFICAR */}
      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Calificar Entrega</DialogTitle>
            <DialogDescription>Estudiante: {selectedSubmission?.usuarioNombre}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted/30 rounded-lg text-sm border-l-4 border-l-primary max-h-[200px] overflow-y-auto">
              <p className="font-bold mb-1">Contenido Recibido:</p>
              <p className="whitespace-pre-wrap">{selectedSubmission?.detalleEnvio}</p>
            </div>
            <div className="space-y-2">
              <Label>Puntaje (0.0 - 5.0)</Label>
              <Input 
                type="number" 
                step="0.1" 
                min="0" 
                max="5" 
                value={gradingForm.puntaje} 
                onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value)})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Recomendaciones</Label>
              <Textarea 
                placeholder="Retroalimentación para el estudiante..." 
                value={gradingForm.recomendaciones}
                onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleGradeSubmission} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Calificar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción eliminará permanentemente el registro de la base de datos. No se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} className="bg-destructive text-white hover:bg-destructive/90" disabled={isProcessing}>
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
