
import React from 'react';

// Este layout se aplica específicamente a la ruta /login y sus sub-rutas.
// No incluye la barra lateral ni el encabezado principal de la aplicación.
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {/* Simplemente renderiza el contenido de la página (page.tsx) sin ningún layout adicional */}
      {children}
    </section>
  );
}
