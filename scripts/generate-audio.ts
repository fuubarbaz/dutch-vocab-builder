/**
 * generate-audio.ts
 *
 * Generates bundled phrase audio for the app — no API key required.
 *
 * Two synthesis backends (auto-detected, first available wins):
 *
 *   1. edge-tts  — Microsoft Edge neural TTS, free, excellent Dutch voices
 *      Install : pip install edge-tts
 *      Voices  : nl-NL-MaartenNeural (Dutch), en-US-AriaNeural (English)
 *
 *   2. macOS say — Built-in, zero dependencies, decent quality
 *      Voices  : Xander (Dutch NL), Samantha (English US)
 *      Requires: macOS only
 *
 * Run:
 *   npx tsx scripts/generate-audio.ts
 *
 * Output:
 *   src/assets/audio/phrases/*.mp3   (edge-tts)
 *   src/assets/audio/phrases/*.aiff  (say fallback)
 *   src/assets/audio/phrases/index.ts
 *
 * Re-running skips already-generated files — safe to run incrementally.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { PHRASE_CATEGORIES } from '../src/data/phrases';

// ── Config ────────────────────────────────────────────────────────────────────

const OUTPUT_DIR = path.join(__dirname, '../src/assets/audio/phrases');
const MANIFEST   = path.join(OUTPUT_DIR, 'index.ts');

// edge-tts voices
const EDGE_VOICE_NL = 'nl-NL-MaartenNeural';
const EDGE_VOICE_EN = 'en-US-AriaNeural';
const EDGE_RATE     = '-10%';   // slightly slower than default for learning

// macOS say voices (fallback)
const SAY_VOICE_NL =  'Xander (Enhanced)' ;
const SAY_VOICE_EN = 'Samantha (Enhanced)';
const SAY_RATE     = '160';        // words per minute

// ── Backend detection ─────────────────────────────────────────────────────────

type Backend = 'edge-tts' | 'say' | null;

function detectBackend(): Backend {
  // Try edge-tts first
  const edgeResult = spawnSync('edge-tts', ['--version'], { encoding: 'utf8' });
  if (edgeResult.status === 0 || edgeResult.stderr === '') {
    return 'edge-tts';
  }

  // Try macOS say
  if (process.platform === 'darwin') {
    const sayResult = spawnSync('say', ['--version'], { encoding: 'utf8' });
    if (sayResult.status === 0 || sayResult.error == null) {
      return 'say';
    }
  }

  return null;
}

// ── Synthesis ─────────────────────────────────────────────────────────────────

function synthesizeEdgeTts(text: string, voice: string, outputPath: string): void {
  const result = spawnSync(
    'edge-tts',
    ['--voice', voice, '--rate', EDGE_RATE, '--text', text, '--write-media', outputPath],
    { encoding: 'utf8', timeout: 30_000 }
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'edge-tts failed');
  }
}

function synthesizeSay(text: string, voice: string, outputPath: string): void {
  const result = spawnSync(
    'say',
    ['-v', voice, '-r', SAY_RATE, '-o', outputPath, text],
    { encoding: 'utf8', timeout: 30_000 }
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'say failed');
  }
}

function synthesize(
  text: string,
  lang: 'nl' | 'en',
  outputPath: string,
  backend: Backend
): void {
  if (backend === 'edge-tts') {
    synthesizeEdgeTts(text, lang === 'nl' ? EDGE_VOICE_NL : EDGE_VOICE_EN, outputPath);
  } else if (backend === 'say') {
    synthesizeSay(text, lang === 'nl' ? SAY_VOICE_NL : SAY_VOICE_EN, outputPath);
  } else {
    throw new Error('No TTS backend available');
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function main() {
  // Detect backend
  const backend = detectBackend();
  if (!backend) {
    console.error(`
No TTS backend found. Install one of:

  pip install edge-tts          (recommended — neural voices, cross-platform)

  or use macOS built-in voices — the "say" command is already available on Mac.
`);
    process.exit(1);
  }

  const ext = backend === 'edge-tts' ? 'mp3' : 'aiff';
  console.log(`Backend : ${backend}`);
  console.log(`Format  : .${ext}`);
  console.log(`Output  : src/assets/audio/phrases/\n`);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allPhrases = PHRASE_CATEGORIES.flatMap(cat =>
    cat.phrases.map(p => ({ id: `${cat.id}_${p.id}`, dutch: p.dutch, english: p.english }))
  );

  console.log(`Phrases : ${allPhrases.length} × 2 languages = ${allPhrases.length * 2} files\n`);

  type Entry = { id: string; nlFile: string; enFile: string };
  const entries: Entry[] = [];
  let generated = 0;
  let skipped   = 0;
  let errors    = 0;

  for (const phrase of allPhrases) {
    const name   = phrase.id.replace(/[^a-z0-9_-]/gi, '_');
    const nlFile = `${name}_nl.${ext}`;
    const enFile = `${name}_en.${ext}`;
    const nlPath = path.join(OUTPUT_DIR, nlFile);
    const enPath = path.join(OUTPUT_DIR, enFile);

    entries.push({ id: phrase.id, nlFile, enFile });

    const nlExists = fs.existsSync(nlPath);
    const enExists = fs.existsSync(enPath);

    if (nlExists && enExists) {
      skipped++;
      process.stdout.write(`  [skip] ${phrase.id}${' '.repeat(Math.max(0, 50 - phrase.id.length))}\r`);
      continue;
    }

    process.stdout.write(`  [gen]  ${phrase.id}...`);

    try {
      if (!nlExists) synthesize(phrase.dutch,   'nl', nlPath, backend);
      if (!enExists) synthesize(phrase.english, 'en', enPath, backend);
      generated++;
      console.log(' ✓');
    } catch (e: any) {
      errors++;
      console.log(` ✗ ${e.message}`);
    }
  }

  // Write manifest with static require() calls (Metro requires these to be static)
  const lines = [
    '// Auto-generated by scripts/generate-audio.ts — DO NOT EDIT MANUALLY',
    `// Generated with: ${backend}  (format: .${ext})`,
    '// To regenerate: npx tsx scripts/generate-audio.ts',
    '',
    'export const PHRASE_AUDIO: Record<string, { nl: any; en: any }> = {',
    ...entries.map(({ id, nlFile, enFile }) =>
      `  '${id}': { nl: require('./${nlFile}'), en: require('./${enFile}') },`
    ),
    '};',
    '',
  ];
  fs.writeFileSync(MANIFEST, lines.join('\n'));

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Generated : ${generated}`);
  console.log(`Skipped   : ${skipped}`);
  console.log(`Errors    : ${errors}`);
  console.log(`Manifest  : src/assets/audio/phrases/index.ts`);

  if (errors > 0) {
    console.log('\nRe-run to retry failed files.');
    process.exit(1);
  }

  console.log('\nDone! Commit src/assets/audio/phrases/ to the repo.');
}

main();
