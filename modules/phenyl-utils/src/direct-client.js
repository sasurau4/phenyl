// @flow
import {
  PhenylRestApiClient,
} from './phenyl-rest-api-client.js'

import type {
  RestApiHandler,
  RequestData,
  ResponseData,
  TypeMap,
} from 'phenyl-interfaces'

/**
 * Client to access to the given RestApiHandler directly.
 */
export class PhenylRestApiDirectClient<TM: TypeMap> extends PhenylRestApiClient<TM> {
  restApiHandler: RestApiHandler<TM>

  constructor(restApiHandler: RestApiHandler<TM>) {
    super()
    this.restApiHandler = restApiHandler
  }

  /**
   * @override
   * Access to PhenylRestApi directly.
   */
  async handleRequestData(reqData) {
    return this.restApiHandler.handleRequestData(reqData)
  }
}
