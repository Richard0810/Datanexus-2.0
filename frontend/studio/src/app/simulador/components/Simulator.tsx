"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Search, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

interface SimulatedResult {
  id: string;
  title: string;
  source: string;
  snippet: string;
}

const simulatedDatabases = [
  { id: "google_scholar", name: "Google Scholar" },
  { id: "scielo", name: "SciELO" },
  { id: "pubmed", name: "PubMed" },
  { id: "ieee_xplore", name: "IEEE Xplore" },
];

export function Simulator() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState(simulatedDatabases[0].id);
  const [simulatedResults, setSimulatedResults] = useState<SimulatedResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSimulation = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast({ title: "Error", description: "Por favor, introduce un término de búsqueda.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setSimulatedResults([]); // Clear previous results

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const results: SimulatedResult[] = Array.from({ length: 5 }).map((_, i) => ({
      id: `${selectedDatabase}-result-${i + 1}`,
      title: `Artículo simulado ${i + 1} para "${searchQuery}"`,
      source: simulatedDatabases.find(db => db.id === selectedDatabase)?.name || "Base de Datos Desconocida",
      snippet: `Este es un fragmento simulado del artículo ${i + 1} que trata sobre ${searchQuery.toLowerCase()} y se encontró en ${selectedDatabase}. Contiene palabras clave relevantes y ofrece una visión general del contenido...`,
    }));
    setSimulatedResults(results);
    setIsLoading(false);

    toast({
      title: "Simulación Completada",
      description: `Se encontraron ${results.length} resultados simulados para tu búsqueda.`,
    });
  };

  const handleFeedback = () => {
    // This is a placeholder for more complex feedback logic
    if (searchQuery.split(" ").length < 3 && simulatedResults.length > 0) {
      toast({
        title: "Sugerencia de Mejora",
        description: "Intenta usar términos de búsqueda más específicos o frases más largas para refinar tus resultados.",
        variant: "default" 
      });
    } else if (simulatedResults.length === 0 && !isLoading && searchQuery.trim() !== "") {
       toast({
        title: "Sugerencia de Mejora",
        description: "No se encontraron resultados. Prueba con sinónimos o términos relacionados.",
        variant: "default"
      });
    } else if (simulatedResults.length > 0) {
       toast({
        title: "¡Buen Trabajo!",
        description: "Has obtenido resultados. Considera usar filtros avanzados (simulados) para refinar más.",
        variant: "default"
      });
    }
  };

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSimulation} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="database-select" className="text-sm font-medium">Selecciona una base de datos simulada:</label>
              <select
                id="database-select"
                value={selectedDatabase}
                onChange={(e) => setSelectedDatabase(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                {simulatedDatabases.map(db => (
                  <option key={db.id} value={db.id}>{db.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Introduce tu consulta de búsqueda..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow"
                aria-label="Consulta de búsqueda"
              />
              <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
                <Search className="mr-2 h-4 w-4" /> {isLoading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="text-center py-4">
          <p className="text-lg text-primary animate-pulse">Cargando resultados simulados...</p>
        </div>
      )}

      {!isLoading && simulatedResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados Simulados</CardTitle>
            <CardDescription>Estos son los resultados generados por la simulación.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {simulatedResults.map((result) => (
              <Card key={result.id} className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-primary">{result.title}</h3>
                <p className="text-sm text-muted-foreground">Fuente: {result.source}</p>
                <p className="text-sm mt-1">{result.snippet}</p>
              </Card>
            ))}
            <Button onClick={handleFeedback} variant="outline" className="mt-4">
              <Send className="mr-2 h-4 w-4" /> Obtener Retroalimentación
            </Button>
          </CardContent>
        </Card>
      )}
      
      {!isLoading && simulatedResults.length === 0 && searchQuery.trim() !== "" && (
         <Card>
          <CardHeader>
            <CardTitle>No se encontraron resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tu búsqueda simulada no arrojó resultados. Intenta refinar tus términos.</p>
             <Button onClick={handleFeedback} variant="outline" className="mt-4">
              <Send className="mr-2 h-4 w-4" /> Obtener Retroalimentación
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
