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

### 3. Gestión Académica (CRUD)
- **Recursos Educativos**:
    - Creación de recursos (Links/URLs).
    - Edición de metadatos (Títulos, descripciones).
    - **Eliminación Robusta**: Migración de `window.confirm` a un componente `Dialog` de la interfaz para evitar bloqueos del navegador.
    - **Manejo de IDs**: Implementación de `getResourceId` para procesar identificadores de MongoDB en formato string u objeto (`$oid`).
- **Panel de Seguimiento**: Pestaña exclusiva para administradores que permite visualizar envíos de estudiantes, calificar (0-5) y dejar retroalimentación.
- **Editor de Texto**: Reparación del icono de cursiva (`Italic`) en el editor de entregas.

### 4. Backend y Configuración
- **Límites de Carga**: Configuración de `50mb` en el servidor NestJS para permitir entregas con archivos base64 y textos enriquecidos.
- **Conteo Dinámico**: Cálculo en tiempo real de lecciones por módulo sumando recursos, actividades y evaluaciones.
- **Seguridad CORS**: Configuración robusta para permitir peticiones desde el entorno de Cloud Workstations.

### 5. Correcciones de Estabilidad
- **Iframe Empty Src**: Se corrigió el error que pasaba una cadena vacía al atributo `src` de los iframes, lo cual provocaba recargas de página innecesarias.
- **Script de Inicio**: Corrección en el `package.json` raíz para usar `npm run dev` en el frontend.

---
*Última actualización: Mayo 2026*
