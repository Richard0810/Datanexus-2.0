
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para aceptar peticiones desde el frontend en desarrollo y producción
  // Incluimos comodines para los dominios de Cloud Workstations
  app.enableCors({
    origin: true, // En desarrollo permitimos todos para evitar bloqueos de Workstations
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('DataNexus API')
    .setDescription('Servidor central de DataNexus para gestión académica')
    .setVersion('1.0')
    .addTag('datanexus')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend de DataNexus corriendo en: http://localhost:${port}`);
}
bootstrap();
