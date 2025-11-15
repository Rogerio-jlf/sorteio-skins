-- CreateEnum
CREATE TYPE "RaffleStatus" AS ENUM ('ACTIVE', 'DRAWING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "couponCode" TEXT NOT NULL,
    "logoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffle" (
    "id" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "skinName" TEXT NOT NULL,
    "skinImage" TEXT,
    "skinValue" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "drawDate" TIMESTAMP(3),
    "status" "RaffleStatus" NOT NULL DEFAULT 'ACTIVE',
    "winnerId" TEXT,
    "winnerNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raffle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sponsorId" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "quotas" INTEGER NOT NULL,
    "proofImage" TEXT NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raffle_entry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raffleId" TEXT NOT NULL,
    "depositId" TEXT NOT NULL,
    "ticketNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "raffle_entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_name_key" ON "sponsor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_slug_key" ON "sponsor"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "sponsor_couponCode_key" ON "sponsor"("couponCode");

-- CreateIndex
CREATE INDEX "raffle_sponsorId_idx" ON "raffle"("sponsorId");

-- CreateIndex
CREATE INDEX "raffle_status_idx" ON "raffle"("status");

-- CreateIndex
CREATE INDEX "deposit_userId_idx" ON "deposit"("userId");

-- CreateIndex
CREATE INDEX "deposit_sponsorId_idx" ON "deposit"("sponsorId");

-- CreateIndex
CREATE INDEX "deposit_raffleId_idx" ON "deposit"("raffleId");

-- CreateIndex
CREATE INDEX "deposit_status_idx" ON "deposit"("status");

-- CreateIndex
CREATE INDEX "raffle_entry_userId_idx" ON "raffle_entry"("userId");

-- CreateIndex
CREATE INDEX "raffle_entry_raffleId_idx" ON "raffle_entry"("raffleId");

-- CreateIndex
CREATE INDEX "raffle_entry_depositId_idx" ON "raffle_entry"("depositId");

-- CreateIndex
CREATE UNIQUE INDEX "raffle_entry_raffleId_ticketNumber_key" ON "raffle_entry"("raffleId", "ticketNumber");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle" ADD CONSTRAINT "raffle_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "sponsor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposit" ADD CONSTRAINT "deposit_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_entry" ADD CONSTRAINT "raffle_entry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_entry" ADD CONSTRAINT "raffle_entry_raffleId_fkey" FOREIGN KEY ("raffleId") REFERENCES "raffle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raffle_entry" ADD CONSTRAINT "raffle_entry_depositId_fkey" FOREIGN KEY ("depositId") REFERENCES "deposit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
