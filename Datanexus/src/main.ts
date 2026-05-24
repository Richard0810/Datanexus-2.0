import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentamos los límites para permitir subida de archivos Base64 en las actividades
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // CORS configurado para producción y desarrollo
  app.enableCors({
    origin: true, 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('DataNexus API')
    .setDescription('Servidor central de DataNexus para gestión académica')
    .setVersion('1.0')
    .addTag('datanexus')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Puerto dinámico para Render/Railway o 3001 por defecto
  const port = process.env.PORT || 3001;

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`Backend de DataNexus corriendo exitosamente en el puerto: ${port}`);
  } catch (error: any) {
    if (error.code === 'EADDRINUSE') {
      console.error(`ERROR: El puerto ${port} está ocupado. Intentando liberar puerto.`);
      process.exit(1);
    } else {
      console.error('Error al iniciar el servidor:', error);
    }
  }
}
bootstrap();