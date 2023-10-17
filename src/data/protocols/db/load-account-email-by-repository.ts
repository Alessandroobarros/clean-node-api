import { AccountModel } from '../../usecases/add-Account/db-add-account-protocols'

export interface LoadAccountByEmailRepository {
  loadByEmail: (email: string) => Promise<AccountModel>
}
