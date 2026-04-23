import { UserCircle } from "lucide-react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "./components/ProfileForm";

export default function PerfilPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <UserCircle className="h-8 w-8 text-primary" />
            Perfil de Usuario y Personalización
          </CardTitle>
          <CardDescription>Ajusta tus preferencias para una experiencia de aprendizaje a tu medida.</CardDescription>
        </CardHeader>
      </Card>

      <ProfileForm />
    </div>
  );
}
