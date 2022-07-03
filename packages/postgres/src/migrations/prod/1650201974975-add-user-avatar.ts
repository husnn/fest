import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserAvatar1650201974975 implements MigrationInterface {
  name = 'addUserAvatar1650201974975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
  }
}
