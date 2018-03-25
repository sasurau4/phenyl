// @flow
import type {
  CustomParams,
  CustomResult,
  CustomCommand,
  CustomCommandHandler,
  CustomCommandMap,
  CustomCommandDefinitions,
  CustomCommandResult,
  Session,
} from 'phenyl-interfaces'


export class CustomCommandHandlerCreator<CM: CustomCommandMap> {
  static create(commandDefinitions: CustomCommandDefinitions<CM>): CustomCommandHandler<CM> {
    return function customCommandHandler<
      N: $Keys<CM>
    >(command: CustomCommand<N, CustomParams<CM, N>>, session: ?Session): Promise<CustomCommandResult<CustomResult<CM, N>>> {
      const { name } = command
      const definition = commandDefinitions[name]
      if (definition == null || typeof definition.execution !== 'function') {
        throw new Error(`No execution function found for custom command named "${name}".`)
      }
      // $FlowIssue(?)
      return definition.execution(command, session)
    }
  }
}

const CCHC: Class<CustomCommandHandlerCreator<*>> = CustomCommandHandlerCreator
export const createCustomCommandHandler = CCHC.create
