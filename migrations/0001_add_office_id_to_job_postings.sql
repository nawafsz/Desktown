ALTER TABLE "job_postings"
ADD COLUMN IF NOT EXISTS "office_id" integer;
--> statement-breakpoint
ALTER TABLE "job_postings"
ADD CONSTRAINT IF NOT EXISTS "job_postings_office_id_offices_id_fk"
FOREIGN KEY ("office_id") REFERENCES "offices"("id")
ON DELETE NO ACTION ON UPDATE NO ACTION;

