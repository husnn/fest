import { MigrationInterface, QueryRunner } from 'typeorm';

export class initial1643471745646 implements MigrationInterface {
  name = 'initial1643471745646';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "community" ("id" text NOT NULL, "creator_id" text NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invite_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'USED', 'EXPIRED', 'CANCELLED')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invite_type_enum" AS ENUM('BASIC', 'CREATOR', 'FAN')`
    );
    await queryRunner.query(
      `CREATE TABLE "invite" ("id" SERIAL NOT NULL, "date_created" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."invite_status_enum" NOT NULL DEFAULT 'ACTIVE', "expiry_date" TIMESTAMP, "type" "public"."invite_type_enum" NOT NULL DEFAULT 'BASIC', "owner_id" text NOT NULL, "code" text NOT NULL, "useCount" integer NOT NULL DEFAULT '0', "maxUseCount" integer, CONSTRAINT "PK_fc9fa190e5a3c5d80604a4f63e1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."message_type_enum" AS ENUM('1', '2')`
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date_created" TIMESTAMP NOT NULL DEFAULT now(), "date_updated" TIMESTAMP NOT NULL DEFAULT now(), "community_id" text NOT NULL, "type" "public"."message_type_enum" NOT NULL, "parent_id" uuid, "user_id" text NOT NULL, "text" text NOT NULL, "media" text array NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_category_enum" AS ENUM('MARKET')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notification_topic_enum" AS ENUM('TOKEN_MARKET_SALE', 'TOKEN_MARKET_ROYALTY_PAYMENT')`
    );
    await queryRunner.query(
      `CREATE TABLE "notification" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date_created" TIMESTAMP NOT NULL DEFAULT now(), "priority" integer NOT NULL, "category" "public"."notification_category_enum" NOT NULL, "topic" "public"."notification_topic_enum" NOT NULL, "recipient_id" text NOT NULL, "values" text, "resources" jsonb, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."oauth_provider_enum" AS ENUM('GOOGLE')`
    );
    await queryRunner.query(
      `CREATE TABLE "oauth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" text NOT NULL, "provider" "public"."oauth_provider_enum" NOT NULL, "accessToken" text NOT NULL, "refreshToken" text, "expiry" TIMESTAMP NOT NULL, CONSTRAINT "PK_a957b894e50eb16b969c0640a8d" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_fe5d40f0a1fc51e37747fd0378" ON "oauth" ("user_id", "provider") `
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" text NOT NULL, "date_created" TIMESTAMP NOT NULL DEFAULT now(), "date_updated" TIMESTAMP NOT NULL DEFAULT now(), "community_id" text NOT NULL, "user_id" text NOT NULL, "text" text NOT NULL, "media" text, CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "referral" ("id" SERIAL NOT NULL, "date_created" TIMESTAMP NOT NULL DEFAULT now(), "invite_id" integer NOT NULL, "referrer_id" text NOT NULL, "referee_id" text NOT NULL, CONSTRAINT "PK_a2d3e935a6591168066defec5ad" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_e2c1f7ab5545735bd2077f4f6b" ON "referral" ("invite_id", "referee_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "room" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "community_id" text NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_0aa559e85555aab90d0993ebcf" ON "room" ("community_id", "name") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_listing_protocol_enum" AS ENUM('ETHEREUM')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_listing_status_enum" AS ENUM('ACTIVE', 'SOLD', 'CANCELLED')`
    );
    await queryRunner.query(
      `CREATE TABLE "token_listing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date_created" TIMESTAMP NOT NULL DEFAULT now(), "protocol" "public"."token_listing_protocol_enum" NOT NULL, "seller_id" text NOT NULL, "token_id" text NOT NULL, "quantity" integer NOT NULL DEFAULT '0', "available" integer NOT NULL DEFAULT '0', "price" jsonb NOT NULL, "chain" jsonb NOT NULL, "status" "public"."token_listing_status_enum" NOT NULL, CONSTRAINT "PK_55f087f4d7715c66f2bc2058d37" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_offer_status_enum" AS ENUM('SENT', 'WITHDRAWN', 'ACCEPTED', 'DECLINED')`
    );
    await queryRunner.query(
      `CREATE TABLE "token_offer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date_sent" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."token_offer_status_enum" NOT NULL, "sender_id" text NOT NULL, "receiver_id" text NOT NULL, "ownership_id" text NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "price" jsonb NOT NULL, "expiry" TIMESTAMP NOT NULL, "signature" text NOT NULL, CONSTRAINT "PK_5f3dc78c796b6f237f8669f8748" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "token_ownership" ("id" text NOT NULL, "date_created" TIMESTAMP NOT NULL DEFAULT now(), "date_updated" TIMESTAMP NOT NULL DEFAULT now(), "wallet_id" text, "token_id" text NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_08f5d967ea3a08eb9c7caab2f4a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3e4a78e977698cb395a88e1ef6" ON "token_ownership" ("wallet_id", "token_id") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."token_type_enum" AS ENUM('BASIC', 'YT_VIDEO')`
    );
    await queryRunner.query(
      `CREATE TABLE "token" ("id" text NOT NULL, "date_created" TIMESTAMP NOT NULL DEFAULT now(), "creator_id" text, "type" "public"."token_type_enum" NOT NULL DEFAULT 'BASIC', "name" text NOT NULL, "description" text, "supply" integer NOT NULL DEFAULT '0', "image" text, "externalUrl" text, "fees" jsonb, "attributes" text, "extra" text, "metadataUri" text NOT NULL, "chain" jsonb, "minted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "token_trade" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date_created" TIMESTAMP NOT NULL DEFAULT now(), "seller_id" text NOT NULL, "buyer_id" text NOT NULL, "token_listing_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_fca9adf66dd0fd04eb16e084926" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" text NOT NULL, "email" text, "password" text, "username" text, "name" text, "bio" text, "login_code" text, "email_change_token" text, "password_reset_token" text, "wallet_id" text, "is_creator" boolean NOT NULL DEFAULT false, "lastLogin" TIMESTAMP, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "REL_b453ec3d9d579f6b9699be98be" UNIQUE ("wallet_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."waitlist_entry_type_enum" AS ENUM('NORMAL', 'CREATOR')`
    );
    await queryRunner.query(
      `CREATE TABLE "waitlist_entry" ("id" SERIAL NOT NULL, "type" "public"."waitlist_entry_type_enum" NOT NULL DEFAULT 'NORMAL', "date_created" TIMESTAMP NOT NULL DEFAULT now(), "email" text NOT NULL, "wallet" text, "socialMedia" text, "isAccepted" boolean NOT NULL DEFAULT false, "date_accepted" TIMESTAMP, CONSTRAINT "PK_77e5b27d89e0b1795ea07ef32f8" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_7c8712366016537aa227d895ff" ON "waitlist_entry" ("type", "email") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_616c21c9af5e235ebaf562f2f0" ON "waitlist_entry" ("type", "wallet") `
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_type_enum" AS ENUM('INTERNAL', 'EXTERNAL')`
    );
    await queryRunner.query(
      `CREATE TYPE "public"."wallet_protocol_enum" AS ENUM('ETHEREUM')`
    );
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" text NOT NULL, "type" "public"."wallet_type_enum" NOT NULL, "protocol" "public"."wallet_protocol_enum" NOT NULL, "address" text NOT NULL, "publicKey" text, "privateKey" text, "seed" text, "owner_id" text, CONSTRAINT "REL_26b096404e3b6ece7d44d88fb1" UNIQUE ("owner_id"), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_260549efd3e0c5829058a86e21" ON "wallet" ("protocol", "address") `
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_a090c4153a70aa6ee80712b822" ON "wallet" ("protocol", "publicKey") `
    );
    await queryRunner.query(
      `CREATE TABLE "community_token" ("community_id" text NOT NULL, "token_id" text NOT NULL, CONSTRAINT "PK_d1067b76fa34a259da252028f6c" PRIMARY KEY ("community_id", "token_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e75f0479afacac37585738c23c" ON "community_token" ("community_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7a7f3af8c22f6c4f88fb470fb2" ON "community_token" ("token_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "community_user" ("community_id" text NOT NULL, "user_id" text NOT NULL, CONSTRAINT "PK_4f91d10faaac2dafbd35b4f7911" PRIMARY KEY ("community_id", "user_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_58284c99ec011274f648010849" ON "community_user" ("community_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dccffa38c8504a446d30e780d0" ON "community_user" ("user_id") `
    );
    await queryRunner.query(
      `CREATE TABLE "message_room" ("message_id" uuid NOT NULL, "room_id" uuid NOT NULL, CONSTRAINT "PK_7583475ac1b0bdddcba8ce36679" PRIMARY KEY ("message_id", "room_id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_a1a674a937bf405f753fc1b233" ON "message_room" ("message_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8a131fdaa62871ce6e2c1c6d2c" ON "message_room" ("room_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "community" ADD CONSTRAINT "FK_b1bfddcbe2d4c038808d3bbad58" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "invite" ADD CONSTRAINT "FK_267ec7b773607be6949152c583b" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_ff863658648240e487567eb51f0" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" ADD CONSTRAINT "FK_c1e31b84cedaa9135fd13ca1620" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD CONSTRAINT "FK_9a4124d6db87d6863d23595b450" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD CONSTRAINT "FK_52378a74ae3724bcab44036645b" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_85da456ea13b17c35fa12ed7183" FOREIGN KEY ("invite_id") REFERENCES "invite"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_f79e4f8d7f796b3fcb16894b527" FOREIGN KEY ("referrer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_3ebf676e9613646800e3749ce65" FOREIGN KEY ("referee_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "room" ADD CONSTRAINT "FK_94c70607cc968339864b69b9f1b" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_listing" ADD CONSTRAINT "FK_942c82302bce9587ac36d8bc16c" FOREIGN KEY ("seller_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_listing" ADD CONSTRAINT "FK_b329e077c6af221e9cbda859f30" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_offer" ADD CONSTRAINT "FK_68309d5c9ebffd384699ad025d5" FOREIGN KEY ("sender_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_offer" ADD CONSTRAINT "FK_ebe57933d772b30dee901acf0f7" FOREIGN KEY ("receiver_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_offer" ADD CONSTRAINT "FK_ae669d2d19e994e7c87a66f5853" FOREIGN KEY ("ownership_id") REFERENCES "token_ownership"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_ownership" ADD CONSTRAINT "FK_8245c0702fb2125c7204e96ee13" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_ownership" ADD CONSTRAINT "FK_01c2500f39e457f0e798341dc69" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token" ADD CONSTRAINT "FK_80de15cad9e2ebfb1c465473c9c" FOREIGN KEY ("creator_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_trade" ADD CONSTRAINT "FK_4ce38afe040f5f8254ecf146b67" FOREIGN KEY ("seller_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_trade" ADD CONSTRAINT "FK_9ec71a710506e007cbcccc80fd6" FOREIGN KEY ("buyer_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "token_trade" ADD CONSTRAINT "FK_b7833d05ff8389687e790507b92" FOREIGN KEY ("token_listing_id") REFERENCES "token_listing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_26b096404e3b6ece7d44d88fb1a" FOREIGN KEY ("owner_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "community_token" ADD CONSTRAINT "FK_e75f0479afacac37585738c23cd" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "community_token" ADD CONSTRAINT "FK_7a7f3af8c22f6c4f88fb470fb29" FOREIGN KEY ("token_id") REFERENCES "token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "community_user" ADD CONSTRAINT "FK_58284c99ec011274f6480108495" FOREIGN KEY ("community_id") REFERENCES "community"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "community_user" ADD CONSTRAINT "FK_dccffa38c8504a446d30e780d03" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "message_room" ADD CONSTRAINT "FK_a1a674a937bf405f753fc1b2332" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
    await queryRunner.query(
      `ALTER TABLE "message_room" ADD CONSTRAINT "FK_8a131fdaa62871ce6e2c1c6d2c8" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message_room" DROP CONSTRAINT "FK_8a131fdaa62871ce6e2c1c6d2c8"`
    );
    await queryRunner.query(
      `ALTER TABLE "message_room" DROP CONSTRAINT "FK_a1a674a937bf405f753fc1b2332"`
    );
    await queryRunner.query(
      `ALTER TABLE "community_user" DROP CONSTRAINT "FK_dccffa38c8504a446d30e780d03"`
    );
    await queryRunner.query(
      `ALTER TABLE "community_user" DROP CONSTRAINT "FK_58284c99ec011274f6480108495"`
    );
    await queryRunner.query(
      `ALTER TABLE "community_token" DROP CONSTRAINT "FK_7a7f3af8c22f6c4f88fb470fb29"`
    );
    await queryRunner.query(
      `ALTER TABLE "community_token" DROP CONSTRAINT "FK_e75f0479afacac37585738c23cd"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_26b096404e3b6ece7d44d88fb1a"`
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_trade" DROP CONSTRAINT "FK_b7833d05ff8389687e790507b92"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_trade" DROP CONSTRAINT "FK_9ec71a710506e007cbcccc80fd6"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_trade" DROP CONSTRAINT "FK_4ce38afe040f5f8254ecf146b67"`
    );
    await queryRunner.query(
      `ALTER TABLE "token" DROP CONSTRAINT "FK_80de15cad9e2ebfb1c465473c9c"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_ownership" DROP CONSTRAINT "FK_01c2500f39e457f0e798341dc69"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_ownership" DROP CONSTRAINT "FK_8245c0702fb2125c7204e96ee13"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_offer" DROP CONSTRAINT "FK_ae669d2d19e994e7c87a66f5853"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_offer" DROP CONSTRAINT "FK_ebe57933d772b30dee901acf0f7"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_offer" DROP CONSTRAINT "FK_68309d5c9ebffd384699ad025d5"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_listing" DROP CONSTRAINT "FK_b329e077c6af221e9cbda859f30"`
    );
    await queryRunner.query(
      `ALTER TABLE "token_listing" DROP CONSTRAINT "FK_942c82302bce9587ac36d8bc16c"`
    );
    await queryRunner.query(
      `ALTER TABLE "room" DROP CONSTRAINT "FK_94c70607cc968339864b69b9f1b"`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_3ebf676e9613646800e3749ce65"`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_f79e4f8d7f796b3fcb16894b527"`
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_85da456ea13b17c35fa12ed7183"`
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_52378a74ae3724bcab44036645b"`
    );
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_9a4124d6db87d6863d23595b450"`
    );
    await queryRunner.query(
      `ALTER TABLE "oauth" DROP CONSTRAINT "FK_c1e31b84cedaa9135fd13ca1620"`
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_ff863658648240e487567eb51f0"`
    );
    await queryRunner.query(
      `ALTER TABLE "invite" DROP CONSTRAINT "FK_267ec7b773607be6949152c583b"`
    );
    await queryRunner.query(
      `ALTER TABLE "community" DROP CONSTRAINT "FK_b1bfddcbe2d4c038808d3bbad58"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8a131fdaa62871ce6e2c1c6d2c"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a1a674a937bf405f753fc1b233"`
    );
    await queryRunner.query(`DROP TABLE "message_room"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dccffa38c8504a446d30e780d0"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_58284c99ec011274f648010849"`
    );
    await queryRunner.query(`DROP TABLE "community_user"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7a7f3af8c22f6c4f88fb470fb2"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e75f0479afacac37585738c23c"`
    );
    await queryRunner.query(`DROP TABLE "community_token"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_a090c4153a70aa6ee80712b822"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_260549efd3e0c5829058a86e21"`
    );
    await queryRunner.query(`DROP TABLE "wallet"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_protocol_enum"`);
    await queryRunner.query(`DROP TYPE "public"."wallet_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_616c21c9af5e235ebaf562f2f0"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7c8712366016537aa227d895ff"`
    );
    await queryRunner.query(`DROP TABLE "waitlist_entry"`);
    await queryRunner.query(`DROP TYPE "public"."waitlist_entry_type_enum"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "token_trade"`);
    await queryRunner.query(`DROP TABLE "token"`);
    await queryRunner.query(`DROP TYPE "public"."token_type_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3e4a78e977698cb395a88e1ef6"`
    );
    await queryRunner.query(`DROP TABLE "token_ownership"`);
    await queryRunner.query(`DROP TABLE "token_offer"`);
    await queryRunner.query(`DROP TYPE "public"."token_offer_status_enum"`);
    await queryRunner.query(`DROP TABLE "token_listing"`);
    await queryRunner.query(`DROP TYPE "public"."token_listing_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."token_listing_protocol_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0aa559e85555aab90d0993ebcf"`
    );
    await queryRunner.query(`DROP TABLE "room"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e2c1f7ab5545735bd2077f4f6b"`
    );
    await queryRunner.query(`DROP TABLE "referral"`);
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_fe5d40f0a1fc51e37747fd0378"`
    );
    await queryRunner.query(`DROP TABLE "oauth"`);
    await queryRunner.query(`DROP TYPE "public"."oauth_provider_enum"`);
    await queryRunner.query(`DROP TABLE "notification"`);
    await queryRunner.query(`DROP TYPE "public"."notification_topic_enum"`);
    await queryRunner.query(`DROP TYPE "public"."notification_category_enum"`);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`DROP TABLE "invite"`);
    await queryRunner.query(`DROP TYPE "public"."invite_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invite_status_enum"`);
    await queryRunner.query(`DROP TABLE "community"`);
  }
}
