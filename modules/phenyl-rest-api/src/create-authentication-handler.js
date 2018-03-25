// @flow
import type {
  AuthCommandMapOf,
  AuthenticationHandler,
  AuthenticationResult,
  CredentialsOf,
  EntityMapOf,
  LoginCommand,
  OptionsOf,
  Session,
  TypeMap,
  UserDefinitions,
  UserEntityNameOf,
} from 'phenyl-interfaces'


export class AuthenticationHandlerCreator<TM: TypeMap> {

  static create<N: UserEntityNameOf<TM>>(userEntityDefinitions: UserDefinitions<EntityMapOf<TM>, AuthCommandMapOf<TM>>): AuthenticationHandler<TM> {
    return async function authenticationHandler(
      loginCommand: LoginCommand<N, CredentialsOf<TM, N>, OptionsOf<TM, N>>,
      session: ?Session
    ) :Promise<AuthenticationResult> {
      const { entityName } = loginCommand
      const definition = userEntityDefinitions[entityName]
      if (definition == null || typeof definition.authentication !== 'function') {
        throw new Error(`No authentication function found for user entity named "${entityName}".`)
      }
      return definition.authentication(loginCommand, session)
    }
  }
}

const AHC: Class<AuthenticationHandlerCreator<*>> = AuthenticationHandlerCreator

export const createAuthenticationHandler = AHC.create
