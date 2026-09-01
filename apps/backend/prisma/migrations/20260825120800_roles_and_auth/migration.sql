-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'AGENT', 'CLIENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "User" ADD COLUMN "role_enum" "UserRole" NOT NULL DEFAULT 'CLIENT';

UPDATE "User"
SET "role_enum" = CASE
  WHEN lower("role") IN ('admin') THEN 'ADMIN'::"UserRole"
  WHEN lower("role") IN ('agent', 'operator', 'reviewer') THEN 'AGENT'::"UserRole"
  ELSE 'CLIENT'::"UserRole"
END;

ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_enum" TO "role";
ALTER TABLE "User" ALTER COLUMN "passwordHash" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN "agentId" TEXT;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
