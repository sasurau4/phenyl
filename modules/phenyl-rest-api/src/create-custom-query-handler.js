// @flow
import type {
  CustomParams,
  CustomResult,
  CustomQuery,
  CustomQueryHandler,
  CustomQueryMap,
  CustomQueryDefinitions,
  CustomQueryResult,
  Session,
} from 'phenyl-interfaces'

export class CustomQueryHandlerCreator<QM: CustomQueryMap> {
  static create(queryDefinitions: CustomQueryDefinitions<QM>): CustomQueryHandler<QM> {
    return function customQueryHandler<N: $Keys<QM>>(query: CustomQuery<N, CustomParams<QM, N>>, session: ?Session): Promise<CustomQueryResult<CustomResult<QM, N>>> {
      const { name } = query
      const definition = queryDefinitions[name]
      if (definition == null || typeof definition.execution !== 'function') {
        throw new Error(`No execution function found for custom query named "${name}".`)
      }
      // $FlowIssue(?)
      return definition.execution(query, session)
    }
  }
}

const CQHC: Class<CustomQueryHandlerCreator<*>> = CustomQueryHandlerCreator
export const createCustomQueryHandler = CQHC.create
