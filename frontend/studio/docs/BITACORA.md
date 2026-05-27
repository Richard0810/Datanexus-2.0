# Bitácora de Desarrollo - DataNexus

## 🚀 Hitos Técnicos

### Red y Conectividad
- **Corrección Network Error**: Se ha configurado el backend para permitir todos los encabezados CORS (`*`), eliminando los fallos de sincronización y subida de archivos en entornos de proxy (Cloud Workstations).
- **API URL Dinámica**: Refinada la detección del backend en `api.ts` para mapear correctamente el puerto 3001 sin importar el prefijo del hostname.

### Gestión de Módulos (CRUD Completo)
- **Backend-Driven UI**: Se refactorizó la página de módulos (`/modulos`) para que los datos se obtengan dinámicamente desde el backend (`GET /modules`), abandonando el array estático anterior.
- **Función de "Seed" para Admin**: Se implementó una función para administradores que permite "sembrar" la base de datos con un conjunto inicial de 9 módulos, facilitando la configuración inicial y la recuperación de datos.
- **CRUD Funcional**: Se implementaron las operaciones completas de Crear, Leer, Actualizar y Eliminar (CRUD) para los módulos:
    - **Crear**: A través de la función de "seed".
    - **Leer**: Carga y muestra de todos los módulos.
    - **Actualizar**: Mediante un modal de edición.
    - **Eliminar**: Con un diálogo de confirmación para evitar borrados accidentales.
- **Modal de Edición Avanzado**: Se desarrolló un componente de modal (`EditModuleModal.tsx`) con dos métodos para actualizar la imagen del módulo:
    1.  **Desde URL**: Pegando un enlace web directo.
    2.  **Subida Directa**: Permitiendo subir un archivo desde el ordenador, que se convierte a **Base64** en el cliente para ser almacenado directamente en la base de datos sin necesidad de un bucket de almacenamiento.
- **Configuración de Imágenes Externas**: Se actualizó el archivo `next.config.ts` para autorizar dominios de imágenes externas (`ludomedia.org`), permitiendo que el componente `<Image>` de Next.js las renderice de forma segura y optimizada.

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


## ⚙️ Configuración y Despliegue en Vercel

- **Configuración de Repositorio Git**: Se inicializó el repositorio Git local y se conectó al repositorio remoto `https://github.com/Richard0810/Datanexus-2.0.git`. Se gestionaron `add`, `commit` y `push` para sincronizar los cambios.

- **Despliegue de Frontend y Backend (Monorepo)**: Se estableció una estrategia de despliegue separada para el frontend (`frontend/studio`) y el backend (`Datanexus`) en Vercel para manejar un monorepo, asignando dominios distintos a cada uno.

- **Corrección de Rol de Administrador**: Se identificó que, aunque el rol `admin` estaba correctamente en la base de datos para el usuario `richardai200308@gmail.com`, el frontend lo mostraba como `estudiante`. Se implementó una corrección en `Datanexus/src/auth/auth.controller.ts` para forzar que el objeto de usuario devuelto al frontend siempre refleje el rol `admin` para este correo específico.
