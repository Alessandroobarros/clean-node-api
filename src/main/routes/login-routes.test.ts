import request from 'supertest'
import app from '../config/app'
import { MongoHelper } from '../../infra/db/mongodb/helpers/helper-mongo'
import { Collection } from 'mongodb'
import { hash } from 'bcrypt'

let accoutCollection: Collection

describe('Login Routes', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accoutCollection = await MongoHelper.getCollection('accounts')
    await accoutCollection.deleteMany({})
  })

  describe('POST /signup', () => {
    test('Should return 200 on signup', async () => {
      await request(app)
        .post('/api/signup')
        .send({
          name: 'Alessandro',
          email: 'Alessandro.teste@gmail.com',
          password: '123',
          passwordConfirmation: '123'
        })
        .expect(200)
    })
  })

  describe('POST /login', () => {
    test('Should return 200 on login', async () => {
      const password = await hash('123', 12)

      await accoutCollection.insertOne({
        name: 'Alessandro',
        email: 'Alessandro.teste@gmail.com',
        password
      })

      await request(app)
        .post('/api/login')
        .send({
          email: 'alessandro.teste@gmail.com',
          password: '123'
        })
        .expect(200)
    })

    test('Should return 401 on login', async () => {
      await request(app)
        .post('/api/login')
        .send({
          email: 'alessandro.teste@gmail.com',
          password: '123'
        })
        .expect(401)
    })
  })
})
