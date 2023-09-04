import { MissingParamError } from '../../errors'
import { badRequest, ok, serverError, unauthorized } from '../../helpers/http/http-helper'
import { HttpRequest, Authentication, Validation, AuthenticationModel } from './login-protocols'
import { LoginController } from './login'

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate (input: any): Error {
      return null
    }
  }
  return new ValidationStub()
}

const makeFakeRequest = (): HttpRequest => ({
  body: {
    email: 'any_email@mail.com',
    password: 'any_password'
  }
})

interface SutTypes {
  sut: LoginController
  autenthicationStub: Authentication
  validationStub: Validation
}

const makeAuthentication = (): Authentication => {
  class AuthenticationStub implements Authentication {
    async auth (authentication: AuthenticationModel): Promise<string> {
      return 'any_token'
    }
  }
  return new AuthenticationStub()
}

const makeSut = (): SutTypes => {
  const validationStub = makeValidation()
  const autenthicationStub = makeAuthentication()
  const sut = new LoginController(validationStub, autenthicationStub)
  return {
    sut,
    autenthicationStub,
    validationStub
  }
}

describe('Login Controller', () => {
  test('Should call authentication with correct values', async () => {
    const { sut, autenthicationStub } = makeSut()
    const authSpy = jest.spyOn(autenthicationStub, 'auth')

    await sut.handle(makeFakeRequest())
    expect(authSpy).toHaveBeenCalledWith({
      email: 'any_email@mail.com',
      password: 'any_password'
    })
  })

  test('Should retun 401 if invalid credentials are provided', async () => {
    const { sut, autenthicationStub } = makeSut()
    jest.spyOn(autenthicationStub, 'auth').mockReturnValueOnce(new Promise(resolve => resolve(null)))

    const htttpResponse = await sut.handle(makeFakeRequest())
    expect(htttpResponse).toEqual(unauthorized())
  })

  test('Should retun 500 if authentication throws', async () => {
    const { sut, autenthicationStub } = makeSut()
    jest.spyOn(autenthicationStub, 'auth').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))

    const htttpResponse = await sut.handle(makeFakeRequest())
    expect(htttpResponse).toEqual(serverError(new Error()))
  })

  test('Should retun 200 if valid credentials are provided', async () => {
    const { sut } = makeSut()

    const htttpResponse = await sut.handle(makeFakeRequest())
    expect(htttpResponse).toEqual(ok({ accessToken: 'any_token' }))
  })

  it('Should call validation with correct values', async () => {
    const { sut, validationStub } = makeSut()
    const validateSpy = jest.spyOn(validationStub, 'validate')
    const httpRequest = makeFakeRequest()
    await sut.handle(httpRequest)
    expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
  })

  it('Should return 400 if validation returns an error', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValue(new MissingParamError('any_field'))
    const httpResponse = await sut.handle(makeFakeRequest())
    expect(httpResponse).toEqual(badRequest(new MissingParamError('any_field')))
  })
})
