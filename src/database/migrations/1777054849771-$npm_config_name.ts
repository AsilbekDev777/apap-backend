import { MigrationInterface, QueryRunner } from "typeorm";

export class  $npmConfigName1777054849771 implements MigrationInterface {
    name = ' $npmConfigName1777054849771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'teacher', 'student', 'parent')`);
        await queryRunner.query(`CREATE TYPE "public"."users_lang_enum" AS ENUM('uz', 'ru')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL, "lang" "public"."users_lang_enum" NOT NULL DEFAULT 'uz', "is_active" boolean NOT NULL DEFAULT true, "last_login" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name_uz" character varying NOT NULL, "name_ru" character varying NOT NULL, "code" character varying NOT NULL, "credit_hours" integer NOT NULL, CONSTRAINT "UQ_86b3589486bac01d2903e22471c" UNIQUE ("code"), CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "faculties" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name_uz" character varying NOT NULL, "name_ru" character varying NOT NULL, "code" character varying NOT NULL, CONSTRAINT "UQ_f1b2cd43a96c6fb75c8ad44de88" UNIQUE ("code"), CONSTRAINT "PK_fd83e4a09c7182ccf7bdb3770b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "faculty_id" uuid NOT NULL, "name" character varying NOT NULL, "year" integer NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "semesters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "start_date" date NOT NULL, "end_date" date NOT NULL, "is_active" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_25c393e2e76b3e32e87a79b1dc2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teacher_courses" ("teacher_user_id" uuid NOT NULL, "course_id" uuid NOT NULL, "group_id" uuid NOT NULL, "semester_id" uuid NOT NULL, CONSTRAINT "PK_d918cf21ef28facb4638f7efe7d" PRIMARY KEY ("teacher_user_id", "course_id", "group_id", "semester_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."report_jobs_type_enum" AS ENUM('student_card', 'group_report')`);
        await queryRunner.query(`CREATE TYPE "public"."report_jobs_format_enum" AS ENUM('pdf', 'excel')`);
        await queryRunner.query(`CREATE TYPE "public"."report_jobs_status_enum" AS ENUM('pending', 'processing', 'ready', 'failed')`);
        await queryRunner.query(`CREATE TABLE "report_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "requested_by" uuid NOT NULL, "type" "public"."report_jobs_type_enum" NOT NULL, "format" "public"."report_jobs_format_enum" NOT NULL, "status" "public"."report_jobs_status_enum" NOT NULL DEFAULT 'pending', "file_key" character varying, "error" text, CONSTRAINT "PK_0c1416b1e9ba757ceae79b598e8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "group_id" uuid NOT NULL, "student_number" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_a711caeb43450bf6ce3e9086dfa" UNIQUE ("student_number"), CONSTRAINT "REL_fb3eff90b11bddf7285f9b4e28" UNIQUE ("user_id"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "token_hash" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "revoked_at" TIMESTAMP, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "parent_student" ("parent_user_id" uuid NOT NULL, "student_id" uuid NOT NULL, CONSTRAINT "PK_1d32e0dbb5827f56995d6efae95" PRIMARY KEY ("parent_user_id", "student_id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('grade_added', 'attendance_warning', 'report_ready')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "title_uz" character varying NOT NULL, "title_ru" character varying NOT NULL, "payload" jsonb, "is_read" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grade_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name_uz" character varying NOT NULL, "name_ru" character varying NOT NULL, "weight_percent" numeric(5,2) NOT NULL, "max_score" numeric(5,2) NOT NULL, CONSTRAINT "PK_ee96c1992ae24b4bca26982000d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "grades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "student_id" uuid NOT NULL, "course_id" uuid NOT NULL, "semester_id" uuid NOT NULL, "grade_type_id" uuid NOT NULL, "score" numeric(5,2) NOT NULL, "entered_by" uuid NOT NULL, CONSTRAINT "PK_4740fb6f5df2505a48649f1687b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "gpa_cache" ("student_id" uuid NOT NULL, "semester_id" uuid NOT NULL, "gpa_100" numeric(5,2) NOT NULL, "gpa_5" numeric(3,2) NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_883f25b74630c46d4f622716f82" PRIMARY KEY ("student_id", "semester_id"))`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "action" character varying NOT NULL, "entity_type" character varying NOT NULL, "entity_id" character varying, "old_value" jsonb, "new_value" jsonb, "ip_address" character varying, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."attendance_status_enum" AS ENUM('present', 'absent', 'late')`);
        await queryRunner.query(`CREATE TABLE "attendance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "student_id" uuid NOT NULL, "course_id" uuid NOT NULL, "lesson_date" date NOT NULL, "status" "public"."attendance_status_enum" NOT NULL, CONSTRAINT "PK_ee0ffe42c1f1a01e72b725c0cb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "groups" ADD CONSTRAINT "FK_605decc6d0626239f9cf391fe2c" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" ADD CONSTRAINT "FK_f340a39f9737aa58a39a72809aa" FOREIGN KEY ("teacher_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" ADD CONSTRAINT "FK_ee876e2b6462fc2833ab9703359" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" ADD CONSTRAINT "FK_5d9f76bfa5ac2f75fa9456d10b7" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" ADD CONSTRAINT "FK_0ab8e3e66fc8815700c2a448d3f" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "report_jobs" ADD CONSTRAINT "FK_7e6f60039a272f1f813cc91857e" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "students" ADD CONSTRAINT "FK_b9f6fcd8a397ee5b503191dd7c3" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parent_student" ADD CONSTRAINT "FK_c74f47ef00461d92413236c47d5" FOREIGN KEY ("parent_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parent_student" ADD CONSTRAINT "FK_9c2fadef93e1c8a720c428e9969" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_9acca493883cee3b9e8f9e01cd1" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_9a927cab52e881e0aa78f8a181b" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_f3ea1888fbd83f3c698146b3ec4" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_f9620718225713b89d078949e19" FOREIGN KEY ("grade_type_id") REFERENCES "grade_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grades" ADD CONSTRAINT "FK_51af3fb4f8fbe1cb8438c3ebcaa" FOREIGN KEY ("entered_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gpa_cache" ADD CONSTRAINT "FK_0e2a6d13b0faafaa05bebaa001a" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gpa_cache" ADD CONSTRAINT "FK_0ea97ffc1edac65fd6112f6bdcc" FOREIGN KEY ("semester_id") REFERENCES "semesters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_6200532f3ef99f639a27bdcae7f" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "attendance" ADD CONSTRAINT "FK_0ce01e85e94ccecea83365bb36f" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_0ce01e85e94ccecea83365bb36f"`);
        await queryRunner.query(`ALTER TABLE "attendance" DROP CONSTRAINT "FK_6200532f3ef99f639a27bdcae7f"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "gpa_cache" DROP CONSTRAINT "FK_0ea97ffc1edac65fd6112f6bdcc"`);
        await queryRunner.query(`ALTER TABLE "gpa_cache" DROP CONSTRAINT "FK_0e2a6d13b0faafaa05bebaa001a"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_51af3fb4f8fbe1cb8438c3ebcaa"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_f9620718225713b89d078949e19"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_f3ea1888fbd83f3c698146b3ec4"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_9a927cab52e881e0aa78f8a181b"`);
        await queryRunner.query(`ALTER TABLE "grades" DROP CONSTRAINT "FK_9acca493883cee3b9e8f9e01cd1"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`);
        await queryRunner.query(`ALTER TABLE "parent_student" DROP CONSTRAINT "FK_9c2fadef93e1c8a720c428e9969"`);
        await queryRunner.query(`ALTER TABLE "parent_student" DROP CONSTRAINT "FK_c74f47ef00461d92413236c47d5"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_b9f6fcd8a397ee5b503191dd7c3"`);
        await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT "FK_fb3eff90b11bddf7285f9b4e281"`);
        await queryRunner.query(`ALTER TABLE "report_jobs" DROP CONSTRAINT "FK_7e6f60039a272f1f813cc91857e"`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" DROP CONSTRAINT "FK_0ab8e3e66fc8815700c2a448d3f"`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" DROP CONSTRAINT "FK_5d9f76bfa5ac2f75fa9456d10b7"`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" DROP CONSTRAINT "FK_ee876e2b6462fc2833ab9703359"`);
        await queryRunner.query(`ALTER TABLE "teacher_courses" DROP CONSTRAINT "FK_f340a39f9737aa58a39a72809aa"`);
        await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT "FK_605decc6d0626239f9cf391fe2c"`);
        await queryRunner.query(`DROP TABLE "attendance"`);
        await queryRunner.query(`DROP TYPE "public"."attendance_status_enum"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TABLE "gpa_cache"`);
        await queryRunner.query(`DROP TABLE "grades"`);
        await queryRunner.query(`DROP TABLE "grade_types"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "parent_student"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TABLE "report_jobs"`);
        await queryRunner.query(`DROP TYPE "public"."report_jobs_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."report_jobs_format_enum"`);
        await queryRunner.query(`DROP TYPE "public"."report_jobs_type_enum"`);
        await queryRunner.query(`DROP TABLE "teacher_courses"`);
        await queryRunner.query(`DROP TABLE "semesters"`);
        await queryRunner.query(`DROP TABLE "groups"`);
        await queryRunner.query(`DROP TABLE "faculties"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_lang_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
