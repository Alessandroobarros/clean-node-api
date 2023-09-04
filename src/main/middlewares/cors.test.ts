import request from 'supertest'
import app from '../config/app'

describe('CORS Middleware', () => {
  test('Should enable CORS', async () => {
    app.post('/test_cors', (req, res) => {
      res.send()
    })

    await request(app)
      .get('/test_cors')
      .expect('access-cors-allow-origin', '*')
      .expect('access-cors-allow-methods', '*')
      .expect('access-cors-allow-headers', '*')
  })
})
