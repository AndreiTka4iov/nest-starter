import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'

import { AppModule } from '../src/app.module'

describe('Health (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /health returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('GET /ready returns ok', async () => {
    const res = await request(app.getHttpServer()).get('/ready')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })

  it('exposes x-request-id header', async () => {
    const res = await request(app.getHttpServer()).get('/health')
    expect(res.headers['x-request-id']).toBeDefined()
  })
})
