import { Collection } from 'mongodb'
import { MongoHelper } from '../helpers/helper-mongo'
import { AccountMongoRepository } from './account-mongo-repository'

let accountCollection: Collection
describe('Account Mongo Repository', () => {
  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  beforeEach(async () => {
    accountCollection = await MongoHelper.getCollection('accounts')
    await accountCollection.deleteMany({})
  })

  const makeSut = (): AccountMongoRepository => {
    return new AccountMongoRepository()
  }
  it('Shoul return and account on add success', async () => {
    const sut = makeSut()
    const account = await sut.add({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    expect(account).toBeTruthy()
  })

  it('Shoul return and account on loadByEmail success', async () => {
    const sut = makeSut()
    await accountCollection.insertOne({
      name: 'any_name',
      email: 'any_email@mail.com',
      password: 'any_password'
    })
    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeTruthy()
  })

  it('Shoul return null if loadByEmail fails', async () => {
    const sut = makeSut()

    const account = await sut.loadByEmail('any_email@mail.com')
    expect(account).toBeFalsy()
  })

  // it('Shoul update the account accessToken on success', async () => {
  //   const sut = makeSut()
  //   const result = await accountCollection.insertOne({
  //     name: 'any_name',
  //     email: 'any_email@mail.com',
  //     password: 'any_password'
  //   })

  //   console.log('RESULT', result)

  //   await sut.updateAccessToken(result.id, 'any_token')
  //   const account = await accountCollection.findOne({ email: 'any_email@mail.com' })
  //   expect(account.accessToken).toBe('any_token')
  // })
})
