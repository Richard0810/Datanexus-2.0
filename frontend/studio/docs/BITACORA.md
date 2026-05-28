# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Multimedia y Previsualización
- **Google Drive Patch**: Implementada la transformación automática de enlaces `view` a `/preview` para archivos de Google Drive/Docs. Esto soluciona el error "Necesitas acceso" y permite visualizar PDFs y documentos públicos directamente en la plataforma.
- **Soporte para Prezi**: Restaurada la funcionalidad de apertura en ventana externa para presentaciones de Prezi, optimizando la experiencia de usuario al evitar restricciones de marcos (iframe) de terceros.

### Inteligencia Artificial (Potenciación PICO/PECO)
- **Actualización de Modelo**: Migración exitosa al modelo **`gemini-3.5-flash`**, asegurando respuestas ultra-rápidas y precisas siguiendo la última documentación de Google AI.
- **Refactorización Genkit v1**: Se eliminó el uso del método obsoleto `run()` en la API Route. Ahora los flujos se invocan directamente como funciones asíncronas, eliminando errores de ejecución y mejorando la estabilidad en producción.
- **Enriquecimiento de Salida**: La IA ahora entrega un paquete completo de investigación: Pregunta PICO/PECO, Sugerencia del experto, y Palabras Clave (Keywords).

### Gestión de Módulos (OVA) y Estabilización
- **Corrección de Error Crítico**: Resolución del fallo `handleSaveGrade is not defined` que provocaba pantallas blancas al entrar en el detalle de los módulos.
- **Restauración de Herramientas Admin**: Se recuperaron los botones de **Editar** y **Eliminar** en Recursos, Actividades y Evaluaciones, permitiendo una gestión total del contenido desde la interfaz.
- **Motor de Evaluaciones**: Se rediseñó la lógica para separar el "Modo Examen" (estudiante) del "Editor de Preguntas" (administrador), permitiendo crear y modificar exámenes dinámicamente sin errores de navegación.
- **Entrega de Actividades**: Restaurado el sistema de entrega de tareas con editor de texto enriquecido y soporte para archivos adjuntos.

### Red y Conectividad (Vercel & Render)
- **Corrección ERESOLVE**: Se alinearon todas las dependencias de Genkit a la versión **`1.36.0`** en el `package.json`, resolviendo los conflictos de dependencias que bloqueaban el despliegue en Vercel.
- **CORS Universal**: Se configuró el backend en NestJS para permitir peticiones desde cualquier origen (`origin: true`), eliminando el "Network Error" que impedía guardar datos desde el frontend desplegado.
- **API URL Dinámica**: Refinada la detección del backend en `api.ts` para limpiar barras diagonales finales y manejar puertos dinámicos.

### Seguridad y Roles
- **Blindaje de Admin**: Implementada la sincronización forzada en el backend para el usuario `richardai200308@gmail.com`, garantizando que mantenga el rol de `admin` en MongoDB y en el estado de la aplicación de forma automática.

## 💡 Lecciones Aprendidas y Soluciones Reales
- **Embebido de Documentos**: Para archivos de Google Drive, el parámetro `/preview` es obligatorio para evitar que el navegador bloquee la visualización por conflictos de cookies de Google.
- **Genkit v1**: En la versión 1.x, los flujos deben tratarse como funciones estándar importadas, no invocarse por strings de ID.
- **Protección de Inicialización**: La validación de `window` y `apiKey` en la configuración de Firebase es vital para que el proceso de "build" de Vercel no falle por falta de variables de entorno.
