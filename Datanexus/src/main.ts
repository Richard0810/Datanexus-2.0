
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configurado para permitir peticiones desde el frontend en Cloud Workstations
  app.enableCors({
    origin: true, 
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

  // Forzamos el puerto 3001 para el backend independientemente de los argumentos externos
  const port = 3001;

  // Escuchamos en todas las interfaces (0.0.0.0) para que sea accesible externamente
  await app.listen(port, '0.0.0.0');
  console.log(`Backend de DataNexus corriendo en el puerto: ${port}`);
}
bootstrap();
