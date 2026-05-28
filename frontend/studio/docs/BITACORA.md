

# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Refinamiento de Calificaciones y Feedback (Fix v15)
- **Calificación Limpia**: Se ajustó el campo de nota en el panel de seguimiento para que sea intuitivo y restringido estrictamente al rango de 0-5.0.
- **Transparencia Estudiantil**: Los estudiantes ahora pueden visualizar su nota final y los comentarios del docente directamente en las tarjetas de actividad del módulo, mejorando el ciclo de aprendizaje.

### Flexibilidad en Evaluaciones y UX (Fix v14)
- **Editor de Evaluaciones Dinámico**: Se añadió la capacidad de agregar múltiples opciones de respuesta en el diseñador de preguntas y eliminar las innecesarias, permitiendo exámenes más complejos.
- **Autoajuste de Recursos**: Se refinó el diálogo de gestión de recursos para que se autoajuste verticalmente de forma fluida, eliminando espacios muertos al cambiar entre pestañas de carga.

### Optimización UX y Flujos Administrativos (Fix v13)
- **Autoajuste de Diálogos**: Se corrigió el diseño de los modales de gestión de recursos para que se ajusten dinámicamente al contenido, eliminando espacios vacíos.
- **Selector de Respuestas Dinámico**: Se implementó un selector de botones al lado de las opciones en el editor de evaluaciones, permitiendo marcar la respuesta correcta de forma intuitiva sin usar campos de texto manuales.

### Estabilización de Dependencias y UI (Fix v12)
- **Corrección de Iconos**: Se reemplazó `CheckSquare` por `SquareCheck` en `page.tsx` para cumplir con las actualizaciones de la librería `lucide-react`, eliminando el error de ejecución en el cliente.
- **Sincronización de Genkit**: Se fijaron las versiones de `@genkit-ai/google-genai` para resolver conflictos de resolución de módulos en el entorno de Vercel.

... (resto de la bitácora)
