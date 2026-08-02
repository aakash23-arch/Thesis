-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'CAUTION', 'BROKEN');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('STOCK', 'ETF', 'MUTUAL_FUND');

-- CreateEnum
CREATE TYPE "ThesisTier" AS ENUM ('TIER_0', 'TIER_1', 'TIER_2');

-- CreateEnum
CREATE TYPE "ConvictionLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ThesisStatus" AS ENUM ('ACTIVE', 'UNDER_REVIEW', 'EXITED');

-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('THESIS_BASED', 'VALUATION_BASED', 'RISK_BASED', 'PORTFOLIO_LEVEL');

-- CreateEnum
CREATE TYPE "DecisionType" AS ENUM ('HOLD', 'PARTIAL_EXIT', 'FULL_EXIT', 'OVERRIDE_RULE');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('RULE_TRIGGERED', 'ASSUMPTION_BREACH', 'NEWS', 'PRICE_MOVE');

-- CreateEnum
CREATE TYPE "InvestsIn" AS ENUM ('STOCKS', 'MUTUAL_FUNDS', 'BOTH');

-- CreateEnum
CREATE TYPE "TracksWith" AS ENUM ('SPREADSHEET', 'BROKER_APP', 'NOTHING', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" TIMESTAMP(3),
    "name" TEXT,
    "avatar_url" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "invests_in" "InvestsIn",
    "tracks_with" "TracksWith",
    "onboarded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "asset_type" "AssetType" NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "avg_buy_price" DECIMAL(18,4) NOT NULL,
    "buy_date" TIMESTAMP(3) NOT NULL,
    "current_price" DECIMAL(18,4),
    "sector" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portfolio_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "snapshot_date" TIMESTAMP(3) NOT NULL,
    "total_value" DECIMAL(18,4) NOT NULL,
    "sector_exposure_json" JSONB,
    "company_exposure_json" JSONB,
    "factor_exposure_json" JSONB,
    "overlap_score" INTEGER,
    "dqs_score" INTEGER,

    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theses" (
    "id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tier" "ThesisTier" NOT NULL,
    "thesis_text" TEXT NOT NULL,
    "thesis_template_id" TEXT,
    "conviction_level" "ConvictionLevel" NOT NULL,
    "time_horizon_months" INTEGER NOT NULL,
    "health_score" INTEGER,
    "previous_health_score" INTEGER,
    "status" "ThesisStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assumptions" (
    "id" TEXT NOT NULL,
    "thesis_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "metric_key" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "threshold_value" DECIMAL(18,4) NOT NULL,
    "current_value" DECIMAL(18,4),
    "status" "HealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "last_checked_at" TIMESTAMP(3),

    CONSTRAINT "assumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exit_rules" (
    "id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rule_text_verbatim" TEXT NOT NULL,
    "rule_type" "RuleType" NOT NULL,
    "metric_key" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "threshold_value" DECIMAL(18,4) NOT NULL,
    "current_value" DECIMAL(18,4),
    "status" "HealthStatus" NOT NULL DEFAULT 'HEALTHY',
    "created_date_text" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(3),

    CONSTRAINT "exit_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "position_id" TEXT NOT NULL,
    "exit_rule_id" TEXT,
    "decision_type" "DecisionType" NOT NULL,
    "reasoning_text" TEXT,
    "position_pnl_at_decision" DECIMAL(18,4),
    "outcome_pnl_30d" DECIMAL(18,4),
    "outcome_pnl_90d" DECIMAL(18,4),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mf_holdings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "units" DECIMAL(18,4) NOT NULL,
    "nav" DECIMAL(18,4) NOT NULL,
    "current_value" DECIMAL(18,4) NOT NULL,
    "amc" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mf_holdings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mf_stock_exposures" (
    "id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "percentage_of_aum" DECIMAL(9,4) NOT NULL,
    "reporting_month" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mf_stock_exposures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ipo_reports" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "ticker" TEXT,
    "issue_open" TIMESTAMP(3) NOT NULL,
    "issue_close" TIMESTAMP(3) NOT NULL,
    "price_band_low" DECIMAL(18,4) NOT NULL,
    "price_band_high" DECIMAL(18,4) NOT NULL,
    "issue_size" DECIMAL(18,4) NOT NULL,
    "fresh_issue_pct" DECIMAL(6,2) NOT NULL,
    "ofs_pct" DECIMAL(6,2) NOT NULL,
    "business_summary" TEXT NOT NULL,
    "peer_comparison_json" JSONB,
    "financials_json" JSONB,
    "forensic_score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ipo_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dqs_scores" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score_date" TIMESTAMP(3) NOT NULL,
    "overall_score" INTEGER NOT NULL,
    "thesis_rigor" INTEGER NOT NULL,
    "portfolio_construction" INTEGER NOT NULL,
    "exit_discipline" INTEGER NOT NULL,
    "learning_adaptation" INTEGER NOT NULL,
    "track" TEXT NOT NULL,
    "benchmark_percentile" INTEGER,

    CONSTRAINT "dqs_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "position_id" TEXT,
    "alert_type" "AlertType" NOT NULL,
    "rule_text_echo" TEXT,
    "status_text" TEXT NOT NULL,
    "confidence_level" TEXT,
    "source_url" TEXT,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_accuracy_log" (
    "id" TEXT NOT NULL,
    "data_type" TEXT NOT NULL,
    "ticker" TEXT,
    "expected_value" TEXT,
    "parsed_value" TEXT,
    "is_correct" BOOLEAN NOT NULL,
    "correction_applied" BOOLEAN NOT NULL DEFAULT false,
    "reported_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_accuracy_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "positions_user_id_idx" ON "positions"("user_id");

-- CreateIndex
CREATE INDEX "positions_ticker_idx" ON "positions"("ticker");

-- CreateIndex
CREATE INDEX "portfolio_snapshots_user_id_idx" ON "portfolio_snapshots"("user_id");

-- CreateIndex
CREATE INDEX "theses_user_id_idx" ON "theses"("user_id");

-- CreateIndex
CREATE INDEX "theses_position_id_idx" ON "theses"("position_id");

-- CreateIndex
CREATE INDEX "assumptions_thesis_id_idx" ON "assumptions"("thesis_id");

-- CreateIndex
CREATE INDEX "exit_rules_user_id_idx" ON "exit_rules"("user_id");

-- CreateIndex
CREATE INDEX "exit_rules_position_id_idx" ON "exit_rules"("position_id");

-- CreateIndex
CREATE INDEX "decisions_user_id_idx" ON "decisions"("user_id");

-- CreateIndex
CREATE INDEX "decisions_position_id_idx" ON "decisions"("position_id");

-- CreateIndex
CREATE INDEX "mf_holdings_user_id_idx" ON "mf_holdings"("user_id");

-- CreateIndex
CREATE INDEX "mf_stock_exposures_ticker_idx" ON "mf_stock_exposures"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "mf_stock_exposures_scheme_code_ticker_reporting_month_key" ON "mf_stock_exposures"("scheme_code", "ticker", "reporting_month");

-- CreateIndex
CREATE INDEX "dqs_scores_user_id_idx" ON "dqs_scores"("user_id");

-- CreateIndex
CREATE INDEX "alerts_user_id_idx" ON "alerts"("user_id");

-- CreateIndex
CREATE INDEX "data_accuracy_log_ticker_idx" ON "data_accuracy_log"("ticker");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theses" ADD CONSTRAINT "theses_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theses" ADD CONSTRAINT "theses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assumptions" ADD CONSTRAINT "assumptions_thesis_id_fkey" FOREIGN KEY ("thesis_id") REFERENCES "theses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_rules" ADD CONSTRAINT "exit_rules_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exit_rules" ADD CONSTRAINT "exit_rules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decisions" ADD CONSTRAINT "decisions_exit_rule_id_fkey" FOREIGN KEY ("exit_rule_id") REFERENCES "exit_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mf_holdings" ADD CONSTRAINT "mf_holdings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dqs_scores" ADD CONSTRAINT "dqs_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
