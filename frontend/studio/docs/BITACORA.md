

# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Flexibilidad en Evaluaciones y UX (Fix v14)
- **Editor de Evaluaciones Dinámico**: Se añadió la capacidad de agregar múltiples opciones de respuesta en el diseñador de preguntas y eliminar las innecesarias, permitiendo exámenes más complejos.
- **Autoajuste de Recursos**: Se refinó el diálogo de gestión de recursos para que se autoajuste verticalmente de forma fluida, eliminando espacios muertos al cambiar entre pestañas de carga.

### Optimización UX y Flujos Administrativos (Fix v13)
- **Autoajuste de Diálogos**: Se corrigió el diseño de los modales de gestión de recursos para que se ajusten dinámicamente al contenido, eliminando espacios vacíos.
- **Selector de Respuestas Dinámico**: Se implementó un selector de botones al lado de las opciones en el editor de evaluaciones, permitiendo marcar la respuesta correcta de forma intuitiva sin usar campos de texto manuales.

### Estabilización de Dependencias y UI (Fix v12)
- **Corrección de Iconos**: Se reemplazó `CheckSquare` por `SquareCheck` en `page.tsx` para cumplir con las actualizaciones de la librería `lucide-react`, eliminando el error de ejecución en el cliente.
- **Sincronización de Genkit**: Se fijaron las versiones de `@genkit-ai/google-genai` para resolver conflictos de resolución de módulos en el entorno de Vercel.

### Corrección de Errores Críticos (Fix v11)
- **Import CheckSquare**: Se solucionó el error `ReferenceError: CheckSquare is not defined` que bloqueaba la carga de los módulos. Se incluyó el icono en la lista de importaciones de `lucide-react`.
- **Consistencia UI**: Se verificó que todos los componentes de interfaz utilizados en la gestión de evaluaciones tengan sus dependencias correctamente declaradas.

### Potenciación de Búsqueda Académica (Fix v10)
- **Motor de Inteligencia**: Se implementó el modelo **`gemini-3.5-flash`** para la búsqueda académica asistida, mejorando drásticamente la calidad y estructura de las respuestas.
- **Resultados Enriquecidos**: El motor ahora devuelve objetos estructurados con título, resumen simulado y fuente probable (PubMed, Scielo, etc.), facilitando la identificación de materiales.
- **Estrategias de Refinamiento**: La IA genera automáticamente cadenas de búsqueda booleanas (AND, OR, NOT) basadas en la consulta del usuario para ayudarle a navegar en bases de datos reales.

... (resto de la bitácora)
