-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "closed_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "sector" TEXT,
    "last_price" DECIMAL(18,4),
    "previous_close" DECIMAL(18,4),
    "price_updated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stocks_company_idx" ON "stocks"("company");

-- CreateIndex
CREATE UNIQUE INDEX "stocks_ticker_exchange_key" ON "stocks"("ticker", "exchange");

-- CreateIndex
CREATE INDEX "positions_user_id_closed_at_idx" ON "positions"("user_id", "closed_at");
