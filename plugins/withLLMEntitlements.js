/**
 * withLLMEntitlements
 *
 * Adds the two iOS entitlements required to load large on-device LLMs
 * (Gemma 4 / LiteRT-LM) in a standalone production build.
 *
 * ─── WHY THESE ENTITLEMENTS ARE NEEDED ────────────────────────────────────────
 *
 * com.apple.developer.kernel.increased-memory-limit
 *   Raises the per-process JETSAM ceiling (default ~1.5 GB). Without it iOS
 *   silently kills the process the moment the 2.6 GB model weights are mapped.
 *
 * com.apple.developer.kernel.extended-virtual-addressing
 *   arm64 gets 4 GB of virtual address space by default. 2.6 GB model +
 *   app binary + Metal driver + stack leaves no room for litert_lm_engine_create's
 *   mmap, so the C function returns NULL. This entitlement raises the VA
 *   ceiling to 36 GB on A12+ chips.
 *
 * ─── WHY LOCAL `expo run:ios --device` DOESN'T NEED THEM ──────────────────────
 *
 * `expo run:ios --device` runs your code inside the Expo Dev Launcher process,
 * which already holds both entitlements in its own provisioning profile. Your
 * module code runs in that process and inherits the elevated limits for free.
 * A standalone .ipa has its own clean process — only what's in YOUR entitlements
 * file AND provisioning profile counts.
 *
 * ─── APPLE DEVELOPER PORTAL ACTION REQUIRED (one-time) ───────────────────────
 *
 * These are *privileged* entitlements. Before a provisioning profile can include
 * them you must:
 *
 *   1. Request access at:
 *      https://developer.apple.com/contact/request/increased-memory-limit/
 *
 *   2. After approval (usually 1–2 business days), go to:
 *      developer.apple.com → Certificates, Identifiers & Profiles → Identifiers
 *      → select com.dutchvocabbuilder.app
 *      → enable "Increased Memory Limit" and "Extended Virtual Addressing"
 *      → Save
 *
 *   3. In Xcode: Signing & Capabilities → tap the refresh ↺ icon next to the
 *      provisioning profile, or let EAS Managed Credentials re-generate it.
 *
 * Until step 1–3 are complete, set enabled: false (or omit the option) so that
 * local and CI builds don't fail with "Provisioning profile doesn't include the
 * … capability" errors. The GPU → CPU fallback in DutchVocabAIModule.swift
 * ensures the model still loads during development without these entitlements.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────
 *
 * In app.json:
 *   // Disabled (default) — safe for local dev and CI before Apple approval:
 *   "./plugins/withLLMEntitlements"
 *
 *   // Enabled — use this once Apple has approved and you've enabled on App ID:
 *   ["./plugins/withLLMEntitlements", { "enabled": true }]
 *
 * Or gate on an EAS env var so production builds opt in automatically:
 *   ["./plugins/withLLMEntitlements", { "enabled": "$ENABLE_LLM_ENTITLEMENTS" }]
 *   (set ENABLE_LLM_ENTITLEMENTS=1 in your EAS build profile's env block)
 */

const { withEntitlementsPlist } = require('@expo/config-plugins');

/**
 * @param {import('@expo/config-plugins').ExpoConfig} config
 * @param {{ enabled?: boolean | string }} [options]
 */
function withLLMEntitlements(config, options = {}) {
  // Resolve enabled — accept boolean or a stringified env-var value from EAS.
  const rawEnabled = options.enabled ?? false;
  const isEnabled =
    rawEnabled === true ||
    rawEnabled === 'true' ||
    rawEnabled === '1';

  if (!isEnabled) {
    // Safety guard: if the entitlements were previously written (e.g. by a
    // prior run with enabled:true), remove them so a disabled run doesn't leave
    // stale keys that cause provisioning-profile mismatches.
    return withEntitlementsPlist(config, (cfg) => {
      delete cfg.modResults['com.apple.developer.kernel.increased-memory-limit'];
      delete cfg.modResults['com.apple.developer.kernel.extended-virtual-addressing'];
      return cfg;
    });
  }

  return withEntitlementsPlist(config, (cfg) => {
    cfg.modResults['com.apple.developer.kernel.increased-memory-limit'] = true;
    cfg.modResults['com.apple.developer.kernel.extended-virtual-addressing'] = true;
    return cfg;
  });
}

module.exports = withLLMEntitlements;
