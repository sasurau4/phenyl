// @flow
import type {
  AuthorizationHandler,
  NormalizedFunctionalGroup,
  RequestDataOf,
  Session,
  TypeMap,
} from 'phenyl-interfaces'

function assertAuthorizationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No authorization function found for ${name} (methodName = ${methodName})`)
}

export default class AuthorizationHandlerCreator<TM: TypeMap> {
  static create(fg: NormalizedFunctionalGroup<TM>): AuthorizationHandler<TM> {
    const { users, nonUsers, customQueries, customCommands } = fg
    return async function authorizationHandler(reqData: RequestDataOf<TM>, session: ?Session) :Promise<boolean> {
      const { method } = reqData
      switch (reqData.method) {
        case 'find':
        case 'findOne':
        case 'get':
        case 'getByIds':
        case 'pull':
        case 'insertOne':
        case 'insertMulti':
        case 'insertAndGet':
        case 'insertAndGetMulti':
        case 'updateById':
        case 'updateMulti':
        case 'updateAndGet':
        case 'updateAndFetch':
        case 'push':
        case 'delete': {
          const data = reqData.payload
          const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
          // $FlowIssue(?)
          if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
          // $FlowIssue(?)
          assertAuthorizationFunction(entityDefinition.authorization, data.entityName, method)
          // $FlowIssue(?)
          return entityDefinition.authorization(reqData, session)
        }

        case 'runCustomQuery': {
          const { payload } = reqData
          const customQueryDefinition = customQueries[payload.name]
          if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
          assertAuthorizationFunction(customQueryDefinition.authorization, payload.name, method)
          // $FlowIssue(?)
          return customQueryDefinition.authorization(payload, session)
        }

        case 'runCustomCommand': {
          const { payload } = reqData
          const customCommandDefinition = customCommands[payload.name]
          if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
          assertAuthorizationFunction(customCommandDefinition.authorization, payload.name, method)
          // $FlowIssue(?)
          return customCommandDefinition.authorization(payload, session)
        }

        case 'logout':
        case 'login': {
          const { payload } = reqData
          const userEntityDefinition = users[payload.entityName]
          // $FlowIssue(?)
          if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
          // $FlowIssue(?)
          assertAuthorizationFunction(userEntityDefinition.authorization, payload.entityName, method)
          // $FlowIssue(?)
          return userEntityDefinition.authorization(reqData, session)
        }
        default:
          throw new Error(`Unknown method "${method}" given in RequestData.`)
      }
    }
  }
}

const AHC: Class<AuthorizationHandlerCreator<*>> = AuthorizationHandlerCreator
export const createAuthorizationHandler = AHC.create
