const SIMILARWEB_ORIGIN = "https://www.similarweb.com";
const USER_AGENT = "WebsiteIntelligenceTracker/1.0 (+weekly public-data research tool)";

type RobotRule = {
  directive: "allow" | "disallow";
  path: string;
};

function matchingGroups(robotsText: string, userAgent: string) {
  const groups: { agents: string[]; rules: RobotRule[] }[] = [];
  let current: { agents: string[]; rules: RobotRule[] } | null = null;

  for (const rawLine of robotsText.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, "").trim();
    if (!line) continue;
    const [rawKey, ...rawValue] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rawValue.join(":").trim();

    if (key === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    }

    if ((key === "allow" || key === "disallow") && current) {
      current.rules.push({ directive: key, path: value });
    }
  }

  const normalizedAgent = userAgent.toLowerCase();
  return groups.filter((group) =>
    group.agents.some((agent) => agent === "*" || normalizedAgent.includes(agent.replace(/\*/g, "")))
  );
}

export function isPathAllowedByRobots(robotsText: string, path: string, userAgent = USER_AGENT) {
  const rules = matchingGroups(robotsText, userAgent).flatMap((group) => group.rules);
  if (rules.length === 0) return true;

  const matchingRules = rules
    .filter((rule) => rule.path === "" || path.startsWith(rule.path.replace(/\*$/, "")))
    .sort((a, b) => b.path.length - a.path.length);

  const mostSpecific = matchingRules[0];
  if (!mostSpecific) return true;
  if (mostSpecific.directive === "allow") return true;
  return mostSpecific.path === "";
}

export async function checkSimilarwebRobots(path: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${SIMILARWEB_ORIGIN}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal
    });
    if (!response.ok) {
      return {
        allowed: false,
        warning: `robots.txt could not be inspected: HTTP ${response.status}`
      };
    }
    const body = await response.text();
    const allowed = isPathAllowedByRobots(body, path);
    return {
      allowed,
      warning: allowed ? null : `robots.txt disallows ${path}`
    };
  } catch (error) {
    return {
      allowed: false,
      warning: `robots.txt could not be inspected: ${error instanceof Error ? error.message : "unknown error"}`
    };
  } finally {
    clearTimeout(timeout);
  }
}

export { USER_AGENT };
