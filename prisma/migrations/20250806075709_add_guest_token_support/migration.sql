-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BasketItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "guestId" TEXT,
    "variantId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BasketItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "BasketItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BasketItem" ("createdAt", "id", "quantity", "userId", "variantId") SELECT "createdAt", "id", "quantity", "userId", "variantId" FROM "BasketItem";
DROP TABLE "BasketItem";
ALTER TABLE "new_BasketItem" RENAME TO "BasketItem";
CREATE INDEX "BasketItem_userId_idx" ON "BasketItem"("userId");
CREATE INDEX "BasketItem_guestId_idx" ON "BasketItem"("guestId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
