import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1791732631375 implements MigrationInterface {
    name = 'Init1791732631375'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "vin_specs" (
                "vin" character varying(17) NOT NULL,
                "make" character varying NOT NULL,
                "model" character varying NOT NULL,
                "trim" character varying NOT NULL,
                "model_year" integer NOT NULL,
                "battery_kwh" integer NOT NULL,
                "list_price" integer NOT NULL,
                "equipment_specs" jsonb NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_acac5a23d53d929e3785210dba9" PRIMARY KEY ("vin")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "vehicle" (
                "id" SERIAL NOT NULL,
                "seller_id" integer NOT NULL,
                "vin" character varying NOT NULL,
                "mileage" integer NOT NULL,
                "battery_health" integer NOT NULL,
                "price" integer NOT NULL,
                "is_sale_ready" boolean NOT NULL,
                "is_available" boolean NOT NULL,
                "equipments" character varying,
                CONSTRAINT "PK_187fa17ba39d367e5604b3d1ec9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."issue_field_name_enum" AS ENUM('mileage', 'batteryHealth', 'equipments')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."issue_status_enum" AS ENUM('pending', 'confirmed', 'rejected')
        `);
        await queryRunner.query(`
            CREATE TABLE "issue" (
                "id" SERIAL NOT NULL,
                "seller_id" integer NOT NULL,
                "field_name" "public"."issue_field_name_enum" NOT NULL,
                "old_value" character varying,
                "new_value" character varying NOT NULL,
                "seller_message" character varying NOT NULL,
                "status" "public"."issue_status_enum" NOT NULL DEFAULT 'pending',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "resolved_at" TIMESTAMP,
                "vehicle_id" integer,
                CONSTRAINT "PK_f80e086c249b9f3f3ff2fd321b7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "vehicle"
            ADD CONSTRAINT "FK_960e864037056a9e38cb4277bdd" FOREIGN KEY ("vin") REFERENCES "vin_specs"("vin") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "issue"
            ADD CONSTRAINT "FK_830f754da8a8feec9a144c1e177" FOREIGN KEY ("vehicle_id") REFERENCES "vehicle"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "issue" DROP CONSTRAINT "FK_830f754da8a8feec9a144c1e177"
        `);
        await queryRunner.query(`
            ALTER TABLE "vehicle" DROP CONSTRAINT "FK_960e864037056a9e38cb4277bdd"
        `);
        await queryRunner.query(`
            DROP TABLE "issue"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."issue_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."issue_field_name_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "vehicle"
        `);
        await queryRunner.query(`
            DROP TABLE "vin_specs"
        `);
    }

}
