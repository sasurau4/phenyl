// @flow
import type {
  CustomQueryNameOf,
  ValidationHandler,
  NormalizedFunctionalGroup,
  RequestData,
  Session,
  TypeMap,
} from 'phenyl-interfaces'

function assertValidationFunction(fn: any, name: string, methodName: string) {
  if (typeof fn !== 'function') throw new Error(`No validation function found for ${name} (methodName = ${methodName})`)
}

export class ValidationHandlerCreator<TM: TypeMap> {
  static create(fg: NormalizedFunctionalGroup<TM>): ValidationHandler<TM> {
    const { users, nonUsers, customQueries, customCommands } = fg
    return async function validationHandler<
      EN: string,
      QN: CustomQueryNameOf<TM>,
      CN: string,
      AN: string,
    >(reqData: RequestData<TM, EN, QN, CN, AN>, session: ?Session) :Promise<void> {
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
          assertValidationFunction(entityDefinition.validation, data.entityName, method)
          // $FlowIssue(?)
          return entityDefinition.validation(reqData, session)
        }

        case 'runCustomQuery': {
          const { payload } = reqData
          const customQueryDefinition = customQueries[payload.name]
          if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
          assertValidationFunction(customQueryDefinition.validation, payload.name, method)
          return customQueryDefinition.validation(payload, session)
        }

        case 'runCustomCommand': {
          const { payload } = reqData
          const customCommandDefinition = customCommands[payload.name]
          if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
          assertValidationFunction(customCommandDefinition.validation, payload.name, method)
          return customCommandDefinition.validation(payload, session)
        }

        case 'login':
        case 'logout': {
          const { payload } = reqData
          // $FlowIssue(?)
          const userEntityDefinition = users[payload.entityName]
          if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
          assertValidationFunction(userEntityDefinition.validation, payload.entityName, method)
          return userEntityDefinition.validation(reqData, session)
        }
        default:
          throw new Error(`Unknown method "${method}" given in RequestData.`)
      }
    }
  }
}

const VHC: Class<ValidationHandlerCreator<*>> = ValidationHandlerCreator

export const createValidationHandler = VHC.create
