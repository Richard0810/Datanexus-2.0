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

---
*Última actualización: Mayo 2026*
