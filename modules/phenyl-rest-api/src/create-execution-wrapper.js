// @flow
import type {
  RestApiExecution,
  ExecutionWrapper,
  NormalizedFunctionalGroup,
  RequestData,
  ResponseData,
  Session,
} from 'phenyl-interfaces'

/**
 *
 */
export function createExecutionWrapper(fg: NormalizedFunctionalGroup): ExecutionWrapper {
  const { users, nonUsers } = fg
  return async function executionWrapper(reqData: RequestData, session: ?Session, execution: RestApiExecution) :Promise<ResponseData> {
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
      case 'delete':
      case 'login':
      case 'logout': {
        const data = reqData.payload
        const entityDefinition = nonUsers[data.entityName] || users[data.entityName]
        if (entityDefinition == null) throw new Error(`Unkown entity name "${data.entityName}".`)
        if (entityDefinition.wrapExecution == null) return execution(reqData, session)
        return entityDefinition.wrapExecution(reqData, session, execution)
      }

      case 'runCustomQuery':
      case 'runCustomCommand':
        return execution(reqData, session)

      default:
        throw new Error(`Unknown method "${method}" given in RequestData.`)
    }
  }
}
