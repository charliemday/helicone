ALTER TABLE "public"."request"
ALTER COLUMN request_ip DROP DEFAULT,
ALTER COLUMN request_ip SET DEFAULT NULL;