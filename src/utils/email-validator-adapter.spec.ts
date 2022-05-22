import { EmailValidatorAdapter } from './emailValidator'
import validator from 'validator'

jest.mock('validator', () => ({
  isEmail (): Boolean {
    return true
  }
}))

describe('Email validator Adapter', () => {
  test('Should return false if validator returns false', async () => {
    const sut = new EmailValidatorAdapter()
    jest.spyOn(validator, 'isEmail').mockReturnValueOnce(false)
    const isValid = await sut.isValid('invalid_email@mail.com')
    expect(isValid).toBe(false)
  })

  test('Should return true if validator returns true', async () => {
    const sut = new EmailValidatorAdapter()
    const isValid = await sut.isValid('invalid_email@mail.com')
    expect(isValid).toBe(true)
  })

  test('Should call validator with correct email', async () => {
    const sut = new EmailValidatorAdapter()
    const isEmailSpy = jest.spyOn(validator, 'isEmail')
    await sut.isValid('any_email@mail.com')
    expect(isEmailSpy).toHaveBeenCalledWith('any_email@mail.com')
  })
})
