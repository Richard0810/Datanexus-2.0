import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EducationalResourcesModule } from './educational_resources/educational_resources.module';
import { UserConfigurationsModule } from './user_configurations/user_configurations.module';
import { UsersModule } from './users/users.module';
import { SearchesModule } from './searches/searches.module';
import { PrismaModelsModule } from './prisma_models/prisma_models.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { ActivitiesModule } from './activities/activities.module';
import { QuestionsModule } from './questions/questions.module';
import { ModulesModule } from './modules/modules.module';
import { RolesModule } from './roles/roles.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AcademicReferencesModule } from './academic_references/academic_references.module';
import { PerformanceReportsModule } from './performance_reports/performance_reports.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    EducationalResourcesModule, 
    RolesModule, 
    // Usamos forRootAsync para esperar a que las variables de entorno carguen en Render
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI')!,
      }),
      inject: [ConfigService],
    }), 
    ModulesModule, 
    QuestionsModule, 
    ActivitiesModule, 
    AssessmentsModule, 
    PrismaModelsModule, 
    SearchesModule, 
    UsersModule, 
    UserConfigurationsModule, 
    AcademicReferencesModule, 
    PerformanceReportsModule, 
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}