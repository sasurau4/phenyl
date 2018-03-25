// @flow
import {
  assertValidRequestData,
  createServerError,
  PhenylRestApiDirectClient
} from 'phenyl-utils/jsnext'

import DefaultHandlers from './default-handlers.js'

import {
  ParamsByFunctionalGroupCreator,
} from './create-params-by-functional-group.js'

import {
  VersionDiffCreator,
} from './create-version-diff.js'

import type {
  AuthenticationHandler,
  AuthorizationHandler,
  CredentialsOf,
  CustomQueryHandler,
  CustomCommandHandler,
  EntityClient,
  EntityOf,
  EntityMapOf,
  ExecutionWrapper,
  FunctionalGroup,
  LoginCommand,
  LoginCommandResult,
  LogoutCommand,
  LogoutCommandResult,
  NormalizedFunctionalGroup,
  OptionsOf,
  RequestDataOf,
  RequestNormalizationHandler,
  ResponseDataOf,
  RestApiHandler,
  Session,
  SessionClient,
  TypeMap,
  UserEntityNameOf,
  ValidationHandler,
  VersionDiffPublisher,
} from 'phenyl-interfaces'

export type PhenylRestApiParams<TM: TypeMap> = {
  client: EntityClient<EntityMapOf<TM>>,
  sessionClient?: SessionClient,
  authorizationHandler?: AuthorizationHandler<TM>,
  normalizationHandler?: RequestNormalizationHandler<TM>,
  validationHandler?: ValidationHandler<TM>,
  customQueryHandler?: CustomQueryHandler<TM>,
  customCommandHandler?: CustomCommandHandler<TM>,
  authenticationHandler?: AuthenticationHandler<TM>,
  executionWrapper?: ExecutionWrapper<TM>,
  versionDiffPublisher?: VersionDiffPublisher,
}

/**
 *
 */
export class PhenylRestApi<TM: TypeMap> implements RestApiHandler<TM> {
  client: EntityClient<EntityMapOf<TM>>
  sessionClient: SessionClient
  authorizationHandler: AuthorizationHandler<TM>
  normalizationHandler: RequestNormalizationHandler<TM>
  validationHandler: ValidationHandler<TM>
  customQueryHandler: CustomQueryHandler<TM>
  customCommandHandler: CustomCommandHandler<TM>
  authenticationHandler: AuthenticationHandler<TM>
  executionWrapper: ExecutionWrapper<TM>
  versionDiffPublisher: ?VersionDiffPublisher

  constructor(params: PhenylRestApiParams<TM>) {
    const DH: Class<DefaultHandlers<TM>> = DefaultHandlers
    const {
      passThroughHandler,
      noOperationHandler,
      noHandler,
      simpleExecutionWrapper,
      simpleNormalizationHandler,
    } = DH

    this.client = params.client
    this.sessionClient = params.sessionClient || this.createSessionClient()
    // $FlowIssue(TypeMap-is-same)
    this.authorizationHandler = params.authorizationHandler || passThroughHandler
    // $FlowIssue(TypeMap-is-same)
    this.normalizationHandler = params.normalizationHandler || simpleNormalizationHandler
    // $FlowIssue(TypeMap-is-same)
    this.validationHandler = params.validationHandler || noOperationHandler
    // $FlowIssue(TypeMap-is-same)
    this.customQueryHandler = params.customQueryHandler || noHandler
    // $FlowIssue(TypeMap-is-same)
    this.customCommandHandler = params.customCommandHandler || noHandler
    // $FlowIssue(TypeMap-is-same)
    this.authenticationHandler = params.authenticationHandler || noHandler
    // $FlowIssue(TypeMap-is-same)
    this.executionWrapper = params.executionWrapper || simpleExecutionWrapper
    this.versionDiffPublisher = params.versionDiffPublisher
  }

  /**
   * Create instance from FunctionalGroup.
   * "client" params must be set in 2nd argument.
   *
   * @example
   *   const restApiHandler = PhenylRestApi.createFromFunctionalGroup({
   *     customQueries: {}, customCommands: {}, users: {}, nonUsers: {}
   *   }, { client: new PhenylMemoryClient() })
   */
  static createFromFunctionalGroup(fg: FunctionalGroup<TM>, params: PhenylRestApiParams<TM>): PhenylRestApi<TM> {
    const PBFGC: Class<ParamsByFunctionalGroupCreator<TM>> = ParamsByFunctionalGroupCreator
    const fgParams = PBFGC.create(normalizeFunctionalGroup(fg))
    const newParams = Object.assign({}, params, fgParams)
    return new PhenylRestApi(newParams)
  }

  /**
   * @public
   */
  async handleRequestData(reqData: RequestDataOf<TM>): Promise<ResponseDataOf<TM>> {
    try {
      // 0. Request data validation
      assertValidRequestData(reqData)

      // 1. Get session information
      const session = await this.sessionClient.get(reqData.sessionId)

      // 2. Authorization
      const isAccessible = await this.authorizationHandler(reqData, session)
      if (!isAccessible) {
        // $FlowIssue(valid-response)
        return { type: 'error', payload: createServerError('Authorization Required.', 'Unauthorized') }
      }

      const normalizedReqData = await this.normalizationHandler(reqData, session)

      // 4. Validation
      try {
        await this.validationHandler(normalizedReqData, session)
      }
      catch (validationError) {
        validationError.message = `Validation Failed. ${validationError.mesage}`
        // $FlowIssue(valid-response)
        return { type: 'error', payload: createServerError(validationError, 'BadRequest') }
      }

      // 5. Execution
      const resData = await this.executionWrapper(normalizedReqData, session, this.execute.bind(this))

      // 5. Publish VersionDiff (Side-Effect)
      this.publishVersionDiff(normalizedReqData, resData)

      return resData
    }
    catch (e) {
      return { type: 'error', payload: createServerError(e) }
    }
  }

