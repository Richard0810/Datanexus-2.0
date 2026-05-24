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
  FileCode
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
  
  const isAdmin = user?.role === 'admin' || user?.role === 'administrador';
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({});
  
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceTab, setSourceTab] = useState<"url" | "file">("url");

  const { toast } = useToast();
  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const [resourceForm, setResourceForm] = useState<Resource>({
    titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL"
  });

  const getResourceId = (res: any) => {
    if (!res) return '';
    if (res._id) {
      if (typeof res._id === 'string') return res._id;
      if (typeof res._id === 'object') return res._id.$oid || res._id.toString();
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
      setSubmissions(subResponse.data.filter((sub: any) => String(sub.moduloId) === String(id)));
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
        if (blobUrl) newUrls[getResourceId(res)] = blobUrl;
      }
    });
    setPdfUrls(newUrls);
    return () => Object.values(newUrls).forEach(url => URL.revokeObjectURL(url));
  }, [resources]);

  const handleEditClick = (res: Resource) => {
    setEditingResource(res);
    setResourceForm({
      titulo: res.titulo,
      descripcion: res.descripcion || "",
      url: res.url || "",
      unidad: res.unidad || `Módulo ${id}`,
      tipo: res.tipo || "guia",
      formato: res.formato || "URL"
    });
    setSourceTab(res.url?.startsWith('data:') ? "file" : "url");
    setUploadedFile(null);
    setIsResourceDialogOpen(true);
  };

  const handleSaveResource = async () => {
    if (!resourceForm.titulo) return;
    setIsProcessing(true);
    try {
      let payload = { ...resourceForm };
      if (sourceTab === "file" && uploadedFile) {
        payload.url = await fileToBase64(uploadedFile);
        payload.formato = uploadedFile.name.split('.').pop() || 'file';
      }
      const resourceId = getResourceId(editingResource);
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

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return;
    const resId = getResourceId(resourceToDelete);
    setIsProcessing(true);
    try {
      await api.delete(`/educational-resources/${resId}`);
      toast({ title: "Recurso eliminado" });
      fetchData();
    } catch (error) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setIsDeleteDialogOpen(false);
      setResourceToDelete(null);
    }
  };

  const handleViewFull = (res: Resource) => {
    const url = res.url;
    if (!url) return;
    if (url.startsWith('data:')) {
      const resId = getResourceId(res);
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

  const getEmbedUrl = (url: string) => {
    if (!url || typeof url !== 'string' || !url.startsWith("http")) return null;
    
    // Soporte para Google Drive (Convertir /view a /preview)
    if (url.includes("drive.google.com")) {
      if (url.includes("/view")) {
        return url.split("/view")[0] + "/preview";
      }
      return url;
    }

    // Soporte para YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      let vId = url.includes("youtu.be/") ? url.split("youtu.be/")[1].split("?")[0] : url.split("v=")[1]?.split("&")[0];
      return vId ? `https://www.youtube.com/embed/${vId}` : url;
    }
    return url;
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
        <TabsList className="grid w-full md:w-[400px] grid-cols-3 mb-8">
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="actividades">Actividades</TabsTrigger>
          <TabsTrigger value="evaluaciones">Evaluaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="recursos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-headline">Materiales</h2>
            {isAdmin && <Button onClick={() => { setEditingResource(null); setResourceForm({ titulo: "", descripcion: "", url: "", unidad: `Módulo ${id}`, tipo: "guia", formato: "URL" }); setSourceTab("url"); setIsResourceDialogOpen(true); }} size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Añadir</Button>}
          </div>

          <div className="grid grid-cols-1 gap-8">
            {resources.map((res) => {
              const resId = getResourceId(res);
              const embedUrl = getEmbedUrl(res.url);
              const isBase64 = res.url?.startsWith('data:');
              const isPdf = isBase64 && (res.url.includes('pdf') || res.formato?.toLowerCase() === 'pdf');
              const isVideo = isBase64 && res.url.includes('video/');
              const isOffice = isBase64 && (res.url.includes('officedocument') || ['pptx', 'docx', 'xlsx'].includes(res.formato?.toLowerCase() || ''));

              return (
                <Card key={resId} className="overflow-hidden shadow-md group relative">
                  {isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <Button 
                        variant="default" 
                        size="icon" 
                        className="h-8 w-8 bg-blue-600 hover:bg-blue-700 text-white shadow-md" 
                        onClick={() => handleEditClick(res)}
                        title="Editar Recurso"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="h-8 w-8 shadow-md" 
                        onClick={() => { setResourceToDelete(res); setIsDeleteDialogOpen(true); }}
                        title="Eliminar Recurso"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
                      <div className="aspect-video rounded-xl overflow-hidden bg-white border"><iframe src={embedUrl} className="w-full h-full border-0" allowFullScreen /></div>
                    ) : isPdf ? (
                      <div className="aspect-video rounded-xl overflow-hidden border bg-background"><iframe src={pdfUrls[resId]} className="w-full h-full border-0" /></div>
                    ) : isVideo ? (
                      <div className="aspect-video rounded-xl overflow-hidden bg-black"><video controls className="w-full h-full"><source src={res.url} /></video></div>
                    ) : isOffice ? (
                      <div className="aspect-video rounded-xl border border-dashed flex flex-col items-center justify-center bg-blue-50/30">
                        <Monitor className="h-12 w-12 text-blue-500 mb-4" />
                        <p className="font-bold">Documento de Productividad ({res.formato.toUpperCase()})</p>
                        <Button variant="outline" className="mt-4" onClick={() => handleViewFull(res)}>Abrir con Visor</Button>
                      </div>
                    ) : (
                      <div className="p-12 text-center border rounded-xl bg-muted/20"><FileCode className="h-12 w-12 mx-auto mb-2 opacity-20" /><p className="text-sm">Enlace externo o archivo adjunto</p><Button variant="link" onClick={() => handleViewFull(res)}>Abrir Recurso</Button></div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <div className="bg-[#1a2744] p-6 text-white"><DialogTitle>{editingResource ? 'Editar' : 'Nuevo'} Recurso</DialogTitle></div>
          <div className="p-6 space-y-4 overflow-y-auto">
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
          <div className="p-6 border-t flex justify-end gap-2"><Button variant="outline" onClick={() => setIsResourceDialogOpen(false)}>Cancelar</Button><Button onClick={handleSaveResource} disabled={isProcessing}>{isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : 'Guardar'}</Button></div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar eliminación?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente el recurso <strong>{resourceToDelete?.titulo}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleDeleteConfirm(); }} 
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
