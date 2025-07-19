import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { INestApplication } from '@nestjs/common'

export const setupSwaggerAdmin = (app: INestApplication): void => {
    const swaggerConfig = new DocumentBuilder()
        .setTitle('Qolay.uz Admin API')
        .setDescription('This documentation provides a comprehensive overview of the qolay.uz Admin API, including available endpoints, request formats, and response structures.')
        .setVersion('1.0.0')
        .addBearerAuth()
        .setContact(
            'qolay.uz Support Team',
            'https://qolay.uz',
            'support@qolay.uz',
        )
        .setLicense(
            'Proprietary License',
            'https://qolay.uz',
        )
        .addServer('http://127.0.0.1:3000', 'Local Development Server')
        .addServer('https://api.qolay.uz', 'Production Server')
        .addGlobalParameters({
            name: 'x-lang',
            in: 'header',
            required: false,
            description: 'Language preference header. Supported values: uz, ru, en, kaa.',
            schema: {
                type: 'string',
                example: 'kaa',
            },
        })
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig, {
        // include: [AdminModule],
    })
    app.use('/api-docs-json/', (req: Request, res: Response) => res.send(document))

    SwaggerModule.setup(process.env.SWAGGER_URL || '/api-docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        explorer: true,
        customSiteTitle: 'Qolay.uz Admin API',
        customCss: '.swagger-container .swagger-ui { max-width: 900px; margin: 0 auto; }',
    })
}