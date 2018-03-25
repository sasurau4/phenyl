// @flow
import { AuthenticationHandlerCreator } from './create-authentication-handler.js'
import { AuthorizationHandlerCreator } from './create-authorization-handler.js'
import { CustomQueryHandlerCreator } from './create-custom-query-handler.js'
import { NormalizationHandlerCreator } from './create-normalization-handler.js'
import { CustomCommandHandlerCreator } from './create-custom-command-handler.js'
import { ExecutionWrapperCreator } from './create-execution-wrapper.js'
import { ValidationHandlerCreator } from './create-validation-handler.js'

import type {
  NormalizedFunctionalGroup,
  HandlerParams,
} from 'phenyl-interfaces'

export class ParamsByFunctionalGroupCreator<TM: TypeMap> {
  static create(fg: NormalizedFunctionalGroup<TM>): HandlerParams {
    const authenticationHandler = AuthenticationHandlerCreator.create(fg.users)
    const authorizationHandler = AuthorizationHandlerCreator.create(fg)
    const normalizationHandler = NormalizationHandlerCreator.create(fg)
    const validationHandler = ValidationHandlerCreator.create(fg)
    const customQueryHandler = CustomQueryHandlerCreator.create(fg.customQueries)
    const customCommandHandler = CustomCommandHandlerCreator.create(fg.customCommands)
    const executionWrapper = ExecutionWrapperCreator.create(fg)

    return {
      authenticationHandler,
      authorizationHandler,
      normalizationHandler,
      validationHandler,
      customQueryHandler,
      customCommandHandler,
      executionWrapper,
    }
  }
}

const PBFGC: Class<ParamsByFunctionalGroupCreator<*>> = ParamsByFunctionalGroupCreator
export const createParamsByFunctionalGroup = PBFGC.create
