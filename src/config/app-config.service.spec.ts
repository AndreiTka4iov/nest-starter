import { ConfigModule } from '@nestjs/config'
import { Test } from '@nestjs/testing'

import { AppConfigService } from './app-config.service'
import { NodeEnv, validateEnv } from './env.schema'

describe('AppConfigService', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  async function build(envOverrides: Record<string, string | null> = {}) {
    process.env = { ...originalEnv }
    for (const [key, value] of Object.entries(envOverrides)) {
      if (value === null) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          validate: validateEnv,
        }),
      ],
      providers: [AppConfigService],
    }).compile()
    return moduleRef.get(AppConfigService)
  }

  it('applies defaults when env vars are absent', async () => {
    const service = await build({
      NODE_ENV: null,
      PORT: null,
      LOG_LEVEL: null,
    })
    expect(service.port).toBe(3000)
    expect(service.logLevel).toBe('info')
    expect(service.nodeEnv).toBe(NodeEnv.Development)
    expect(service.isProduction).toBe(false)
  })

  it('reads provided values from env', async () => {
    const service = await build({
      NODE_ENV: 'production',
      PORT: '8080',
      LOG_LEVEL: 'warn',
    })
    expect(service.port).toBe(8080)
    expect(service.logLevel).toBe('warn')
    expect(service.nodeEnv).toBe(NodeEnv.Production)
    expect(service.isProduction).toBe(true)
  })

  it('rejects invalid PORT', async () => {
    await expect(build({ PORT: 'nope' })).rejects.toThrow(/Invalid environment/)
  })
})
