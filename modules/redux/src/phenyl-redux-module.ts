import { assign } from 'power-assign/jsnext'
import { randomStringWithTimeStamp } from 'phenyl-utils/jsnext'
import {
  AssignAction,
  AuthCommandMapOf,
  CommitAction,
  RePushAction,
  PushAction,
  PushActionPayload,
  CommitAndPushAction,
  CredentialsOf,
  DeleteAction,
  Entity,
  EntityName,
  EntityMapOf,
  EntityNameOf,
  EntityOf,
  FollowAction,
  FollowAllAction,
  Id,
  IdDeleteCommand,
  IdQuery,
  IdUpdateCommand,
  LocalState,
  LoginAction,
  LoginCommand,
  LogoutAction,
  LogoutCommand,
  OptionsOf,
  PhenylAction,
  PullAction,
  PushAndCommitAction,
  ResolveErrorAction,
  ReplaceAction,
  ResetAction,
  SetSessionAction,
  OnlineAction,
  OfflineAction,
  Session,
  TypeMap,
  UnfollowAction,
  UnsetSessionAction,
  UpdateOperation,
  UseEntitiesAction,
  UserEntityNameOf,
} from 'phenyl-interfaces'
export class PhenylReduxModule<TM extends TypeMap> {
  static createInitialState(): LocalState<EntityMapOf<TM>> {
    return {
      entities: {},
      unreachedCommits: [],
      network: {
        requests: [],
        isOnline: true,
      },
    }
  }
  /**
   * Reducer.
   */

  static phenylReducer(
    state: LocalState<EntityMapOf<TM>> | undefined | null,
    action: PhenylAction<EntityMapOf<TM>, AuthCommandMapOf<TM>>,
  ): LocalState<EntityMapOf<TM>> {
    if (state == null) {
      return this.createInitialState()
    }

    switch (action.type) {
      case 'phenyl/replace':
        return action.payload

      case 'phenyl/reset':
        return this.createInitialState()

      case 'phenyl/assign':
        return assign(state, ...action.payload)

      default:
        return state
    }
  }

  static replace(state: LocalState<EntityMapOf<TM>>): ReplaceAction<EntityMapOf<TM>> {
    return {
      type: 'phenyl/replace',
      payload: state,
      tag: randomStringWithTimeStamp(),
    }
  }

  static useEntities(entityNames: Array<EntityName>): UseEntitiesAction {
    return {
      type: 'phenyl/useEntities',
      payload: entityNames,
      tag: randomStringWithTimeStamp(),
    }
  }

  static reset(): ResetAction {
    return {
      type: 'phenyl/reset',
      tag: randomStringWithTimeStamp(),
    }
  }

  static assign(ops: Array<UpdateOperation>): AssignAction {
    return {
      type: 'phenyl/assign',
      payload: ops,
      tag: randomStringWithTimeStamp(),
    }
  }

  static setSession(session: Session, user?: Entity | undefined | null): SetSessionAction {
    return {
      type: 'phenyl/setSession',
      payload: {
        session,
        user,
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static unsetSession(): UnsetSessionAction {
    return {
      type: 'phenyl/unsetSession',
      tag: randomStringWithTimeStamp(),
    }
  }

  static follow<N extends EntityNameOf<TM>>(
    entityName: N,
    entity: EntityOf<TM, N>,
    versionId: Id,
  ): FollowAction<N, EntityMapOf<TM>> {
    return {
      type: 'phenyl/follow',
      payload: {
        entityName,
        entity,
        versionId,
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static followAll<N extends EntityNameOf<TM>>(
    entityName: N,
    entities: Array<EntityOf<TM, N>>,
    versionsById: {
      [entityId: Id]: Id
    },
  ): FollowAllAction<N, EntityMapOf<TM>> {
    return {
      type: 'phenyl/followAll',
      payload: {
        entityName,
        entities,
        versionsById,
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static unfollow<N extends EntityNameOf<TM>>(entityName: N, id: Id): UnfollowAction<N> {
    return {
      type: 'phenyl/unfollow',
      payload: {
        entityName,
        id,
      },
      tag: randomStringWithTimeStamp(),
    }
  }

  static delete<N extends EntityNameOf<TM>>(command: IdDeleteCommand<N>): DeleteAction<N> {
    return {
      type: 'phenyl/delete',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static pushAndCommit<N extends EntityNameOf<TM>>(command: IdUpdateCommand<N>): PushAndCommitAction<N> {
    return {
      type: 'phenyl/pushAndCommit',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static commit<N extends EntityNameOf<TM>>(command: IdUpdateCommand<N>): CommitAction<N> {
    return {
      type: 'phenyl/commit',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static push<N extends EntityNameOf<TM>>(payload: PushActionPayload<N>): PushAction<N> {
    return {
      type: 'phenyl/push',
      payload: assign(
        {
          until: -1,
        },
        payload,
      ),
      tag: randomStringWithTimeStamp(),
    }
  }

  static repush(): RePushAction {
    return {
      type: 'phenyl/repush',
      tag: randomStringWithTimeStamp(),
    }
  }

  static commitAndPush<N extends EntityNameOf<TM>>(command: IdUpdateCommand<N>): CommitAndPushAction<N> {
    return {
      type: 'phenyl/commitAndPush',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static pull<N extends EntityNameOf<TM>>(query: IdQuery<N>): PullAction<N> {
    return {
      type: 'phenyl/pull',
      payload: query,
      tag: randomStringWithTimeStamp(),
    }
  }

  static login<N extends UserEntityNameOf<TM>, C extends CredentialsOf<TM, N>, O extends OptionsOf<TM, N>>(
    command: LoginCommand<N, C, O>,
  ): LoginAction<N, AuthCommandMapOf<TM>> {
    return {
      type: 'phenyl/login',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static logout<N extends UserEntityNameOf<TM>>(command: LogoutCommand<N>): LogoutAction<N> {
    return {
      type: 'phenyl/logout',
      payload: command,
      tag: randomStringWithTimeStamp(),
    }
  }

  static online(): OnlineAction {
    return {
      type: 'phenyl/online',
      tag: randomStringWithTimeStamp(),
    }
  }

  static offline(): OfflineAction {
    return {
      type: 'phenyl/offline',
      tag: randomStringWithTimeStamp(),
    }
  }

  static resolveError(): ResolveErrorAction {
    return {
      type: 'phenyl/resolveError',
      tag: randomStringWithTimeStamp(),
    }
  }
} // For backward compatibility
// export const actions: Class<PhenylReduxModule<*>> = PhenylReduxModule

export default actions.phenylReducer.bind(actions)