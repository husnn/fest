import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokenMediaUri1643578042812 implements MigrationInterface {
  name = 'addTokenMediaUri1643578042812';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "token" ADD "mediaUri" text`);
    await queryRunner.query(
      `ALTER TABLE "token" ALTER COLUMN "metadataUri" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token" ALTER COLUMN "metadataUri" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "mediaUri"`);
  }
}
