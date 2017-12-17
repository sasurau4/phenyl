// @flow
import type {
  ValidationHandler,
  NormalizedFunctionalGroup,
  RequestData,
  Session,
} from 'phenyl-interfaces'

/**
 *
 */
export function createValidationHandler(fg: NormalizedFunctionalGroup): ValidationHandler {
  const { users, nonUsers, customQueries, customCommands } = fg
  return async function validationHandler(reqData: RequestData, session: ?Session) :Promise<void> {
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
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        if (entityDefinition.validation == null) return
        return entityDefinition.validation(reqData, session)
      }

      case 'runCustomQuery': {
        const { payload } = reqData
        const customQueryDefinition = customQueries[payload.name]
        if (customQueryDefinition == null) throw new Error(`Unknown custom query name "${payload.name}".`)
        if (customQueryDefinition.validation == null) return
        return customQueryDefinition.validation(payload, session)
      }

      case 'runCustomCommand': {
        const { payload } = reqData
        const customCommandDefinition = customCommands[payload.name]
        if (customCommandDefinition == null) throw new Error(`Unknown custom command name "${payload.name}".`)
        if (customCommandDefinition.validation == null) return
        return customCommandDefinition.validation(payload, session)
      }

      case 'login':
      case 'logout': {
        const { payload } = reqData
        const userEntityDefinition = users[payload.entityName]
        if (userEntityDefinition == null) throw new Error(`Unknown entity name "${payload.entityName}".`)
        if (userEntityDefinition.validation == null) return
        return userEntityDefinition.validation(reqData, session)
      }
      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
