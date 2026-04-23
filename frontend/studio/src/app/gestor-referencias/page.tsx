import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferenceManager } from "./components/ReferenceManager";
import { BookMarked } from "lucide-react";

export default function GestorReferenciasPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <BookMarked className="h-8 w-8 text-primary" />
            Gestor de Referencias
          </CardTitle>
          <CardDescription>
            Administra tus referencias bibliográficas y expórtalas fácilmente a Zotero o Mendeley.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <ReferenceManager />

      <Card>
        <CardHeader>
          <CardTitle>Instrucciones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. Pega tus referencias en formato BibTeX o RIS en el área de texto proporcionada.</p>
          <p>2. Asegúrate de que cada referencia esté correctamente formateada.</p>
          <p>3. Selecciona el formato de exportación deseado (Zotero o Mendeley).</p>
          <p>4. Haz clic en el botón "Exportar Referencias".</p>
          <p>5. El sistema simulará el proceso de exportación. En una aplicación real, esto generaría un archivo o se conectaría directamente con el software de gestión de referencias.</p>
        </CardContent>
      </Card>
    </div>
  );
}
