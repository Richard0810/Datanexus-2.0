import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Simulator } from "./components/Simulator";
import { FlaskConical } from "lucide-react";

export default function SimuladorPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
           <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <FlaskConical className="h-8 w-8 text-primary" />
            Simulador de Búsqueda Académica
          </CardTitle>
          <CardDescription>Practica tus estrategias de búsqueda en entornos simulados y recibe retroalimentación.</CardDescription>
        </CardHeader>
      </Card>
      
      <Simulator />
    </div>
  );
}
