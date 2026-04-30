
"use client";

import { useEffect, useState, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  Video, 
  FileText, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle2, 
  Pencil, 
  Trash2,
  MoreVertical,
  Link as LinkIcon,
  Upload
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
  DialogTrigger,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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
  _id?: string;
  titulo: string;
  descripcion: string;
  url: string;
  unidad: string;
  tipo: string;
  formato: string;
}

export default function ModuloDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Resource>({
    titulo: "",
    descripcion: "",
    url: "",
    unidad: `Módulo ${id}`,
    tipo: "guia",
    formato: "URL"
  });

  const moduleInfo = modulesData[id as keyof typeof modulesData] || { title: `Módulo ${id}`, objective: "" };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await api.get("/educational-resources");
      const filtered = response.data.filter((res: any) => 
        res.unidad === `Módulo ${id}`
      );
      setResources(filtered);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [id]);

  const handleOpenDialog = (resource?: Resource) => {
    if (resource) {
      setEditingResource(resource);
      setFormData(resource);
    } else {
      setEditingResource(null);
      setFormData({
        titulo: "",
        descripcion: "",
        url: "",
        unidad: `Módulo ${id}`,
        tipo: "guia",
        formato: "URL"
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveResource = async () => {
    if (!formData.titulo || !formData.url) {
      toast({ title: "Campos requeridos", description: "El título y la URL/Archivo son obligatorios.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      if (editingResource?._id) {
        await api.patch(`/educational-resources/${editingResource._id}`, formData);
        toast({ title: "Recurso actualizado", description: "Los cambios se guardaron correctamente." });
      } else {
        await api.post("/educational-resources", formData);
        toast({ title: "Recurso creado", description: "El nuevo material ha sido añadido al módulo." });
      }
      setIsDialogOpen(false);
      fetchResources();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo procesar la solicitud.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await api.delete(`/educational-resources/${resourceId}`);
      toast({ title: "Recurso eliminado", description: "El material fue removido del módulo." });
      fetchResources();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar el recurso.", variant: "destructive" });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulación de subida: Generamos un nombre ficticio para la URL
      setFormData({
        ...formData,
        titulo: formData.titulo || file.name,
        url: `file://${file.name}`,
        formato: file.type || "Archivo"
      });
      toast({ title: "Archivo seleccionado", description: file.name });
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url || !url.startsWith("http")) return "";
    if (url.includes("youtube.com/embed/")) return url;
    let videoId = "";
    if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    } else if (url.includes("v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/modulos">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-headline">{moduleInfo.title}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {moduleInfo.objective}
            </p>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingResource ? "Editar Recurso" : "Nuevo Recurso Educativo"}</DialogTitle>
              <DialogDescription>
                Completa los campos para {editingResource ? "modificar" : "añadir"} material al {moduleInfo.title}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título del recurso</Label>
                <Input 
                  id="titulo" 
                  value={formData.titulo} 
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Ej: Tutorial de búsqueda básica"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo de contenido</Label>
                <Select value={formData.tipo} onValueChange={(val) => setFormData({...formData, tipo: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video (YouTube)</SelectItem>
                    <SelectItem value="guia">Guía / Documento</SelectItem>
                    <SelectItem value="articulo">Artículo Académico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  value={formData.descripcion} 
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                  placeholder="Breve descripción del material..."
                />
              </div>
              <div className="grid gap-2">
                <Label>Origen del recurso</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="URL del recurso (https://...)" 
                    className="flex-1"
                    value={formData.url.startsWith('file://') ? '' : formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value, formato: 'URL'})}
                  />
                  <div className="relative">
                    <Input 
                      type="file" 
                      className="hidden" 
                      id="file-upload" 
                      onChange={handleFileUpload}
                    />
                    <Button asChild variant="outline" size="icon">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="h-4 w-4" />
                      </label>
                    </Button>
                  </div>
                </div>
                {formData.url.startsWith('file://') && (
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Archivo seleccionado: {formData.url.replace('file://', '')}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSaveResource} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingResource ? "Guardar Cambios" : "Crear Recurso"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando materiales...</p>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-8">
          {resources.map((res) => (
            <Card key={res._id} className="overflow-hidden shadow-md group relative">
              <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(res)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El recurso "{res.titulo}" será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => res._id && handleDeleteResource(res._id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-col md:flex-row">
                {res.tipo === "video" && res.url.startsWith("http") && (
                  <div className="md:w-1/2 aspect-video bg-black">
                    <iframe
                      src={getEmbedUrl(res.url)}
                      title={res.titulo}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}
                <div className={res.tipo === "video" && res.url.startsWith("http") ? "md:w-1/2 p-6 flex flex-col" : "w-full p-6 flex flex-col"}>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={res.tipo === "video" ? "default" : "secondary"} className="flex gap-1 items-center">
                      {res.tipo === "video" ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                      {res.tipo.toUpperCase()}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl mb-2">{res.titulo}</CardTitle>
                  <CardDescription className="text-base mb-6">{res.descripcion}</CardDescription>
                  <div className="mt-auto">
                    {res.url.startsWith("http") ? (
                      <Button asChild className="w-full md:w-auto">
                        <a href={res.url} target="_blank" rel="noopener noreferrer">
                          Abrir Recurso <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    ) : (
                      <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                         <div className="flex items-center gap-2 text-sm">
                           <FileText className="h-4 w-4 text-primary" />
                           <span>Archivo: {res.url.replace('file://', '')}</span>
                         </div>
                         <Badge variant="outline">Local</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <CardContent className="space-y-4">
            <GraduationCap className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-xl font-semibold">Este módulo aún no tiene materiales</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Usa el botón "Añadir Recurso" para comenzar a poblar este módulo con contenido educativo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
