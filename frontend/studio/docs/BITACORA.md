

# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Potenciación de Búsqueda Académica (Fix v10)
- **Motor de Inteligencia**: Se implementó el modelo **`gemini-3.5-flash`** para la búsqueda académica asistida, mejorando drásticamente la calidad y estructura de las respuestas.
- **Resultados Enriquecidos**: El motor ahora devuelve objetos estructurados con título, resumen simulado y fuente probable (PubMed, Scielo, etc.), facilitando la identificación de materiales.
- **Estrategias de Refinamiento**: La IA genera automáticamente cadenas de búsqueda booleanas (AND, OR, NOT) basadas en la consulta del usuario para ayudarle a navegar en bases de datos reales.
- **UX Bibliotecaria**: Se añadió una sección de "Expert Tip" que sugiere bases de datos específicas según el área temática detectada.
- **Consistencia de API**: Se unificó el llamado a los flujos de IA a través de la ruta centralizada `/api/ai` para evitar errores de hidratación y permisos en el cliente.

### Solución de Errores Críticos (Fix v9)
- **Corrección de Dependencias**: Se reinstalaron y sincronizaron las dependencias de Genkit (`@genkit-ai/google-genai`) para resolver el error de `Module not found` que bloqueaba el flujo de búsqueda académica y el gestor de referencias.
- **Prezi CRUD Fix**: Se restauró la opción "Presentación Prezi" en el modal de creación de recursos, asegurando que el docente pueda clasificar correctamente este tipo de contenido.
- **Drive Embed Pro**: Se robusteció la función `getEmbedUrl` para transformar automáticamente cualquier enlace de Google Drive (Docs, Sheets, Slides) en modo previsualización, eliminando el error de permisos "Necesitas acceso".

### Restauración de Opciones Multimedia (Fix v8)
- **Soporte Prezi Recuperado**: Se restauró la opción "Presentación Prezi" en el selector de tipo de recurso del CRUD, permitiendo al docente clasificar correctamente este contenido.
- **UX de Previsualización**: Se verificó que el motor de previsualización siga manejando la lógica de apertura externa para Prezi, garantizando una carga fluida y sin bloqueos de seguridad.

... (resto de la bitácora)