  /**
   * @public
   */
  createDirectClient(): PhenylRestApiDirectClient {
    return new PhenylRestApiDirectClient(this)
  }

  /**
   *
   */
  async execute(reqData: RequestDataOf<TM>, session: ?Session): Promise<ResponseDataOf<TM>> {
    switch (reqData.method) {
      case 'find':
        // $FlowIssue(valid-response)
        return { type: 'find', payload: await this.client.find(reqData.payload) }

      case 'findOne':
        // $FlowIssue(valid-response)
        return { type: 'findOne', payload: await this.client.findOne(reqData.payload) }

      case 'get':
        // $FlowIssue(valid-response)
        return { type: 'get', payload: await this.client.get(reqData.payload) }

      case 'getByIds':
        // $FlowIssue(valid-response)
        return { type: 'getByIds', payload: await this.client.getByIds(reqData.payload) }

      case 'pull':
        // $FlowIssue(valid-response)
        return { type: 'pull', payload: await this.client.pull(reqData.payload) }

      case 'insertOne':
        // $FlowIssue(valid-response)
        return { type: 'insertOne', payload: await this.client.insertOne(reqData.payload) }

      case 'insertMulti':
        // $FlowIssue(valid-response)
        return { type: 'insertMulti', payload: await this.client.insertMulti(reqData.payload) }

      case 'insertAndGet':
        // $FlowIssue(valid-response)
        return { type: 'insertAndGet', payload: await this.client.insertAndGet(reqData.payload) }

      case 'insertAndGetMulti':
        // $FlowIssue(valid-response)
        return { type: 'insertAndGetMulti', payload: await this.client.insertAndGetMulti(reqData.payload) }

      case 'updateById':
        // $FlowIssue(valid-response)
        return { type: 'updateById', payload: await this.client.updateById(reqData.payload) }

      case 'updateMulti':
        // $FlowIssue(valid-response)
        return { type: 'updateMulti', payload: await this.client.updateMulti(reqData.payload) }

      case 'updateAndGet':
        // $FlowIssue(valid-response)
        return { type: 'updateAndGet', payload: await this.client.updateAndGet(reqData.payload) }

      case 'updateAndFetch':
        // $FlowIssue(valid-response)
        return { type: 'updateAndFetch', payload: await this.client.updateAndFetch(reqData.payload) }

      case 'push':
        // $FlowIssue(valid-response)
        return { type: 'push', payload: await this.client.push(reqData.payload) }

      case 'delete':
        // $FlowIssue(valid-response)
        return { type: 'delete', payload: await this.client.delete(reqData.payload) }

      case 'runCustomQuery':
        // $FlowIssue(valid-response)
        return { type: 'runCustomQuery', payload: await this.customQueryHandler(reqData.payload, session) }

      case 'runCustomCommand':
        // $FlowIssue(valid-response)
        return { type: 'runCustomCommand', payload: await this.customCommandHandler(reqData.payload, session) }

      case 'login':
        // $FlowIssue(valid-response)
        return { type: 'login', payload: await this.login(reqData.payload, session) }

      case 'logout':
        // $FlowIssue(valid-response)
        return { type: 'logout', payload: await this.logout(reqData.payload, session) }

      default: {
        // $FlowIssue(valid-response)
        return { type: 'error', payload: createServerError('Invalid method name.', 'NotFound') }
      }
    }
  }

  /**
   * create Session
   */
  async login<N: UserEntityNameOf<TM>>(loginCommand: LoginCommand<N, CredentialsOf<TM, N>, OptionsOf<TM, N>>, session: ?Session): Promise<LoginCommandResult<EntityOf<TM, N>>> {
    const result = await this.authenticationHandler(loginCommand, session)
    const newSession = await this.sessionClient.create(result.preSession)
    return {
      ok: 1,
      user: result.user,
      versionId: result.versionId,
      session: newSession
    }
  }

  /**
   * Publish entity version diffs.
   */
  publishVersionDiff(reqData: RequestDataOf<TM>, resData: ResponseDataOf<TM>) {
    const VDC: Class<VersionDiffCreator<TM>> = VersionDiffCreator
    const { versionDiffPublisher } = this
    if (versionDiffPublisher == null) return
    const versionDiffs = VDC.create(reqData, resData)
    for (const versionDiff of versionDiffs) {
      versionDiffPublisher.publishVersionDiff(versionDiff)
    }
  }

  /**
   * delete Session by sessionId if exists.
   */
  async logout<N: UserEntityNameOf<TM>>(logoutCommand: LogoutCommand<N>, session: ?Session): Promise<LogoutCommandResult> { // eslint-disable-line no-unused-vars
    const { sessionId } = logoutCommand
    const result = await this.sessionClient.delete(sessionId)
    // sessionId not found
    if (!result) {
      throw createServerError('sessionId not found', 'BadRequest')
    }
    return { ok: 1 }
  }

  /**
   * @private
   */
  createSessionClient(): SessionClient {
    try {
      return this.client.createSessionClient()
    }
    catch (e) {
      throw new Error('"sessionClient" is missing in 1st argument of constructor "new PhenylRestApi()". SessionClient can be created by EntityClient ("client" property in argument), but the given client couldn\'t.')
    }
  }
}

function normalizeFunctionalGroup<TM: TypeMap>(fg: FunctionalGroup<TM>): NormalizedFunctionalGroup<TM> {
  return Object.assign({
    users: {},
    nonUsers: {},
    customQueries: {},
    customCommands: {}
  }, fg)
}
