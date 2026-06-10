-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'URGENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.
ALTER TYPE "AuditActionType" ADD VALUE 'SERVICE_INTEREST_UPDATED';
ALTER TYPE "AuditActionType" ADD VALUE 'BUDGET_UPDATED';
ALTER TYPE "AuditActionType" ADD VALUE 'INTERNAL_NOTES_UPDATED';
ALTER TYPE "AuditActionType" ADD VALUE 'NOTIFICATION_SENT';
ALTER TYPE "AuditActionType" ADD VALUE 'GLOBAL_NOTIFICATION_SENT';
ALTER TYPE "AuditActionType" ADD VALUE 'NOTIFICATION_READ';
ALTER TYPE "AuditActionType" ADD VALUE 'ALL_NOTIFICATIONS_READ';

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropIndex
DROP INDEX "notifications_user_id_idx";

-- DropIndex
DROP INDEX "notifications_user_id_is_read_idx";

-- AlterTable
ALTER TABLE "leads" DROP COLUMN "employee_count",
DROP COLUMN "estimated_revenue",
ADD COLUMN     "current_business_problem" VARCHAR(2000),
ADD COLUMN     "custom_contact_platform" VARCHAR(255),
ADD COLUMN     "estimated_budget" VARCHAR(255),
ADD COLUMN     "internal_notes" TEXT,
ADD COLUMN     "preferred_contact_platform" VARCHAR(100),
ADD COLUMN     "services_interested_in" VARCHAR(500);

-- AlterTable
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_pkey",
DROP COLUMN "read_at",
DROP COLUMN "reference_id",
DROP COLUMN "reference_type",
DROP COLUMN "type",
DROP COLUMN "user_id",
ADD COLUMN     "created_by_id" UUID NOT NULL,
ADD COLUMN     "is_global" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "NotificationPriority" NOT NULL,
ADD COLUMN     "recipient_id" UUID,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "title" SET DATA TYPE TEXT,
ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_idx" ON "notifications"("recipient_id");

-- CreateIndex
CREATE INDEX "notifications_recipient_id_is_read_idx" ON "notifications"("recipient_id", "is_read");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
