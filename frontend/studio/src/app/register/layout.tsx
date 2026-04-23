
import React from 'react';

// Este layout se aplica específicamente a la ruta /register y sus sub-rutas.
export default function RegisterLayout({
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
