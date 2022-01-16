import { EntitySchema } from 'typeorm';
import { Post } from '@fanbase/core';

const PostSchema = new EntitySchema<Post>({
  name: 'post',
  tableName: 'posts',
  columns: {
    id: {
      type: 'text',
      primary: true
    },
    dateCreated: {
      type: 'timestamp',
      createDate: true,
      name: 'date_created'
    },
    dateUpdated: {
      type: 'timestamp',
      updateDate: true,
      name: 'date_updated'
    },
    communityId: {
      type: 'text',
      name: 'community_id'
    },
    userId: {
      type: 'text',
      name: 'user_id'
    },
    text: {
      type: 'text'
    },
    media: {
      type: 'simple-json',
      nullable: true
    }
  },
  relations: {
    community: {
      type: 'many-to-one',
      target: 'community',
      joinColumn: {
        name: 'community_id',
        referencedColumnName: 'id'
      }
    },
    user: {
      type: 'many-to-one',
      target: 'user',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id'
      }
    }
  }
});

export default PostSchema;
