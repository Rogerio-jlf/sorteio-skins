-- CreateIndex
CREATE INDEX "raffle_winnerId_idx" ON "raffle"("winnerId");

-- AddForeignKey
ALTER TABLE "raffle" ADD CONSTRAINT "raffle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
