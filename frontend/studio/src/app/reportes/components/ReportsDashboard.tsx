"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, ListChecks, Loader2, Trophy, AlertCircle, Users, Trash2, Eraser } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Submission {
  _id: string;
  usuarioNombre: string;
  usuarioEmail: string;
  tipoEnvio: string;
  moduloId: string;
  tituloContenido: string;
  puntaje?: number;
  estado: string;
  createdAt: string;
}

export function ReportsDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const userRole = user?.role?.trim().toLowerCase();
  const isAdmin = userRole === 'admin' || userRole === 'administrador';

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/performance-reports");
      const data = response.data.filter((sub: any) => 
        isAdmin ? true : sub.usuarioEmail === user?.email
      );
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching performance reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, isAdmin]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar este registro permanentemente?")) return;
    
    setIsProcessing(true);
    try {
      await api.delete(`/performance-reports/${id}`);
      setSubmissions(prev => prev.filter(s => s._id !== id));
      toast({ title: "Registro eliminado con éxito" });
    } catch (e) {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearNonGraded = async () => {
    const nonGraded = submissions.filter(s => s.estado !== 'calificado');
    if (nonGraded.length === 0) {
      toast({ title: "No hay registros pendientes de limpieza" });
      return;
    }
    
    if (!window.confirm(`¿Estás seguro de eliminar los ${nonGraded.length} registros que NO están calificados? Esta acción limpiará tu base de datos.`)) return;
    
    setIsProcessing(true);
    try {
      for (const sub of nonGraded) {
        await api.delete(`/performance-reports/${sub._id}`);
      }
      toast({ title: "Limpieza completada", description: "Se han mantenido solo los registros calificados." });
      fetchData();
    } catch (e) {
      toast({ title: "Error durante la limpieza", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const chartData = useMemo(() => {
    const modules: Record<string, { total: number; count: number }> = {};
    
    submissions.forEach(sub => {
      const modId = sub.moduloId || "N/A";
      if (!modules[modId]) modules[modId] = { total: 0, count: 0 };
      
      if (sub.puntaje !== undefined && sub.puntaje !== null && !isNaN(Number(sub.puntaje))) {
        modules[modId].total += Number(sub.puntaje);
        modules[modId].count += 1;
      }
    });

    return Object.entries(modules)
      .filter(([_, stats]) => stats.count > 0)
      .map(([id, stats]) => ({
        modulo: `Mód. ${id}`,
        promedio: Number((stats.total / stats.count).toFixed(2)),
        fullMark: 5
      }))
      .sort((a, b) => a.modulo.localeCompare(b.modulo));
  }, [submissions]);

  const chartConfig = {
    promedio: { 
      label: "Rendimiento (0-5)", 
      color: "hsl(var(--primary))" 
    },
  } satisfies ChartConfig;

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "S/F";
    const date = new Date(dateStr);
    return isValid(date) ? format(date, "dd MMM, yyyy", { locale: es }) : "S/F";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Consultando base de datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Promedio de Calificaciones por Módulo
            </CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Rendimiento general basado en registros calificados." 
                : "Tu desempeño académico basado en actividades calificadas."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <RechartsBarChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />
                  <XAxis
                    dataKey="modulo"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis domain={[0, 5]} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Bar dataKey="promedio" fill="var(--color-promedio)" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center border-2 border-dashed rounded-xl bg-muted/20">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">No hay suficientes entregas calificadas en MongoDB para mostrar datos.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumen de Datos</CardTitle>
            <CardDescription>Información extraída de MongoDB.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <div>
                   <p className="text-[10px] font-bold uppercase text-primary tracking-widest">
                     {isAdmin ? "Total Entregas Sistema" : "Mis Entregas"}
                   </p>
                   <p className="text-3xl font-headline font-bold">{submissions.length}</p>
                </div>
                <ListChecks className="h-8 w-8 text-primary/40" />
             </div>
             
             {isAdmin && (
               <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div>
                     <p className="text-[10px] font-bold uppercase text-amber-600 tracking-widest">Estudiantes Activos</p>
                     <p className="text-3xl font-headline font-bold text-amber-700">
                      {new Set(submissions.map(s => s.usuarioEmail)).size}
                     </p>
                  </div>
                  <Users className="h-8 w-8 text-amber-600/40" />
               </div>
             )}

             <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                <div>
                   <p className="text-[10px] font-bold uppercase text-green-600 tracking-widest">Calificadas</p>
                   <p className="text-3xl font-headline font-bold text-green-700">
                    {submissions.filter(s => s.estado === 'calificado').length}
                   </p>
                </div>
                <Trophy className="h-8 w-8 text-green-600/40" />
             </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-md border-none overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-slate-50 border-b px-8 py-6 flex flex-row items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-3">
              <ListChecks className="h-6 w-6 text-primary" />
              {isAdmin ? "Registro Global de Actividades" : "Mi Historial de Actividades"}
            </CardTitle>
            <CardDescription>Visualizando registros encontrados en el servidor.</CardDescription>
          </div>
          {isAdmin && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:bg-destructive/10 border-destructive/20"
              onClick={handleClearNonGraded}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Eraser className="mr-2 h-4 w-4" />}
              Limpiar registros no calificados
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="px-8 py-4">Fecha</TableHead>
                {isAdmin && <TableHead>Estudiante</TableHead>}
                <TableHead>Módulo</TableHead>
                <TableHead>Contenido / Tarea</TableHead>
                <TableHead>Calificación</TableHead>
                <TableHead>Estado</TableHead>
                {isAdmin && <TableHead className="px-8 text-right">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...submissions].sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
              }).map((sub) => (
                <TableRow key={sub._id} className="hover:bg-slate-50/80 transition-colors">
                  <TableCell className="px-8 font-medium">
                    {safeFormatDate(sub.createdAt)}
                  </TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold">{sub.usuarioNombre || 'Sin nombre'}</span>
                        <span className="text-[10px] text-muted-foreground">{sub.usuarioEmail}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline">Módulo {sub.moduloId || '?'}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate font-semibold">
                    {sub.tituloContenido || 'Sin título'}
                  </TableCell>
                  <TableCell>
                     {sub.puntaje !== undefined && sub.puntaje !== null ? (
                       <span className={cn(
                         "font-bold",
                         Number(sub.puntaje) >= 3.5 ? "text-green-600" : "text-amber-600"
                       )}>
                         {Number(sub.puntaje).toFixed(1)}/5.0
                       </span>
                     ) : (
                       <span className="text-slate-300 italic text-xs">Pendiente</span>
                     )}
                  </TableCell>
                  <TableCell>
                     <Badge 
                       className={cn(
                         "rounded-full px-3 text-[10px] font-bold border-none",
                         (sub.estado || 'enviado').toLowerCase() === 'calificado' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                       )}
                     >
                      {(sub.estado || 'enviado').toUpperCase()}
                    </Badge>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="px-8 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(sub._id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 5} className="text-center py-20 text-muted-foreground italic">
                    No hay registros en la base de datos para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
