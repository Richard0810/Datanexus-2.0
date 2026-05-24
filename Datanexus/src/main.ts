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

  // Puerto asignado dinámicamente o 3001 por defecto
  const port = process.env.PORT || 3001;

  try {
    await app.listen(port, '0.0.0.0');
    console.log(`Backend de DataNexus corriendo exitosamente en el puerto: ${port}`);
  } catch (error) {
    if (error.code === 'EADDRINUSE') {
      console.error(`ERROR CRÍTICO: El puerto ${port} está ocupado. Intenta matar el proceso anterior o cambia el puerto en el archivo .env`);
      process.exit(1);
    } else {
      console.error('Error fatal al iniciar el servidor:', error);
    }
  }
}
bootstrap();
