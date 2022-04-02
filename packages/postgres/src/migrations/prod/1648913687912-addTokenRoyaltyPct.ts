import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTokenRoyaltyPct1648913687912 implements MigrationInterface {
  name = 'addTokenRoyaltyPct1648913687912';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "token" RENAME COLUMN "fees" TO "royalty_pct"`
    );
    await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "royalty_pct"`);
    await queryRunner.query(
      `ALTER TABLE "token" ADD "royalty_pct" integer NOT NULL DEFAULT '0'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "token" DROP COLUMN "royalty_pct"`);
    await queryRunner.query(`ALTER TABLE "token" ADD "royalty_pct" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "token" RENAME COLUMN "royalty_pct" TO "fees"`
    );
  }
}
