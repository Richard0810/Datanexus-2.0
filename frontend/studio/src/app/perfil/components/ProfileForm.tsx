"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { useState, type FormEvent } from "react";

export function ProfileForm() {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState({
    name: "Estudiante Ejemplo",
    email: "estudiante@example.com",
    language: "es",
    difficulty: "intermedio",
    contextualHelp: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Simulate saving profile data
    toast({
      title: "Perfil Actualizado",
      description: "Tus preferencias han sido guardadas.",
    });
    console.log("Profile data saved:", profileData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Información Personal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={profileData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input id="email" type="email" value={profileData.email} onChange={(e) => handleChange("email", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Preferencias de la Plataforma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">Idioma</Label>
            <Select value={profileData.language} onValueChange={(value) => handleChange("language", value)}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Selecciona idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="en">Inglés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty">Nivel de Dificultad</Label>
            <Select value={profileData.difficulty} onValueChange={(value) => handleChange("difficulty", value)}>
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Selecciona nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principiante">Principiante</SelectItem>
                <SelectItem value="intermedio">Intermedio</SelectItem>
                <SelectItem value="avanzado">Avanzado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <Label htmlFor="contextualHelp" className="text-base">Ayudas Contextuales</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar/ocultar ayudas y pistas durante las actividades.
              </p>
            </div>
            <Switch
              id="contextualHelp"
              checked={profileData.contextualHelp}
              onCheckedChange={(checked) => handleChange("contextualHelp", checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      <Button type="submit" className="mt-6 w-full sm:w-auto bg-primary hover:bg-primary/90">
        <Save className="mr-2 h-4 w-4" /> Guardar Cambios
      </Button>
    </form>
  );
}
