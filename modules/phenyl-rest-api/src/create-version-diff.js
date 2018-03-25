// @flow

import type {
  RequestData,
  ResponseData,
  VersionDiff,
  IdUpdateCommand,
  IdUpdateCommandResult,
  MultiUpdateCommand,
  GetCommandResult,
  PushCommand,
  PushCommandResult,
  MultiValuesCommandResult,
  TypeMap,
  EntityNameOf,
  EntityOf,
} from 'phenyl-interfaces'

export class VersionDiffCreator<TM: TypeMap> {

  static create<
    EN: string,
    QN: string,
    CN: string,
    AN: string,
    ReqData: RequestData<TM, EN, QN, CN, AN>
  >(reqData: ReqData, resData: ResponseData<TM, EN, QN, CN, AN, ReqData>): Array<VersionDiff> {
    if (resData.type === 'error') return []

    switch (reqData.method) {
      case 'updateById': {
        // $FlowIssue(resData-has-versionId)
        const result: CommandResult = resData.payload
        const versionDiff = this.createVersionDiffByIdUpdateCommand(reqData.payload, result)
        return versionDiff ? [versionDiff] : []
      }

      case 'updateMulti': {
        // $FlowIssue(resData.payload-is-MultiValuesCommandResult)
        const result: MultiValuesCommandResult = resData.payload
        // $FlowIssue(null-value-is-filtered)
        return this.createVersionDiffByMultiUpdateCommand(reqData.payload, result).filter(v => v != null)
      }

      case 'updateAndGet': {
        // $FlowIssue(resData.payload-is-GetCommandREsult)
        const versionDiff = this.createVersionDiffByIdUpdateCommand(reqData.payload, resData.payload)
        return versionDiff ? [versionDiff] : []
      }

      case 'updateAndFetch': {
        // $FlowIssue(resData.payload-is-MultiValuesCommandResult)
        const result: MultiValuesCommandResult = resData.payload
        // $FlowIssue(null-value-is-filtered)
        return this.createVersionDiffByMultiUpdateCommand(reqData.payload, result).filter(v => v)
      }

      case 'push': {
        // $FlowIssue(resData.payload-is-PushCommandResult)
        const result: PushCommandResult = resData.payload
        const versionDiff = this.createVersionDiffByPushCommand(reqData.payload, result)
        return versionDiff ? [versionDiff] : []
      }
      default:
        return []
    }
  }

  static createVersionDiffByIdUpdateCommand<
    EN: EntityNameOf<TM>
  >(command: IdUpdateCommand<EN>, result: IdUpdateCommandResult<EN> | GetCommandResult<EntityOf<TM, EN>>): ?VersionDiff {
    const { versionId, prevVersionId } = result
    if (versionId && prevVersionId) {
      const { entityName, id, operation } = command
      return { entityName, id, operation, versionId, prevVersionId }
    }
    return null
  }

  static createVersionDiffByMultiUpdateCommand<
    EN: EntityNameOf<TM>
  >(command: MultiUpdateCommand<N>, result: MultiValuesCommandResult<EntityOf<TM, EN>>): Array<?VersionDiff> {
    const { versionsById, prevVersionsById } = result
    if (!versionsById || !prevVersionsById) return []

    const { entityName, operation } = command
    // $FlowIssue(returns-non-null-value-with-filter(v => v))
    return Object.keys(versionsById).map(entityId => {
      const versionId = versionsById[entityId]
      const prevVersionId = prevVersionsById[entityId]
      if (versionId && prevVersionId) {
        return { entityName, id: entityId, operation, versionId, prevVersionId }
      }
      return null
    })
  }

  static createVersionDiffByPushCommand<
    EN: EntityNameOf<TM>
  >(command: PushCommand<EN>, result: PushCommandResult<EntityOf<TM, EN>>): ?VersionDiff {
    const { versionId, prevVersionId, newOperation } = result
    if (versionId && prevVersionId) {
      const { entityName, id } = command
      return { entityName, id, operation: newOperation, versionId, prevVersionId }
    }
    return null
  }
}

const VDC: Class<VersionDiffCreator<*>> = VersionDiffCreator

export const createVersionDiff = VDC.create
