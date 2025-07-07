import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用全局验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));
  
  // 设置全局前缀
  app.setGlobalPrefix('api/v1');

  // 启用 CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
    ],
    credentials: true,
  });
  
  // 配置 Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('家庭记账本 API')
    .setDescription('家庭记账本后端服务 API 文档')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('认证管理', '用户认证相关接口')
    .addTag('用户管理', '用户信息管理接口')
    .addTag('账本管理', '账本创建和管理接口')
    .addTag('账户管理', '账户创建和管理接口')
    .addTag('分类管理', '收支分类管理接口')
    .addTag('交易管理', '交易记录管理接口')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 应用启动成功`);
  console.log(`📖 API文档地址: http://localhost:${port}/api/docs`);
  console.log(`🌐 服务地址: http://localhost:${port}/api/v1`);
}
bootstrap();
