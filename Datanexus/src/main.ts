
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configurado para permitir peticiones desde el frontend en Cloud Workstations
  app.enableCors({
    origin: true, // Permitir cualquier origen en desarrollo para evitar bloqueos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const config = new DocumentBuilder()
    .setTitle('DataNexus API')
    .setDescription('Servidor central de DataNexus para gestión académica')
    .setVersion('1.0')
    .addTag('datanexus')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  // Forzamos el puerto 3001 si el puerto detectado es el del frontend (9002)
  let port = process.env.PORT || 3001;
  if (String(port) === '9002') {
    port = 3001;
  }

  // Escuchamos en todas las interfaces (0.0.0.0) para que sea accesible externamente
  await app.listen(port, '0.0.0.0');
  console.log(`Backend de DataNexus corriendo en el puerto: ${port}`);
}
bootstrap();
