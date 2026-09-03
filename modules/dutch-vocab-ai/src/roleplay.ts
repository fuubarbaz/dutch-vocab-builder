/**
 * Roleplay helpers shared by the native and web builds of the module.
 */

// ── Roleplay reply cleanup ────────────────────────────────────────────────────

/** Labels that mean the model has started writing the learner's side of the scene. */
const LEARNER_LABEL = /^\s*(jij|je|u|jullie|you|learner|student|leerling|user)\s*:/i;
/**
 * A speaker label the model put in front of its own line — "Barista:", "Ik:", "A:".
 * Restricted to a single word so ordinary Dutch openers that contain a colon
 * ("Let op: ...") are left alone.
 */
const SELF_LABEL = /^\s*[A-Za-zÀ-ÖØ-öø-ÿ]{1,20}\s*:\s*/;

function stripLabels(line: string): string {
  return line.replace(SELF_LABEL, '');
}

/**
 * Trims a roleplay reply down to the character's own spoken line.
 *
 * A 2B model will sometimes continue both halves of the dialogue or wrap the line in
 * stage directions, despite being told not to. Cutting at the first learner-side label
 * keeps the scene turn-by-turn. Safe to call on partial text while streaming.
 */
export function sanitizeRoleplayReply(raw: string): string {
  const lines = raw.replace(/```[a-z]*/gi, '').replace(/```/g, '').split('\n');

  const kept: string[] = [];
  for (const line of lines) {
    if (LEARNER_LABEL.test(line)) break;
    const stripped = stripLabels(line);
    // Drop whole-line stage directions like *hij glimlacht*
    if (/^\s*\*[^*]*\*\s*$/.test(stripped)) continue;
    kept.push(stripped);
  }

  const cleaned = kept.join('\n').replace(/\*/g, '').replace(/\n{3,}/g, '\n\n').trim();

  // If the very first line was a learner label there is nothing left to show; fall back
  // to the delabelled text rather than handing the screen an empty turn.
  if (cleaned) return cleaned;
  return lines.map(stripLabels).join('\n').replace(/\*/g, '').trim();
}

// ── Scene review ──────────────────────────────────────────────────────────────

export type RoleplayCorrection = {
  /** The learner's sentence, exactly as they typed it. */
  original: string;
  /** True when nothing needed changing. */
  ok: boolean;
  /** The corrected sentence. Equal to `original` when `ok`. */
  fix: string;
  /** Short English explanation. Empty when `ok`. */
  why: string;
};

/** Pulls balanced `{...}` blocks out of text, so one malformed record can't lose the rest. */
function scanObjects(text: string): any[] {
  const found: any[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        try { found.push(JSON.parse(text.slice(start, i + 1))); } catch { /* skip */ }
        start = -1;
      }
    }
  }
  return found;
}

/**
 * Pairs the model's review output back onto the learner's lines.
 *
 * Returns `null` when nothing parseable came back. That case must stay distinct from
 * "every line was fine" — degrading a failed review into all-clear would tell the
 * learner their Dutch was correct when it was never actually checked.
 *
 * Otherwise returns one entry per original line: an individual dropped record degrades
 * to "no correction" rather than shifting every later line onto the wrong sentence.
 */
/**
 * Normalises a sentence for "did anything real change?" comparison.
 *
 * Sentence punctuation and capitalisation are dropped, so a correction that only adds a
 * comma or a capital is not shown to the learner — this is chat practice, not dictation.
 * Apostrophes and hyphens are deliberately KEPT significant: `autos` -> `auto\'s` and
 * `s ochtends` -> `\'s ochtends` are real spelling fixes worth surfacing.
 */
function normalizeForCompare(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseRoleplayReview(
  raw: string,
  originals: string[],
): RoleplayCorrection[] | null {
  const records = scanObjects(raw.replace(/```[a-z]*/gi, '').replace(/```/g, ''));
  if (records.length === 0) return null;

  return originals.map((original, idx) => {
    const rec =
      records.find(r => Number(r?.i) === idx + 1) ??
      (records.length === originals.length ? records[idx] : undefined);

    const fix = typeof rec?.fix === 'string' ? rec.fix.trim() : '';
    const why = typeof rec?.why === 'string' ? rec.why.trim() : '';
    // Trust the sentences over the flag: models set ok:false and then hand back the
    // input unchanged — or changed only in punctuation — neither of which is a
    // correction worth showing.
    const unchanged =
      !fix || normalizeForCompare(fix) === normalizeForCompare(original);
    const ok = rec?.ok === true || unchanged;

    return { original, ok, fix: ok ? original : fix, why: ok ? '' : why };
  });
}
