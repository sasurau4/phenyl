import {
  timeStampWithRandomString
  // @ts-ignore remove this commend after @phenyl/utils release
} from '@phenyl/utils'

import {
  Id,
  DbClient,
  PreSession,
  Session,
  SessionClient,
  // @ts-ignore remove this commend after @phenyl/interfaces release
} from '@phenyl/interfaces'

type PhenylSessionEntityMap = {
  _PhenylSession: Session
}

/**
 *
 */
export class PhenylSessionClient implements SessionClient {
  dbClient: DbClient<PhenylSessionEntityMap>

  constructor(dbClient: DbClient<*>) {
    this.dbClient = dbClient
  }

  /**
   *
   */
  async get(id: Id | null | undefined): Promise<Session | null | undefined> {
    if (id == null) {
      return null
    }
    try {
      const session = await this.dbClient.get({ entityName: '_PhenylSession', id })
      if (new Date(session.expiredAt).getTime() <= Date.now()) {
        this.delete(id) // Run asynchronously
        return null
      }
      return session
    }
    catch (e) {
      // TODO: Check error message.
      return null
    }
  }

  /**
   *
   */
  async create(preSession: PreSession): Promise<Session> {
    let value = preSession
    if (value.id == null) {
      value = Object.assign({}, value, { id: timeStampWithRandomString() })
    }
    return this.set(value)
  }

  /**
   *
   */
  async set(value: Session): Promise<Session> {
    return this.dbClient.insertAndGet({ entityName: '_PhenylSession', value })
  }

  /**
   *
   */
  async delete(id: Id | null | undefined): Promise<boolean> {
    if (id == null) {
      return false
    }
    await this.dbClient.delete({ entityName: '_PhenylSession', id })
    return true
  }
}