/** Deterministic eligibility / fraud / duplication / geo checks for TrueGrant. */
function runVerification({ formData, scheme, user, existingAadhaarIndex }) {
  const income = parseFloat(String(formData.f4 ?? "").replace(/,/g, "")) || 0;
  const aadhaar = String(formData.f2 ?? "").replace(/\s/g, "");
  const state = String(formData.f5 ?? "").trim();
  const name = String(formData.f1 ?? "").trim();
  const justificationPoints = [];
  const flags = [];
  let score = 88;
  const incomeCap = scheme.id === "s4" ? 1800000 : 800000;
  const roles = scheme.eligibleRoles || ["individual"];
  if (!roles.includes(user.role)) {
    return finalize("blocked", 12, [
      "Scheme not available for account type (" + user.role + "). Eligible: " + roles.join(", ") + ".",
      "Role eligibility failed.",
    ], ["ROLE_MISMATCH"], []);
  }
  if (!/^\d{12}$/.test(aadhaar)) {
    return finalize("blocked", 20, ["Aadhaar must be 12 digits.", "UIDAI format check failed."], ["INVALID_AADHAAR"], []);
  }
  if (/^(\d)\1{11}$/.test(aadhaar)) {
    flags.push("FRAUD_PATTERN_AADHAAR");
    justificationPoints.push("Aadhaar pattern invalid/test — risk hold.");
    score -= 35;
  }
  if (income > 5000000) {
    flags.push("INCOME_OUTLIER");
    justificationPoints.push("Income outlier — review.");
    score -= 15;
  }
  let linkedApplicant;
  const dup = existingAadhaarIndex.find((e) => e.aadhaar === aadhaar && e.userId !== user.id);
  if (dup) {
    linkedApplicant = "Linked " + dup.applicationId + " (same Aadhaar, other account)";
    flags.push("POSSIBLE_DUPLICATE");
    justificationPoints.push("Duplicate: Aadhaar matches another application.");
    score -= 25;
  }
  if (income > incomeCap) {
    justificationPoints.push("Income exceeds scheme threshold.");
    return finalize("blocked", Math.max(15, score - 40), justificationPoints, ["INCOME_THRESHOLD"], flags, linkedApplicant);
  }
  if (income > incomeCap * 0.9) {
    flags.push("INCOME_NEAR_CAP");
    justificationPoints.push("Income within 10% of cap — manual review.");
    score -= 8;
  }
  if (scheme.id === "s5" && ["Delhi", "Goa"].includes(state)) {
    flags.push("GEO_RURAL_MISMATCH");
    justificationPoints.push("Geo integrity: state vs rural Gramin scheme — verify.");
    score -= 10;
  } else {
    justificationPoints.push("State " + (state || "—") + " recorded; geo OK (demo).");
  }
  if (flags.includes("POSSIBLE_DUPLICATE") || flags.includes("GEO_RURAL_MISMATCH") || flags.includes("INCOME_NEAR_CAP")) {
    justificationPoints.push("Risk signals — officer confirmation required.");
    return finalize("under_review", Math.min(95, Math.max(40, score)), justificationPoints, flags, flags, linkedApplicant);
  }
  if (flags.some((f) => f.startsWith("FRAUD") || f === "INCOME_OUTLIER")) {
    return finalize("under_review", Math.min(90, score), justificationPoints, flags, flags, linkedApplicant);
  }
  justificationPoints.unshift("Identity \"" + name + "\" format check passed.");
  justificationPoints.push("No duplicate on demo index.");
  return finalize("approved", Math.min(99, Math.max(85, score + 7)), justificationPoints, [], flags, linkedApplicant);
}
function finalize(status, score, justificationPoints, primaryFlags, allFlags, linkedApplicant) {
  const merged = [...new Set([...primaryFlags, ...allFlags])];
  return { status, score, justificationPoints, flags: merged, linkedApplicant };
}
module.exports = { runVerification };