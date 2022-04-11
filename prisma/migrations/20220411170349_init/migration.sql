-- CreateTable
CREATE TABLE "Bracket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "organizerAddress" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "entranceFee" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "started" BOOLEAN NOT NULL DEFAULT false,
    "finished" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "Entrant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bracketAddress" TEXT,
    CONSTRAINT "Entrant_bracketAddress_fkey" FOREIGN KEY ("bracketAddress") REFERENCES "Bracket" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Bracket_address_key" ON "Bracket"("address");
