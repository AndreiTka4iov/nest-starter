import { Module } from '@nestjs/common'

import { AppConfigModule } from './config/config.module'
import { HealthModule } from './health/health.module'
import { AppLoggerModule } from './logger/logger.module'

@Module({
  imports: [AppConfigModule, AppLoggerModule, HealthModule],
})
export class AppModule {}
