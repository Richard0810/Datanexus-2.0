
"use client";

import React, { useEffect, useState, use, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, PlusCircle, Pencil, Trash2, Upload, ClipboardList, FileQuestion, Layers, X, Trophy, FileText, Video, History, Save, Download, PlayCircle, BookOpen, Link as LinkIcon, ExternalLink, Presentation, FileUp, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Eye, MessageSquare, GraduationCap as GradeIcon, CheckCircle2, AlertCircle
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

interface Resource { _id?: any; titulo: string; descripcion: string; url: string; unidad: string; tipo: string; formato: string; }
interface Activity { _id?: any; titulo: string; descripcion: string; tipo: string; criterios_evaluacion: string; moduloId: string; archivoUrl?: string; }
interface Question { id: string; texto: string; tipo: 'opcion-multiple'; opciones: string[]; respuestaCorrecta: string; }
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

const resourceTypes = [
  { id: 'video', label: 'Video', icon: Video },
  { id: 'guia', label: 'Guía', icon: FileText },
  { id: 'articulo', label: 'Artículo', icon: BookOpen },
  { id: 'presentacion', label: 'Presentación', icon: Presentation },
  { id: 'otro', label: 'Otro', icon: LinkIcon },
];

function ResourcePreview({ url, title, tipo }: { url: string; title: string, tipo: string }) {
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
        console.error("Error procesando Blob URL:", e);
      }
    }
    return undefined;
  }, [url]);

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (url.includes("gamma.app/docs/")) return url.replace("gamma.app/docs/", "gamma.app/embed/");
    if (url.includes("/presentation/d/")) return url.replace(/\/edit.*|\/view.*$/, '/embed');
    return url;
  };

  const finalUrl = blobUrl || getEmbedUrl(url);

  if (!finalUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-muted-foreground p-8 text-center">
        <FileText className="h-12 w-12 mb-3 opacity-20" />
        <p className="text-sm font-bold uppercase tracking-widest mb-4">Material Local</p>
        <Button asChild variant="outline" size="sm" className="rounded-xl bg-white"><a href={url} download={title}><Download className="mr-2 h-4 w-4" /> Descargar Material</a></Button>
      </div>
    );
  }
  return <div className="relative w-full h-full"><iframe src={finalUrl} className="w-full h-full border-0" allowFullScreen /></div>;
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'administrador';
  
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
  
  const [itemToDelete, setItemToDelete] = useState<{ id: string, type: string, name: string } | null>(null);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  
  const [resourceForm, setResourceForm] = useState<Resource>({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" });
  const [activityForm, setActivityForm] = useState<Activity>({ titulo: "", descripcion: "", tipo: "individual", criterios_evaluacion: "", moduloId: id, archivoUrl: "" });
  const [assessmentForm, setAssessmentForm] = useState<Assessment>({ titulo: "", descripcion: "", moduloId: id, preguntas: [] });
  const [gradingForm, setGradingForm] = useState({ puntaje: 0, recomendaciones: "" });
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [assessmentStep, setAssessmentStep] = useState<'intro' | 'test' | 'result'>('intro');

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");
  const editorRef = useRef<HTMLDivElement>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string, data: string } | null>(null);
  
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
      setResources(resResponse.data.filter((res: any) => [id, `Módulo ${id}`, `Unidad ${id}`].includes(res.unidad)));
      setActivities(actResponse.data.filter((act: any) => String(act.moduloId) === id));
      setAssessments(assResponse.data.filter((ass: any) => String(ass.moduloId) === id));
      setSubmissions(subResponse.data.filter((sub: any) => String(sub.moduloId) === id && (isAdmin || sub.usuarioEmail === user?.email)));
    } catch (error) {
      toast({ title: "Error al cargar datos", variant: "destructive" });
    } finally { setLoading(false); }
  };

  useEffect(() => { if (user) fetchData(); }, [id, user, isAdmin]);

  const handleSaveResource = async () => {
    if (!resourceForm.titulo) return;
    setIsProcessing(true);
    try {
      const resourceId = getObjectId(editingResource);
      if (sourceTab === 'file' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('titulo', resourceForm.titulo);
        formData.append('descripcion', resourceForm.descripcion);
        formData.append('unidad', resourceForm.unidad);
        formData.append('tipo', resourceForm.tipo);
        formData.append('formato', uploadedFile.name.split('.').pop() || 'file');
        const apiCall = resourceId ? api.patch(`/educational-resources/${resourceId}`, formData) : api.post("/educational-resources", formData);
        await apiCall;
      } else {
        const apiCall = resourceId ? api.patch(`/educational-resources/${resourceId}`, resourceForm) : api.post("/educational-resources", resourceForm);
        await apiCall;
      }
      setIsResourceDialogOpen(false); fetchData(); toast({ title: "Recurso guardado" });
    } catch (e) { toast({ title: "Error al guardar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleSaveAssessment = async () => {
    if (!assessmentForm.titulo || assessmentForm.preguntas.length === 0) return;
    setIsProcessing(true);
    try {
      const assessmentId = getObjectId(editingAssessment);
      const apiCall = assessmentId ? api.patch(`/assessments/${assessmentId}`, assessmentForm) : api.post("/assessments", assessmentForm);
      await apiCall;
      setIsAssessmentDialogOpen(false); fetchData(); toast({ title: "Evaluación guardada" });
    } catch (e) { toast({ title: "Error al guardar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleFinishAssessment = async () => {
    if (!editingAssessment) return;
    let correct = 0;
    editingAssessment.preguntas.forEach(q => { if (userAnswers[q.id] === q.respuestaCorrecta) correct++; });
    const finalScore = (correct / editingAssessment.preguntas.length) * 5;
    
    setIsProcessing(true);
    try {
      await api.post("/performance-reports", {
        usuarioNombre: user?.name || "Estudiante",
        usuarioEmail: user?.email,
        tipoEnvio: "evaluacion",
        moduloId: id,
        tituloContenido: editingAssessment.titulo,
        detalleEnvio: JSON.stringify(userAnswers),
        puntaje: finalScore,
        estado: "enviado"
      });
      setAssessmentStep('result'); fetchData();
    } catch (e) { toast({ title: "Error al enviar", variant: "destructive" }); }
    finally { setIsProcessing(false); }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsProcessing(true);
    try {
      const endpoint = itemToDelete.type === 'recurso' ? 'educational-resources' : itemToDelete.type === 'actividad' ? 'activities' : 'assessments';
      await api.delete(`/${endpoint}/${itemToDelete.id}`);
      fetchData(); setIsDeleteDialogOpen(false); toast({ title: "Eliminado con éxito" });
    } catch (e) { toast({ title: "Error al eliminar", variant: "destructive" }); }
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
            <h2 className="text-xl font-headline font-bold">Materiales de Estudio</h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir Recurso</Button>}
          </div>
          {loading ? <div className="text-center py-10"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div> :
          resources.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {resources.map((res) => (
                <Card key={getObjectId(res)} className="shadow-md overflow-hidden">
                  <CardHeader className="pb-0 flex flex-row justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="uppercase text-[9px]">{res.tipo}</Badge>
                      </div>
                      <CardTitle className="text-xl">{res.titulo}</CardTitle>
                      <CardDescription>{res.descripcion}</CardDescription>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { setEditingResource(res); setResourceForm(res); setIsResourceDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { setItemToDelete({ id: getObjectId(res), type: 'recurso', name: res.titulo }); setIsDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
                      <ResourcePreview url={res.url} title={res.titulo} tipo={res.tipo} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-center py-20 text-muted-foreground italic">No hay recursos disponibles.</p>}
        </TabsContent>

        <TabsContent value="actividades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((act) => (
              <Card key={getObjectId(act)}>
                <CardHeader>
                  <CardTitle>{act.titulo}</CardTitle>
                  <CardDescription>{act.descripcion}</CardDescription>
                </CardHeader>
                <CardFooter>
                  {!isAdmin && <Button className="w-full" onClick={() => { setSelectedActivity(act); setIsSubmitActivityOpen(true); }}><Upload className="mr-2 h-4 w-4" /> Entregar Tarea</Button>}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evaluaciones" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline font-bold">Evaluaciones</h2>
            {isAdmin && <Button onClick={() => { setEditingAssessment(null); setAssessmentForm({ titulo: "", descripcion: "", moduloId: id, preguntas: [] }); setIsAssessmentDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Crear Evaluación</Button>}
          </div>
          {loading ? <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /> :
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {assessments.map((ass) => (
              <Card key={getObjectId(ass)} className="hover:border-primary transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{ass.titulo}</CardTitle>
                  <CardDescription className="line-clamp-2">{ass.descripcion}</CardDescription>
                </CardHeader>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full font-bold" onClick={() => { setEditingAssessment(ass); setAssessmentStep('intro'); setIsAssessmentDialogOpen(true); }}>Realizar Evaluación</Button>
                  {isAdmin && <Button variant="outline" className="w-full" onClick={() => { setEditingAssessment(ass); setAssessmentForm(ass); setIsAssessmentDialogOpen(true); }}>Editar</Button>}
                </CardFooter>
              </Card>
            ))}
          </div>}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="seguimiento">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Estudiante</TableHead>
                      <TableHead>Contenido</TableHead>
                      <TableHead>Puntaje</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right pr-6">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub._id}>
                        <TableCell className="pl-6 font-medium">{sub.usuarioNombre}</TableCell>
                        <TableCell className="text-xs">{sub.tituloContenido}</TableCell>
                        <TableCell><Badge variant="outline" className="bg-primary/5">{sub.puntaje}/5.0</Badge></TableCell>
                        <TableCell><Badge className={cn(sub.estado === 'calificado' ? 'bg-green-600' : 'bg-blue-600')}>{sub.estado.toUpperCase()}</Badge></TableCell>
                        <TableCell className="text-right pr-6"><Button size="sm" variant="ghost" onClick={() => { setSelectedSubmission(sub); setGradingForm({ puntaje: sub.puntaje, recomendaciones: sub.recomendaciones || "" }); setIsGradingDialogOpen(true); }}><GradeIcon className="h-4 w-4 mr-2" /> Revisar</Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <Dialog open={isAssessmentDialogOpen} onOpenChange={setIsAssessmentDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          {isAdmin && !editingAssessment?.preguntas.length ? (
             <div className="space-y-6">
                <DialogHeader><DialogTitle>Configurar Evaluación</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Título" value={assessmentForm.titulo} onChange={e => setAssessmentForm({...assessmentForm, titulo: e.target.value})} />
                  <Textarea placeholder="Descripción" value={assessmentForm.descripcion} onChange={e => setAssessmentForm({...assessmentForm, descripcion: e.target.value})} />
                  <Separator />
                  <h3 className="font-bold">Preguntas</h3>
                  <Button variant="outline" size="sm" onClick={() => setAssessmentForm({...assessmentForm, preguntas: [...assessmentForm.preguntas, { id: Math.random().toString(), texto: "Nueva Pregunta", tipo: 'opcion-multiple', opciones: ["Opción 1", "Opción 2"], respuestaCorrecta: "Opción 1" }]})}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Pregunta</Button>
                  <div className="space-y-4">
                    {assessmentForm.preguntas.map((q, idx) => (
                      <div key={q.id} className="p-4 border rounded-lg bg-muted/20 space-y-2">
                        <Input value={q.texto} onChange={e => { const copy = [...assessmentForm.preguntas]; copy[idx].texto = e.target.value; setAssessmentForm({...assessmentForm, preguntas: copy}); }} />
                        <div className="grid grid-cols-2 gap-2">
                           {q.opciones.map((opt, oIdx) => (
                             <Input key={oIdx} value={opt} onChange={e => { const copy = [...assessmentForm.preguntas]; copy[idx].opciones[oIdx] = e.target.value; setAssessmentForm({...assessmentForm, preguntas: copy}); }} />
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <DialogFooter><Button onClick={handleSaveAssessment} disabled={isProcessing}>Guardar Evaluación</Button></DialogFooter>
             </div>
          ) : (
            <div className="space-y-6 py-4">
              {assessmentStep === 'intro' && (
                <div className="text-center space-y-4">
                  <Trophy className="h-16 w-16 mx-auto text-amber-500" />
                  <DialogHeader><DialogTitle className="text-2xl">{editingAssessment?.titulo}</DialogTitle></DialogHeader>
                  <p className="text-muted-foreground">{editingAssessment?.descripcion}</p>
                  <Button className="w-full" onClick={() => setAssessmentStep('test')}>Empezar Ahora</Button>
                </div>
              )}
              {assessmentStep === 'test' && (
                <div className="space-y-8">
                  {editingAssessment?.preguntas.map((q, idx) => (
                    <div key={q.id} className="space-y-4">
                      <p className="font-bold text-lg">{idx + 1}. {q.texto}</p>
                      <RadioGroup onValueChange={(val) => setUserAnswers({ ...userAnswers, [q.id]: val })}>
                        {q.opciones.map((opt) => (
                          <div key={opt} className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                            <Label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer">{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                  <Button className="w-full h-12 font-bold" onClick={handleFinishAssessment} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin" /> : "Finalizar y Enviar"}</Button>
                </div>
              )}
              {assessmentStep === 'result' && (
                 <div className="text-center space-y-6 py-10">
                    <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center"><CheckCircle2 className="h-12 w-12 text-green-600" /></div>
                    <h3 className="text-2xl font-bold">¡Evaluación Enviada!</h3>
                    <p className="text-muted-foreground">Tu resultado ha sido registrado exitosamente en el sistema.</p>
                    <Button variant="outline" onClick={() => setIsAssessmentDialogOpen(false)} className="w-full">Cerrar</Button>
                 </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl p-0 overflow-hidden">
          <div className="bg-[#1a2744] px-6 py-5 text-white flex justify-between items-center">
             <DialogTitle className="font-headline">{editingResource ? "Editar" : "Añadir"} Recurso</DialogTitle>
             <Button variant="ghost" size="icon" onClick={() => setIsResourceDialogOpen(false)}><X className="h-4 w-4"/></Button>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-2"><Label>Título</Label><Input value={resourceForm.titulo} onChange={e => setResourceForm({...resourceForm, titulo: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={resourceForm.descripcion} onChange={e => setResourceForm({...resourceForm, descripcion: e.target.value})} className="rounded-xl" /></div>
            <div className="space-y-2">
              <Label>Tipo de Recurso</Label>
              <Select value={resourceForm.tipo} onValueChange={(v) => setResourceForm({...resourceForm, tipo: v})}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecciona tipo" /></SelectTrigger>
                <SelectContent>{resourceTypes.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Tabs value={sourceTab} onValueChange={(v:any) => setSourceTab(v)} className="w-full">
               <TabsList className="grid w-full grid-cols-2 mb-4"><TabsTrigger value="url">URL</TabsTrigger><TabsTrigger value="file">Archivo</TabsTrigger></TabsList>
               <TabsContent value="url"><Input placeholder="https://..." value={resourceForm.url} onChange={e => setResourceForm({...resourceForm, url: e.target.value})} className="rounded-xl"/></TabsContent>
               <TabsContent value="file">
                  <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => document.getElementById('res-upload')?.click()}>
                     <input type="file" id="res-upload" className="hidden" onChange={e => setUploadedFile(e.target.files?.[0] || null)} />
                     <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                     <p className="text-sm font-medium">{uploadedFile ? uploadedFile.name : "Subir PDF o Imagen"}</p>
                  </div>
               </TabsContent>
            </Tabs>
          </div>
          <div className="p-6 border-t bg-slate-50 flex gap-2">
             <Button variant="outline" onClick={() => setIsResourceDialogOpen(false)} className="flex-1 rounded-xl">Cancelar</Button>
             <Button onClick={handleSaveResource} disabled={isProcessing} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold">{isProcessing ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>} Guardar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader><AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle><AlertDialogDescription>Se eliminará permanentemente "{itemToDelete?.name}". No se puede deshacer.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 text-white rounded-xl">Eliminar Definitivamente</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
