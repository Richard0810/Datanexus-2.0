
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-headline">Página No Encontrada</CardTitle>
          <CardDescription>Lo sentimos, el recurso que buscas no existe o ha sido movido.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/inicio">Volver al Inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
