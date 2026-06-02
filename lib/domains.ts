import { z } from "zod";

export const normalizedDomainSchema = z
  .string()
  .min(3)
  .max(253)
  .regex(
    /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,63}$/,
    "Use a valid public domain such as example.com"
  );

export function normalizeDomain(input: string) {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) throw new Error("Domain is required");

  const withProtocol = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let hostname = "";

  try {
    hostname = new URL(withProtocol).hostname;
  } catch {
    throw new Error("Could not parse domain");
  }

  const normalized = hostname.replace(/^www\./, "").replace(/\.$/, "");
  const result = normalizedDomainSchema.safeParse(normalized);
  if (!result.success) throw new Error(result.error.issues[0]?.message ?? "Invalid domain");
  return result.data;
}

export function getDisplayNameFromDomain(domain: string) {
  return domain
    .split(".")[0]
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
