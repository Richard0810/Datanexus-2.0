
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload } from 'lucide-react';

interface EditModuleModalProps {
  module: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedModule: any) => Promise<void>;
}

export function EditModuleModal({ module, isOpen, onClose, onSave }: EditModuleModalProps) {
  const [formData, setFormData] = useState(module);
  const [isSaving, setIsSaving] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    setFormData(module);
    setFileName(null);
  }, [module]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64String = loadEvent.target?.result as string;
        setFormData((prev: any) => ({ ...prev, imageUrl: base64String }));
        setFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save module:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!module) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-white rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Editar Módulo</DialogTitle>
          <DialogDescription>
            Modifica los detalles del módulo. Puedes usar una URL o subir una imagen.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="titulo" className="text-right font-bold">Título</Label>
            <Input id="titulo" name="titulo" value={formData.titulo || ''} onChange={handleChange} className="col-span-3" />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="descripcion" className="text-right font-bold">Descripción</Label>
            <Textarea id="descripcion" name="descripcion" value={formData.descripcion || ''} onChange={handleChange} className="col-span-3 h-24" />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Imagen del Módulo</Label>
            <Tabs defaultValue="url" className="mt-2">
              <TabsList className="grid w-full grid-cols-2 bg-slate-100 h-11">
                <TabsTrigger value="url">Desde URL</TabsTrigger>
                <TabsTrigger value="upload">Subir Archivo</TabsTrigger>
              </TabsList>
              <TabsContent value="url" className="pt-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="imageUrl" className="text-right font-bold">URL</Label>
                  <Input id="imageUrl" name="imageUrl" value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl || ''} onChange={handleChange} className="col-span-3" placeholder="https://..." />
                </div>
              </TabsContent>
              <TabsContent value="upload" className="pt-4">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                      <Upload className="w-8 h-8 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-500">
                        {fileName ? `Archivo: ${fileName}` : "Haz clic para subir un archivo"}
                      </p>
                      <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
                  </label>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-6">Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSaving} className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
