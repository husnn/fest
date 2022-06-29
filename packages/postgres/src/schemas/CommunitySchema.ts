import { Community } from '@fest/core';
import { EntitySchema } from 'typeorm';

const CommunitySchema = new EntitySchema<Community>({
  name: 'community',
  columns: {
    id: {
      type: 'text',
      primary: true
    },
    creatorId: {
      type: 'text',
      name: 'creator_id'
    },
    name: {
      type: 'text'
    },
    discordGuildId: {
      type: 'text',
      name: 'discord_guild_id',
      nullable: true
    },
    discordGuildName: {
      type: 'text',
      name: 'discord_guild_name',
      nullable: true
    }
  },
  relations: {
    creator: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'creator_id',
        referencedColumnName: 'id'
      }
    },
    tokens: {
      type: 'many-to-many',
      target: 'token',
      inverseSide: 'communities',
      joinTable: {
        name: 'community_token',
        joinColumn: {
          name: 'community_id',
          referencedColumnName: 'id'
        },
        inverseJoinColumn: {
          name: 'token_id',
          referencedColumnName: 'id'
        }
      }
    },
    users: {
      type: 'many-to-many',
      target: 'user',
      inverseSide: 'communities',
      joinTable: {
        name: 'community_user',
        joinColumn: {
          name: 'community_id',
          referencedColumnName: 'id'
        },
        inverseJoinColumn: {
          name: 'user_id',
          referencedColumnName: 'id'
        }
      }
    }
  }
});

export default CommunitySchema;
