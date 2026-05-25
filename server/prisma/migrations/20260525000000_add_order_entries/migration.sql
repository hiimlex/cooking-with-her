-- CreateTable
CREATE TABLE "OrderEntry" (
    "id"        TEXT NOT NULL,
    "date"      TEXT NOT NULL,
    "note"      TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "coupleId"  TEXT NOT NULL,

    CONSTRAINT "OrderEntry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderEntry" ADD CONSTRAINT "OrderEntry_coupleId_fkey"
    FOREIGN KEY ("coupleId") REFERENCES "Couple"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
