# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Red y Conectividad
- **Corrección Network Error**: Se ha configurado el backend para permitir todos los encabezados CORS (`*`), eliminando los fallos de sincronización y subida de archivos en entornos de proxy (Cloud Workstations).
- **API URL Dinámica**: Refinada la detección del backend en `api.ts` para mapear correctamente el puerto 3001 sin importar el prefijo del hostname.

### Gestión de Archivos y CRUD
- **Estrategia Base64**: Implementada la conversión de archivos locales a Base64 en el cliente para evitar errores de red complejos y garantizar el almacenamiento en MongoDB.
- **Visualización Universal**: 
    - PDFs: Se visualizan mediante URLs de Blob temporales para eludir los bloqueos de seguridad de Chrome sobre cadenas `data:`.
    - Office (PPTX/Word): Interfaz dedicada que utiliza Blobs dinámicos para apertura instantánea en visores externos.
    - Multimedia: Soporte nativo para videos MP4 e imágenes Base64.

### Reportes y Análisis
- **Dashboard Dinámico**: Conexión total con `/performance-reports` con filtrado por rol (Admin ve global, Estudiante ve personal).
- **Mantenimiento Robusto**:
    - **Limpieza Automática**: Botón de limpieza global para eliminar registros no calificados.
    - **Borrado con AlertDialog**: Migración de `confirm` nativo a diálogos de Shadcn para evitar bloqueos del navegador.
    - **Normalización de IDs**: Función `getReportId` para manejar indistintamente IDs de MongoDB como strings u objetos `$oid`.
- **Formateo Seguro**: Implementación de `safeFormatDate` y renderizado defensivo (`|| 'enviado'`) para prevenir errores de ejecución por datos nulos.

## 💡 Lecciones Aprendidas y Soluciones Reales

### Gestión de Roles y Permisos
- **Sincronización Frontend-Backend**: Se identificó una discrepancia entre `user.rol` (MongoDB) y `user.role` (AuthContext). La solución definitiva fue estandarizar el uso de `user.role` en el frontend para que la lógica `isAdmin` habilitara correctamente las pestañas de seguimiento y botones de edición.

### Diseño y Experiencia de Usuario (UX)
- **Visibilidad de Controles de Admin**: Se eliminaron las clases de opacidad condicional (`opacity-0` / `group-hover`) en los botones de editar y eliminar. La visibilidad permanente con colores sólidos (`bg-blue-600` para editar y `bg-red-600` para eliminar) y forma circular (`rounded-full`) mejoró significativamente la eficiencia operativa del docente.
- **Fluidez del Layout**: Se restauró el ancho total (`w-full`) en la barra de pestañas de módulos. Restringir el ancho causaba problemas de renderizado al añadir la cuarta pestaña de "Seguimiento".

### Sistema de Evaluación y Calificación
- **Escala de Calificación**: Implementación de una escala estricta de **0 a 5.0**. Se añadió lógica de "clamping" en las funciones de guardado para impedir notas fuera de rango, asegurando la integridad de los promedios académicos.
- **Visibilidad Pedagógica**: En el panel de revisión, se modificó el renderizado de detalles para mostrar el **enunciado completo de la pregunta** en lugar de IDs técnicos, facilitando la calificación de preguntas abiertas.

### Entregas de Actividades
- **Editor Enriquecido**: La implementación de un editor con soporte para negrita, alineación y tamaño de fuente permitió a los estudiantes realizar entregas profesionales directamente en la plataforma.
- **Descarga de Adjuntos**: Se integró un botón de descarga dinámica en la vista del docente que extrae el archivo Base64 almacenado en MongoDB, permitiendo la revisión local de documentos complejos (infografías, documentos extensos).

## ⚙️ Configuración y Despliegue en Vercel

- **Configuración de Repositorio Git**: Se inicializó el repositorio Git local y se conectó al repositorio remoto `https://github.com/Richard0810/Datanexus-2.0.git`. Se gestionaron `add`, `commit` y `push` para sincronizar los cambios.

- **Despliegue de Frontend y Backend (Monorepo)**: Se estableció una estrategia de despliegue separada para el frontend (`frontend/studio`) y el backend (`Datanexus`) en Vercel para manejar un monorepo, asignando dominios distintos a cada uno.

- **Corrección de Rol de Administrador**: Se identificó que, aunque el rol `admin` estaba correctamente en la base de datos para el usuario `richardai200308@gmail.com`, el frontend lo mostraba como `estudiante`. Se implementó una corrección en `Datanexus/src/auth/auth.controller.ts` para forzar que el objeto de usuario devuelto al frontend siempre refleje el rol `admin` para este correo específico.

- **Resolución de Errores CORS**: Se abordaron problemas de CORS que impedían las operaciones CRUD (POST, PATCH, DELETE) en el entorno desplegado. La solución final implicó la modificación de `Datanexus/src/main.ts` para especificar explícitamente los orígenes (`https://datanexus-2-0.vercel.app`, `https://datanexus-2-0-vugv.vercel.app`) y los encabezados (`Content-Type, Accept, Authorization`) permitidos en la configuración de CORS del backend, asegurando la correcta comunicación entre frontend y backend.

---
*Última actualización: Mayo 2026*
