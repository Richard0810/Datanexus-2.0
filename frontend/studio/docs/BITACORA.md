
# Bitácora de Desarrollo - DataNexus

Este documento registra los hitos técnicos y cambios estructurales realizados en la plataforma para facilitar el mantenimiento y la resolución de problemas futuros.

## 🚀 Hitos de Desarrollo

### 1. Identidad Visual y Marca
- **Logo Oficial SVG**: Se integró el diseño vectorial exacto con gradientes lineales (`#000a5c` a `#00c8ff`) y formas geométricas personalizadas.
- **Formato de Nombre**: Consolidación de la marca como **Data**nexus (Gris/Blanco + Azul).
- **Estabilidad de Hidratación**: Implementación de montaje seguro en componentes visuales críticos para evitar errores de Next.js 15.

### 2. Interfaz y Experiencia de Usuario (UX/UI)
- **Header Simétrico**: Alineación del encabezado con el contenido principal mediante un padding consistente (`px-8 md:px-12`).
- **Buscador Inteligente**: Lógica de filtrado de módulos que ignora mayúsculas, minúsculas y acentos (ej. "modulo" encuentra "Módulo").
- **Diseño de Botones**: Estilización del botón "Ver en ventana completa" con color `bg-slate-900` para mejorar el contraste.
- **Limpieza de Menú**: Se ha retirado el "Modelo de Datos" de la navegación principal por ser una herramienta de uso interno del sistema.

### 3. Gestión Académica (CRUD)
- **Recursos Educativos**:
    - Creación de recursos (Links/URLs).
    - Edición de metadatos (Títulos, descripciones).
    - **Eliminación Robusta**: Migración de `window.confirm` a un componente `Dialog` de la interfaz para evitar bloqueos del navegador.
    - **Manejo de IDs**: Implementación de `getResourceId` para procesar identificadores de MongoDB en formato string u objeto (`$oid`).
    - **Visualización Multimedia**: Implementación de previsualización inteligente para archivos Base64 (PDF, JPG, MP4).
    - **Estrategia de Visualización Automática**: Se ha robustecido la detección de MIME types para archivos locales, permitiendo previsualizaciones instantáneas de PDF e imágenes sin depender estrictamente de la extensión del archivo.
    - **Soporte Universal de Office**: Se ha añadido una interfaz dedicada para archivos de Word, PowerPoint y Excel subidos localmente, con iconos específicos y apertura optimizada por Blobs.
    - **Apertura por Blobs**: Los archivos locales ahora se abren en pestañas nuevas usando `URL.createObjectURL(blob)` para evitar descargas forzadas y errores de seguridad.
    - **Corrección de Bloqueo de Chrome**: Los PDFs ahora se visualizan mediante URLs de Blob temporales para evitar el bloqueo de seguridad de Chrome sobre cadenas `data:`.
- **Panel de Seguimiento**: Pestaña exclusiva para administradores que permite visualizar envíos de estudiantes, calificar (0-5) y dejar retroalimentación.
- **Editor de Texto**: Reparación del icono de cursiva (`Italic`) en el editor de entregas.

### 4. Reportes y Analítica
- **Dashboard Dinámico**: Sincronización real con el endpoint `/performance-reports`.
- **Robustez de Datos**: Implementación de manejo de nulos y validación de fechas (`safeFormatDate`) para evitar errores de ejecución en registros incompletos.
- **Gráficas de Desempeño**: Visualización de promedios por módulo con filtrado automático de valores no numéricos.
- **Claridad de Roles**: Los administradores ahora visualizan el total global de entregas del sistema, diferenciando entre datos personales y del colectivo estudiantil.

### 5. Backend y Configuración
- **Límites de Carga**: Configuración de `50mb` en el servidor NestJS para permitir entregas con archivos base64 y textos enriquecidos.
- **Conteo Dinámico**: Cálculo en tiempo real de lecciones por módulo sumando recursos, actividades y evaluaciones.
- **Seguridad CORS**: Configuración robusta para permitir peticiones desde el entorno de Cloud Workstations.

### 6. Correcciones de Estabilidad
- **Iframe Empty Src**: Se corrigió el error que pasaba una cadena vacía al atributo `src` de los iframes, lo cual provocaba recargas de página innecesarias.
- **Script de Inicio**: Corrección en el `package.json` raíz para usar `npm run dev` en el frontend.
- **Solución Network Error**: Se eliminó la configuración manual de encabezados `multipart/form-data` en las peticiones de Axios, permitiendo que el navegador asigne el boundary correcto y evitando errores de red.

### 7. Responsividad y Archivos
- **Diálogo Auto-ajustable**: Se ha optimizado el diálogo de recursos para pantallas pequeñas usando scroll interno y grids adaptables.
- **Subida de Archivos**: Integración de soporte para subir archivos físicos (PDF, Word, MP4) mediante conversión a Base64 en el cliente para máxima compatibilidad.

---
*Última actualización: Mayo 2026*
