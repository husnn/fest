import { MigrationInterface, QueryRunner } from 'typeorm';

export class discordIntegration1656708569449 implements MigrationInterface {
  name = 'discordIntegration1656708569449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "community" ADD "discord_guild_id" text`
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD "discord_guild_name" text`
    );
    await queryRunner.query(`ALTER TABLE "oauth" ADD "external_id" text`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe5d40f0a1fc51e37747fd0378"`
    );
    await queryRunner.query(
      `ALTER TYPE "public"."oauth_provider_enum" RENAME TO "oauth_provider_enum_old"`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."oauth_provider_enum" AS ENUM('GOOGLE', 'DISCORD')`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ALTER COLUMN "provider" TYPE "public"."oauth_provider_enum" USING "provider"::"text"::"public"."oauth_provider_enum"`
    );
    await queryRunner.query(`DROP TYPE "public"."oauth_provider_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "oauth" ALTER COLUMN "accessToken" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ALTER COLUMN "expiry" DROP NOT NULL`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe5d40f0a1fc51e37747fd0378" ON "oauth" ("user_id", "provider") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe5d40f0a1fc51e37747fd0378"`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ALTER COLUMN "expiry" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ALTER COLUMN "accessToken" SET NOT NULL`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."oauth_provider_enum_old" AS ENUM('GOOGLE')`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ALTER COLUMN "provider" TYPE "public"."oauth_provider_enum_old" USING "provider"::"text"::"public"."oauth_provider_enum_old"`
    );
    await queryRunner.query(`DROP TYPE "public"."oauth_provider_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."oauth_provider_enum_old" RENAME TO "oauth_provider_enum"`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe5d40f0a1fc51e37747fd0378" ON "oauth" ("user_id", "provider") `
    );
    await queryRunner.query(`ALTER TABLE "oauth" DROP COLUMN "external_id"`);
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "discord_guild_name"`
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP COLUMN "discord_guild_id"`
    );
  }
}
