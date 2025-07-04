-- CreateTable
CREATE TABLE "blacklist" (
    "id" TEXT NOT NULL,
    "passportSeries" TEXT NOT NULL,
    "passportNumber" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "addedByUserId" TEXT NOT NULL,
    "customerId" TEXT,

    CONSTRAINT "blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blacklist_customerId_key" ON "blacklist"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "blacklist_passportSeries_passportNumber_key" ON "blacklist"("passportSeries", "passportNumber");

-- AddForeignKey
ALTER TABLE "blacklist" ADD CONSTRAINT "blacklist_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
