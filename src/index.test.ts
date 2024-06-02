import { Hono } from 'hono'
import { useCorrelationId } from '../src'

describe('useCorrelationId middleware', () => {
    const app = new Hono()

    app.use('/corr/*', useCorrelationId())
    app.get('/corr/id', (c) => c.text('default id'))

    app.use('/custom/*', useCorrelationId({
        header: 'X-Mock-Id',
        generator: () => 'Buffoon'
    }))
    app.get('/custom/id', (c) => c.text('custom id'))

    app.use('/validator/*', useCorrelationId({
        validator: (c) => c === 'validate'
    }))
    app.get('/validator/validate', (c) => c.text('validate'))

    it('Should validate to v4 UUID.', async () => {
        const res = await app.request('http://localhost/corr/id')
        expect(res).not.toBeNull()
        expect(res.status).toBe(200)
        expect(res.headers.get('x-correlation-id')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    })

    it('Should validate to custom header and use custom generator.', async () => {
        const res = await app.request('http://localhost/custom/id')
        expect(res).not.toBeNull()
        expect(res.status).toBe(200)
        expect(res.headers.get('X-Mock-Id')).toBe('Buffoon')
    })

    it('Should ignore the user set correlation id.', async () => {
        const req = new Request('http://localhost/validator/validate', {
            headers: {
                'X-Correlation-Id': 'Invalid'
            }
        })
        const res = await app.request(req)
        console.log(res.headers.get('X-Correlation-Id'))
        expect(res).not.toBeNull()
        expect(res.status).toBe(200)
        expect(res.headers.get('X-Correlation-Id')).not.toBe('validate')
    })
})