import { MigrationInterface, QueryRunner } from 'typeorm';

export class addUserPreferences1654557766412 implements MigrationInterface {
  name = 'addUserPreferences1654557766412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "preferences" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "preferences"`);
  }
}
