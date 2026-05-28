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
  Monitor
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
    
    // Youtube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    // Google Drive / Docs / Sheets
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

    // Gamma
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
              <p className="text-sm text-slate-400 mb-6 max-w-md">Para una mejor experiencia, las presentaciones de Prezi se abren en una ventana externa.</p>
              <Button asChild className="rounded-xl h-12 px-8 bg-blue-600 hover:bg-blue-700">
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
        <Button asChild variant="outline" className="rounded-xl bg-white"><a href={url} target="_blank">Abrir Recurso</a></Button>
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
      
      // Filtro robusto para unidades: coincide con "Módulo 1", "Unidad 1" o solo "1"
      setResources(resResponse.data.filter((res: any) => 
        res.unidad === `Módulo ${id}` || 
        res.unidad === `Unidad ${id}` || 
        String(res.unidad) === String(id)
      ));

      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === String(id)));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === String(id)));
      
      const filteredSubmissions = subResponse.data.filter((sub: any) => 
        String(sub.moduloId) === String(id) && (isAdmin || sub.usuarioEmail === user?.email)
      );
      setSubmissions(filteredSubmissions);
      
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [id, user, isAdmin]);

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
      toast({ title: "Recurso guardado" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSubmitActivity = async () => {
    if (!selectedActivity) return;
    const richText = editorRef.current?.innerHTML || "";
    setIsProcessing(true);
    try {
      const userSub = submissions.find(s => s.tituloContenido === selectedActivity.titulo && s.usuarioEmail === user?.email);
      const payload = {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        tipoEnvio: "actividad",
        moduloId: id,
        tituloContenido: selectedActivity.titulo,
        detalleEnvio: JSON.stringify({ text: richText, file: attachedFile }),
        estado: "enviado"
      };
      if (userSub) await api.patch(`/performance-reports/${getObjectId(userSub)}`, payload);
      else await api.post("/performance-reports", payload);
      setIsSubmitActivityOpen(false);
      fetchData();
      toast({ title: "Entrega enviada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleOpenEditSubmission = (act: Activity) => {
    const sub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
    setSelectedActivity(act);
    setIsSubmitActivityOpen(true);
    setTimeout(() => {
      if (sub && editorRef.current) {
        try {
          const parsed = JSON.parse(sub.detalleEnvio);
          editorRef.current.innerHTML = parsed.text || "";
          setAttachedFile(parsed.file || null);
        } catch (e) { editorRef.current.innerHTML = sub.detalleEnvio; }
      }
    }, 100);
  };

  const handleSaveGrade = async () => {
    if (!selectedSubmission) return;
    setIsProcessing(true);
    try {
      await api.patch(`/performance-reports/${getObjectId(selectedSubmission)}`, {
        ...gradingForm,
        estado: "calificado"
      });
      setIsGradingDialogOpen(false);
      fetchData();
      toast({ title: "Nota guardada" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
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
      toast({ title: "Eliminado" });
    } catch (error) { toast({ title: "Error", variant: "destructive" }); }
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
            <h2 className="text-xl font-headline">Materiales de Estudio</h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Nuevo Recurso</Button>}
          </div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-8">
              {resources.map((res) => (
                <Card key={getObjectId(res)} className="relative shadow-md overflow-hidden">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                       <Button size="icon" className="h-9 w-9 bg-blue-600 rounded-full" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 rounded-full" onClick={() => { setItemToDelete({ id: getObjectId(res), type: 'recurso' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{res.tipo.toUpperCase()}</Badge>
                    <CardTitle className="text-2xl font-bold">{res.titulo}</CardTitle>
                    <CardDescription>{res.descripcion}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video rounded-xl overflow-hidden bg-black border shadow-inner">
                      <ResourcePreview url={res.url} title={res.titulo} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed rounded-3xl bg-muted/20">
               <Layers className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
               <p className="text-muted-foreground italic">No hay recursos disponibles para este módulo.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-headline">Actividades Prácticas</h2>
             {isAdmin && <Button onClick={() => { setEditingActivity(null); setActivityForm({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" }); setIsActivityDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Nueva Actividad</Button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => {
              const userSub = submissions.find(s => s.tituloContenido === act.titulo && s.usuarioEmail === user?.email);
              return (
                <Card key={getObjectId(act)} className="relative flex flex-col shadow-md">
                   {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2">
                       <Button size="icon" className="h-9 w-9 bg-blue-600 rounded-full" onClick={() => { setEditingActivity(act); setActivityForm(act); setIsActivityDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                       <Button variant="destructive" size="icon" className="h-9 w-9 bg-red-600 rounded-full" onClick={() => { setItemToDelete({ id: getObjectId(act), type: 'actividad' }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">{act.tipo.toUpperCase()}</Badge>
                    <CardTitle className="text-xl font-bold">{act.titulo}</CardTitle>
                    <CardDescription>{act.descripcion}</CardDescription>
                  </CardHeader>
                  <CardFooter className="gap-2 mt-auto">
                    {act.archivoUrl && <Button variant="outline" className="flex-1" asChild><a href={act.archivoUrl} target="_blank"><Download className="mr-2 h-4 w-4" /> Guía PDF</a></Button>}
                    {!isAdmin && (
                      userSub ? (
                        <Button variant="secondary" className="flex-1 font-bold bg-green-50 text-green-700" onClick={() => handleOpenEditSubmission(act)}>
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Entregado (Editar)
                        </Button>
                      ) : (
                        <Button className="flex-1 font-bold" onClick={() => { setSelectedActivity(act); setIsSubmitActivityOpen(true); }}>
                          <Upload className="mr-2 h-4 w-4" /> Entregar Tarea
                        </Button>
                      )
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento">
            <Card className="shadow-md overflow-hidden rounded-2xl">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="px-6">Estudiante</TableHead>
                    <TableHead>Actividad</TableHead>
                    <TableHead>Nota</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right px-6">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length > 0 ? submissions.map((sub) => (
                    <TableRow key={getObjectId(sub)}>
                      <TableCell className="px-6 font-bold">{sub.usuarioNombre}</TableCell>
                      <TableCell className="text-xs">{sub.tituloContenido}</TableCell>
                      <TableCell><Badge variant="outline">{sub.puntaje || 0}/5.0</Badge></TableCell>
                      <TableCell><Badge className={sub.estado === 'calificado' ? 'bg-green-600' : 'bg-blue-600'}>{sub.estado.toUpperCase()}</Badge></TableCell>
                      <TableCell className="text-right px-6">
                        <Button size="sm" variant="ghost" onClick={() => { setSelectedSubmission(sub); setGradingForm({ puntaje: sub.puntaje || 0, recomendaciones: sub.recomendaciones || "" }); setIsGradingDialogOpen(true); }}>
                          <GradeIcon className="h-4 w-4 mr-2" /> Calificar
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">Sin entregas aún.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader><DialogTitle>{editingResource ? "Editar" : "Nuevo"} Recurso</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} /></div>
             <div className="space-y-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} /></div>
             <div className="space-y-2">
                <Label>Tipo de Recurso</Label>
                <Select value={resourceForm.tipo} onValueChange={v => setResourceForm({...resourceForm, tipo: v})}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                      <SelectItem value="guia">Guía / Documento</SelectItem>
                      <SelectItem value="video">Video Tutorial</SelectItem>
                      <SelectItem value="articulo">Artículo / Web</SelectItem>
                   </SelectContent>
                </Select>
             </div>
             <Tabs value={sourceTab} onValueChange={(v: any) => setSourceTab(v)}>
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="url">URL</TabsTrigger><TabsTrigger value="file">Archivo</TabsTrigger></TabsList>
                <TabsContent value="url" className="pt-2"><Input value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} placeholder="https://..." /></TabsContent>
                <TabsContent value="file" className="pt-2">
                   <div className="border-2 border-dashed p-6 text-center rounded-xl cursor-pointer hover:bg-slate-50" onClick={() => document.getElementById('res-f')?.click()}>
                      <input id="res-f" type="file" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs">{uploadedFile ? uploadedFile.name : "Seleccionar PDF/MP4/Imagen"}</p>
                   </div>
                </TabsContent>
             </Tabs>
          </div>
          <DialogFooter><Button onClick={handleSaveResource} disabled={isProcessing} className="w-full h-12 rounded-xl">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Recurso"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl">
          <DialogHeader><DialogTitle>Calificar Entrega</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
             <div className="p-4 bg-muted/50 rounded-2xl text-sm italic max-h-[200px] overflow-y-auto">
                {selectedSubmission?.detalleEnvio.startsWith('{') ? "Contenido interactivo enviado." : selectedSubmission?.detalleEnvio}
             </div>
             <div className="space-y-4">
                <div className="space-y-2"><Label>Nota (0.0 - 5.0)</Label><Input type="number" step="0.1" value={gradingForm.puntaje} onChange={e => setGradingForm({...gradingForm, puntaje: parseFloat(e.target.value)})} /></div>
                <div className="space-y-2"><Label>Comentarios</Label><Textarea value={gradingForm.recomendaciones} onChange={e => setGradingForm({...gradingForm, recomendaciones: e.target.value})} /></div>
             </div>
          </div>
          <DialogFooter><Button onClick={handleSaveGrade} disabled={isProcessing} className="w-full h-12 rounded-xl bg-blue-600">{isProcessing ? <Loader2 className="animate-spin" /> : "Guardar Nota"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Se borrará permanentemente de MongoDB.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel><AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 text-white rounded-xl">Eliminar</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
