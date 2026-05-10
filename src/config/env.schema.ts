import { plainToInstance } from 'class-transformer'
import { IsEnum, IsInt, IsString, Max, Min, validateSync } from 'class-validator'

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvVars {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development

  @IsInt()
  @Min(0)
  @Max(65535)
  PORT: number = 3000

  @IsString()
  LOG_LEVEL: string = 'info'
}

export function validateEnv(raw: Record<string, unknown>): EnvVars {
  const config = plainToInstance(EnvVars, raw, {
    enableImplicitConversion: true,
    exposeDefaultValues: true,
  })

  const errors = validateSync(config, { skipMissingProperties: false })
  if (errors.length > 0) {
    const messages = errors.map(e => Object.values(e.constraints ?? {}).join(', ')).join('; ')
    throw new Error(`Invalid environment: ${messages}`)
  }

  return config
}
