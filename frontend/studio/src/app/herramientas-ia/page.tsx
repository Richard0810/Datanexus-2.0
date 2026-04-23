import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";
import { HerramientasIAPageContent } from "./components/HerramientasIAPageContent";

export default function HerramientasIAPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            Herramientas de Inteligencia Artificial
          </CardTitle>
          <CardDescription>Utiliza la IA para potenciar tu investigación académica.</CardDescription>
        </CardHeader>
      </Card>

      <HerramientasIAPageContent />
    </div>
  );
}
