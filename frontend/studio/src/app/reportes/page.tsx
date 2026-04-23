import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart } from "lucide-react";
import { ReportsDashboard } from "./components/ReportsDashboard";

export default function ReportesPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <BarChart className="h-8 w-8 text-primary" />
            Reportes y Desempeño
          </CardTitle>
          <CardDescription>Visualiza tu progreso y accede a tus reportes detallados.</CardDescription>
        </CardHeader>
      </Card>

      <ReportsDashboard />

    </div>
  );
}
