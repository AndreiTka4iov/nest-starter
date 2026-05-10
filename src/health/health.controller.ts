import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService } from '@nestjs/terminus'

@Controller()
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get('health')
  @HealthCheck()
  liveness() {
    return this.health.check([])
  }

  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([])
  }
}
