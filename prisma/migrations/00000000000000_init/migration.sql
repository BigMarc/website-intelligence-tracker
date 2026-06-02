-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SnapshotStatus" AS ENUM ('success', 'partial', 'no_public_data', 'blocked', 'login_wall', 'captcha', 'parser_error', 'network_error');

-- CreateEnum
CREATE TYPE "TrafficChannel" AS ENUM ('direct', 'referrals', 'organic_search', 'paid_search', 'social', 'email', 'display_ads', 'other');

-- CreateEnum
CREATE TYPE "ScrapeRunStatus" AS ENUM ('running', 'success', 'partial', 'failed');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('traffic_increased_percent', 'traffic_decreased_percent', 'global_rank_improved_positions', 'global_rank_declined_positions', 'no_public_data_consecutive_runs', 'collector_blocked', 'parser_errors_detected');

-- CreateEnum
CREATE TYPE "AlertDelivery" AS ENUM ('dashboard', 'telegram');

-- CreateEnum
CREATE TYPE "AlertEventStatus" AS ENUM ('open', 'sent', 'resolved');

-- CreateTable
CREATE TABLE "TrackedDomain" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "displayName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrackedDomain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainCategoryAssignment" (
    "id" TEXT NOT NULL,
    "trackedDomainId" TEXT NOT NULL,
    "domainCategoryId" TEXT NOT NULL,

    CONSTRAINT "DomainCategoryAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainSnapshot" (
    "id" TEXT NOT NULL,
    "trackedDomainId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "snapshotDate" DATE NOT NULL,
    "collectedAt" TIMESTAMP(3) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "status" "SnapshotStatus" NOT NULL,
    "parserVersion" TEXT NOT NULL,
    "estimatedMonthlyVisits" DOUBLE PRECISION,
    "globalRank" INTEGER,
    "countryRank" INTEGER,
    "categoryRank" INTEGER,
    "bounceRate" DOUBLE PRECISION,
    "pagesPerVisit" DOUBLE PRECISION,
    "averageVisitDurationSeconds" INTEGER,
    "warningsJson" JSONB NOT NULL,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrafficChannelSnapshot" (
    "id" TEXT NOT NULL,
    "domainSnapshotId" TEXT NOT NULL,
    "channel" "TrafficChannel" NOT NULL,
    "sharePercent" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TrafficChannelSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountrySnapshot" (
    "id" TEXT NOT NULL,
    "domainSnapshotId" TEXT NOT NULL,
    "countryCode" TEXT,
    "countryName" TEXT NOT NULL,
    "sharePercent" DOUBLE PRECISION,

    CONSTRAINT "CountrySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "status" "ScrapeRunStatus" NOT NULL DEFAULT 'running',
    "domainsAttempted" INTEGER NOT NULL DEFAULT 0,
    "domainsSucceeded" INTEGER NOT NULL DEFAULT 0,
    "domainsPartial" INTEGER NOT NULL DEFAULT 0,
    "domainsBlocked" INTEGER NOT NULL DEFAULT 0,
    "domainsFailed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScrapeRunItem" (
    "id" TEXT NOT NULL,
    "scrapeRunId" TEXT NOT NULL,
    "trackedDomainId" TEXT NOT NULL,
    "status" "SnapshotStatus" NOT NULL,
    "errorMessage" TEXT,
    "durationMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScrapeRunItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchInterestSnapshot" (
    "id" TEXT NOT NULL,
    "searchTermId" TEXT NOT NULL,
    "geo" TEXT NOT NULL DEFAULT 'worldwide',
    "date" DATE NOT NULL,
    "interest" INTEGER NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual_csv',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchInterestSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "trackedDomainId" TEXT,
    "thresholdFloat" DOUBLE PRECISION,
    "thresholdInt" INTEGER,
    "consecutiveRuns" INTEGER,
    "delivery" "AlertDelivery" NOT NULL DEFAULT 'dashboard',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertEvent" (
    "id" TEXT NOT NULL,
    "alertRuleId" TEXT,
    "trackedDomainId" TEXT,
    "type" "AlertType" NOT NULL,
    "status" "AlertEventStatus" NOT NULL DEFAULT 'open',
    "message" TEXT NOT NULL,
    "payloadJson" JSONB,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TrackedDomain_domain_key" ON "TrackedDomain"("domain");

-- CreateIndex
CREATE INDEX "TrackedDomain_isActive_idx" ON "TrackedDomain"("isActive");

-- CreateIndex
CREATE INDEX "TrackedDomain_domain_idx" ON "TrackedDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "DomainCategory_name_key" ON "DomainCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "DomainCategory_slug_key" ON "DomainCategory"("slug");

-- CreateIndex
CREATE INDEX "DomainCategoryAssignment_domainCategoryId_idx" ON "DomainCategoryAssignment"("domainCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "DomainCategoryAssignment_trackedDomainId_domainCategoryId_key" ON "DomainCategoryAssignment"("trackedDomainId", "domainCategoryId");

-- CreateIndex
CREATE INDEX "DomainSnapshot_trackedDomainId_collectedAt_idx" ON "DomainSnapshot"("trackedDomainId", "collectedAt");

-- CreateIndex
CREATE INDEX "DomainSnapshot_provider_status_idx" ON "DomainSnapshot"("provider", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DomainSnapshot_trackedDomainId_provider_snapshotDate_key" ON "DomainSnapshot"("trackedDomainId", "provider", "snapshotDate");

-- CreateIndex
CREATE UNIQUE INDEX "TrafficChannelSnapshot_domainSnapshotId_channel_key" ON "TrafficChannelSnapshot"("domainSnapshotId", "channel");

-- CreateIndex
CREATE INDEX "CountrySnapshot_countryCode_idx" ON "CountrySnapshot"("countryCode");

-- CreateIndex
CREATE INDEX "CountrySnapshot_domainSnapshotId_idx" ON "CountrySnapshot"("domainSnapshotId");

-- CreateIndex
CREATE INDEX "ScrapeRun_startedAt_idx" ON "ScrapeRun"("startedAt");

-- CreateIndex
CREATE INDEX "ScrapeRun_status_idx" ON "ScrapeRun"("status");

-- CreateIndex
CREATE INDEX "ScrapeRunItem_scrapeRunId_idx" ON "ScrapeRunItem"("scrapeRunId");

-- CreateIndex
CREATE INDEX "ScrapeRunItem_trackedDomainId_idx" ON "ScrapeRunItem"("trackedDomainId");

-- CreateIndex
CREATE INDEX "ScrapeRunItem_status_idx" ON "ScrapeRunItem"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SearchTerm_term_key" ON "SearchTerm"("term");

-- CreateIndex
CREATE INDEX "SearchInterestSnapshot_date_idx" ON "SearchInterestSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SearchInterestSnapshot_searchTermId_geo_date_key" ON "SearchInterestSnapshot"("searchTermId", "geo", "date");

-- CreateIndex
CREATE INDEX "AlertRule_type_idx" ON "AlertRule"("type");

-- CreateIndex
CREATE INDEX "AlertRule_isActive_idx" ON "AlertRule"("isActive");

-- CreateIndex
CREATE INDEX "AlertRule_trackedDomainId_idx" ON "AlertRule"("trackedDomainId");

-- CreateIndex
CREATE INDEX "AlertEvent_type_idx" ON "AlertEvent"("type");

-- CreateIndex
CREATE INDEX "AlertEvent_status_idx" ON "AlertEvent"("status");

-- CreateIndex
CREATE INDEX "AlertEvent_createdAt_idx" ON "AlertEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "DomainCategoryAssignment" ADD CONSTRAINT "DomainCategoryAssignment_trackedDomainId_fkey" FOREIGN KEY ("trackedDomainId") REFERENCES "TrackedDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainCategoryAssignment" ADD CONSTRAINT "DomainCategoryAssignment_domainCategoryId_fkey" FOREIGN KEY ("domainCategoryId") REFERENCES "DomainCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainSnapshot" ADD CONSTRAINT "DomainSnapshot_trackedDomainId_fkey" FOREIGN KEY ("trackedDomainId") REFERENCES "TrackedDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrafficChannelSnapshot" ADD CONSTRAINT "TrafficChannelSnapshot_domainSnapshotId_fkey" FOREIGN KEY ("domainSnapshotId") REFERENCES "DomainSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountrySnapshot" ADD CONSTRAINT "CountrySnapshot_domainSnapshotId_fkey" FOREIGN KEY ("domainSnapshotId") REFERENCES "DomainSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeRunItem" ADD CONSTRAINT "ScrapeRunItem_scrapeRunId_fkey" FOREIGN KEY ("scrapeRunId") REFERENCES "ScrapeRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeRunItem" ADD CONSTRAINT "ScrapeRunItem_trackedDomainId_fkey" FOREIGN KEY ("trackedDomainId") REFERENCES "TrackedDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchInterestSnapshot" ADD CONSTRAINT "SearchInterestSnapshot_searchTermId_fkey" FOREIGN KEY ("searchTermId") REFERENCES "SearchTerm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertRule" ADD CONSTRAINT "AlertRule_trackedDomainId_fkey" FOREIGN KEY ("trackedDomainId") REFERENCES "TrackedDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "AlertRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertEvent" ADD CONSTRAINT "AlertEvent_trackedDomainId_fkey" FOREIGN KEY ("trackedDomainId") REFERENCES "TrackedDomain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

