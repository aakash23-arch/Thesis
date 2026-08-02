-- CreateTable
CREATE TABLE "stock_fundamentals" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "trailing_pe" DECIMAL(18,4),
    "price_to_book" DECIMAL(18,4),
    "revenue_growth_yoy" DECIMAL(18,4),
    "profit_margin" DECIMAL(18,4),
    "return_on_equity" DECIMAL(18,4),
    "debt_to_equity" DECIMAL(18,4),
    "dividend_yield" DECIMAL(18,4),
    "fetched_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_fundamentals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_fundamentals_stock_id_key" ON "stock_fundamentals"("stock_id");

-- AddForeignKey
ALTER TABLE "stock_fundamentals" ADD CONSTRAINT "stock_fundamentals_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
