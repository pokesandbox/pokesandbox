import {
  model,
  models,
  Schema,
  Types,
  type HydratedDocument,
  type Model,
  type Query,
  type QueryFilter,
  type QueryWithHelpers,
} from 'mongoose';
import { z } from 'zod';

import { baseEntitySchema, IModelInput } from './base';
import { Region } from './region/region.model';
import type { PopulatedQuery } from './types';
import { isDuplicateKeyError, zMapHydrator } from './utils';

export const serverSchema = baseEntitySchema.extend({
  serverId: z.string(),
  adminRoleIds: z.array(z.string()),
  discovery: z.object({
    description: z.string().optional(),
    enabled: z.boolean(),
    icon: z.string().optional(),
    inviteLink: z.string().optional(),
  }),
  modRoleIds: z.array(z.string()),
  name: z.string(),
  playerList: z.array(z.instanceof(Types.ObjectId)),
  regions: z.array(z.instanceof(Types.ObjectId)),
  // Owner-set flag overrides; string keys so a removed flag still parses.
  settings: z
    .object({
      features: zMapHydrator(z.boolean()).optional(),
    })
    .optional(),
});

export type IServer = z.infer<typeof serverSchema>;
export type IServerInput = IModelInput<IServer>;
export type IServerUpdate = Partial<IServerInput>;
export type Server = HydratedDocument<IServer>;

// Define interface for query helpers
interface IServerQueryHelpers {
  byServerId(
    serverId?: string,
  ): QueryWithHelpers<any, Server, IServerQueryHelpers>;
}

interface IServerModel extends Model<IServer, IServerQueryHelpers> {
  createServer(server: IServerInput): Promise<Server>;
  findOrCreateServer(
    server: IServerInput,
  ): Promise<{ server: Server; created: boolean }>;
  findServerWithRegions(
    filter: QueryFilter<IServer>,
  ): PopulatedQuery<Server | null, IServer, { regions: Region[] }>;
  upsertServer(
    filter: QueryFilter<IServer>,
    update: IServerUpdate,
  ): Query<Server | null, IServer>;
}

export const serverDbSchema = new Schema<
  IServer,
  IServerModel,
  Record<string, never>,
  IServerQueryHelpers
>(
  {
    serverId: { type: String, required: true },
    adminRoleIds: { type: [String], required: true },
    discovery: {
      type: {
        description: String,
        enabled: { type: Boolean, required: true },
        icon: String,
        inviteLink: String,
      },
      required: true,
    },
    modRoleIds: { type: [String], required: true },
    name: { type: String, required: true },
    playerList: { type: [Schema.Types.ObjectId], ref: 'User', required: true },
    regions: { type: [Schema.Types.ObjectId], ref: 'Region', required: true },
    settings: {
      type: {
        features: { type: Map, of: Boolean },
      },
    },
  },
  {
    timestamps: true,
    query: {
      byServerId(
        this: QueryWithHelpers<any, Server, IServerQueryHelpers>,
        serverId?: string,
      ) {
        return this.where({ serverId });
      },
    },
    statics: {
      createServer(server: IServerInput) {
        const newServer = new this(server);
        return newServer.save();
      },
      /** Race-safe: a duplicate-key error returns the concurrent winner. */
      async findOrCreateServer(server: IServerInput) {
        const existing = await this.findOne({ serverId: server.serverId });
        if (existing) return { server: existing, created: false };
        try {
          return { server: await this.create(server), created: true };
        } catch (error) {
          if (!isDuplicateKeyError(error)) throw error;
          const winner = await this.findOne({ serverId: server.serverId });
          if (!winner) throw error;
          return { server: winner, created: false };
        }
      },
      findServerWithRegions(filter: QueryFilter<IServer>) {
        return this.findOne(filter).populate('regions');
      },
      upsertServer(filter: QueryFilter<IServer>, update: IServerUpdate) {
        return this.findOneAndUpdate(filter, update, { upsert: true });
      },
    },
  },
);

// One Server per Discord guild.
serverDbSchema.index({ serverId: 1 }, { unique: true });

export const Server =
  (models.Server as IServerModel) ||
  (model<IServer, IServerModel>(
    'Server',
    serverDbSchema,
    'servers',
  ) as IServerModel);
