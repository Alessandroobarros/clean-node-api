import { InvalidParamError, MissingParamError, UnauthorizedError } from "../../errors"
import { badRequest, ok, serverError, unauthorized } from "../../helpers/http-helper"
import { EmailValidator, HttpRequest, Authentication } from "./login-protocols"
import { LoginController } from "./login"


const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid (email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}

const makeFakeRequest = (): HttpRequest => ({
    body: {
        email: 'any_email@mail.com',
        password: 'any_password'
    }
})


interface SutTypes {
    sut: LoginController
    emailValidatorStub: EmailValidator
    autenthicationStub: Authentication
}

const makeAuthentication = (): Authentication => {
    class AuthenticationStub implements Authentication {
        async auth (email: string, password: string): Promise<string> {
            return 'any_token'
        }
    }
    return new AuthenticationStub()
}

const makeSut = ():SutTypes => {
    const emailValidatorStub = makeEmailValidator()
    const autenthicationStub = makeAuthentication()
    const sut = new LoginController(emailValidatorStub, autenthicationStub)
    return {
        sut,
        emailValidatorStub,
        autenthicationStub
    }
}

describe('Login Controller', () => {
    test('Should return 400 if no email is provider', async () => {
        const { sut } = makeSut()
        const httpRequest = makeFakeRequest()

        delete httpRequest.body.email

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(badRequest(new MissingParamError('email')))
    })

    test('Should return 400 if no password is provider', async () => {
        const { sut } = makeSut()
        const httpRequest = makeFakeRequest()

        delete httpRequest.body.password

        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual(badRequest(new MissingParamError('password')))
    })

    test('Should return 400 if an invalid email is provider', async () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false)


        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')))
    })

    test('Should call email validator with correct email', async () => {
        const { sut, emailValidatorStub } = makeSut()
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid')

        await sut.handle(makeFakeRequest())
        expect(isValidSpy).toHaveBeenCalledWith('any_email@mail.com')
    })

    test('Should return 500 if email validator throws', async () => {
        const { sut, emailValidatorStub } = makeSut()
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
            throw new Error()
        })

        const httpResponse =await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(serverError(new Error()))
    })

    test('Should call authentication with correct values', async () => {
        const { sut, autenthicationStub } = makeSut()
        const authSpy = jest.spyOn(autenthicationStub, 'auth')

        await sut.handle(makeFakeRequest())
        expect(authSpy).toHaveBeenCalledWith('any_email@mail.com', 'any_password')
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
        const { sut} = makeSut()

        const htttpResponse = await sut.handle(makeFakeRequest())
        expect(htttpResponse).toEqual(ok({accessToken: 'any_token'}))
    })
})