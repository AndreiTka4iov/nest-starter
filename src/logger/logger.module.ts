import { randomUUID } from 'node:crypto'
import { IncomingMessage, ServerResponse } from 'node:http'

import { Module } from '@nestjs/common'
import { LoggerModule } from 'nestjs-pino'

import { AppConfigService } from '../config/app-config.service'
import { AppConfigModule } from '../config/config.module'

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.logLevel,
          genReqId: (req: IncomingMessage, res: ServerResponse) => {
            const headerId = req.headers['x-request-id']
            const id = (Array.isArray(headerId) ? headerId[0] : headerId) ?? randomUUID()
            res.setHeader('x-request-id', id)
            return id
          },
          transport: config.isProduction
            ? undefined
            : {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  translateTime: 'SYS:HH:MM:ss.l',
                  ignore: 'pid,hostname,req.headers,res.headers',
                },
              },
          serializers: {
            req: req => ({
              id: req.id,
              method: req.method,
              url: req.url,
            }),
            res: res => ({ statusCode: res.statusCode }),
          },
          redact: {
            paths: ['req.headers.authorization', 'req.headers.cookie'],
            remove: true,
          },
        },
      }),
    }),
  ],
})
export class AppLoggerModule {}
