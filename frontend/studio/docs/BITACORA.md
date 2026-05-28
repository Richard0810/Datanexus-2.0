
# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Gestión de Entregas y Evaluaciones (Fix v5)
- **Corrección de Entregas**: Se reparó la lógica de `handleSubmitActivity` que fallaba al guardar nuevas entregas. Ahora el sistema detecta si es una creación (POST) o actualización (PATCH) basándose en la existencia previa de una entrega del estudiante.
- **Motor de Evaluaciones Estabilizado**: Se flexibilizó el filtro de `moduloId` en la carga de evaluaciones para asegurar que los exámenes aparezcan correctamente en la interfaz sin importar el tipo de dato en la DB.
- **Editor Enriquecido**: Restaurado el editor de texto enriquecido para las entregas de actividades, permitiendo formato negrita, cursiva y subrayado.

### Multimedia y Filtros (Fix v4)
- **Filtro de Unidades Estabilizado**: Se actualizó el motor de búsqueda de recursos para permitir coincidencias exactas con el ID del módulo (ej. coincidir "1" con el Módulo 1), solucionando el problema de recursos que no se renderizaban.
- **Drive & Prezi Patch**: Restaurada la funcionalidad de apertura para Prezi en ventana externa y la transformación automática de enlaces de Google Drive a modo previsualización para evitar errores de permisos.
- **Resiliencia de Carga**: Se añadió manejo de errores individual para las peticiones de la API de MongoDB en el detalle del módulo, asegurando que si un recurso falla, el resto de la interfaz siga funcionando.

### Gestión de Entregas y Seguimiento (Fix v3)
- **Visibilidad Estudiante**: Se implementó el estado "Entregado (Editar)" en las tarjetas de actividades. Ahora el estudiante puede recuperar su texto y archivo enviado para corregirlo antes de la calificación.
- **Sincronización de IDs**: Se estandarizó el uso de `String(moduloId)` para asegurar que el filtro de la base de datos no ignore registros en el panel de Seguimiento.
- **Seguimiento Admin**: Reparada la tabla de calificaciones; ahora muestra correctamente el listado de todos los estudiantes que han entregado tareas o exámenes en el módulo actual.

### Gestor de Referencias (IA Power - v2)
- **Motor de Citación Estabilizado**: Migración definitiva al modelo **`gemini-3.5-flash`** para asegurar disponibilidad y precisión en el formateo bibliográfico.
- **UX de Copiado Masivo**: Implementado el botón "Copiar Todas" con feedback visual de éxito para mejorar la productividad del investigador.
- **Markdown Prohibido**: Se instruyó a la IA para devolver solo texto plano limpio, eliminando asteriscos y guiones bajos innecesarios en las citas.

### Inteligencia Artificial (Potenciación PICO/PECO)
- **Actualización de Modelo**: Migración exitosa al modelo **`gemini-3.5-flash`**, asegurando respuestas ultra-rápidas y precisas siguiendo la última documentación de Google AI.
- **Refactorización Genkit v1**: Se eliminó el uso del método obsoleto `run()` en la API Route. Ahora los flujos se invocan directamente como funciones asíncronas.
