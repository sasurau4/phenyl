// Sorry for poor typing
import { MongoClient, Collection } from 'mongodb'
// @ts-ignore something is wrong with types/es6-promisify
import promisify from 'es6-promisify'
import {
  ChangeStreamPipeline,
  ChangeStreamOptions,
  ChangeStream,
} from './change-stream'

import { FindOperation, GeneralUpdateOperation } from 'sp2'

const connectToMongoDb = promisify(MongoClient.connect)

export interface MongoDbConnection {
  close(): void,
  collection(entityName: string): MongoDbCollection,
}

export type MongoDbCollection = {
  find(op?: FindOperation, options?: { limit?: number, skip?: number }): Promise<Array<Object>>,
  insertOne(obj: Object): Promise<{ insertedId: string, insertedCount: number }>,
  insertMany(objs: Array<Object>): Promise<{ insertedIds: { [key: string]: string }, insertedCount: number }>,
  updateOne({ _id }: { _id: any }, op: GeneralUpdateOperation): Promise<{ matchedCount: number }>,
  updateMany(fOp: FindOperation, uOp: GeneralUpdateOperation): Promise<Object>,
  deleteOne({ _id }: { _id: any }): Promise<{ deletedCount: number }>,
  deleteMany(op: FindOperation): Promise<{ deletedCount: number }>,
  watch(pipeline?: ChangeStreamPipeline, options?: ChangeStreamOptions): ChangeStream
}

export async function connect(url: string, dbName: string): Promise<MongoDbConnection> {
  const dbClient = await connectToMongoDb(url, { useNewUrlParser: true })
  return new PhenylMongoDbConnection({ dbClient, dbName })
}

export function close(db: MongoDbConnection): void {
  db.close()
}

type PhenylMongoDbConnectionParams = {
  dbClient: MongoClient,
  dbName: string,
  collections?: {
    [entityName: string]: MongoDbCollection
  }
}

export class PhenylMongoDbConnection implements MongoDbConnection {
  dbClient: MongoClient
  dbName: string
  collections: {
    [entityName: string]: MongoDbCollection
  }

  constructor(params: PhenylMongoDbConnectionParams) {
    this.dbClient = params.dbClient
    this.dbName = params.dbName
    this.collections = params.collections || {}
  }

  collection(entityName: string): MongoDbCollection {
    if (this.collections[entityName] == null) {
      const coll = this.dbClient.db(this.dbName).collection(entityName)
      this.collections[entityName] = promisifyCollection(coll)
    }
    return this.collections[entityName]
  }

  close(): void {
    this.dbClient.close()
  }
}

function promisifyCollection(coll: Collection): MongoDbCollection {
  return {
    find: promisifyFindChain(coll.find.bind(coll)),
    insertOne: promisify(coll.insertOne, coll),
    insertMany: promisify(coll.insertMany, coll),
    updateOne: promisify(coll.updateOne, coll),
    updateMany: promisify(coll.updateMany, coll),
    deleteOne: promisify(coll.deleteOne, coll),
    deleteMany: promisify(coll.deleteMany, coll),
    watch: coll.watch.bind(coll),
  }
}

type FindChainParams = {
  skip?: number,
  limit?: number,
}

type PromisifiedFind = (where?: Object, params?: FindChainParams) => Promise<any>

function promisifyFindChain(find: (where?: Object) => Object): PromisifiedFind {
  return function(where: Object = {}, params: FindChainParams = {}): Promise<any> {
    const findChain = find(where)
    const newFindChain = Object.keys(params).reduce((chain, name) =>
      // @ts-ignore fix this latter
      chain[name](params[name]), findChain)
    return promisify(newFindChain.toArray, newFindChain)()
  }
}
