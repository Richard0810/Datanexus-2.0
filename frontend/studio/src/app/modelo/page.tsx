import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DatabaseZap, ArrowRight } from "lucide-react";

const entities = [
  {
    name: "Usuario",
    attributes: [
      "ID_usuario (PK)", "Nombre", "Correo electrónico", "Rol", "Idioma preferido",
      "Nivel de experiencia", "Estilo de aprendizaje", "Progreso_general (%)",
      "Configuraciones de accesibilidad"
    ]
  },
  {
    name: "Módulo / Recurso Educativo",
    attributes: [
      "ID_módulo (PK)", "Título", "Descripción", "Tipo", "Objetivo de aprendizaje",
      "Enlace/archivo asociado", "Duración estimada", "Nivel de dificultad", "Estado"
    ]
  },
  {
    name: "Búsqueda Académica",
    attributes: [
      "ID_búsqueda (PK)", "ID_usuario (FK)", "Palabras clave", "Operadores aplicados",
      "Filtros aplicados", "Resultados obtenidos", "Uso de IA", "Fecha y hora"
    ]
  },
  {
    name: "Referencia Académica",
    attributes: [
      "ID_referencia (PK)", "Título", "Autor(es)", "Año de publicación", "Fuente",
      "DOI / URL", "Tipo de documento", "Formato de citación"
    ]
  },
   {
    name: "Pregunta Estructurada (PICO/PECO)",
    attributes: [
      "ID_pregunta (PK)", "ID_usuario (FK)", "Tipo (PICO/PECO)", "Población", "Intervención / Exposición",
      "Comparación", "Resultado (Outcome)", "Pregunta generada"
    ]
  },
  {
    name: "Modelo PRISMA",
    attributes: [
      "ID_prisma (PK)", "ID_usuario (FK)", "Fase actual", "Número de artículos por fase",
      "Criterios aplicados", "Observaciones", "Diagrama generado"
    ]
  },
  {
    name: "Actividad / Evaluación",
    attributes: [
      "ID_actividad (PK)", "ID_módulo (FK)", "Tipo", "Descripción", "Criterios de evaluación",
      "Puntuación máxima", "Retroalimentación automática"
    ]
  },
  {
    name: "Reporte de Desempeño",
    attributes: [
        "ID_reporte (PK)", "ID_usuario (FK)", "Periodo", "Módulo evaluado",
        "Actividades completadas", "Puntaje obtenido", "Tiempo invertido", "Recomendaciones (IA)"
    ]
  },
  {
    name: "Configuración del Usuario",
    attributes: [
        "ID_configuración (PK)", "ID_usuario (FK)", "Idioma", "Preferencias de visualización",
        "Notificaciones activas", "Nivel de dificultad"
    ]
  }
];

const relationships = [
    { from: "Usuario", to: "Configuración del Usuario", type: "1:1", verb: "tiene" },
    { from: "Usuario", to: "Reporte de Desempeño", type: "1:M", verb: "genera" },
    { from: "Usuario", to: "Búsqueda Académica", type: "1:M", verb: "realiza" },
    { from: "Usuario", to: "Pregunta Estructurada", type: "1:M", verb: "formula" },
    { from: "Usuario", to: "Modelo PRISMA", type: "1:M", verb: "aplica" },
    { from: "Usuario", to: "Módulo / Recurso", type: "N:M", verb: "cursa" },
    { from: "Usuario", to: "Actividad / Evaluación", type: "N:M", verb: "completa" },
    { from: "Usuario", to: "Referencia Académica", type: "N:M", verb: "guarda" },
    { from: "Módulo / Recurso", to: "Actividad / Evaluación", type: "1:M", verb: "contiene" },
    { from: "Búsqueda Académica", to: "Referencia Académica", type: "N:M", verb: "obtiene" },
];

export default function ModeloPage() {
  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <DatabaseZap className="h-8 w-8 text-primary" />
            Modelo de Datos de DataNexus
          </CardTitle>
          <CardDescription>
            Arquitectura de la información que estructura la plataforma, sus componentes y sus interacciones.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle>Entidades y Atributos</CardTitle>
                <CardDescription>Componentes fundamentales que almacenan la información del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {entities.map((entity) => (
                    <div key={entity.name} className="p-4 border rounded-lg bg-muted/50">
                        <h3 className="text-lg font-semibold text-primary mb-2">{entity.name}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {entity.attributes.map(attr => <li key={attr}>{attr}</li>)}
                        </ul>
                    </div>
                ))}
            </CardContent>
        </Card>

         <Card className="sticky top-4">
            <CardHeader>
                <CardTitle>Relaciones y Cardinalidad</CardTitle>
                <CardDescription>Asociaciones entre las entidades que definen la lógica del negocio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {relationships.map((rel, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <span className="font-medium text-sm">{rel.from}</span>
                        <div className="flex flex-col items-center">
                            <span className="text-xs text-muted-foreground">{rel.verb}</span>
                            <ArrowRight className="h-4 w-4 text-accent"/>
                            <Badge variant="outline" className="mt-1">{rel.type}</Badge>
                        </div>
                        <span className="font-medium text-sm">{rel.to}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}
