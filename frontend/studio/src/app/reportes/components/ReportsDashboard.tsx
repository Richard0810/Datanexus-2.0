"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, ListChecks } from "lucide-react";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "Enero", module1: 30, module2: 40 },
  { month: "Febrero", module1: 50, module2: 60 },
  { month: "Marzo", module1: 75, module2: 65 },
  { month: "Abril", module1: 60, module2: 80 },
  { month: "Mayo", module1: 85, module2: 70 },
];

const chartConfig = {
  module1: { label: "Módulo 1: Búsqueda Avanzada", color: "hsl(var(--chart-1))" },
  module2: { label: "Módulo 2: IA en Investigación", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const recentActivities = [
  { id: 1, date: "2024-07-20", activity: "Completó simulación 'Bases de Datos Genéricas'", status: "Completado" },
  { id: 2, date: "2024-07-19", activity: "Exportó referencias a Zotero", status: "Realizado" },
  { id: 3, date: "2024-07-18", activity: "Visualizó tutorial 'Estrategias Booleanas'", status: "Visto" },
  { id: 4, date: "2024-07-17", activity: "Formuló pregunta PICO/PECO para 'Impacto de redes sociales'", status: "Realizado" },
  { id: 5, date: "2024-07-16", activity: "Inició Módulo 'Ética en IA'", status: "En Progreso" },
];

export function ReportsDashboard() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Progreso por Módulo</CardTitle>
          <CardDescription>Gráfica de tu avance en los módulos principales.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
            <RechartsBarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="module1" fill="var(--color-module1)" radius={4} />
              <Bar dataKey="module2" fill="var(--color-module2)" radius={4} />
            </RechartsBarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-6 w-6 text-accent" />
            Bitácora de Actividades Recientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>{activity.date}</TableCell>
                  <TableCell>{activity.activity}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 text-xs rounded-full ${activity.status === "Completado" || activity.status === "Realizado" ? "bg-green-100 text-green-800" : activity.status === "En Progreso" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}>
                      {activity.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Descargar Reportes</CardTitle>
          <CardDescription>Obtén tus reportes de progreso en formato PDF o Word.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" /> Descargar como PDF (Simulado)
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            <FileDown className="mr-2 h-4 w-4" /> Descargar como Word (Simulado)
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
