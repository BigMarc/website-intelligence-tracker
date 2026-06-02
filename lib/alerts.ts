import type { AlertRule, DomainSnapshot, TrackedDomain } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { calculateRankChange, calculateTrafficChange } from "@/lib/metrics";

type SnapshotWithDomain = DomainSnapshot & { trackedDomain: TrackedDomain };

function ruleTriggered(rule: AlertRule, latest: DomainSnapshot, previous: DomainSnapshot | null) {
  if (rule.type === "collector_blocked") {
    return ["blocked", "captcha", "login_wall"].includes(latest.status);
  }
  if (rule.type === "parser_errors_detected") return latest.status === "parser_error";

  if (rule.type === "traffic_increased_percent" || rule.type === "traffic_decreased_percent") {
    const change = calculateTrafficChange({
      latestValue: latest.estimatedMonthlyVisits,
      previousValue: previous?.estimatedMonthlyVisits
    }).percentageVisitChange;
    if (change === null) return false;
    const threshold = rule.thresholdFloat ?? 0;
    return rule.type === "traffic_increased_percent" ? change > threshold : change < -threshold;
  }

  if (rule.type === "global_rank_improved_positions" || rule.type === "global_rank_declined_positions") {
    const rankChange = calculateRankChange(latest.globalRank, previous?.globalRank);
    if (rankChange === null) return false;
    const threshold = rule.thresholdInt ?? 0;
    return rule.type === "global_rank_improved_positions" ? rankChange > threshold : rankChange < -threshold;
  }

  return false;
}

function alertMessage(rule: AlertRule, domain: TrackedDomain, latest: DomainSnapshot) {
  const label = domain.displayName || domain.domain;
  return `${rule.name}: ${label} matched ${rule.type} on ${latest.collectedAt.toISOString()}.`;
}

export async function evaluateAlertsForSnapshot(snapshot: SnapshotWithDomain) {
  const rules = await prisma.alertRule.findMany({
    where: {
      isActive: true,
      OR: [{ trackedDomainId: null }, { trackedDomainId: snapshot.trackedDomainId }]
    }
  });

  const previous = await prisma.domainSnapshot.findFirst({
    where: {
      trackedDomainId: snapshot.trackedDomainId,
      provider: snapshot.provider,
      id: { not: snapshot.id }
    },
    orderBy: { collectedAt: "desc" }
  });

  const events = [];
  for (const rule of rules) {
    if (rule.type === "no_public_data_consecutive_runs") {
      const needed = rule.consecutiveRuns ?? 2;
      const recent = await prisma.domainSnapshot.findMany({
        where: { trackedDomainId: snapshot.trackedDomainId, provider: snapshot.provider },
        orderBy: { collectedAt: "desc" },
        take: needed
      });
      if (recent.length < needed || recent.some((item) => item.status !== "no_public_data")) continue;
    } else if (!ruleTriggered(rule, snapshot, previous)) {
      continue;
    }

    events.push(
      await prisma.alertEvent.create({
        data: {
          alertRuleId: rule.id,
          trackedDomainId: snapshot.trackedDomainId,
          type: rule.type,
          message: alertMessage(rule, snapshot.trackedDomain, snapshot),
          payloadJson: {
            snapshotId: snapshot.id,
            provider: snapshot.provider,
            status: snapshot.status
          }
        }
      })
    );
  }
  return events;
}
