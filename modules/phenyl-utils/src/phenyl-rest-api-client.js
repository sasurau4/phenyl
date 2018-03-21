// @flow
import {
  createServerError
} from './create-error.js'

import type {
  RestApiClient,
  AuthCommandMap,
  CustomQuery,
  CustomQueryMap,
  CustomQueryResult,
  CustomCommand,
  CustomCommandMap,
  CustomCommandResult,
  DeleteCommand,
  DeleteCommandResult,
  EntityMap,
  MultiValuesCommandResult,
  GetCommandResult,
  Id,
  IdQuery,
  IdsQuery,
  IdUpdateCommand,
  IdUpdateCommandResult,
  MultiInsertCommand,
  MultiInsertCommandResult,
  MultiUpdateCommandResult,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  PreEntity,
  PullQuery,
  PullQueryResult,
  PushCommand,
  PushCommandResult,
  RequestData,
  ResponseData,
  QueryResult,
  SessionClient,
  SingleInsertCommand,
  SingleInsertCommandResult,
  SingleQueryResult,
  MultiUpdateCommand,
  WhereQuery,
} from 'phenyl-interfaces'

type CustomParams<T: CustomQueryMap | CustomCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'params'>
type CustomResult<T: CustomQueryMap | CustomCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'result'>
type AuthCredentials<T: AuthCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'credentials'>
type AuthOptions<T: AuthCommandMap, N: $Keys<T>> = $ElementType<$ElementType<T, N>, 'options'>

/**
 * @abstract
 * Client to access to PhenylRestApi.
 *
 * (Query | Command) + sessionId => RequestData => ResponseData => (QueryResult | CommandResult | Error)
 *                                  ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *                                     This part is abstract.
 *
 * Child classes must implements handleRequestData(reqData: RequestData) => Promise<ResponseData>
 * For example, PhenylHttpClient is the child and its "handleRequestData()" is to access to PhenylRestApi via HttpServer.
 * Also, PhenylRestApiDirectClient is the direct client which contains PhenylRestApi instance.
 */
export class PhenylRestApiClient<M: EntityMap, AM: AuthCommandMap, QM: CustomQueryMap, CM: CustomCommandMap> implements RestApiClient<M, AM, QM, CM> {

  /**
   * @abstract
   */
  async handleRequestData(reqData: RequestData): Promise<ResponseData> { // eslint-disable-line no-unused-vars
    throw new Error('No implementation')
  }

  /**
   *
   */
  async find<N: $Keys<M>>(query: WhereQuery<N>, sessionId?: ?Id): Promise<QueryResult<$ElementType<M, N>>> {
    const reqData = { method: 'find', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'find') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async findOne<N: $Keys<M>>(query: WhereQuery<N>, sessionId?: ?Id): Promise<SingleQueryResult<$ElementType<M, N>>> {
    const reqData = { method: 'findOne', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'findOne') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async get<N: $Keys<M>>(query: IdQuery<N>, sessionId?: ?Id): Promise<SingleQueryResult<$ElementType<M, N>>> {
    const reqData = { method: 'get', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'get') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async getByIds<N: $Keys<M>>(query: IdsQuery<N>, sessionId?: ?Id): Promise<QueryResult<$ElementType<M, N>>> {
    const reqData = { method: 'getByIds', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'getByIds') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async pull<N: $Keys<M>>(query: PullQuery<N>, sessionId?: ?Id): Promise<PullQueryResult<$ElementType<M, N>>> {
    const reqData = { method: 'pull', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'pull') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertOne<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<SingleInsertCommandResult> {
    const reqData = { method: 'insertOne', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertOne') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<MultiInsertCommandResult> {
    const reqData = { method: 'insertMulti', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertMulti') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertAndGet<N: $Keys<M>>(command: SingleInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<GetCommandResult<$ElementType<M, N>>> {
    const reqData = { method: 'insertAndGet', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGet') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async insertAndGetMulti<N: $Keys<M>>(command: MultiInsertCommand<N, PreEntity<$ElementType<M, N>>>, sessionId?: ?Id): Promise<MultiValuesCommandResult<$ElementType<M, N>, *>> {
    const reqData = { method: 'insertAndGetMulti', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'insertAndGetMulti') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateById<N: $Keys<M>>(command: IdUpdateCommand<N>, sessionId?: ?Id): Promise<IdUpdateCommandResult> {
    const reqData = { method: 'updateById', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateById') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateMulti<N: $Keys<M>>(command: MultiUpdateCommand<N>, sessionId?: ?Id): Promise<MultiUpdateCommandResult<*>> {
    const reqData = { method: 'updateMulti', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateMulti') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateAndGet<N: $Keys<M>>(command: IdUpdateCommand<N>, sessionId?: ?Id): Promise<GetCommandResult<$ElementType<M, N>>> {
    const reqData = { method: 'updateAndGet', payload: command, sessionId}
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndGet') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async updateAndFetch<N: $Keys<M>>(command: MultiUpdateCommand<N>, sessionId?: ?Id): Promise<MultiValuesCommandResult<$ElementType<M, N>, *>> {
    const reqData = { method: 'updateAndFetch', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'updateAndFetch') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }
  /**
   *
   */
  async push<N: $Keys<M>>(command: PushCommand<N>, sessionId?: ?Id): Promise<PushCommandResult<$ElementType<M, N>>> {
    const reqData = { method: 'push', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'push') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async delete<N: $Keys<M>>(command: DeleteCommand<N>, sessionId?: ?Id): Promise<DeleteCommandResult> {
    const reqData = { method: 'delete', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'delete') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async runCustomQuery<N: $Keys<QM>>(query: CustomQuery<N, CustomParams<QM, N>>, sessionId?: ?Id): Promise<CustomQueryResult<CustomResult<QM, N>>> {
    const reqData = { method: 'runCustomQuery', payload: query, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomQuery') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async runCustomCommand<N: $Keys<CM>>(command: CustomCommand<N, CustomParams<CM, N>>, sessionId?: ?Id): Promise<CustomCommandResult<CustomResult<CM, N>>> {
    const reqData = { method: 'runCustomCommand', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'runCustomCommand') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async login<N: $Keys<M> & $Keys<AM>>(command: LoginCommand<N, AuthCredentials<AM, N>, AuthOptions<AM, N>>, sessionId?: ?Id): Promise<LoginCommandResult<$ElementType<M, N>>> {
    const reqData = { method: 'login', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'login') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   *
   */
  async logout<N: $Keys<M> & $Keys<AM>>(command: LogoutCommand<N>, sessionId?: ?Id): Promise<LogoutCommandResult> {
    const reqData = { method: 'logout', payload: command, sessionId }
    const resData = await this.handleRequestData(reqData)
    if (resData.type === 'logout') return resData.payload
    throw createServerError(resData.type === 'error' ? resData.payload : `Unexpected response type "${resData.type}".`)
  }

  /**
   * Create session client.
   * RestApiClient cannot create SessionClient.
   */
  createSessionClient(): SessionClient {
    throw new Error('Cannot create SessionClient from RestApiClient.')
  }
}
