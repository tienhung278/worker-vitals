import {MigrationInterface, QueryRunner} from "typeorm";

export class InitSchema1755606399464 implements MigrationInterface {
    name = 'InitSchema1755606399464'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "vital_signs"
                                 (
                                     "id"          uuid                     NOT NULL DEFAULT uuid_generate_v4(),
                                     "workerId"    character varying(100)   NOT NULL,
                                     "heartRate"   integer                  NOT NULL,
                                     "temperature" double precision         NOT NULL,
                                     "timestamp"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                                     CONSTRAINT "PK_83ba5a3455279f645885c327bb6" PRIMARY KEY ("id")
                                 )`);
        await queryRunner.query(`CREATE INDEX "idx_vital_worker_timestamp" ON "vital_signs" ("workerId", "timestamp") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_vital_worker_timestamp"`);
        await queryRunner.query(`DROP TABLE "vital_signs"`);
    }

}
