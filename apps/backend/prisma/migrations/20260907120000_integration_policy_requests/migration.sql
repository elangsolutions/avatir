-- CreateEnum
CREATE TYPE "PolicyKind" AS ENUM ('OFERTA', 'ADJUDICACION');

-- CreateEnum
CREATE TYPE "PolicyFormat" AS ENUM ('ELECTRONICA', 'ELECTRONICA_CERTIFICADA', 'FISICA');

-- CreateEnum
CREATE TYPE "PolicyRequestStatus" AS ENUM ('received', 'under_review', 'issued', 'rejected');

-- AlterTable
ALTER TABLE "Agreement" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(14,2);

-- CreateTable
CREATE TABLE "IntegrationClient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" TEXT[],
    "agentId" TEXT,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyRequest" (
    "id" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "integrationClientId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" "PolicyRequestStatus" NOT NULL DEFAULT 'received',
    "policyKind" "PolicyKind" NOT NULL,
    "policyFormat" "PolicyFormat" NOT NULL,
    "policyAmount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ARS',
    "applicantName" TEXT NOT NULL,
    "applicantTaxId" TEXT NOT NULL,
    "applicantAddress" TEXT,
    "beneficiaryName" TEXT NOT NULL,
    "beneficiaryTaxId" TEXT NOT NULL,
    "beneficiaryAddress" TEXT,
    "processCode" TEXT NOT NULL,
    "fileNumber" TEXT,
    "bidOpeningAt" TIMESTAMP(3),
    "purpose" TEXT NOT NULL,
    "purchaseOrder" TEXT,
    "billingPeriod" TEXT,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationClient_keyPrefix_key" ON "IntegrationClient"("keyPrefix");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyRequest_agreementId_key" ON "PolicyRequest"("agreementId");

-- CreateIndex
CREATE INDEX "PolicyRequest_processCode_idx" ON "PolicyRequest"("processCode");

-- CreateIndex
CREATE INDEX "PolicyRequest_applicantTaxId_idx" ON "PolicyRequest"("applicantTaxId");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyRequest_integrationClientId_idempotencyKey_key" ON "PolicyRequest"("integrationClientId", "idempotencyKey");

-- AddForeignKey
ALTER TABLE "IntegrationClient" ADD CONSTRAINT "IntegrationClient_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyRequest" ADD CONSTRAINT "PolicyRequest_integrationClientId_fkey" FOREIGN KEY ("integrationClientId") REFERENCES "IntegrationClient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
