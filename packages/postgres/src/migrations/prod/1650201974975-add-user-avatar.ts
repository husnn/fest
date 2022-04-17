import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserAvatar1650201974975 implements MigrationInterface {
  name = 'addUserAvatar1650201974975';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "avatar" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "merlin_balance" DROP CONSTRAINT "FK_a6fa6d00c2a8660b51d33c6f465"`
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
  }
}
