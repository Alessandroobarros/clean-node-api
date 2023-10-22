import { AddAccountModel } from '../../../../domain/usecases/add-account'
import { AccountModel } from '../../../usecases/add-Account/db-add-account-protocols'

export interface AddAccountRepository {
  add: (accountData: AddAccountModel) => Promise<AccountModel>
}
