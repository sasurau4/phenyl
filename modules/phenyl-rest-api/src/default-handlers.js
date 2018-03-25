// @flow

import type {
  RequestData,
  ResponseData,
  Session,
  RestApiExecution,
  TypeMap,
} from 'phenyl-interfaces'


export default class DefaultHandlers<TM: TypeMap> {
  /**
   * PassThroughHandler: handler passing through any request,
   * designed to apply for AuthorizationHandler
   */
  static async passThroughHandler() {
    return true
  }

  /**
   * NoOperationHandler.
   * designed to apply for ValidationHandler
   */
  static async noOperationHandler() {
  }

  /**
   * NoHandler: handler always throwing an Error.
   * designed to apply for AuthenticationHandler, CustomCommandHandler and CustomQueryHandler
   */
  static async noHandler(commandOrQuery: *) {
    if (commandOrQuery.credentials != null) {
      throw new Error('No Login Handler is registered.')
    }
    if (commandOrQuery.name != null) {
      throw new Error('No Custom Handler is registered.')
    }
    throw new Error('No Handler is registered to the given request.')
  }

  /**
   * SimpleExecutionWrapper: ExecutionWrapper which simply wraps execution function.
   */
  static async simpleExecutionWrapper<
    EN: string,
    QN: string,
    CN: string,
    AN: string,
    ReqData: RequestData<TM, EN, QN, CN, AN>,
  >(reqData: ReqData, session: ?Session, execution: RestApiExecution<TM>): Promise<ResponseData<TM, EN, QN, CN, AN, ReqData>> {
    return execution(reqData, session)
  }

  /**
   * Handler with no normalization.
   */
  static async simpleNormalizationHandler<
    EN: string,
    QN: string,
    CN: string,
    AN: string,
    ReqData: RequestData<TM, EN, QN, CN, AN>
  >(reqData: $Subtype<ReqData>): Promise<ReqData> {
    return reqData
  }
}

const DH: Class<DefaultHandlers<*>> = DefaultHandlers
export const {
  passThroughHandler,
  noOperationHandler,
  noHandler,
  simpleExecutionWrapper,
  simpleNormalizationHandler,
} = DH
