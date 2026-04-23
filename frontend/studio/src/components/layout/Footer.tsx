export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground md:px-6">
        <p>&copy; {new Date().getFullYear()} DataNexus. Todos los derechos reservados.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:text-foreground">Créditos del Equipo</a>
          <a href="#" className="hover:text-foreground">Políticas de Privacidad</a>
          <a href="#" className="hover:text-foreground">Soporte Técnico</a>
        </div>
      </div>
    </footer>
  );
}
