import { NestFactory } from "@nestjs/core"
import { ValidationPipe, Logger, HttpException, ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { AppModule } from "./app.module"
import { Response } from 'express'

@Catch()
class GlobalHttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus ? exception.getStatus() : 500

    // Validation error (422)
    if (status === 422 || (status === 400 && exception.response?.message && Array.isArray(exception.response.message) && exception.response.message[0] instanceof Object && exception.response.message[0].property)) {
      // NestJS ValidationPipe returns status 400 by default, but you may want 422
      const errors: Record<string, string[]> = {}
      if (Array.isArray(exception.response?.message)) {
        for (const err of exception.response.message) {
          if (err.property && err.constraints) {
            errors[err.property] = Object.values(err.constraints)
          }
        }
      }
      return response.status(422).json({ statusCode: 422, errors })
    }

    // Другие ошибки
    const message = exception.response?.message || exception.message || 'Internal server error'
    response.status(status).json({ statusCode: status, message })
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const configService = app.get(ConfigService)
  const logger = new Logger("Bootstrap")

  // Global validation pipe
  const validationPipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  })
  app.useGlobalPipes(validationPipe)

  // Глобальный фильтр ошибок
  app.useGlobalFilters(new GlobalHttpExceptionFilter())

  // CORS
  app.enableCors({
    origin: "*",
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix("api")

  const port = configService.get("PORT", 3000)
  await app.listen(port)

  logger.log(`🚀 Application is running on: http://localhost:${port}`)
}

bootstrap()
